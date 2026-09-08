import OpenAI from "openai";
import { z } from "zod";
import { gatherEvidence, type EvidenceItem } from "@/lib/evidence";

// ============================================================
// AI CLIENT
// ============================================================

function getClient(): OpenAI {
  return new OpenAI({
    apiKey: process.env.GROQ_API_KEY ?? "placeholder",
    baseURL: "https://api.groq.com/openai/v1",
  });
}

function getModel(): string {
  return process.env.AI_MODEL ?? "openai/gpt-oss-120b";
}

// ============================================================
// SHARED AI RULES
// ============================================================

const SAFETY_INSTRUCTIONS = `
EVIDENCE AND CLAIM INTEGRITY RULES:

1. Never claim that a creator personally authored, endorsed, approved,
   collaborated on, licensed, or currently sells a product unless the
   supplied evidence explicitly confirms it.

2. Never describe a proposed product as "official", "insider",
   "proprietary", "first-hand", "creator-authored", or "endorsed"
   unless the evidence explicitly supports the claim.

3. Never invent financial figures, revenue, subscriber counts,
   audience behavior, comments, testimonials, partnerships, or
   business relationships.

4. Distinguish between:
   VERIFIED:
   Directly supported by supplied evidence.

   INFERRED:
   A reasonable conclusion based on multiple evidence signals.

   HYPOTHESIS:
   A plausible opportunity that requires validation.

5. Proposed products must be described as proposed products,
   product opportunities, or potential collaboration concepts.

6. Never assume that the creator's name, likeness, trademarks,
   branding, content, proprietary methods, or endorsement can be
   commercially used without permission.

7. Never imply that the creator has approved a product.

8. If evidence is insufficient, say that validation is required.

9. Never fabricate audience comments or buying-intent signals.

10. Never turn an assumption into a factual statement merely because
    it makes the report sound more persuasive.

11. Avoid guaranteed claims about revenue, virality, growth,
    subscribers, or business outcomes.

12. Prefer accurate, evidence-grounded language over hype.

13. The proposed product should remain useful even if the creator
    never participates.
`;

// ============================================================
// TYPES
// ============================================================

export type CreatorInput = {
  name: string;
  niche: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  youtubeUrl?: string;
  description?: string;
  manualPosts?: string;
  audienceInfo?: string;
};

export type CreatorAnalysis = {
  summary: string;
  mainNiche: string;
  subNiches: string[];
  recurringTopics: string[];
  promisingTopics: string[];
  contentThemes: string[];
  audienceProblems: string[];
  buyingSignals: string[];
  evidence: EvidenceItem[];
};

export type Opportunity = {
  title: string;
  format: string;
  priceRange: string;
  difficulty: "easy" | "medium" | "hard";
  overallScore: number;
  creatorFit: number;
  rationale: string;
  targetCustomer: string;
  problem: string;
  transformation: string;
  evidenceBasis: string[];
};

export type ProductRecommendation = {
  productName: string;
  type: string;
  price: number;
  targetAudience: string;
  problem: string;
  transformation: string;
  uniqueAngle: string;
  contents: string[];
};

export type WorkbookSection = {
  title: string;
  description: string;
  exercises: string[];
  templates: string[];
};

export type Workbook = {
  title: string;
  subtitle: string;
  branded: boolean;
  sections: WorkbookSection[];
};

export type BrandingBrief = {
  tone: string;
  audienceLevel: string;
  positioning: string;
  ctaStyle: string;
};

export type OutreachDraft = {
  channel: "email" | "twitter_dm" | "instagram_dm";
  tone: "professional" | "enthusiastic" | "casual";
  subject?: string;
  body: string;
};

// ============================================================
// ZOD SCHEMAS
// ============================================================

const CreatorAnalysisSchema = z.object({
  summary: z.string(),
  mainNiche: z.string(),
  subNiches: z.array(z.string()),
  recurringTopics: z.array(z.string()),
  promisingTopics: z.array(z.string()),
  contentThemes: z.array(z.string()),
  audienceProblems: z.array(z.string()),
  buyingSignals: z.array(z.string()),
});

