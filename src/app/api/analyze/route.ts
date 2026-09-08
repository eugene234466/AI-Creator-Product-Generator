import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { creators, analyses } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { analyzeCreatorContent } from "@/lib/ai";

const ANALYSIS_FRESHNESS_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function POST(req: NextRequest) {
  try {
    const { creatorId, forceRegenerate } = await req.json();

    if (!creatorId) {
      return NextResponse.json({ error: "creatorId is required" }, { status: 400 });
    }

    const [creator] = await db.select().from(creators).where(eq(creators.id, creatorId));
    if (!creator) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }

    if (!forceRegenerate) {
      const [existing] = await db
        .select()
        .from(analyses)
        .where(eq(analyses.creatorId, creatorId))
        .orderBy(desc(analyses.createdAt))
        .limit(1);

      const isFresh =
        existing && Date.now() - new Date(existing.createdAt).getTime() < ANALYSIS_FRESHNESS_MS;

      if (isFresh) {
        return NextResponse.json({ analysis: existing, cached: true }, { status: 200 });
      }
    }

    const result = await analyzeCreatorContent({
      name: creator.name,
      niche: creator.niche,
      instagramUrl: creator.instagramUrl ?? undefined,
      tiktokUrl: creator.tiktokUrl ?? undefined,
      youtubeUrl: creator.youtubeUrl ?? undefined,
      description: creator.description ?? undefined,
      manualPosts: creator.manualPosts ?? undefined,
      audienceInfo: creator.audienceInfo ?? undefined,
    });

    const [analysis] = await db
      .insert(analyses)
      .values({
        creatorId,
        mainNiche: result.mainNiche,
        subNiches: result.subNiches,
        recurringTopics: result.recurringTopics,
        promisingTopics: result.promisingTopics,
        contentThemes: result.contentThemes,
        audienceProblems: result.audienceProblems,
        audienceDesires: result.audienceDesires,
        repeatedQuestions: result.repeatedQuestions,
        buyingIntentSignals: result.buyingIntentSignals,
        highPerformingContent: result.highPerformingContent,
        gapsInSolutions: result.gapsInSolutions,
        contentPopularityNotes: result.contentPopularityNotes,
        monetizationPotentialNotes: result.monetizationPotentialNotes,
        sources: result.sources,
      })
      .returning();

    return NextResponse.json({ analysis }, { status: 201 });
  } catch (err) {
    console.error("Analyze error:", err);
    const message = err instanceof Error ? err.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
