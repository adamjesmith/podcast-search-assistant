"use client";

import { useState } from "react";
import type { SearchResult } from "@/lib/types";
import styles from "./page.module.css";

function formatTimestamp(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// Brute-force cosine search always returns its top-K, even for a query with
// no real match in the corpus — observed scores for genuinely unrelated
// queries top out around 0.30-0.33, while on-topic queries score 0.45+.
// Below this, warn rather than silently presenting noise as confident hits.
const LOW_CONFIDENCE_THRESHOLD = 0.35;

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  async function runSearch(params: URLSearchParams) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/search?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.hint ?? data.error ?? "Search failed");
      setResults(data.results ?? []);
      setSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    runSearch(new URLSearchParams({ q: query.trim() }));
  }

  function findRelated(chunkId: string) {
    runSearch(new URLSearchParams({ relatedTo: chunkId }));
  }

  return (
    <main className={styles.page}>
      <h1>Podcast Search — The News Agents</h1>
      <p className={styles.subtitle}>
        Search recent episodes by topic. Click &ldquo;related elsewhere&rdquo; on a
        result to find other episodes touching the same subject.
      </p>

      <form onSubmit={handleSubmit} className={styles.searchForm}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. where was Trump mentioned?"
          className={styles.input}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {error && <p className={styles.error}>{error}</p>}

      {searched && results.length > 0 && results[0].score < LOW_CONFIDENCE_THRESHOLD && (
        <p className={styles.lowConfidenceNotice}>
          No strong matches for this query — showing the closest results anyway,
          but treat them as low confidence.
        </p>
      )}

      {searched && results.length === 0 && !error && <p>No results.</p>}

      <ul className={styles.results}>
        {results.map((r) => {
          const weak = r.score < LOW_CONFIDENCE_THRESHOLD;
          return (
            <li key={r.chunkId} className={`${styles.result} ${weak ? styles.weakResult : ""}`}>
              <div className={styles.resultHeader}>
                <strong>{r.episodeTitle}</strong>
                <span className={styles.timestamp}>{formatTimestamp(r.startSec)}</span>
              </div>
              <p>{r.text}</p>
              <div className={styles.resultFooter}>
                <button className={styles.relatedButton} onClick={() => findRelated(r.chunkId)}>
                  related elsewhere →
                </button>
                <span className={styles.score} title="Similarity score">
                  {Math.round(r.score * 100)}% match
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
