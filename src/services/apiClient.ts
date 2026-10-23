export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
export const isApiConfigured = Boolean(API_BASE_URL) || import.meta.env.DEV;
const TOKEN_KEY = 'video-intelligence-token';

export interface Account {
  id: number;
  name: string;
  email: string;
}

export interface AuthSession {
  token: string;
  user: Account;
}

export interface SharePointImport {
  id: string;
  folderName: string;
  status: 'queued' | 'processing' | 'completed' | 'completed_with_errors' | 'failed';
  total: number;
  processed: number;
  imported: number;
  failed: number;
  errors: Array<{ title?: string; detail: string }>;
  createdAt: string;
  updatedAt: string;
}

export function getAuthToken(): string | null {
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string | null): void {
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

function requestErrorMessage(response: Response, detail: string): string {
  if (response.status !== 429) return detail;
  const secondsFromHeader = Number(response.headers.get('Retry-After'));
  const secondsFromDetail = Number(detail.match(/available in\s+(\d+)\s+seconds?/i)?.[1]);
  const seconds = secondsFromHeader || secondsFromDetail;
  if (!Number.isFinite(seconds) || seconds <= 0) return 'This action is temporarily rate-limited. Please wait a little while, then try again.';
  const minutes = Math.ceil(seconds / 60);
  const wait = minutes < 1 ? 'less than a minute' : `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
  return `You’ve reached the request limit for now. Please try again in about ${wait}.`;
}

function requestHeaders(headers?: HeadersInit): Headers {
  const result = new Headers(headers);
  if (!result.has('Content-Type')) result.set('Content-Type', 'application/json');
  const token = getAuthToken();
  if (token) result.set('Authorization', `Token ${token}`);
  return result;
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T | null> {
  if (!API_BASE_URL && !import.meta.env.DEV) {
    return null;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: requestHeaders(options.headers),
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const body = (await response.json()) as { detail?: unknown } & Record<string, unknown>;
      if (typeof body.detail === 'string') message = body.detail;
      else {
        const first = Object.values(body).flatMap((value) => Array.isArray(value) ? value : typeof value === 'string' ? [value] : []);
        if (first.length) message = String(first[0]);
      }
    } catch {
      // Keep the status-based message when the server does not return JSON.
    }
    throw new Error(requestErrorMessage(response, message));
  }

  if (response.status === 204) return null;

  return (await response.json()) as T;
}

export function loginWithApi(email: string, password: string) {
  return apiRequest<AuthSession>('/api/auth/login/', { method: 'POST', body: JSON.stringify({ email, password }) });
}

export function registerWithApi(name: string, email: string, password: string) {
  return apiRequest<AuthSession>('/api/auth/register/', { method: 'POST', body: JSON.stringify({ name, email, password }) });
}

export function logoutWithApi() {
  return apiRequest<null>('/api/auth/logout/', { method: 'POST' });
}

export function currentAccountWithApi() {
  return apiRequest<Account>('/api/auth/me/');
}

export function listSharePointImports() {
  return apiRequest<SharePointImport[]>('/api/sharepoint/imports/recent/');
}

export function startSharePointImport() {
  return apiRequest<SharePointImport>('/api/sharepoint/imports/', { method: 'POST', body: JSON.stringify({}) });
}

export function getSharePointImport(id: string) {
  return apiRequest<SharePointImport>(`/api/sharepoint/imports/${id}/`);
}

export async function analyzeWithApi(transcript: string, title: string) {
  return apiRequest<{
    summary: string;
    categories: Array<'Design' | 'Content' | 'Marketing'>;
    keyTopics: string[];
    kbScore: number;
    trainingReady: boolean;
    analysisMode: 'ai';
  }>('/api/analyze/', { method: 'POST', body: JSON.stringify({ transcript, title }) });
}

export async function uploadVideoWithApi(file: File, title: string, sourceUrl: string): Promise<import('../types/video').VideoRecord> {
  const form = new FormData();
  form.append('file', file);
  form.append('title', title);
  form.append('sourceUrl', sourceUrl);
  const headers = new Headers();
  const token = getAuthToken();
  if (token) headers.set('Authorization', `Token ${token}`);
  const response = await fetch(`${API_BASE_URL}/api/videos/upload/`, { method: 'POST', headers, body: form });
  if (!response.ok) {
    let message = `Video processing failed (${response.status}).`;
    try { message = ((await response.json()) as { detail?: string }).detail || message; } catch { /* retain status message */ }
    throw new Error(requestErrorMessage(response, message));
  }
  return (await response.json()) as import('../types/video').VideoRecord;
}