const OpportunitySchema = z.object({
  title: z.string(),
  format: z.string(),
  priceRange: z.string(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  overallScore: z.number().min(0).max(100),
  creatorFit: z.number().min(0).max(100),
  rationale: z.string(),
  targetCustomer: z.string(),
  problem: z.string(),
  transformation: z.string(),
  evidenceBasis: z.array(z.string()),
});

const OpportunitiesSchema = z.object({
  opportunities: z.array(OpportunitySchema),
});

const ProductRecommendationSchema = z.object({
  productName: z.string(),
  type: z.string(),
  price: z.number().nonnegative(),
  targetAudience: z.string(),
  problem: z.string(),
  transformation: z.string(),
  uniqueAngle: z.string(),
  contents: z.array(z.string()),
});

const WorkbookSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  branded: z.boolean(),
  sections: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      exercises: z.array(z.string()),
      templates: z.array(z.string()),
    })
  ),
});

const BrandingBriefSchema = z.object({
  tone: z.string(),
  audienceLevel: z.string(),
  positioning: z.string(),
  ctaStyle: z.string(),
});

const OutreachDraftSchema = z.object({
  channel: z.enum(["email", "twitter_dm", "instagram_dm"]),
  tone: z.enum(["professional", "enthusiastic", "casual"]),
  subject: z.string().optional(),
  body: z.string(),
});

const OutreachSchema = z.object({
  drafts: z.array(OutreachDraftSchema),
});

const AuditSchema = z.object({
  passed: z.boolean(),
  issues: z.array(z.string()),
  corrected: z.object({
    product: ProductRecommendationSchema,
    workbook: WorkbookSchema,
    branding: BrandingBriefSchema,
    outreach: z.array(OutreachDraftSchema),
  }),
});

// ============================================================
// RAW CHAT
// ============================================================

async function rawChat(
  system: string,
  user: string,
  jsonMode = true
): Promise<string> {
  const client = getClient();
  const model = getModel();

  console.log("AI CONFIG:", {
    provider: "groq",
    baseURL: "https://api.groq.com/openai/v1",
    model,
    hasGroqKey: Boolean(process.env.GROQ_API_KEY),
  });

  const response = await client.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content: `${SAFETY_INSTRUCTIONS}\n\n${system}`,
      },
      {
        role: "user",
        content: user,
      },
    ],
    ...(jsonMode
      ? {
          response_format: {
            type: "json_object",
          },
        }
      : {}),
    temperature: 0.7,
    max_tokens: 4000,
  });

  return response.choices[0]?.message?.content ?? "";
}

// ============================================================
// JSON PARSER
// ============================================================

function parseJson<T>(text: string, schema: z.ZodSchema<T>): T {
  try {
    const parsed = JSON.parse(text);
    return schema.parse(parsed);
  } catch (error) {
    console.error("AI JSON parse/validation error:", error);
    console.error("Raw AI output:", text);

    throw new Error("AI returned invalid structured output");
  }
}

// ============================================================
// EVIDENCE FORMATTER
// ============================================================

function formatEvidence(evidence: EvidenceItem[]): string {
  if (!evidence.length) {
    return "No external evidence was found.";
  }

  return evidence
    .map(
      (item, index) => `
[Evidence ${index + 1}]
Type: ${item.type}
Source: ${item.source}
Title: ${item.title}
Content: ${item.content}
`
    )
    .join("\n");
}

// ============================================================
// 1. CREATOR ANALYSIS
// ============================================================

export async function analyzeCreatorContent(
  creator: CreatorInput
): Promise<CreatorAnalysis> {
  const evidence = await gatherEvidence(creator);

  const system = `
You are a creator intelligence analyst.

Analyze the creator using the supplied creator information and
external evidence.

Identify:

1. Main niche.
2. Sub-niches.
3. Recurring topics.
4. Promising topics.
5. Major content themes.
6. Audience problems.
7. Buying-intent signals.
8. A concise creator summary.

IMPORTANT:

Audience problems and buying signals must be grounded in evidence.

If something is inferred rather than directly observed, phrase it as
an inference rather than a fact.

Do not fabricate comments, requests, testimonials, or demand.

Return JSON:

{
  "summary": "...",
  "mainNiche": "...",
  "subNiches": ["..."],
  "recurringTopics": ["..."],
  "promisingTopics": ["..."],
  "contentThemes": ["..."],
  "audienceProblems": ["..."],
  "buyingSignals": ["..."]
}
`;

  const user = `
CREATOR

Name: ${creator.name}
Niche: ${creator.niche}

Instagram:
${creator.instagramUrl ?? "Not provided"}

TikTok:
${creator.tiktokUrl ?? "Not provided"}

YouTube:
${creator.youtubeUrl ?? "Not provided"}

Description:
${creator.description ?? "Not provided"}

Audience information:
${creator.audienceInfo ?? "Not provided"}

Manual posts:
${creator.manualPosts ?? "Not provided"}

EXTERNAL EVIDENCE

${formatEvidence(evidence)}
`;

  const text = await rawChat(system, user);

  const result = parseJson(text, CreatorAnalysisSchema);

  return {
    ...result,
    evidence,
  };
}

