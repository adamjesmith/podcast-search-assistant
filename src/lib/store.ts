import { readFile } from "node:fs/promises";
import path from "node:path";
import type { IndexFile, SearchResult } from "./types";

const INDEX_PATH = path.join(process.cwd(), "data", "index.json");

let cached: IndexFile | null = null;

/**
 * Loads data/index.json into memory. At the ~5-episode scope of this project
 * (a few hundred chunks) an in-process cache plus brute-force cosine search
 * is simpler and faster than standing up a vector database — see
 * DESIGN_NOTE.md for how this would change at production scale.
 *
 * Cached for the life of the process: re-running `npm run ingest` while the
 * dev server is already running won't be picked up until it's restarted.
 */
export async function loadIndex(): Promise<IndexFile> {
  if (cached) return cached;
  const raw = await readFile(INDEX_PATH, "utf-8");
  cached = JSON.parse(raw) as IndexFile;
  return cached;
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dot / denominator;
}

export async function searchByEmbedding(queryEmbedding: number[], topK = 8): Promise<SearchResult[]> {
  const index = await loadIndex();
  const scored = index.chunks.map((chunk) => ({
    chunkId: chunk.id,
    episodeId: chunk.episodeId,
    episodeTitle: chunk.episodeTitle,
    text: chunk.text,
    startSec: chunk.startSec,
    endSec: chunk.endSec,
    score: cosineSimilarity(queryEmbedding, chunk.embedding),
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}

/** Finds chunks from other episodes most similar to a given chunk — powers the "related discussions elsewhere" flow. */
export async function searchRelatedToChunk(chunkId: string, topK = 8): Promise<SearchResult[]> {
  const index = await loadIndex();
  const source = index.chunks.find((c) => c.id === chunkId);
  if (!source) return [];
  const results = await searchByEmbedding(source.embedding, topK + 20);
  return results.filter((r) => r.episodeId !== source.episodeId).slice(0, topK);
}
