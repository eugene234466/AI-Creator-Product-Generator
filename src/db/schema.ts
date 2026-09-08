import { pgTable, serial, text, integer, jsonb, timestamp, real } from "drizzle-orm/pg-core";

// Creators table - stores creator profile info
export const creators = pgTable("creators", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  niche: text("niche").notNull(),
  instagramUrl: text("instagram_url"),
  tiktokUrl: text("tiktok_url"),
  youtubeUrl: text("youtube_url"),
  description: text("description"),
  manualPosts: text("manual_posts"),
  audienceInfo: text("audience_info"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Analyses table - stores content analysis results
export const analyses = pgTable("analyses", {
  id: serial("id").primaryKey(),
  creatorId: integer("creator_id").notNull().references(() => creators.id, { onDelete: "cascade" }),
  mainNiche: text("main_niche"),
  subNiches: jsonb("sub_niches").$type<string[]>(),
  recurringTopics: jsonb("recurring_topics").$type<string[]>(),
  promisingTopics: jsonb("promising_topics").$type<string[]>(),
  contentThemes: jsonb("content_themes").$type<string[]>(),
  audienceProblems: jsonb("audience_problems").$type<string[]>(),
  audienceDesires: jsonb("audience_desires").$type<string[]>(),
  repeatedQuestions: jsonb("repeated_questions").$type<string[]>(),
  buyingIntentSignals: jsonb("buying_intent_signals").$type<string[]>(),
  highPerformingContent: jsonb("high_performing_content").$type<string[]>(),
  gapsInSolutions: jsonb("gaps_in_solutions").$type<string[]>(),
  contentPopularityNotes: text("content_popularity_notes"),
  monetizationPotentialNotes: text("monetization_potential_notes"),
  rawResearch: text("raw_research"),
  sources: jsonb("sources").$type<{ label: string; type: "creator_post" | "audience_comment" | "ai_inference" | "external_research" }[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Opportunities table - stores discovered product opportunities
export const opportunities = pgTable("opportunities", {
  id: serial("id").primaryKey(),
  analysisId: integer("analysis_id").notNull().references(() => analyses.id, { onDelete: "cascade" }),
  creatorId: integer("creator_id").notNull().references(() => creators.id, { onDelete: "cascade" }),
  productIdea: text("product_idea").notNull(),
  targetAudience: text("target_audience"),
  problemSolved: text("problem_solved"),
  desiredOutcome: text("desired_outcome"),
  evidenceSignals: jsonb("evidence_signals").$type<string[]>(),
  creatorCredibility: text("creator_credibility"),
  existingAlternatives: text("existing_alternatives"),
  differentiation: text("differentiation"),
  suggestedFormat: text("suggested_format"),
  priceRangeLow: integer("price_range_low"),
  priceRangeHigh: integer("price_range_high"),
  difficulty: text("difficulty"),
  // Score breakdown (0-100 each)
  scoreAudienceFit: integer("score_audience_fit"),
  scoreProblemSeverity: integer("score_problem_severity"),
  scoreEvidenceOfDemand: integer("score_evidence_of_demand"),
  scoreBuyingIntent: integer("score_buying_intent"),
  scoreContentPerformance: integer("score_content_performance"),
  scoreCreatorAuthority: integer("score_creator_authority"),
  scoreCompetition: integer("score_competition"),
  scoreDifferentiation: integer("score_differentiation"),
  scoreEaseOfCreation: integer("score_ease_of_creation"),
  scoreMonetizationPotential: integer("score_monetization_potential"),
  overallScore: real("overall_score"),
  scoreExplanations: jsonb("score_explanations").$type<Record<string, string>>(),
  creatorProductScore: real("creator_product_score"),
  creatorProductScoreBreakdown: jsonb("creator_product_score_breakdown").$type<Record<string, string | number>>(),
  isSelected: integer("is_selected").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Product recommendations table
export const productRecommendations = pgTable("product_recommendations", {
  id: serial("id").primaryKey(),
  opportunityId: integer("opportunity_id").notNull().references(() => opportunities.id, { onDelete: "cascade" }),
  creatorId: integer("creator_id").notNull().references(() => creators.id, { onDelete: "cascade" }),
  productName: text("product_name").notNull(),
  productType: text("product_type").notNull(),
  targetCustomer: text("target_customer"),
  coreProblem: text("core_problem"),
  transformation: text("transformation"),
  uniqueAngle: text("unique_angle"),
  recommendedPrice: integer("recommended_price"),
  recommendedContents: jsonb("recommended_contents").$type<string[]>(),
  whyThisCreator: text("why_this_creator"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Workbooks table
export const workbooks = pgTable("workbooks", {
  id: serial("id").primaryKey(),
  recommendationId: integer("recommendation_id").references(() => productRecommendations.id, { onDelete: "cascade" }),
  creatorId: integer("creator_id").notNull().references(() => creators.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  introduction: text("introduction"),
  whoItsFor: text("who_its_for"),
  desiredOutcome: text("desired_outcome"),
  instructions: text("instructions"),
  sections: jsonb("sections").$type<WorkbookSection[]>(),
  actionPlan: text("action_plan"),
  finalReview: text("final_review"),
  nextSteps: text("next_steps"),
  isBranded: integer("is_branded").default(0),
  brandingApplied: jsonb("branding_applied").$type<BrandingBrief | null>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Branding briefs table
export const brandingBriefs = pgTable("branding_briefs", {
  id: serial("id").primaryKey(),
  creatorId: integer("creator_id").notNull().references(() => creators.id, { onDelete: "cascade" }),
  workbookId: integer("workbook_id").references(() => workbooks.id, { onDelete: "cascade" }),
  tone: text("tone"),
  vocabularyTendencies: jsonb("vocabulary_tendencies").$type<string[]>(),
  contentStyle: text("content_style"),
  audienceSophistication: text("audience_sophistication"),
  visualDirection: text("visual_direction"),
  positioning: text("positioning"),
  productNamingStyle: text("product_naming_style"),
  ctaStyle: text("cta_style"),
  audienceExamples: jsonb("audience_examples").$type<string[]>(),
  disclaimer: text("disclaimer"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Outreach drafts table
export const outreachDrafts = pgTable("outreach_drafts", {
  id: serial("id").primaryKey(),
  creatorId: integer("creator_id").notNull().references(() => creators.id, { onDelete: "cascade" }),
  opportunityId: integer("opportunity_id").references(() => opportunities.id, { onDelete: "cascade" }),
  subject: text("subject"),
  message: text("message").notNull(),
  platform: text("platform"),
  tone: text("tone"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Reports table
export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  creatorId: integer("creator_id").notNull().references(() => creators.id, { onDelete: "cascade" }),
  analysisId: integer("analysis_id").references(() => analyses.id),
  opportunityIds: jsonb("opportunity_ids").$type<number[]>(),
  selectedOpportunityId: integer("selected_opportunity_id"),
  workbookId: integer("workbook_id").references(() => workbooks.id),
  brandingBriefId: integer("branding_brief_id").references(() => brandingBriefs.id),
  reportData: jsonb("report_data").$type<ReportData>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Types used in jsonb fields
export type WorkbookSection = {
  id: string;
  title: string;
  type: "section" | "exercise" | "worksheet" | "checklist" | "tracker";
  content: string;
  items?: string[];
  prompts?: string[];
};

export type BrandingBrief = {
  tone: string;
  vocabularyTendencies: string[];
  contentStyle: string;
  audienceSophistication: string;
  visualDirection: string;
  positioning: string;
  productNamingStyle: string;
  ctaStyle: string;
  audienceExamples: string[];
  disclaimer: string;
};

export type ReportData = {
  creator: { name: string; niche: string; urls: string[] };
  niche: string;
  audience: string;
  topContentThemes: string[];
  audienceProblems: string[];
  buyingIntentSignals: string[];
  opportunities: OpportunitySummary[];
  recommendedProduct: string;
  creatorProductScore: number;
  workbookOutline: string[];
  brandingBrief: BrandingBrief | null;
  outreachDrafts: string[];
};

export type OpportunitySummary = {
  id: number;
  productIdea: string;
  overallScore: number;
  creatorProductScore: number;
};