// ============================================================
// 2. OPPORTUNITY DISCOVERY
// ============================================================

export async function discoverOpportunities(
  creator: CreatorInput,
  analysis: CreatorAnalysis
): Promise<Opportunity[]> {
  const system = `
You are a digital product opportunity strategist.

Generate exactly 4 commercially realistic digital product
opportunities.

Each opportunity must connect:

Creator content
        +
Audience problem
        +
Buying signal
        +
Evidence
        =
Product opportunity

The creator has NOT agreed to these products.

Do not manufacture:
- creator endorsement
- creator authorship
- insider access
- proprietary frameworks
- audience demand
- financial claims

The opportunity should solve a specific customer problem.

For each opportunity provide:
- product concept
- format
- realistic price range
- implementation difficulty
- overall opportunity score
- creator fit
- rationale
- target customer
- problem
- transformation
- evidence supporting the opportunity

The score represents opportunity quality, not guaranteed business
performance.

Return JSON:

{
  "opportunities": [
    {
      "title": "...",
      "format": "...",
      "priceRange": "$X-$Y",
      "difficulty": "easy",
      "overallScore": 0,
      "creatorFit": 0,
      "rationale": "...",
      "targetCustomer": "...",
      "problem": "...",
      "transformation": "...",
      "evidenceBasis": ["..."]
    }
  ]
}
`;

  const user = `
CREATOR

Name:
${creator.name}

Niche:
${creator.niche}

ANALYSIS

Summary:
${analysis.summary}

Main niche:
${analysis.mainNiche}

Sub-niches:
${analysis.subNiches.join("\n- ")}

Recurring topics:
${analysis.recurringTopics.join("\n- ")}

Promising topics:
${analysis.promisingTopics.join("\n- ")}

Content themes:
${analysis.contentThemes.join("\n- ")}

Audience problems:
${analysis.audienceProblems.join("\n- ")}

Buying signals:
${analysis.buyingSignals.join("\n- ")}

EVIDENCE

${formatEvidence(analysis.evidence)}
`;

  const text = await rawChat(system, user);

  const result = parseJson(text, OpportunitiesSchema);

  return result.opportunities;
}

// ============================================================
// 3. PRODUCT RECOMMENDATION
// ============================================================

export async function generateProductRecommendation(
  creator: CreatorInput,
  analysis: CreatorAnalysis,
  opportunity: Opportunity
): Promise<ProductRecommendation> {
  const system = `
You are a digital product strategist.

Turn the selected opportunity into a concrete product recommendation.

This is a PROPOSED PRODUCT.

The creator has NOT endorsed, authored, approved, licensed, or
collaborated on this product unless the evidence explicitly confirms
otherwise.

The product must stand on its own without creator participation.

Do not describe the product as:

- official
- insider
- proprietary
- first-hand
- creator-authored
- endorsed

Do not imply that the creator personally developed the methodology.

Instead, position it around:
- observable content patterns
- transferable strategies
- audience problems
- practical workflows
- customer transformation

The unique angle must describe a genuine product differentiation.

Return JSON:

{
  "productName": "...",
  "type": "...",
  "price": 0,
  "targetAudience": "...",
  "problem": "...",
  "transformation": "...",
  "uniqueAngle": "...",
  "contents": ["..."]
}
`;

  const user = `
CREATOR

Name:
${creator.name}

Niche:
${creator.niche}

ANALYSIS

${analysis.summary}

Content themes:
${analysis.contentThemes.join("\n- ")}

Audience problems:
${analysis.audienceProblems.join("\n- ")}

Buying signals:
${analysis.buyingSignals.join("\n- ")}

SELECTED OPPORTUNITY

Title:
${opportunity.title}

Format:
${opportunity.format}

Price range:
${opportunity.priceRange}

Difficulty:
${opportunity.difficulty}

Overall score:
${opportunity.overallScore}

Creator fit:
${opportunity.creatorFit}

Rationale:
${opportunity.rationale}

Target customer:
${opportunity.targetCustomer}

Problem:
${opportunity.problem}

Transformation:
${opportunity.transformation}

Evidence:
${opportunity.evidenceBasis.join("\n- ")}
`;

  const text = await rawChat(system, user);

  return parseJson(text, ProductRecommendationSchema);
}

