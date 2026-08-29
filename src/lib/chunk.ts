import type { TranscriptSegment } from "./transcribe";

export interface TextChunk {
  text: string;
  startSec: number;
  endSec: number;
}

/**
 * Groups consecutive transcript segments into ~targetDurationSec windows.
 * Non-overlapping: keeps citations unambiguous and avoids duplicate hits
 * for the same moment, at the cost of the occasional split thought at a
 * window boundary — an acceptable trade at this scale.
 */
export function chunkSegments(segments: TranscriptSegment[], targetDurationSec = 45): TextChunk[] {
  const chunks: TextChunk[] = [];
  let current: TranscriptSegment[] = [];

  const flush = () => {
    if (current.length === 0) return;
    chunks.push({
      text: current.map((s) => s.text).join(" ").replace(/\s+/g, " ").trim(),
      startSec: current[0].start,
      endSec: current[current.length - 1].end,
    });
    current = [];
  };

  for (const segment of segments) {
    current.push(segment);
    const duration = current[current.length - 1].end - current[0].start;
    if (duration >= targetDurationSec) flush();
  }
  flush();

  return chunks.filter((c) => c.text.length > 0);
}
