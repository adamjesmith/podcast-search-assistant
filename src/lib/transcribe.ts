import { createReadStream } from "node:fs";
import OpenAI from "openai";

export const TRANSCRIPTION_MODEL = "whisper-1";

export interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
}

/** Transcribes an audio file, returning segment-level timestamps. */
export async function transcribeAudio(client: OpenAI, filePath: string): Promise<TranscriptSegment[]> {
  const response = await client.audio.transcriptions.create({
    file: createReadStream(filePath),
    model: TRANSCRIPTION_MODEL,
    response_format: "verbose_json",
    timestamp_granularities: ["segment"],
  });

  // The SDK's verbose_json type doesn't declare `segments`, but the API returns it.
  const segments = (response as unknown as { segments?: TranscriptSegment[] }).segments ?? [];
  return segments.map((s) => ({ start: s.start, end: s.end, text: s.text.trim() }));
}
