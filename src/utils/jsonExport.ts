import type { VideoRecord } from '../types/video';

export function exportVideosAsJson(videos: VideoRecord[], fileName: string) {
  const payload = JSON.stringify(videos, null, 2);
  const blob = new Blob([payload], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
