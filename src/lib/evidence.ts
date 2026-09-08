/**
 * Real web evidence gathering via Tavily, used to ground analyzeCreatorContent
 * in actual search results instead of pure LLM inference.
 *
 * Requires TAVILY_API_KEY in env. If it's not set, gatherEvidence() returns
 * an empty array and the caller falls back to niche-knowledge-only analysis
 * (with an explicit note to the model, so it doesn't pretend evidence exists).
 */

import { z } from "zod";

const TAVILY_URL = "https://api.tavily.com/search";

const tavilyResultSchema = z.object({
  title: z.string(),
  url: z.string(),
  content: z.string(),
  raw_content: z.string().nullable().optional(),
});

const tavilyResponseSchema = z.object({
  results: z.array(tavilyResultSchema),
});

export type EvidenceSourceType =
  | "creator_post"
  | "audience_comment"
  | "external_research";

export type EvidenceItem = {
  sourceType: EvidenceSourceType;
  label: string;
  content: string;
  url: string;
};

type TavilySearchOptions = {
  depth?: "basic" | "advanced"; // "advanced" costs 2 credits instead of 1
  maxResults?: number;
};

/**
 * Low-level Tavily search call. Throws on network/API errors — callers
 * should catch and degrade gracefully rather than let one failed search
 * abort the whole analysis.
 */
async function tavilySearch(
  query: string,
  options: TavilySearchOptions = {}
): Promise<z.infer<typeof tavilyResultSchema>[]> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    throw new Error("TAVILY_API_KEY is not configured");
  }

  const response = await fetch(TAVILY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      query,
      search_depth: options.depth ?? "basic",
      max_results: options.maxResults ?? 5,
      include_raw_content: true,
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Tavily request failed (${response.status}): ${text.slice(0, 200)}`);
  }

  const json = await response.json();
  const parsed = tavilyResponseSchema.safeParse(json);
  if (!parsed.success) {
    throw new Error(`Unexpected Tavily response shape: ${parsed.error.message}`);
  }
  return parsed.data.results;
}

function truncate(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars) + "…";
}

function domainOf(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

/**
 * Runs a batch of Tavily searches for one creator and returns a flat,
 * capped list of evidence items tagged by source type. Each search is
 * isolated in try/catch: if Tavily is unreachable or the key is missing,
 * that category is silently skipped rather than failing the whole call.
 */
export async function gatherEvidence(creator: {
  name: string;
  niche: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  youtubeUrl?: string;
}): Promise<EvidenceItem[]> {
  const evidence: EvidenceItem[] = [];

  // A. The creator's own public content, where the social platform is
  // actually indexable (mostly YouTube; Instagram/TikTok rarely surface
  // useful results this way — manualPosts stays the real source for those).
  const socialUrls = [creator.instagramUrl, creator.tiktokUrl, creator.youtubeUrl].filter(
    (u): u is string => Boolean(u)
  );

  for (const socialUrl of socialUrls) {
    const domain = domainOf(socialUrl);
    if (!domain) continue;
    try {
      const results = await tavilySearch(`${creator.name} ${creator.niche} site:${domain}`, {
        maxResults: 3,
      });
      for (const r of results) {
        evidence.push({
          sourceType: "creator_post",
          label: r.title,
          content: truncate(r.raw_content || r.content, 800),
          url: r.url,
        });
      }
    } catch (err) {
      console.warn(`Evidence search failed for ${domain}:`, err);
    }
  }

  // B. What the creator's audience actually asks / struggles with.
  try {
    const audienceResults = await tavilySearch(
      `${creator.niche} common questions problems beginners struggle with`,
      { maxResults: 5 }
    );
    for (const r of audienceResults) {
      evidence.push({
        sourceType: "audience_comment",
        label: r.title,
        content: truncate(r.content, 800),
        url: r.url,
      });
    }
  } catch (err) {
    console.warn("Evidence search failed for audience questions:", err);
  }

  // C. Existing products/competitors, for the differentiation field later.
  try {
    const competitorResults = await tavilySearch(
      `${creator.niche} digital product course workbook guide`,
      { maxResults: 4 }
    );
    for (const r of competitorResults) {
      evidence.push({
        sourceType: "external_research",
        label: r.title,
        content: truncate(r.content, 500),
        url: r.url,
      });
    }
  } catch (err) {
    console.warn("Evidence search failed for competitor research:", err);
  }

  // Cap total items so the prompt stays a sane size regardless of how many
  // categories returned results.
  return evidence.slice(0, 12);
}

/**
 * Formats evidence items into a labeled block ready to drop into a prompt.
 * Returns null if there's nothing to include, so the caller can fall back
 * to a "no evidence fetched" note instead of an empty block.
 */
export function formatEvidenceBlock(evidence: EvidenceItem[]): string | null {
  if (evidence.length === 0) return null;
  return evidence
    .map((e) => `[${e.sourceType}] ${e.label} (${e.url})\n${e.content}`)
    .join("\n\n");
}
