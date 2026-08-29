# Technical Assessment: Podcast Search Assistant

## Overview

Build a small application that ingests podcast episodes and lets users search podcast content using natural language.

This assessment is intentionally open-ended. **We're evaluating product engineering judgment, architectural reasoning, and how you use AI coding tools in practice — not algorithm puzzles, not the pixel-perfectness of a UI, not how many features you ship.**

## Real-world context

This mirrors an actual workflow at Global. Our newsroom, broadcasting, and production teams regularly need to find where topics were mentioned or discussed across previously-aired radio segments and podcast episodes. Some workflows start from a search ("where was Trump mentioned?"), others start from an episode ("show me related discussions across other episodes"). Design as if this were the v0.1 of an internal tool for those teams.

## What we'll provide

- A podcast RSS feed URL (Captivate). Example source: `https://feeds.captivate.fm/the-news-agents/`
- An OpenAI API key so you don't spend your own credits. You can use it for **anything** the project needs — transcription, embeddings, retrieval, generation, or as your coding assistant (Codex, o-family models, etc.)

## The prompt

Build an app that lets a user query podcast content and find relevant transcript references across recent episodes.

## Core requirements

Your solution should:

1. Consume podcast episodes from the RSS feed
2. Turn episode content into a form that users can search and explore
3. Support natural-language queries over podcast content
4. Return useful results — relevant matches, clear source context (episode title, excerpt, timestamp if reasonable), and sensible handling of feed metadata

That's the whole functional spec. How you get there is your design decision.

## Time expectation

**We expect this to take around 4–6 hours of focused work.** Please don't spend more than that. If you're still going after 6 hours, stop where you are and describe the rest in the design note. We're testing structure and reasoning, not endurance.

## Scope constraints

- **Ingest 3–5 recent episodes** — no need to backfill the archive. If you build something that could scale to hundreds, discuss that in the design note; don't actually run it.
- **UI is not a scoring dimension.** A clean single-page interface is more than enough. Spend the time on ingest, indexing, retrieval, and result presentation.
- **Perfection isn't the point.** We'd rather see a working end-to-end thin slice with sharp architectural reasoning than a half-built system with polished CSS.

## Tech stack

**Next.js is preferred** because it maps to our stack — but use whatever TS framework and tools let you ship a working thin slice in the time budget.

## How to think about AI usage

Using AI coding tools is expected and encouraged. This assessment is designed for you to use them. **We're more interested in *how* you use them than in *whether* you use them.**

We'd like to see:
- Where AI accelerated you and where it didn't
- Places you accepted AI output as-is vs where you had to redirect, rewrite, or push back
- Where AI got something wrong — and how you noticed
- How you kept the architecture coherent when AI would happily have made it messy

Please bring **a short AI workflow log** as part of your deliverables (see below). It doesn't need to be exhaustive — 5–10 short bullets is fine — but it needs to be honest.

## Deliverables

Submit:

1. **Source code** (a git repo — GitHub link is fine)
2. **`README`** with local setup and run instructions
3. **Design note** (≈500–800 words) covering:
   - Key architectural choices — what you picked and why
   - The trade-offs you considered but didn't take
   - What you'd change for production readiness at Global's scale
   - Constraints you hit that shaped the design
4. **AI workflow log** (≈5–10 short bullets or a paragraph) covering:
   - Which AI tools you used and roughly for what
   - One decision AI helped with well
   - One decision where AI got it wrong or you had to redirect it
   - Anything you deliberately did *not* delegate to AI

## For the "production readiness" section

Ground it in Global's actual context. Think about:

- **Multi-tenant** — same tool serving multiple broadcasters, isolated content
- **Cost control** — transcription and embeddings aren't free at scale; how would you manage that?
- **Authentication and access** — this would be internal to journalists / production teams
- **Freshness** — new episodes drop constantly; how do you keep the index current?
- **Scale** — hundreds of shows, tens of thousands of episodes over time

You don't need to build any of this. Just show us you can see it coming.

## How you'll be evaluated

Primary dimensions:

1. **Product engineering judgment** — problem framing, scope decisions, "what to build vs skip"
2. **End-to-end delivery quality** — does it work, is the thin slice coherent, are the seams reasonable
3. **AI tooling fluency** — evidence of considered use, not just acceptance of output
4. **Architecture and scalability thinking** — the design note plus the walkthrough
5. **Communication in the walkthrough** — how you defend and revise your decisions live

You'll notice this list ranks *judgment* above *delivery*. That's deliberate.

## What we're not looking for

- Feature completeness beyond the core requirements
- UI polish
- Test coverage as a scoring dimension (though sensible testing is fine)
- Backfilling the entire archive
- Custom-training models or fine-tuning
- Anything that took you outside the 4–6 hour window

## Deadline & logistics

- **Submission window:** one calendar week from receipt of this brief
- **Walkthrough:** scheduled within 2 days of submission
- If life happens and you need an extension, just tell us — we'd rather know than have you rush

## Questions

If anything is unclear before you start, reply to this email and ask. We'd rather answer a question up front than have you assume something we didn't intend.

Good luck — looking forward to seeing what you build and, more importantly, hearing how you thought about it.
