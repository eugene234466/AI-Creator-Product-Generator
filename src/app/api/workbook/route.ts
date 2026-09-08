import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { productRecommendations, opportunities, creators, workbooks } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateWorkbook } from "@/lib/ai";
import type { OpportunityResult, ProductRecommendation } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const { recommendationId } = await req.json();

    if (!recommendationId) {
      return NextResponse.json({ error: "recommendationId is required" }, { status: 400 });
    }

    const [rec] = await db
      .select()
      .from(productRecommendations)
      .where(eq(productRecommendations.id, recommendationId));
    if (!rec) return NextResponse.json({ error: "Recommendation not found" }, { status: 404 });

    const [opp] = await db
      .select()
      .from(opportunities)
      .where(eq(opportunities.id, rec.opportunityId));

    const [creator] = await db
      .select()
      .from(creators)
      .where(eq(creators.id, rec.creatorId));

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

    const recData: ProductRecommendation = {
      productName: rec.productName,
      productType: rec.productType,
      targetCustomer: rec.targetCustomer ?? "",
      coreProblem: rec.coreProblem ?? "",
      transformation: rec.transformation ?? "",
      uniqueAngle: rec.uniqueAngle ?? "",
      recommendedPrice: rec.recommendedPrice ?? 27,
      recommendedContents: (rec.recommendedContents as string[]) ?? [],
      whyThisCreator: rec.whyThisCreator ?? "",
      whyThisOne: "",
    };

    const workbookData = await generateWorkbook({
      creator: { name: creator.name, niche: creator.niche },
      opportunity: oppData,
      recommendation: recData,
    });

    const [workbook] = await db
      .insert(workbooks)
      .values({
        recommendationId,
        creatorId: rec.creatorId,
        title: workbookData.title,
        subtitle: workbookData.subtitle,
        introduction: workbookData.introduction,
        whoItsFor: workbookData.whoItsFor,
        desiredOutcome: workbookData.desiredOutcome,
        instructions: workbookData.instructions,
        sections: workbookData.sections,
        actionPlan: workbookData.actionPlan,
        finalReview: workbookData.finalReview,
        nextSteps: workbookData.nextSteps,
        isBranded: 0,
      })
      .returning();

    return NextResponse.json({ workbook }, { status: 201 });
  } catch (err) {
    console.error("Workbook error:", err);
    const message = err instanceof Error ? err.message : "Failed to generate workbook";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
