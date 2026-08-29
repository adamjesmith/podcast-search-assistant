export interface EpisodeMeta {
  id: string; // RSS guid
  title: string;
  pubDate: string; // ISO string
  audioUrl: string;
  durationSec?: number;
}

export interface Chunk {
  id: string; // `${episodeId}::${index}`
  episodeId: string;
  episodeTitle: string;
  text: string;
  startSec: number;
  endSec: number;
  embedding: number[];
}

export interface IndexFile {
  createdAt: string;
  models: {
    transcription: string;
    embedding: string;
  };
  episodes: EpisodeMeta[];
  chunks: Chunk[];
}

export interface SearchResult {
  chunkId: string;
  episodeId: string;
  episodeTitle: string;
  text: string;
  startSec: number;
  endSec: number;
  score: number;
}
