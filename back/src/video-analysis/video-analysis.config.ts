export interface VideoAnalysisConfig {
  ffmpeg: {
    audioFormat: string;
    sampleRate: string;
    channels: string;
    codec: string;
  };
  analysis: {
    maxLearningObjectives: number;
    maxRequirements: number;
    temperature: number;
    maxTokens: number;
  };
}

export const defaultVideoAnalysisConfig: VideoAnalysisConfig = {
  ffmpeg: {
    audioFormat: 'wav',
    sampleRate: '16000',
    channels: '1',
    codec: 'pcm_s16le',
  },
  analysis: {
    maxLearningObjectives: 5,
    maxRequirements: 4,
    temperature: 0.3,
    maxTokens: 500,
  },
}; 