// ============================================================
// 4. WORKBOOK GENERATION
// ============================================================

export async function generateWorkbook(
  creator: CreatorInput,
  product: ProductRecommendation
): Promise<Workbook> {
  const system = `
You are an expert educational product designer.

Create a practical workbook for the proposed digital product.

The workbook should contain:

- clear lessons
- practical exercises
- useful templates
- checklists
- implementation steps

Do not:
- invent creator quotes
- claim creator authorship
- claim official status
- imply endorsement
- imply insider access
- make unsupported financial claims
- promise guaranteed results

The material should teach transferable principles.

If the creator's name is included, it must be treated as a proposed
branding/collaboration concept rather than an approved product.

Return JSON:

{
  "title": "...",
  "subtitle": "...",
  "branded": false,
  "sections": [
    {
      "title": "...",
      "description": "...",
      "exercises": ["..."],
      "templates": ["..."]
    }
  ]
}
`;

  const user = `
CREATOR

Name:
${creator.name}

Niche:
${creator.niche}

PRODUCT

Name:
${product.productName}

Type:
${product.type}

Target audience:
${product.targetAudience}

Problem:
${product.problem}

Transformation:
${product.transformation}

Unique angle:
${product.uniqueAngle}

Contents:
${product.contents.join("\n- ")}
`;

  const text = await rawChat(system, user);

  return parseJson(text, WorkbookSchema);
}

// ============================================================
// 5. BRANDING BRIEF
// ============================================================

export async function generateBrandingBrief(
  creator: CreatorInput,
  product: ProductRecommendation
): Promise<BrandingBrief> {
  const system = `
You are a brand strategist.

Create a branding brief for the proposed product.

Do not imply:

- creator endorsement
- creator authorship
- official affiliation
- insider access
- proprietary creator knowledge
- existing partnership

Position the product around the customer's desired transformation.

If creator branding is potentially relevant, describe it as a possible
future collaboration or licensed branding opportunity.

The branding should remain valid even without creator participation.

Return JSON:

{
  "tone": "...",
  "audienceLevel": "...",
  "positioning": "...",
  "ctaStyle": "..."
}
`;

  const user = `
CREATOR

Name:
${creator.name}

Niche:
${creator.niche}

PRODUCT

Name:
${product.productName}

Type:
${product.type}

Target audience:
${product.targetAudience}

Problem:
${product.problem}

Transformation:
${product.transformation}

Unique angle:
${product.uniqueAngle}
`;

  const text = await rawChat(system, user);

  return parseJson(text, BrandingBriefSchema);
}

// ============================================================
// 6. APPLY BRANDING TO WORKBOOK
// ============================================================

export async function applyBrandingToWorkbook(
  creator: CreatorInput,
  product: ProductRecommendation,
  workbook: Workbook,
  branding: BrandingBrief
): Promise<Workbook> {
  const system = `
You are an expert content editor.

Adapt the workbook to the supplied branding brief.

Maintain factual integrity.

Do NOT add:

- creator endorsements
- invented creator quotes
- invented creator experiences
- creator authorship
- official status
- insider access
- proprietary claims
- unsupported financial claims

The creator's public content may influence examples and tone.

Do not pretend that the creator personally authored the material.

Return JSON using exactly the same workbook structure.
`;

  const user = `
CREATOR

Name:
${creator.name}

Niche:
${creator.niche}

PRODUCT

${JSON.stringify(product, null, 2)}

CURRENT WORKBOOK

${JSON.stringify(workbook, null, 2)}

BRANDING BRIEF

${JSON.stringify(branding, null, 2)}
`;

  const text = await rawChat(system, user);

  return parseJson(text, WorkbookSchema);
}

// ============================================================
// 7. OUTREACH DRAFTS
// ============================================================

