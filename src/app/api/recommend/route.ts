import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { opportunities, analyses, creators, productRecommendations } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateProductRecommendation } from "@/lib/ai";
import type { AnalysisResult, OpportunityResult } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const { opportunityId } = await req.json();

    if (!opportunityId) {
      return NextResponse.json({ error: "opportunityId is required" }, { status: 400 });
    }

    const [opp] = await db.select().from(opportunities).where(eq(opportunities.id, opportunityId));
    if (!opp) return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });

    const [creator] = await db.select().from(creators).where(eq(creators.id, opp.creatorId));
    const [analysis] = await db.select().from(analyses).where(eq(analyses.id, opp.analysisId));

    const analysisData: AnalysisResult = {
      mainNiche: analysis?.mainNiche ?? "",
      subNiches: (analysis?.subNiches as string[]) ?? [],
      recurringTopics: (analysis?.recurringTopics as string[]) ?? [],
      promisingTopics: (analysis?.promisingTopics as string[]) ?? [],
      contentThemes: (analysis?.contentThemes as string[]) ?? [],
      audienceProblems: (analysis?.audienceProblems as string[]) ?? [],
      audienceDesires: (analysis?.audienceDesires as string[]) ?? [],
      repeatedQuestions: (analysis?.repeatedQuestions as string[]) ?? [],
      buyingIntentSignals: (analysis?.buyingIntentSignals as string[]) ?? [],
      highPerformingContent: (analysis?.highPerformingContent as string[]) ?? [],
      gapsInSolutions: (analysis?.gapsInSolutions as string[]) ?? [],
      contentPopularityNotes: analysis?.contentPopularityNotes ?? "",
      monetizationPotentialNotes: analysis?.monetizationPotentialNotes ?? "",
      sources: (analysis?.sources as AnalysisResult["sources"]) ?? [],
    };

    const oppData: OpportunityResult = {
      productIdea: opp.productIdea,
      targetAudience: opp.targetAudience ?? "",
      problemSolved: opp.problemSolved ?? "",
      desiredOutcome: opp.desiredOutcome ?? "",
      evidenceSignals: (opp.evidenceSignals as string[]) ?? [],
      creatorCredibility: opp.creatorCredibility ?? "",
      existingAlternatives: opp.existingAlternatives ?? "",
      differentiation: opp.differentiation ?? "",
      suggestedFormat: opp.suggestedFormat ?? "workbook",
      priceRangeLow: opp.priceRangeLow ?? 17,
      priceRangeHigh: opp.priceRangeHigh ?? 47,
      difficulty: opp.difficulty ?? "medium",
      scores: {
        audienceFit: opp.scoreAudienceFit ?? 50,
        problemSeverity: opp.scoreProblemSeverity ?? 50,
        evidenceOfDemand: opp.scoreEvidenceOfDemand ?? 50,
        buyingIntent: opp.scoreBuyingIntent ?? 50,
        contentPerformance: opp.scoreContentPerformance ?? 50,
        creatorAuthority: opp.scoreCreatorAuthority ?? 50,
        competition: opp.scoreCompetition ?? 50,
        differentiation: opp.scoreDifferentiation ?? 50,
        easeOfCreation: opp.scoreEaseOfCreation ?? 50,
        monetizationPotential: opp.scoreMonetizationPotential ?? 50,
      },
      scoreExplanations: (opp.scoreExplanations as Record<string, string>) ?? {},
      overallScore: opp.overallScore ?? 50,
      creatorProductScore: opp.creatorProductScore ?? 50,
      creatorProductScoreBreakdown: (opp.creatorProductScoreBreakdown as Record<string, string | number>) ?? {},
    };

    const rec = await generateProductRecommendation({
      creator: { name: creator.name, niche: creator.niche },
      opportunity: oppData,
      analysis: analysisData,
    });

    // Mark opportunity as selected
    await db.update(opportunities).set({ isSelected: 1 }).where(eq(opportunities.id, opportunityId));

    const [recommendation] = await db
      .insert(productRecommendations)
      .values({
        opportunityId,
        creatorId: opp.creatorId,
        productName: rec.productName,
        productType: rec.productType,
        targetCustomer: rec.targetCustomer,
        coreProblem: rec.coreProblem,
        transformation: rec.transformation,
        uniqueAngle: rec.uniqueAngle,
        recommendedPrice: rec.recommendedPrice,
        recommendedContents: rec.recommendedContents,
        whyThisCreator: rec.whyThisCreator,
      })
      .returning();

    return NextResponse.json({ recommendation, whyThisOne: rec.whyThisOne }, { status: 201 });
  } catch (err) {
    console.error("Recommend error:", err);
    const message = err instanceof Error ? err.message : "Failed to generate recommendation";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
