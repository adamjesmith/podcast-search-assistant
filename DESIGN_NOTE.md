# Design Note

## Architecture

The pipeline is deliberately linear and mostly stateless: **RSS → metadata →
audio → Whisper transcript (with segment timestamps) → chunking → embeddings
→ flat-file index → brute-force retrieval → UI.**

A one-shot ingest script (`npm run ingest`) fetches the 5 most recent
episodes from the feed, downloads each episode's audio, re-encodes it
(mono, 16kHz, 32kbps via ffmpeg) to fit under Whisper's 25MB upload cap,
transcribes with segment-level timestamps, groups segments into ~45s
non-overlapping chunks, embeds each chunk (`text-embedding-3-small`), and
writes everything — episode metadata, chunk text, timestamps, and vectors —
to a single `data/index.json`.

Retrieval is a Next.js API route that embeds the query, loads the index into
an in-process cache, and does brute-force cosine similarity over all chunks.
At this scale (5 episodes, a few hundred chunks) that's on the order of a
few hundred dot products per query — sub-millisecond, no index structure
needed. The same retrieval path serves both workflows in the brief: a text
query searches by its own embedding, and "related discussions elsewhere"
searches by an existing chunk's embedding, filtered to other episodes.

## Key choices and why

**No vector database.** Pinecone/pgvector/etc. solve approximate nearest
neighbor search at scale; at 5 episodes there's nothing to approximate.
Adding one would be infrastructure for a problem that doesn't exist yet in
this slice, at the cost of setup time the brief explicitly says to spend on
retrieval quality instead.

**A JSON file, not SQLite/Postgres.** Same reasoning, one level further:
storage is sized to the actual data volume, not to what production would
eventually need. It's also the most legible walkthrough artifact — the
entire searchable state is one file you can open and read.

**Surfaced similarity scores instead of a relevance cutoff.** Brute-force
top-k always returns *something*, even for a query with no real match —
verified live: on-topic queries score 0.45+, nonsense queries top out
around 0.30–0.36. Those bands overlap too much for a hard cutoff to be
safe, so 0.35 (picked from that observed gap, not derived analytically)
only dims weak results and shows a banner — it never filters, so a real
but oddly-phrased match can't be silently dropped. The "% match" shown
is the raw cosine similarity, not a calibrated confidence probability;
it's a ranking signal, and the right default is to leave the actual
relevance judgment to the domain-expert journalist searching, not a
consumer-style "best answer" box.

**Whisper over relying on feed-provided transcripts.** Checked the actual
feed before building: no `<podcast:transcript>` tag is present despite the
namespace being declared, and episode descriptions are short marketing
copy, not usable transcript content. Audio transcription wasn't optional.

**Audio re-encoding before transcription.** All 5 target episodes exceed
Whisper's 25MB upload limit at their native bitrate (29–51MB observed).
Re-encoding to mono/16kHz/32kbps drops even a 90-minute episode well under
that limit with no meaningful loss for speech ASR — cheaper and simpler
than splitting audio into multiple Whisper calls and stitching timestamps
back together.

**Non-overlapping ~45s chunks.** Keeps each citation unambiguous (a search
hit maps to exactly one place in exactly one episode) at the cost of
occasionally splitting a thought across a chunk boundary. Overlapping
windows would reduce that cost but double-count near-duplicate hits in
results — not worth it at this corpus size.

## Trade-offs considered, not taken

- **RAG-style generated answers** instead of raw excerpts. The brief asks
  for "relevant transcript references," which raw excerpts with timestamps
  satisfy directly; generation adds cost, latency, and a hallucination
  surface for a newsroom tool where the source clip *is* the product.
- **Semantic/topic-aware chunking** (LLM-assisted boundary detection) over
  fixed-duration windows — meaningfully better chunk quality, not worth the
  extra API calls and complexity at 5 episodes.
- **SQLite as a middle ground** between flat-file and Postgres — a
  reasonable next step, skipped because it adds setup time without changing
  retrieval behavior at this scale.

## What changes for production at Global's scale

- **Multi-tenant**: partition by `show_id`/`tenant_id` at the storage layer;
  today there's implicitly one tenant.
- **Cost control**: transcription is the dominant cost. At scale, transcribe
  once per episode (not per re-ingest), cache aggressively, and consider
  cheaper/faster ASR tiers for older or lower-priority archives.
- **Auth**: none exists today; a real deployment needs SSO scoped to
  newsroom/production staff.
- **Freshness**: replace the manual `npm run ingest` with a webhook or
  polling worker per feed, processing only new episodes incrementally.
- **Scale**: hundreds of shows and tens of thousands of episodes need a real
  vector index (pgvector/managed ANN) and a job queue for
  download/transcribe/embed instead of one synchronous script.

## Constraints that shaped this

Time-boxed to 4–6 hours and capped at 5 episodes by the brief — both
choices above (flat file, brute-force search, no queueing) are sized to
those constraints, not to what the system should look like in production.
