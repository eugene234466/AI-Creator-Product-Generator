import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  creators,
  analyses,
  opportunities,
  productRecommendations,
  workbooks,
  brandingBriefs,
  outreachDrafts,
} from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import type { BrandingBrief, WorkbookSection } from "@/db/schema";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const creatorId = parseInt(searchParams.get("creatorId") ?? "0");

    if (!creatorId) {
      return NextResponse.json({ error: "creatorId is required" }, { status: 400 });
    }

    const [creator] = await db.select().from(creators).where(eq(creators.id, creatorId));
    if (!creator) return NextResponse.json({ error: "Creator not found" }, { status: 404 });

    const [latestAnalysis] = await db
      .select()
      .from(analyses)
      .where(eq(analyses.creatorId, creatorId))
      .orderBy(desc(analyses.createdAt))
      .limit(1);

    const allOpps = await db
      .select()
      .from(opportunities)
      .where(eq(opportunities.creatorId, creatorId))
      .orderBy(desc(opportunities.overallScore));

    const selectedOpp = allOpps.find((o) => o.isSelected === 1) ?? allOpps[0];

    let rec = null;
    let workbook = null;
    let brandingBrief = null;
    let drafts: typeof outreachDrafts.$inferSelect[] = [];

    if (selectedOpp) {
      const [r] = await db
        .select()
        .from(productRecommendations)
        .where(eq(productRecommendations.opportunityId, selectedOpp.id))
        .limit(1);
      rec = r ?? null;

      const [w] = await db
        .select()
        .from(workbooks)
        .where(eq(workbooks.creatorId, creatorId))
        .orderBy(desc(workbooks.createdAt))
        .limit(1);
      workbook = w ?? null;

      if (workbook) {
        const [bb] = await db
          .select()
          .from(brandingBriefs)
          .where(eq(brandingBriefs.workbookId, workbook.id))
          .limit(1);
        brandingBrief = bb ?? null;
      }

      drafts = await db
        .select()
        .from(outreachDrafts)
        .where(eq(outreachDrafts.opportunityId, selectedOpp.id));
    }

    const urls = [
      creator.instagramUrl,
      creator.tiktokUrl,
      creator.youtubeUrl,
    ].filter(Boolean) as string[];

    const report = {
      creator: {
        id: creator.id,
        name: creator.name,
        niche: creator.niche,
        urls,
        description: creator.description,
        createdAt: creator.createdAt,
      },
      niche: latestAnalysis?.mainNiche ?? creator.niche,
      subNiches: (latestAnalysis?.subNiches as string[]) ?? [],
      audience: creator.audienceInfo ?? "Not specified",
      topContentThemes: (latestAnalysis?.contentThemes as string[]) ?? [],
      audienceProblems: (latestAnalysis?.audienceProblems as string[]) ?? [],
      audienceDesires: (latestAnalysis?.audienceDesires as string[]) ?? [],
      buyingIntentSignals: (latestAnalysis?.buyingIntentSignals as string[]) ?? [],
      contentPopularityNotes: latestAnalysis?.contentPopularityNotes ?? "",
      monetizationPotentialNotes: latestAnalysis?.monetizationPotentialNotes ?? "",
      sources: latestAnalysis?.sources ?? [],
      opportunities: allOpps.map((o) => ({
        id: o.id,
        productIdea: o.productIdea,
        suggestedFormat: o.suggestedFormat,
        overallScore: o.overallScore,
        creatorProductScore: o.creatorProductScore,
        difficulty: o.difficulty,
        priceRangeLow: o.priceRangeLow,
        priceRangeHigh: o.priceRangeHigh,
        isSelected: o.isSelected,
      })),
      selectedOpportunity: selectedOpp
        ? {
            id: selectedOpp.id,
            productIdea: selectedOpp.productIdea,
            problemSolved: selectedOpp.problemSolved,
            desiredOutcome: selectedOpp.desiredOutcome,
            evidenceSignals: (selectedOpp.evidenceSignals as string[]) ?? [],
            differentiation: selectedOpp.differentiation,
            overallScore: selectedOpp.overallScore,
            creatorProductScore: selectedOpp.creatorProductScore,
            creatorProductScoreBreakdown: selectedOpp.creatorProductScoreBreakdown,
            scoreBreakdown: {
              audienceFit: selectedOpp.scoreAudienceFit,
              problemSeverity: selectedOpp.scoreProblemSeverity,
              evidenceOfDemand: selectedOpp.scoreEvidenceOfDemand,
              buyingIntent: selectedOpp.scoreBuyingIntent,
              contentPerformance: selectedOpp.scoreContentPerformance,
              creatorAuthority: selectedOpp.scoreCreatorAuthority,
              competition: selectedOpp.scoreCompetition,
              differentiation: selectedOpp.scoreDifferentiation,
              easeOfCreation: selectedOpp.scoreEaseOfCreation,
              monetizationPotential: selectedOpp.scoreMonetizationPotential,
            },
            scoreExplanations: selectedOpp.scoreExplanations,
          }
        : null,
      recommendedProduct: rec
        ? {
            productName: rec.productName,
            productType: rec.productType,
            targetCustomer: rec.targetCustomer,
            coreProblem: rec.coreProblem,
            transformation: rec.transformation,
            uniqueAngle: rec.uniqueAngle,
            recommendedPrice: rec.recommendedPrice,
            recommendedContents: (rec.recommendedContents as string[]) ?? [],
            whyThisCreator: rec.whyThisCreator,
          }
        : null,
      workbook: workbook
        ? {
            title: workbook.title,
            subtitle: workbook.subtitle,
            isBranded: workbook.isBranded,
            sectionCount: ((workbook.sections as WorkbookSection[]) ?? []).length,
            sectionTitles: ((workbook.sections as WorkbookSection[]) ?? []).map((s) => s.title),
          }
        : null,
      brandingBrief: brandingBrief
        ? {
            tone: brandingBrief.tone,
            vocabularyTendencies: brandingBrief.vocabularyTendencies,
            contentStyle: brandingBrief.contentStyle,
            audienceSophistication: brandingBrief.audienceSophistication,
            visualDirection: brandingBrief.visualDirection,
            positioning: brandingBrief.positioning,
            productNamingStyle: brandingBrief.productNamingStyle,
            ctaStyle: brandingBrief.ctaStyle,
            disclaimer: brandingBrief.disclaimer,
          }
        : null,
      outreachDrafts: drafts.map((d) => ({
        platform: d.platform,
        tone: d.tone,
        subject: d.subject,
        message: d.message,
      })),
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ report });
  } catch (err) {
    console.error("Report error:", err);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
