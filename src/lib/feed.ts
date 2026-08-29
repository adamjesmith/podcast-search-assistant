import Parser from "rss-parser";
import type { EpisodeMeta } from "./types";

const FEED_URL = "https://feeds.captivate.fm/the-news-agents/";

type FeedItem = {
  guid?: string;
  title?: string;
  isoDate?: string;
  pubDate?: string;
  enclosure?: { url?: string };
  itunes?: { duration?: string };
};

function parseDurationToSeconds(duration?: string): number | undefined {
  if (!duration) return undefined;
  const parts = duration.split(":").map(Number);
  if (parts.some(Number.isNaN)) return undefined;
  return parts.reduceRight((acc, part, i, arr) => acc + part * Math.pow(60, arr.length - 1 - i), 0);
}

/** Fetches the feed and returns the `count` most recent episodes. */
export async function fetchRecentEpisodes(count: number): Promise<EpisodeMeta[]> {
  const parser = new Parser<Record<string, unknown>, FeedItem>();
  const feed = await parser.parseURL(FEED_URL);

  const episodes: EpisodeMeta[] = (feed.items ?? [])
    .filter((item) => Boolean(item.enclosure?.url))
    .map((item) => ({
      id: item.guid ?? item.enclosure!.url!,
      title: item.title ?? "Untitled episode",
      pubDate: item.isoDate ?? item.pubDate ?? new Date().toISOString(),
      audioUrl: item.enclosure!.url!,
      durationSec: parseDurationToSeconds(item.itunes?.duration),
    }))
    .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

  return episodes.slice(0, count);
}
