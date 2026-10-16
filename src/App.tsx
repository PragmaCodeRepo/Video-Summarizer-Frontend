import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Activity, ArrowUpRight, CheckCircle2, Clapperboard, FileVideo2, Film, FolderOpen, LoaderCircle, Play, Plus, Search, Sparkles, Tags, Upload, X } from 'lucide-react';
import { analyzeWithApi, apiRequest, isApiConfigured, uploadVideoWithApi } from './services/apiClient';
import type { Category, VideoRecord } from './types/video';

const categories: Array<'All materials' | Category> = ['All materials', 'Design', 'Content', 'Marketing'];

function App() {
  const [videos, setVideos] = useState<VideoRecord[]>([]);
  const [title, setTitle] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [transcript, setTranscript] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<(typeof categories)[number]>('All materials');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [apiState, setApiState] = useState<'checking' | 'offline' | 'key-missing' | 'ready'>('checking');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const refresh = () => {
    if (!isApiConfigured) { setApiState('offline'); setLoading(false); return; }
    Promise.all([apiRequest<VideoRecord[]>('/api/videos/'), apiRequest<{ openaiConfigured: boolean }>('/api/health/')])
      .then(([records, health]) => { setVideos(records ?? []); setApiState(health?.openaiConfigured ? 'ready' : 'key-missing'); setError(''); })
      .catch((reason: unknown) => { setApiState('offline'); setError(reason instanceof Error ? reason.message : 'Could not connect to Django.'); })
      .finally(() => setLoading(false));
  };
  useEffect(() => { refresh(); }, []);
  useEffect(() => { if (!notice) return; const timer = window.setTimeout(() => setNotice(''), 3200); return () => window.clearTimeout(timer); }, [notice]);

  const visibleVideos = useMemo(() => {
    const term = query.trim().toLowerCase();
    return videos.filter((video) => (filter === 'All materials' || video.categories.includes(filter)) && (!term || [video.title, video.summary, ...video.categories, ...video.keyTopics].join(' ').toLowerCase().includes(term)));
  }, [videos, filter, query]);
  const topicCount = new Set(videos.flatMap((video) => video.keyTopics.map((topic) => topic.toLowerCase()))).size;
  const readyCount = videos.filter((video) => video.trainingReady).length;
  const avgScore = videos.length ? Math.round(videos.reduce((sum, video) => sum + video.kbScore, 0) / videos.length) : 0;
  const categoryCount = (category: Category) => videos.filter((video) => video.categories.includes(category)).length;

  const clearFile = () => { setFile(null); const input = document.getElementById('video-file') as HTMLInputElement | null; if (input) input.value = ''; };
  const handleAnalyze = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError(''); setNotice('');
    if (!file && !transcript.trim()) { setError('Select a video or paste a transcript first.'); return; }
    if (file && file.size > 500 * 1024 * 1024) { setError('Video uploads are limited to 500 MB.'); return; }
    if (!file && !title.trim()) { setError('Enter a video title for this transcript.'); return; }
    if (apiState === 'offline') { setError('Django is offline. Start the backend server and try again.'); return; }
    setProcessing(true);
    try {
      if (file) {
        const record = await uploadVideoWithApi(file, title.trim() || file.name.replace(/\.[^.]+$/, ''), sourceUrl.trim());
        setVideos((current) => [record, ...current]);
      } else {
        const analysis = await analyzeWithApi(transcript.trim(), title.trim());
        if (!analysis) throw new Error('Django did not return an analysis.');
        const record = await apiRequest<VideoRecord>('/api/videos/', { method: 'POST', body: JSON.stringify({ title: title.trim(), sourceUrl: sourceUrl.trim(), sourceType: 'transcript', transcript: transcript.trim(), ...analysis, status: 'indexed' }) });
        if (!record) throw new Error('Django did not save the analyzed video.');
        setVideos((current) => [record, ...current]);
      }
      setTitle(''); setSourceUrl(''); setTranscript(''); clearFile(); setNotice('Video analyzed and added to your library.'); setApiState('ready');
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Video analysis failed.'); }
    finally { setProcessing(false); }
  };
  const deleteVideo = async (video: VideoRecord) => {
    if (!window.confirm(`Delete “${video.title}” from your library?`)) return;
    try { await apiRequest(`/api/videos/${video.id}/`, { method: 'DELETE' }); setVideos((current) => current.filter((item) => item.id !== video.id)); setNotice('Video removed from the library.'); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not delete this video.'); }
  };

  const badge = { checking: 'Connecting', offline: 'Backend offline', 'key-missing': 'OpenAI key needed', ready: 'Connected' }[apiState];
  return <div className="dashboard-shell">
    <header className="dashboard-topbar"><a className="brand" href="#top"><span className="brand-mark"><Film size={18} /></span><span><b>VIDEO INTELLIGENCE</b><small>KNOWLEDGE WORKSPACE</small></span></a><div className="header-right"><span className="connection-pill"><i className={`connection-dot ${apiState}`} />{badge}</span><a className="header-link" href="http://localhost:8000/api/health/" target="_blank" rel="noreferrer">API status <ArrowUpRight size={13} /></a></div></header>

    <main id="top" className="dashboard-main">
      <div className="dashboard-title"><div><div className="breadcrumb">WORKSPACE <span>/</span> LEARNING LIBRARY</div><h1>Training Material Discovery</h1><p>Turn your video library into searchable, reusable learning resources.</p></div><button className="primary-small" onClick={() => document.getElementById('video-file')?.click()}><Plus size={15} /> Add training video</button></div>

      <section className="metric-grid" aria-label="Library overview">
        <Metric icon={<Clapperboard size={16} />} label="VIDEOS ANALYZED" value={videos.length} detail="In your training library" tone="purple" />
        <Metric icon={<Tags size={16} />} label="UNIQUE TOPICS" value={topicCount} detail="Extracted key concepts" tone="amber" />
        <Metric icon={<CheckCircle2 size={16} />} label="TRAINING READY" value={readyCount} detail="Useful learning resources" tone="green" />
        <Metric icon={<Activity size={16} />} label="AVG. KB SCORE" value={`${avgScore}%`} detail="Knowledge base usefulness" tone="rose" />
      </section>

      <section className="dashboard-grid">
        <aside className="panel import-panel"><div className="panel-heading"><div><h2>Import training video</h2><p>Upload a video or provide its transcript</p></div><span className="panel-icon"><Upload size={16} /></span></div>
          <form onSubmit={handleAnalyze} className="import-form">
            <div className="compact-field"><label htmlFor="video-title">VIDEO TITLE <span>OPTIONAL FOR VIDEO</span></label><input id="video-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Design system onboarding" /></div>
            <div className="compact-field"><label htmlFor="source-url">SHAREPOINT LINK <span>OPTIONAL</span></label><input id="source-url" type="url" value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} placeholder="Paste a link to keep with the record" /></div>
            <label htmlFor="video-file" className={`compact-drop ${file ? 'selected' : ''}`} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); const dropped = event.dataTransfer.files[0]; if (dropped) { setFile(dropped); setTranscript(''); } }}>
              <span className="compact-upload-icon">{file ? <CheckCircle2 size={17} /> : <Upload size={17} />}</span><b>{file ? file.name : 'Choose a video file'}</b><small>{file ? `${(file.size / 1024 / 1024).toFixed(1)} MB · ready to analyze` : 'MP4, MOV or WEBM · up to 500 MB'}</small><input id="video-file" type="file" accept=".mp4,.mov,.webm,video/mp4,video/quicktime,video/webm" onChange={(event) => { setFile(event.target.files?.[0] ?? null); setTranscript(''); }} />
            </label>
            {file && <button type="button" className="remove-file" onClick={clearFile}><X size={12} /> Remove file</button>}
            <div className="or-line"><span>OR PASTE A TRANSCRIPT</span></div>
            <textarea className="compact-transcript" value={transcript} onChange={(event) => { setTranscript(event.target.value); if (event.target.value) clearFile(); }} placeholder="Paste transcript or captions…" />
            <div className="form-hint"><Sparkles size={12} /> AI summarizes, classifies, and extracts topics</div>
            {error && <div role="alert" className="error-banner">{error}</div>}
            <button className="analyze-button" type="submit" disabled={processing || apiState === 'offline'}>{processing ? <><LoaderCircle size={15} className="spin" /> Processing video…</> : <><Sparkles size={15} /> Transcribe &amp; analyze</>}</button>
          </form>
          <div className="sharepoint-note"><FileVideo2 size={14} /><span>SharePoint links are saved with a record. Direct import needs Microsoft Graph sign-in and permissions.</span></div>
        </aside>

        <section className="panel library-panel"><div className="library-header"><div><div className="library-title-line"><span className="panel-icon"><FolderOpen size={16} /></span><div><h2>Training library</h2><p>Summaries and insights from your real video content</p></div></div></div><label className="library-search"><Search size={14} /><input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search training library" placeholder="Search videos, topics…" /></label></div>
          <div className="filter-bar">{categories.map((category) => <button key={category} onClick={() => setFilter(category)} className={`filter-chip ${filter === category ? 'active' : ''}`}>{category}<span>{category === 'All materials' ? videos.length : categoryCount(category)}</span></button>)}</div>
          <div className="library-content">
            {loading ? <div className="library-empty"><LoaderCircle className="spin" size={20} /> Loading Django library…</div> : visibleVideos.length ? <div className="resource-list">{visibleVideos.map((video) => <article className="resource-row" key={video.id}><div className="resource-main"><div className="resource-thumb"><Play size={15} fill="currentColor" /></div><div className="resource-text"><div className="resource-name-line"><h3>{video.title}</h3><span className={`ready-badge ${video.trainingReady ? 'yes' : 'review'}`}>{video.trainingReady ? 'Training ready' : 'Review'}</span></div><p>{video.summary}</p><div className="topic-line">{video.keyTopics.slice(0, 4).map((topic) => <span key={topic}>{topic}</span>)}</div></div></div><div className="resource-side"><div className="resource-categories">{video.categories.map((category) => <span key={category} className={`category-badge ${category.toLowerCase()}`}>{category}</span>)}</div><div className="score-row"><div className="score-track"><i style={{ width: `${Math.min(100, Math.max(0, video.kbScore))}%` }} /></div><b>{video.kbScore}%</b></div><small className="resource-meta">{video.sourceType} <span>·</span> {video.status}</small></div><button type="button" className="delete-resource" aria-label={`Delete ${video.title}`} onClick={() => void deleteVideo(video)}><X size={14} /></button></article>)}</div> : <div className="library-empty"><span className="empty-folder"><FolderOpen size={19} /></span><b>{query || filter !== 'All materials' ? 'No matching training materials' : 'Your training library is empty'}</b><span>{query || filter !== 'All materials' ? 'Try changing your search or category filter.' : 'Upload a video or paste a transcript to see its summary and topics here.'}</span></div>}
          </div>
          <div className="library-footer"><span><CheckCircle2 size={13} /> Connected to Django · {videos.length} saved {videos.length === 1 ? 'record' : 'records'}</span><span>REAL DATA ONLY</span></div>
        </section>
      </section>
      <footer className="dashboard-footer"><span>AI summaries can contain errors. Review content before including it in official training.</span><span>TRAINING &amp; KNOWLEDGE BASE DISCOVERY</span></footer>
    </main>
    {notice && <div role="status" className="toast"><CheckCircle2 size={16} />{notice}</div>}
  </div>;
}

function Metric({ icon, label, value, detail, tone }: { icon: React.ReactNode; label: string; value: string | number; detail: string; tone: string }) {
  return <article className="metric-card"><span className={`metric-icon ${tone}`}>{icon}</span><div className="metric-copy"><span>{label}</span><strong>{value}</strong><small>{detail}</small></div><span className={`metric-accent ${tone}`} /></article>;
}

export default App;
