export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
export const isApiConfigured = Boolean(API_BASE_URL) || import.meta.env.DEV;

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T | null> {
  if (!API_BASE_URL && !import.meta.env.DEV) {
    return null;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const body = (await response.json()) as { detail?: string };
      if (body.detail) message = body.detail;
    } catch {
      // Keep the status-based message when the server does not return JSON.
    }
    throw new Error(message);
  }

  if (response.status === 204) return null;

  return (await response.json()) as T;
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
  const response = await fetch(`${API_BASE_URL}/api/videos/upload/`, { method: 'POST', body: form });
  if (!response.ok) {
    let message = `Video processing failed (${response.status}).`;
    try { message = ((await response.json()) as { detail?: string }).detail || message; } catch { /* retain status message */ }
    throw new Error(message);
  }
  return (await response.json()) as import('../types/video').VideoRecord;
}
