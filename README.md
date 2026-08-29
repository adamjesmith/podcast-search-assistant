# Podcast Search Assistant

Global FE technical assessment — an app that ingests podcast episodes from an
RSS feed and lets a user search the content with natural language.

See `docs/brief.md` for the original brief, `DESIGN_NOTE.md` for architecture
and trade-offs, and `AI_WORKFLOW_LOG.md` for how AI tools were used during
the build.

## Setup

Requires Node 20+ and `ffmpeg` on PATH (`brew install ffmpeg` on macOS).

```bash
npm install
cp .env.example .env.local   # then add your OPENAI_API_KEY
```

## Ingest episodes

Downloads the 5 most recent episodes from the feed, transcribes them via
Whisper, chunks and embeds the transcripts, and writes `data/index.json`.

```bash
npm run ingest
```

This takes several minutes (dominated by Whisper transcription time) and
makes real OpenAI API calls (Whisper + embeddings). Re-run any time to
refresh the index; it fully overwrites `data/index.json`. Run this before
starting the dev server — the search API caches the index in memory for the
life of the process, so restart `npm run dev` if you re-ingest while it's
already running.

## Run the app

```bash
npm run dev
```

Open http://localhost:3000 and search. If `data/index.json` doesn't exist
yet, the search API will return an error telling you to run `npm run ingest`
first.
