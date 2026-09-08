import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { analyses, opportunities } from "@/db/schema";
import { eq } from "drizzle-orm";
import { discoverOpportunities } from "@/lib/ai";
import type { AnalysisResult } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const { analysisId, creatorId, creatorName, creatorNiche, forceRegenerate } = await req.json();

    if (!analysisId || !creatorId) {
      return NextResponse.json({ error: "analysisId and creatorId are required" }, { status: 400 });
    }

    const [analysis] = await db.select().from(analyses).where(eq(analyses.id, analysisId));
    if (!analysis) {
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
    }

    if (!forceRegenerate) {
      const existing = await db
        .select()
        .from(opportunities)
        .where(eq(opportunities.analysisId, analysisId));
      if (existing.length > 0) {
        return NextResponse.json({ opportunities: existing, cached: true }, { status: 200 });
      }
    }

    const analysisData: AnalysisResult = {
      mainNiche: analysis.mainNiche ?? "",
      subNiches: (analysis.subNiches as string[]) ?? [],
      recurringTopics: (analysis.recurringTopics as string[]) ?? [],
      promisingTopics: (analysis.promisingTopics as string[]) ?? [],
      contentThemes: (analysis.contentThemes as string[]) ?? [],
      audienceProblems: (analysis.audienceProblems as string[]) ?? [],
      audienceDesires: (analysis.audienceDesires as string[]) ?? [],
      repeatedQuestions: (analysis.repeatedQuestions as string[]) ?? [],
      buyingIntentSignals: (analysis.buyingIntentSignals as string[]) ?? [],
      highPerformingContent: (analysis.highPerformingContent as string[]) ?? [],
      gapsInSolutions: (analysis.gapsInSolutions as string[]) ?? [],
      contentPopularityNotes: analysis.contentPopularityNotes ?? "",
      monetizationPotentialNotes: analysis.monetizationPotentialNotes ?? "",
      sources: (analysis.sources as AnalysisResult["sources"]) ?? [],
    };

    const opps = await discoverOpportunities({
      creator: { name: creatorName, niche: creatorNiche },
      analysis: analysisData,
    });

    const inserted = await Promise.all(
      opps.map((opp) =>
        db
          .insert(opportunities)
          .values({
            analysisId,
            creatorId,
            productIdea: opp.productIdea,
            targetAudience: opp.targetAudience,
            problemSolved: opp.problemSolved,
            desiredOutcome: opp.desiredOutcome,
            evidenceSignals: opp.evidenceSignals,
            creatorCredibility: opp.creatorCredibility,
            existingAlternatives: opp.existingAlternatives,
            differentiation: opp.differentiation,
            suggestedFormat: opp.suggestedFormat,
            priceRangeLow: opp.priceRangeLow,
            priceRangeHigh: opp.priceRangeHigh,
            difficulty: opp.difficulty,
            scoreAudienceFit: opp.scores.audienceFit,
            scoreProblemSeverity: opp.scores.problemSeverity,
            scoreEvidenceOfDemand: opp.scores.evidenceOfDemand,
            scoreBuyingIntent: opp.scores.buyingIntent,
            scoreContentPerformance: opp.scores.contentPerformance,
            scoreCreatorAuthority: opp.scores.creatorAuthority,
            scoreCompetition: opp.scores.competition,
            scoreDifferentiation: opp.scores.differentiation,
            scoreEaseOfCreation: opp.scores.easeOfCreation,
            scoreMonetizationPotential: opp.scores.monetizationPotential,
            overallScore: opp.overallScore,
            scoreExplanations: opp.scoreExplanations,
            creatorProductScore: opp.creatorProductScore,
            creatorProductScoreBreakdown: opp.creatorProductScoreBreakdown,
            isSelected: 0,
          })
          .returning()
      )
    );

    return NextResponse.json({ opportunities: inserted.map((r) => r[0]) }, { status: 201 });
  } catch (err) {
    console.error("Opportunities error:", err);
    const message = err instanceof Error ? err.message : "Failed to generate opportunities";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
