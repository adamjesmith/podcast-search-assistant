import dotenv from "dotenv";
import { mkdtemp, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import OpenAI from "openai";

import { fetchRecentEpisodes } from "../src/lib/feed";
import { downloadFile, compressForTranscription, removeIfExists } from "../src/lib/audio";
import { transcribeAudio, TRANSCRIPTION_MODEL } from "../src/lib/transcribe";
import { chunkSegments } from "../src/lib/chunk";
import { embedTexts, EMBEDDING_MODEL } from "../src/lib/embeddings";
import type { Chunk, IndexFile } from "../src/lib/types";

dotenv.config({ path: ".env.local" });

const EPISODE_COUNT = Number(process.env.INGEST_EPISODE_COUNT ?? 5);
const OUTPUT_PATH = path.join(process.cwd(), "data", "index.json");

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set. Add it to .env.local before running ingest.");
  }
  const client = new OpenAI();

  console.log(`Fetching ${EPISODE_COUNT} most recent episodes from feed...`);
  const episodes = await fetchRecentEpisodes(EPISODE_COUNT);
  episodes.forEach((e) => console.log(`  - ${e.title} (${e.pubDate})`));

  const workDir = await mkdtemp(path.join(tmpdir(), "podcast-ingest-"));
  const allChunks: Chunk[] = [];

  for (const episode of episodes) {
    console.log(`\n[${episode.title}] downloading audio...`);
    const rawPath = path.join(workDir, `${episode.id.replace(/[^a-z0-9]/gi, "_")}-raw.mp3`);
    const compressedPath = rawPath.replace("-raw.mp3", "-compressed.mp3");
    await downloadFile(episode.audioUrl, rawPath);

    console.log(`[${episode.title}] compressing for transcription...`);
    await compressForTranscription(rawPath, compressedPath);
    await removeIfExists(rawPath);

    console.log(`[${episode.title}] transcribing (this can take a few minutes)...`);
    const segments = await transcribeAudio(client, compressedPath);
    await removeIfExists(compressedPath);
    console.log(`[${episode.title}] got ${segments.length} segments`);

    const textChunks = chunkSegments(segments);
    console.log(`[${episode.title}] grouped into ${textChunks.length} chunks, embedding...`);
    const embeddings = await embedTexts(client, textChunks.map((c) => c.text));

    textChunks.forEach((chunk, i) => {
      allChunks.push({
        id: `${episode.id}::${i}`,
        episodeId: episode.id,
        episodeTitle: episode.title,
        text: chunk.text,
        startSec: chunk.startSec,
        endSec: chunk.endSec,
        embedding: embeddings[i],
      });
    });
  }

  const index: IndexFile = {
    createdAt: new Date().toISOString(),
    models: { transcription: TRANSCRIPTION_MODEL, embedding: EMBEDDING_MODEL },
    episodes,
    chunks: allChunks,
  };

  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, JSON.stringify(index, null, 2));
  console.log(`\nWrote ${allChunks.length} chunks across ${episodes.length} episodes to ${OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
