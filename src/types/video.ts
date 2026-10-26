export type Category = 'Design' | 'Content' | 'Marketing';

export type VideoStatus = 'pending' | 'processing' | 'indexed' | 'failed';

export type AnalysisMode = 'ai' | 'manual';

export interface VideoRecord {
  id: string;
  title: string;
  sourceUrl?: string;
  sourceType: 'sharepoint' | 'upload' | 'transcript';
  summary: string;
  transcript?: string;
  categories: Category[];
  keyTopics: string[];
  duration?: string;
  language?: string;
  kbScore: number;
  trainingReady: boolean;
  status: VideoStatus;
  errorMessage?: string;
  analysisMode: AnalysisMode;
  createdAt: string;
  updatedAt: string;
}

export type TrainingFilter = 'all' | 'ready' | 'not-ready';