export async function generateOutreachDrafts(
  creator: CreatorInput,
  product: ProductRecommendation,
  branding: BrandingBrief
): Promise<OutreachDraft[]> {
  const system = `
You are an expert creator partnership outreach strategist.

Create 9 outreach drafts proposing a potential collaboration.

Generate:

3 professional emails
3 enthusiastic Twitter/X DMs
3 casual Instagram DMs

The drafts must use genuinely different strategies.

Possible strategies:

1. Audience-problem angle
2. Research/prototype-first angle
3. Collaboration/revenue-share angle

IMPORTANT:

Never claim:

- the creator has endorsed the product
- the creator authored the product
- the creator already approved the concept
- the product is official
- a partnership already exists
- the creator's audience definitely wants the product
- the creator has proprietary involvement

Do not fabricate audience comments.

Instead, invite the creator/team to evaluate the opportunity.

The outreach should sound confident without pretending that a
relationship already exists.

Return JSON:

{
  "drafts": [
    {
      "channel": "email",
      "tone": "professional",
      "subject": "...",
      "body": "..."
    }
  ]
}
`;

  const user = `
CREATOR

Name:
${creator.name}

Niche:
${creator.niche}

PROPOSED PRODUCT

Name:
${product.productName}

Type:
${product.type}

Target audience:
${product.targetAudience}

Problem:
${product.problem}

Transformation:
${product.transformation}

Unique angle:
${product.uniqueAngle}

BRANDING

${JSON.stringify(branding, null, 2)}
`;

  const text = await rawChat(system, user);

  const result = parseJson(text, OutreachSchema);

  return result.drafts;
}

// ============================================================
// 8. FINAL CLAIM AUDITOR
// ============================================================

export async function auditGeneratedContent(input: {
  creator: CreatorInput;
  analysis: CreatorAnalysis;
  opportunities: Opportunity[];
  product: ProductRecommendation;
  workbook: Workbook;
  branding: BrandingBrief;
  outreach: OutreachDraft[];
}): Promise<{
  passed: boolean;
  issues: string[];
  corrected: {
    product: ProductRecommendation;
    workbook: Workbook;
    branding: BrandingBrief;
    outreach: OutreachDraft[];
  };
}> {
  const system = `
You are the final fact-checking and claim-integrity auditor for a
creator intelligence platform.

Review the generated product, workbook, branding, and outreach.

Look for:

1. Creator endorsement claims.
2. Creator authorship claims.
3. Official affiliation claims.
4. Insider-access claims.
5. Proprietary methodology claims.
6. Unsupported financial claims.
7. Unsupported audience-demand claims.
8. Fabricated comments.
9. Fabricated testimonials.
10. Implied partnerships.
11. Guaranteed revenue or growth.
12. Unauthorized intellectual-property assumptions.
13. Speculation presented as fact.

You MUST correct every problematic claim.

Examples:

BAD:
"First-hand curriculum authored by MrBeast"

GOOD:
"A proposed workbook inspired by observable patterns in large-scale
challenge content."

BAD:
"The official MrBeast playbook"

GOOD:
"A proposed challenge-content planning playbook."

BAD:
"Your fans constantly ask for this"

GOOD:
"This concept may address a recurring need among aspiring creators;
audience validation is recommended before launch."

BAD:
"Your $100M+ empire"

GOOD:
"Your highly successful creator business."

BAD:
"Your proprietary challenge framework"

GOOD:
"Patterns observable in your public challenge content."

The creator has NOT agreed to the product.

Correct the content while preserving its commercial usefulness.

Return:

{
  "passed": true,
  "issues": [],
  "corrected": {
    "product": {},
    "workbook": {},
    "branding": {},
    "outreach": []
  }
}
`;

  const user = `
CREATOR

${JSON.stringify(input.creator, null, 2)}

ANALYSIS

${JSON.stringify(input.analysis, null, 2)}

OPPORTUNITIES

${JSON.stringify(input.opportunities, null, 2)}

PRODUCT

${JSON.stringify(input.product, null, 2)}

WORKBOOK

${JSON.stringify(input.workbook, null, 2)}

BRANDING

${JSON.stringify(input.branding, null, 2)}

OUTREACH

${JSON.stringify(input.outreach, null, 2)}
`;

  const text = await rawChat(system, user);

  return parseJson(text, AuditSchema);
}
