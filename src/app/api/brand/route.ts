import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { workbooks, productRecommendations, creators, brandingBriefs, analyses } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { generateBrandingBrief, applyBrandingToWorkbook } from "@/lib/ai";
import type { AnalysisResult, ProductRecommendation, WorkbookResult, WorkbookSection } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const { workbookId } = await req.json();

    if (!workbookId) {
      return NextResponse.json({ error: "workbookId is required" }, { status: 400 });
    }

    const [workbook] = await db.select().from(workbooks).where(eq(workbooks.id, workbookId));
    if (!workbook) return NextResponse.json({ error: "Workbook not found" }, { status: 404 });

    const [creator] = await db.select().from(creators).where(eq(creators.id, workbook.creatorId));
    const [rec] = workbook.recommendationId
      ? await db.select().from(productRecommendations).where(eq(productRecommendations.id, workbook.recommendationId))
      : [null];

    const [latestAnalysis] = await db
      .select()
      .from(analyses)
      .where(eq(analyses.creatorId, workbook.creatorId))
      .orderBy(desc(analyses.createdAt))
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

    const recData: ProductRecommendation = {
      productName: rec?.productName ?? workbook.title,
      productType: rec?.productType ?? "workbook",
      targetCustomer: rec?.targetCustomer ?? "",
      coreProblem: rec?.coreProblem ?? "",
      transformation: rec?.transformation ?? "",
      uniqueAngle: rec?.uniqueAngle ?? "",
      recommendedPrice: rec?.recommendedPrice ?? 27,
      recommendedContents: (rec?.recommendedContents as string[]) ?? [],
      whyThisCreator: rec?.whyThisCreator ?? "",
      whyThisOne: "",
    };

    const brief = await generateBrandingBrief({
      creator: {
        name: creator.name,
        niche: creator.niche,
        description: creator.description ?? undefined,
        manualPosts: creator.manualPosts ?? undefined,
      },
      analysis: analysisData,
      recommendation: recData,
    });

    // Apply branding to workbook
    const workbookData: WorkbookResult = {
      title: workbook.title,
      subtitle: workbook.subtitle ?? "",
      introduction: workbook.introduction ?? "",
      whoItsFor: workbook.whoItsFor ?? "",
      desiredOutcome: workbook.desiredOutcome ?? "",
      instructions: workbook.instructions ?? "",
      sections: (workbook.sections as WorkbookSection[]) ?? [],
      actionPlan: workbook.actionPlan ?? "",
      finalReview: workbook.finalReview ?? "",
      nextSteps: workbook.nextSteps ?? "",
    };

    const brandedWorkbook = await applyBrandingToWorkbook({
      workbook: workbookData,
      brandingBrief: brief,
      creatorName: creator.name,
    });

    // Save branding brief
    const [savedBrief] = await db
      .insert(brandingBriefs)
      .values({
        creatorId: workbook.creatorId,
        workbookId,
        tone: brief.tone,
        vocabularyTendencies: brief.vocabularyTendencies,
        contentStyle: brief.contentStyle,
        audienceSophistication: brief.audienceSophistication,
        visualDirection: brief.visualDirection,
        positioning: brief.positioning,
        productNamingStyle: brief.productNamingStyle,
        ctaStyle: brief.ctaStyle,
        audienceExamples: brief.audienceExamples,
        disclaimer: brief.disclaimer,
      })
      .returning();

    // Update workbook with branded content
    const [updatedWorkbook] = await db
      .update(workbooks)
      .set({
        title: brandedWorkbook.title,
        subtitle: brandedWorkbook.subtitle,
        introduction: brandedWorkbook.introduction,
        whoItsFor: brandedWorkbook.whoItsFor,
        desiredOutcome: brandedWorkbook.desiredOutcome,
        instructions: brandedWorkbook.instructions,
        sections: brandedWorkbook.sections,
        actionPlan: brandedWorkbook.actionPlan,
        finalReview: brandedWorkbook.finalReview,
        nextSteps: brandedWorkbook.nextSteps,
        isBranded: 1,
        brandingApplied: brief,
        updatedAt: new Date(),
      })
      .where(eq(workbooks.id, workbookId))
      .returning();

    return NextResponse.json({ workbook: updatedWorkbook, brandingBrief: savedBrief });
  } catch (err) {
    console.error("Brand error:", err);
    const message = err instanceof Error ? err.message : "Failed to apply branding";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
