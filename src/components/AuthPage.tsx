import { useState, type FormEvent } from 'react';
import { ArrowRight, Check, FileVideo2, Layers3, LockKeyhole, Play, ShieldCheck, Sparkles } from 'lucide-react';
import { API_BASE_URL, loginWithApi, registerWithApi, type AuthSession } from '../services/apiClient';

type AuthMode = 'home' | 'login' | 'register';
const authApiUrl = new URL(API_BASE_URL || window.location.origin, window.location.href);
const secureAuthTransport = authApiUrl.protocol === 'https:' || ['localhost', '127.0.0.1'].includes(authApiUrl.hostname);


export function AuthPage({ onAuthenticated }: { onAuthenticated: (session: AuthSession) => void }) {
  const [mode, setMode] = useState<AuthMode>('home');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError(''); setLoading(true);
    try {
      const session = mode === 'register'
        ? await registerWithApi(name.trim(), email.trim(), password)
        : await loginWithApi(email.trim(), password);
      if (!session?.token) throw new Error('The backend did not create a session. Check the API connection.');
      onAuthenticated(session);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not sign you in. Please try again.');
    } finally { setLoading(false); }
  };

  return <div className="site-shell">
    <header className="site-nav"><a href="#home" className="site-brand"><span className="site-brand-mark"><FileVideo2 size={19} /></span><span><b>Video Intelligence</b><small>VIDEO KNOWLEDGE, ORGANIZED</small></span></a><nav><button type="button" className="nav-link" onClick={() => { setMode('login'); setError(''); }}>Sign in</button><button type="button" className="nav-cta" onClick={() => { setMode('register'); setError(''); }}>Create account <ArrowRight size={14} /></button></nav></header>

    <main id="home" className="home-main">
      <section className="home-hero">
        <div className="hero-copy"><div className="home-eyebrow"><span><Sparkles size={13} /></span> VIDEO INTELLIGENCE FOR YOUR TEAM</div><h1>Every video has<br />something <em>worth keeping.</em></h1><p>Turn training recordings into clear summaries, useful topics, and knowledge your team can find again.</p><div className="hero-actions"><button type="button" className="hero-primary" onClick={() => { setMode('register'); setError(''); }}>Create your workspace <ArrowRight size={16} /></button><button type="button" className="hero-secondary" onClick={() => { setMode('login'); setError(''); }}>Sign in to your library</button></div><div className="hero-trust"><ShieldCheck size={15} /><span>Your library is private to your account</span><i /><span>AI-powered video insights</span></div></div>

        {mode === 'home' ? <div className="hero-art" aria-label="How video intelligence works"><div className="art-glow" /><div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" /><div className="art-core"><span className="art-play"><Play size={22} fill="currentColor" /></span><b>VIDEO</b><small>YOUR SOURCE MATERIAL</small></div><div className="art-node node-summary"><span><FileVideo2 size={15} /></span><b>Clear summaries</b><small>One paragraph at a time</small></div><div className="art-node node-topics"><span><Layers3 size={15} /></span><b>Key topics</b><small>Find ideas faster</small></div><div className="art-node node-ready"><span><Check size={15} /></span><b>Training ready</b><small>Knowledge base insights</small></div><div className="art-caption"><span className="art-caption-line" /> FROM RECORDING TO REUSABLE KNOWLEDGE</div></div> : <div className="auth-card"><div className="auth-card-top"><span className="auth-lock"><LockKeyhole size={17} /></span><span className="auth-step">PRIVATE WORKSPACE</span></div><h2>{mode === 'register' ? 'Create your account' : 'Welcome back'}</h2><p>{mode === 'register' ? 'Start building a library your team can learn from.' : 'Sign in to continue to your video library.'}</p>{!secureAuthTransport && <div className="auth-transport-warning"><ShieldCheck size={14} /> Demo access uses HTTP, so credentials and uploads are not encrypted in transit. Use a test account and non-sensitive videos only.</div>}<form onSubmit={submit}>
          {mode === 'register' && <label>Your name<input autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="How should we address you?" required maxLength={150} /></label>}
          <label>Work email<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" required /></label>
          <label>Password<input type="password" autoComplete={mode === 'register' ? 'new-password' : 'current-password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder={mode === 'register' ? 'At least 12 characters' : 'Enter your password'} required minLength={mode === 'register' ? 12 : 1} maxLength={128} /></label>
          {error && <div role="alert" className="auth-error">{error}</div>}
          <button type="submit" className="auth-submit" disabled={loading}>{loading ? 'Please wait…' : mode === 'register' ? 'Create account' : 'Sign in'} <ArrowRight size={15} /></button>
        </form><div className="auth-switch">{mode === 'register' ? 'Already have an account?' : 'New to Video Intelligence?'} <button type="button" onClick={() => { setMode(mode === 'register' ? 'login' : 'register'); setError(''); }}>{mode === 'register' ? 'Sign in' : 'Create an account'}</button></div><div className="auth-password-note"><LockKeyhole size={12} /> Passwords are securely hashed by Django.</div></div>}
      </section>

      <section className="home-features"><div className="features-heading"><span>BUILT FOR BETTER LEARNING</span><h2>Make every recording more useful.</h2></div><div className="feature-grid"><article><span className="feature-icon feature-violet"><FileVideo2 size={18} /></span><h3>Summaries people can use</h3><p>Get a concise paragraph that captures the useful lessons from each recording.</p></article><article><span className="feature-icon feature-teal"><Layers3 size={18} /></span><h3>Organized knowledge</h3><p>Group videos across Design, Content, and Marketing with searchable key topics.</p></article><article><span className="feature-icon feature-peach"><Check size={18} /></span><h3>Ready for what’s next</h3><p>Review training readiness and knowledge usefulness before adding material to your resources.</p></article></div></section>
      <footer className="home-footer"><span>VIDEO INTELLIGENCE</span><span>Thoughtful summaries. Knowledge that lasts.</span></footer>
    </main>
  </div>;
}
