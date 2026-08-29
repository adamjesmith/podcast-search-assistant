import OpenAI from "openai";

export const EMBEDDING_MODEL = "text-embedding-3-small";

/** Embeds a batch of texts in one request. OpenAI allows arrays up to 2048 inputs. */
export async function embedTexts(client: OpenAI, texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];
  const response = await client.embeddings.create({
    model: EMBEDDING_MODEL,
    input: texts,
  });
  return response.data
    .sort((a, b) => a.index - b.index)
    .map((d) => d.embedding);
}
