import { spawn } from "node:child_process";
import { createWriteStream } from "node:fs";
import { unlink } from "node:fs/promises";
import { get as httpGet } from "node:http";
import { get as httpsGet } from "node:https";
import { pipeline } from "node:stream/promises";

/**
 * Downloads a URL to a local file path, following redirects manually via
 * Node's core http/https modules. Deliberately not using the global fetch
 * (undici) here: it returns a bare 404 on this feed's redirecting CDN URLs
 * (episodes.captivate.fm -> dax.captivate.fm) while curl and node:https
 * both follow the same redirect correctly — an undici-specific quirk with
 * this CDN, not a real 404.
 */
export async function downloadFile(url: string, destPath: string, redirectsLeft = 5): Promise<void> {
  return new Promise((resolve, reject) => {
    const get = url.startsWith("http:") ? httpGet : httpsGet;
    const req = get(url, (res) => {
      const status = res.statusCode ?? 0;

      if (status >= 300 && status < 400 && res.headers.location) {
        res.resume();
        if (redirectsLeft <= 0) {
          reject(new Error(`Too many redirects for ${url}`));
          return;
        }
        const nextUrl = new URL(res.headers.location, url).toString();
        downloadFile(nextUrl, destPath, redirectsLeft - 1).then(resolve, reject);
        return;
      }

      if (status !== 200) {
        res.resume();
        reject(new Error(`Failed to download ${url}: ${status} ${res.statusMessage}`));
        return;
      }

      pipeline(res, createWriteStream(destPath)).then(resolve, reject);
    });
    req.on("error", reject);
  });
}

/**
 * Re-encodes audio to mono, 16kHz, 32kbps mp3. Whisper's API caps uploads at
 * 25MB; podcast episodes in this feed run 30-50MB at their original bitrate.
 * This encoding keeps even a ~90min episode comfortably under that limit
 * while remaining more than sufficient quality for speech transcription.
 */
export async function compressForTranscription(srcPath: string, destPath: string): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const ffmpeg = spawn("ffmpeg", [
      "-y",
      "-i", srcPath,
      "-ac", "1",
      "-ar", "16000",
      "-b:a", "32k",
      destPath,
    ]);
    let stderr = "";
    ffmpeg.stderr.on("data", (chunk) => { stderr += chunk; });
    ffmpeg.on("error", reject);
    ffmpeg.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exited with code ${code}: ${stderr.slice(-2000)}`));
    });
  });
}

export async function removeIfExists(path: string): Promise<void> {
  await unlink(path).catch(() => {});
}
