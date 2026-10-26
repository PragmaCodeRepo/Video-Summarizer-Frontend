import { ArrowLeft, BadgeCheck, BookOpenText, CircleHelp, FileVideo2, FolderSync, ListFilter, Printer, Search, Sparkles, Tags, Upload } from 'lucide-react';

type UserManualProps = { onBack: () => void };

const steps = [
  {
    title: 'Sign in to your workspace',
    detail: 'Use your account email and password. Create an account first if this is your first visit.',
    icon: <BadgeCheck size={17} />,
  },
  {
    title: 'Add a video or transcript',
    detail: 'Choose an MP4, MOV, or WEBM video (up to 500 MB), or paste a transcript. Add a title and optional SharePoint link.',
    icon: <Upload size={17} />,
  },
  {
    title: 'Run AI analysis',
    detail: 'Select “Transcribe & analyze”. Uploaded video audio is transcribed, then summarized and classified by the AI.',
    icon: <Sparkles size={17} />,
  },
  {
    title: 'Import SharePoint videos in batches',
    detail: 'Choose Import first 10 videos. The backend queues analysis in the background; keep the SharePoint worker running. Use Stop import to stop after the current video. Completed videos stay saved, and you can continue the remaining folder later.',
    icon: <FolderSync size={17} />,
  },
  {
    title: 'Review the learning resource',
    detail: 'Check the one-paragraph summary, Design / Content / Marketing categories, key topics, and training readiness score.',
    icon: <FileVideo2 size={17} />,
  },
  {
    title: 'Find it again in your library',
    detail: 'Search titles and topics, filter by category or Training ready / Review status, and use the page controls to browse the library. Click any video card to open its full summary, topics, source, and transcript.',
    icon: <Search size={17} />,
  },
];

export function UserManual({ onBack }: UserManualProps) {
  return (
    <main className="user-manual-page">
      <div className="manual-toolbar">
        <button className="manual-back" type="button" onClick={onBack}><ArrowLeft size={15} /> Back to library</button>
        <button className="manual-print" type="button" onClick={() => window.print()}><Printer size={15} /> Print / Save as PDF</button>
      </div>

      <header className="manual-heading">
        <span className="manual-kicker"><BookOpenText size={14} /> VIDEO INTELLIGENCE · QUICK START</span>
        <h1>POC user manual</h1>
        <p>Follow these steps to turn a training recording into a searchable learning resource.</p>
      </header>

      <section className="manual-steps" aria-label="Steps to analyze a video">
        {steps.map((step, index) => (
          <article className="manual-step" key={step.title}>
            <span className="manual-step-number">{String(index + 1).padStart(2, '0')}</span>
            <span className="manual-step-icon">{step.icon}</span>
            <div><h2>{step.title}</h2><p>{step.detail}</p></div>
          </article>
        ))}
      </section>

      <section className="manual-notes">
        <article>
          <span className="manual-note-icon"><Tags size={15} /></span>
          <div><h2>SharePoint and results</h2><p>The configured SharePoint folder is read by the backend using Microsoft Graph. Your administrator must grant the app access and keep its rotated secret in backend settings. Review AI output before using it in official training or a knowledge base.</p></div>
        </article>
        <article>
          <span className="manual-note-icon help"><CircleHelp size={15} /></span>
          <div><h2>If something goes wrong</h2><p>Check the API status in the header. For a 413 upload error, the server upload limit must be raised. If analysis fails, ask the administrator to check the backend and OpenAI configuration.</p></div>
        </article>
      </section>

      <footer className="manual-footer"><ListFilter size={13} /> Search and category filters help surface reusable learning material.</footer>
    </main>
  );
}
