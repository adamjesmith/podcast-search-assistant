# Project: Podcast Search Assistant — Global FE Technical Assessment

## What this is

A take-home technical assessment for Global. Evaluators care about **product
engineering judgment, architectural reasoning, and how AI coding tools were
used** — not algorithm cleverness, UI polish, or feature count. Keep that
front of mind for every decision: prefer a coherent, defensible thin slice
over a sprawling half-built system.

Full original brief: see `docs/brief.md` (copy it in before starting).

## The task

Build an app that ingests podcast episodes from an RSS feed and lets a user
search the content with natural language, returning relevant transcript
references (episode title, excerpt, timestamp if reasonable).

Real-world framing: this mirrors an internal tool for Global's newsroom /
broadcasting / production teams to find where topics were discussed across
aired episodes. Some searches start from a query ("where was X mentioned?"),
others from an episode ("show me related discussions elsewhere"). Design as
v0.1 of that internal tool, not a consumer product.

## Provided

- Podcast RSS feed (Captivate), e.g. `https://feeds.captivate.fm/the-news-agents/`
- An OpenAI API key, usable for anything the project needs — transcription,
  embeddings, retrieval, generation, or as a coding assistant.

## Core requirements

1. Consume episodes from the RSS feed
2. Turn episode content into a searchable/explorable form
3. Support natural-language queries over the content
4. Return useful results: relevant matches, clear source context (episode
   title, excerpt, timestamp if reasonable), sensible handling of feed
   metadata

## Hard scope constraints

- **Ingest only 3–5 recent episodes.** Do not backfill the archive. If the
  design would scale further, say so in the design note — don't actually run it.
- **UI is not scored.** A clean single-page interface is enough. Spend the
  time budget on ingest, indexing, retrieval, result presentation.
- **Time box: 4–6 hours total.** If still going past 6 hours, stop and
  describe the remainder in the design note instead of finishing it.
- No feature creep beyond core requirements, no test-coverage chasing, no
  custom model training/fine-tuning.

## Tech stack

Next.js is preferred (maps to Global's stack), but any TS framework that
ships a working thin slice in the time budget is acceptable. Default to
Next.js unless there's a specific reason not to.

## AI workflow logging — do this as you go, not at the end

Keep a running `AI_WORKFLOW_LOG.md` and add a bullet each time something
notable happens with AI tool use — don't try to reconstruct it after 5 hours
of work. Capture:

- Where AI accelerated the work vs. where it didn't
- Places AI output was accepted as-is vs. had to be redirected/rewritten
- Anywhere AI got something wrong and how it was caught
- How architectural coherence was maintained when AI would've made it messy
- Which AI tools were used and roughly for what

Target: 5–10 honest bullets (or a short paragraph), not exhaustive.

## Design note — draft incrementally

Maintain `DESIGN_NOTE.md` (~500–800 words final) covering:

- Key architectural choices — what and why
- Trade-offs considered but not taken
- What would change for production readiness at Global's scale (see below)
- Constraints that shaped the design

## Production-readiness angle (design note only — do not build)

Ground this in Global's real context:

- **Multi-tenant**: same tool serving multiple broadcasters, isolated content
- **Cost control**: transcription/embeddings aren't free at scale
- **Auth & access**: internal tool for journalists/production teams
- **Freshness**: new episodes drop constantly — index currency
- **Scale**: hundreds of shows, tens of thousands of episodes over time

Show awareness, don't implement it.

## Deliverables checklist

- [ ] Source code (git repo, GitHub link)
- [ ] `README.md` — local setup and run instructions
- [ ] `DESIGN_NOTE.md` (~500–800 words)
- [ ] `AI_WORKFLOW_LOG.md` (~5–10 bullets or short paragraph)

## Evaluation priorities (ranked — judgment above delivery, deliberately)

1. Product engineering judgment — framing, scope calls, what to build vs. skip
2. End-to-end delivery quality — does it work, is the thin slice coherent
3. AI tooling fluency — considered use, not just acceptance of output
4. Architecture and scalability thinking (design note + walkthrough)
5. Communication in the walkthrough — defending/revising decisions live

## Explicitly NOT wanted

- Feature completeness beyond core requirements
- UI polish
- Test coverage as a scoring dimension (sensible testing is fine, not the point)
- Backfilling the archive
- Custom-training or fine-tuning models
- Anything outside the 4–6 hour window

## Working agreement for this repo

- When proposing architecture or scope changes, weigh them against the
  evaluation priorities above (judgment > delivery) before optimizing for
  "more features."
- Flag out loud when a design decision belongs in the design note vs. in code.
- Prompt to add an AI_WORKFLOW_LOG.md entry after any significant AI-assisted
  decision (accepted, redirected, or rejected).
- Default to Next.js + TypeScript unless told otherwise.


## Git commit & branch workflow

All work happens on a `dev` branch — never commit directly to `main`.

1. At the start of the session, create and switch to `dev` from `main` if it doesn't already exist (`git checkout -b dev`).
2. Commit at every meaningful checkpoint (see "Checkpoints" below), then immediately push the branch (`git push -u origin dev` on the first push, `git push` after).
3. After the **first** push, open a PR from `dev` into `main` using the `gh` CLI (`gh pr create --base main --head dev --title ... --body ...`) if one doesn't already exist. Do not open a second PR — subsequent pushes to `dev` update the existing PR automatically.
4. Keep the PR description up to date: after each push, append a short bullet to the PR body summarizing what the commit added (`gh pr edit --body ...`). This turns the PR into a running changelog of the build.
5. Do not merge the PR — leave it open for review unless explicitly told to merge.

### Checkpoints

A checkpoint is a working, coherent unit of progress, for example:
- RSS feed parsing/ingestion working end-to-end
- Transcription pipeline producing usable text
- Embeddings generated and stored
- Search/retrieval endpoint returning results
- UI wired up to the search endpoint
- Any point where you redirect or override AI output in a meaningful way

### Commit rules

1. Before committing, run the build/lint/tests if they exist. Only commit if the app is in a working state, or clearly flag WIP in the message if not.
2. Commit messages: imperative mood, conventional-commit style (`feat:`, `fix:`, `refactor:`, `chore:`), specific about what and why — these double as a build log.
3. Keep commits small and atomic — one logical change per commit.
4. Never commit secrets, API keys, or `.env` files. Confirm `.gitignore` covers them before the first commit.
5. Don't wait for permission to commit/push at a checkpoint — do it proactively, then briefly say what was pushed and to which PR.
6. If a commit follows a moment where AI output was rejected, redirected, or rewritten, note that briefly in the commit body (e.g. "AI's first pass over-fetched episodes; capped to 5 per RSS scope constraint") — raw material for the AI workflow log.
7. After opening the initial PR, stop and wait for explicit approval before continuing to the next checkpoint.