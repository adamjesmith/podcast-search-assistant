import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { embedTexts } from "@/lib/embeddings";
import { searchByEmbedding, searchRelatedToChunk } from "@/lib/store";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q")?.trim();
  const relatedTo = req.nextUrl.searchParams.get("relatedTo")?.trim();

  try {
    if (relatedTo) {
      const results = await searchRelatedToChunk(relatedTo);
      return NextResponse.json({ results });
    }

    if (!query) {
      return NextResponse.json({ error: "Missing query parameter 'q'" }, { status: 400 });
    }

    const client = new OpenAI();
    const [embedding] = await embedTexts(client, [query]);
    const results = await searchByEmbedding(embedding);
    return NextResponse.json({ results });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const hint = message.includes("ENOENT")
      ? "No index found — run `npm run ingest` first."
      : undefined;
    return NextResponse.json({ error: message, hint }, { status: 500 });
  }
}
