import type { VideoRecord } from '../types/video';

export function exportVideosAsCsv(videos: VideoRecord[], fileName: string) {
  const headers = [
    'id',
    'title',
    'sourceUrl',
    'summary',
    'categories',
    'keyTopics',
    'duration',
    'language',
    'kbScore',
    'trainingReady',
    'status',
    'analysisMode',
    'createdAt',
    'updatedAt',
  ];

  const rows = videos.map((video) => [
    video.id,
    video.title,
    video.sourceUrl ?? '',
    video.summary,
    video.categories.join('; '),
    video.keyTopics.join('; '),
    video.duration ?? '',
    video.language ?? '',
    String(video.kbScore),
    String(video.trainingReady),
    video.status,
    video.analysisMode,
    video.createdAt,
    video.updatedAt,
  ]);

  const csvContent = [headers, ...rows]
    .map((row) =>
      row
        .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
        .join(','),
    )
    .join('\n');

  triggerDownload(fileName, 'text/csv;charset=utf-8;', csvContent);
}

function triggerDownload(fileName: string, mimeType: string, content: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
