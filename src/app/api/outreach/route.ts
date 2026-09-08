import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { opportunities, creators, analyses, outreachDrafts, productRecommendations } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { generateOutreachDrafts } from "@/lib/ai";
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

    const [latestAnalysis] = await db
      .select()
      .from(analyses)
      .where(eq(analyses.creatorId, opp.creatorId))
      .orderBy(desc(analyses.createdAt))
      .limit(1);

    // Get the recommendation if it exists
    const [rec] = await db
      .select()
      .from(productRecommendations)
      .where(eq(productRecommendations.opportunityId, opportunityId))
      .limit(1);

    const analysisData: AnalysisResult = {
      mainNiche: latestAnalysis?.mainNiche ?? "",
      subNiches: (latestAnalysis?.subNiches as string[]) ?? [],
      recurringTopics: (latestAnalysis?.recurringTopics as string[]) ?? [],
      promisingTopics: (latestAnalysis?.promisingTopics as string[]) ?? [],
      contentThemes: (latestAnalysis?.contentThemes as string[]) ?? [],
      audienceProblems: (latestAnalysis?.audienceProblems as string[]) ?? [],
      audienceDesires: (latestAnalysis?.audienceDesires as string[]) ?? [],
      repeatedQuestions: (latestAnalysis?.repeatedQuestions as string[]) ?? [],
      buyingIntentSignals: (latestAnalysis?.buyingIntentSignals as string[]) ?? [],
      highPerformingContent: (latestAnalysis?.highPerformingContent as string[]) ?? [],
      gapsInSolutions: (latestAnalysis?.gapsInSolutions as string[]) ?? [],
      contentPopularityNotes: latestAnalysis?.contentPopularityNotes ?? "",
      monetizationPotentialNotes: latestAnalysis?.monetizationPotentialNotes ?? "",
      sources: (latestAnalysis?.sources as AnalysisResult["sources"]) ?? [],
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

    const recData = {
      productName: rec?.productName ?? opp.productIdea,
      productType: rec?.productType ?? opp.suggestedFormat ?? "workbook",
      targetCustomer: rec?.targetCustomer ?? opp.targetAudience ?? "",
      coreProblem: rec?.coreProblem ?? opp.problemSolved ?? "",
      transformation: rec?.transformation ?? opp.desiredOutcome ?? "",
      uniqueAngle: rec?.uniqueAngle ?? opp.differentiation ?? "",
      recommendedPrice: rec?.recommendedPrice ?? opp.priceRangeLow ?? 27,
      recommendedContents: (rec?.recommendedContents as string[]) ?? [],
      whyThisCreator: rec?.whyThisCreator ?? opp.creatorCredibility ?? "",
      whyThisOne: "",
    };

    const drafts = await generateOutreachDrafts({
      creator: { name: creator.name, niche: creator.niche },
      opportunity: oppData,
      recommendation: recData,
      analysis: analysisData,
    });

    const saved = await Promise.all(
      drafts.map((d) =>
        db
          .insert(outreachDrafts)
          .values({
            creatorId: opp.creatorId,
            opportunityId,
            subject: d.subject ?? null,
            message: d.message,
            platform: d.platform,
            tone: d.tone,
          })
          .returning()
      )
    );

    return NextResponse.json({ drafts: saved.map((r) => r[0]) }, { status: 201 });
  } catch (err) {
    console.error("Outreach error:", err);
    const message = err instanceof Error ? err.message : "Failed to generate outreach drafts";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
