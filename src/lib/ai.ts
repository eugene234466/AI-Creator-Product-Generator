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
IMPORTANT EVIDENCE AND CLAIM RULES:

1. Never claim that a creator personally authored, endorsed, approved,
   collaborated on, licensed, or currently sells a product unless the
   provided evidence explicitly confirms it.

2. Never describe a proposed product as:
   - creator-authored
   - official
   - insider
   - proprietary
   - first-hand
   - endorsed
   - creator-approved

   unless the provided evidence explicitly supports that claim.

3. Never invent:
   - financial figures
   - revenue
   - subscriber counts
   - audience behavior
   - customer demand
   - audience comments
   - business relationships
   - partnerships
   - creator statements

4. Distinguish between:
   - VERIFIED: directly supported by provided evidence
   - INFERRED: a reasonable conclusion from multiple evidence signals
   - HYPOTHESIS: a plausible opportunity that still requires validation

5. When proposing a product for a creator, describe it as a:
   - proposed product
   - product opportunity
   - collaboration concept
   - potential product

6. The creator's name, likeness, trademarks, branding, content,
   proprietary methods, and implied endorsement must not be treated
   as automatically available for commercial use.

7. Do not write copy that implies the creator has approved the product.

8. If evidence is insufficient, explicitly state that validation is required.

9. Never fabricate audience comments, testimonials, buying intent,
   search demand, or customer requests.

10. Never turn an assumption into a factual statement simply because
    it makes the report sound more persuasive.

11. Prefer evidence-grounded and commercially realistic language over
    impressive-sounding claims.

12. The product must remain commercially understandable and useful
    even if the creator never participates in the project.
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

const OutreachSchema = z.object({
  drafts: z.array(
    z.object({
      channel: z.enum(["email", "twitter_dm", "instagram_dm"]),
      tone: z.enum(["professional", "enthusiastic", "casual"]),
      subject: z.string().optional(),
      body: z.string(),
    })
  ),
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
// 1. CREATOR ANALYSIS
// ============================================================

export async function analyzeCreatorContent(
  creator: CreatorInput
): Promise<CreatorAnalysis> {
  const evidence = await gatherEvidence(creator);

  const evidenceText = evidence
    .map(
      (item, index) =>
        `[Evidence ${index + 1}]
Type: ${item.type}
Source: ${item.source}
Title: ${item.title}
Content: ${item.content}`
    )
    .join("\n\n");

  const system = `
You are a creator intelligence analyst.

Analyze the creator using ONLY the information provided.

Identify:
1. The creator's major content themes.
2. Realistic audience problems.
3. Buying-intent signals.
4. A concise creator summary.

Every problem and buying signal must be grounded in the supplied
evidence or clearly marked as an inference.

Do not invent audience comments.

Do not assume that a creator's audience wants a product simply because
the product would be commercially attractive.

Return JSON with exactly:

{
  "summary": "...",
  "contentThemes": ["..."],
  "audienceProblems": ["..."],
  "buyingSignals": ["..."]
}
`;

  const user = `
CREATOR

Name: ${creator.name}
Niche: ${creator.niche}
Instagram: ${creator.instagramUrl ?? "Not provided"}
TikTok: ${creator.tiktokUrl ?? "Not provided"}
YouTube: ${creator.youtubeUrl ?? "Not provided"}
Description: ${creator.description ?? "Not provided"}

Audience information:
${creator.audienceInfo ?? "Not provided"}

Manual posts:
${creator.manualPosts ?? "Not provided"}

EVIDENCE

${evidenceText || "No external evidence was found."}
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
  const evidenceText = analysis.evidence
    .map(
      (item, index) =>
        `[Evidence ${index + 1}]
Type: ${item.type}
Source: ${item.source}
Title: ${item.title}
Content: ${item.content}`
    )
    .join("\n\n");

  const system = `
You are a digital product opportunity strategist.

Generate 4 commercially realistic product opportunities based on the
creator's content, audience problems, buying signals, and evidence.

Do not create products merely because they match the creator's name.

Each opportunity must solve a specific customer problem.

The creator has NOT agreed to these products.

These are proposed opportunities only.

Avoid:
- fake creator endorsement
- fake insider access
- fake proprietary frameworks
- unsupported audience demand
- unsupported financial claims
- promises of guaranteed growth or revenue

For each opportunity explain WHY the evidence supports it.

Return JSON:

{
  "opportunities": [
    {
      "title": "...",
      "format": "workbook",
      "priceRange": "$X-$Y",
      "difficulty": "easy",
      "overallScore": 0,
      "creatorFit": 0,
      "rationale": "...",
      "targetCustomer": "...",
      "problem": "...",
      "transformation": "...",
      "evidenceBasis": ["Evidence 1", "Evidence 2"]
    }
  ]
}

Allowed formats include:
workbook, guide, template, action plan, checklist, calculator,
course outline, toolkit, swipe file, planner.
`;

  const user = `
CREATOR

Name: ${creator.name}
Niche: ${creator.niche}

ANALYSIS

Summary:
${analysis.summary}

Content themes:
${analysis.contentThemes.join("\n- ")}

Audience problems:
${analysis.audienceProblems.join("\n- ")}

Buying signals:
${analysis.buyingSignals.join("\n- ")}

EVIDENCE

${evidenceText || "No evidence available."}
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

IMPORTANT:

This is a proposed product.

The creator has NOT endorsed, authored, approved, licensed, or
collaborated on it unless the evidence explicitly says otherwise.

The product must stand on its own without creator participation.

Do not describe it as:
- official
- creator-authored
- insider
- proprietary
- first-hand
- endorsed

Do not imply that the creator personally developed the methodology.

Instead, use language such as:
- inspired by observable content patterns
- based on publicly observable strategies
- proposed collaboration opportunity
- potential product concept

The unique angle must describe the product's genuine differentiation,
not imaginary creator access.

Return JSON:

{
  "productName": "...",
  "type": "...",
  "price": 0,
  "targetAudience": "...",
  "problem": "...",
  "transformation": "...",
  "uniqueAngle": "...",
  "contents": ["...", "..."]
}
`;

  const user = `
CREATOR

Name: ${creator.name}
Niche: ${creator.niche}

ANALYSIS

${analysis.summary}

Content themes:
${analysis.contentThemes.join("\n- ")}

Audience problems:
${analysis.audienceProblems.join("\n- ")}

BUYING SIGNALS

${analysis.buyingSignals.join("\n- ")}

SELECTED OPPORTUNITY

Title: ${opportunity.title}
Format: ${opportunity.format}
Price range: ${opportunity.priceRange}
Difficulty: ${opportunity.difficulty}
Score: ${opportunity.overallScore}
Creator fit: ${opportunity.creatorFit}

Rationale:
${opportunity.rationale}

Target customer:
${opportunity.targetCustomer}

Problem:
${opportunity.problem}

Transformation:
${opportunity.transformation}

Evidence basis:
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

The workbook should:
- teach a transferable process
- contain practical exercises
- contain useful templates
- avoid unsupported claims
- avoid pretending the creator authored it
- avoid implying endorsement
- avoid promising guaranteed results

If the creator's name is used in the product title, treat it as a
proposed collaboration/branding concept rather than an approved product.

The workbook should remain useful if the creator never participates.

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

Name: ${creator.name}
Niche: ${creator.niche}

PRODUCT

Name: ${product.productName}
Type: ${product.type}
Target audience: ${product.targetAudience}
Problem: ${product.problem}
Transformation: ${product.transformation}
Unique angle: ${product.uniqueAngle}

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

Position the product around the customer's desired transformation.

If the creator's branding is potentially relevant, describe it as a
possible future collaboration or licensed branding opportunity.

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

Name: ${creator.name}
Niche: ${creator.niche}

PRODUCT

Name: ${product.productName}
Type: ${product.type}
Target audience: ${product.targetAudience}
Problem: ${product.problem}
Transformation: ${product.transformation}
Unique angle: ${product.uniqueAngle}
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

Do NOT:
- add creator endorsements
- invent creator quotes
- invent creator experiences
- claim creator authorship
- claim official status
- claim insider access
- introduce unsupported financial claims

The creator's public content may influence examples and tone, but do
not pretend that the creator personally authored the material.

Return JSON using the same workbook structure.
`;

  const user = `
CREATOR

Name: ${creator.name}
Niche: ${creator.niche}

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
You are an expert partnership outreach strategist.

Create outreach drafts proposing a potential collaboration around the
product.

The outreach must be honest.

Never claim:
- the creator's audience has explicitly requested the product unless
  evidence confirms it
- the creator has endorsed the product
- the creator has authored the product
- the creator has proprietary involvement
- the product is official
- the creator has already agreed to a revenue share

The message should ask whether the creator/team would be interested
in discussing the concept.

Do not pretend the sender already has a partnership.

Generate 9 drafts:
- 3 professional emails
- 3 enthusiastic Twitter/X DMs
- 3 casual Instagram DMs

Each draft should have a genuinely different angle.

Possible angles:
- audience problem
- prototype/research-first
- collaboration/revenue-share

Avoid repeating the same pitch with different wording.

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

Name: ${creator.name}
Niche: ${creator.niche}

PROPOSED PRODUCT

Name: ${product.productName}
Type: ${product.type}
Target audience: ${product.targetAudience}
Problem: ${product.problem}
Transformation: ${product.transformation}
Unique angle: ${product.uniqueAngle}

Branding:

${JSON.stringify(branding, null, 2)}
`;

  const text = await rawChat(system, user);
  const result = parseJson(text, OutreachSchema);

  return result.drafts;
}

// ============================================================
// 8. CLAIM AUDITOR
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

Review the generated content against the creator information and
evidence.

Look specifically for:

1. Claims of creator endorsement.
2. Claims of creator authorship.
3. Claims of official affiliation.
4. Claims of insider access.
5. Claims of proprietary methodology.
6. Unsupported financial claims.
7. Unsupported audience-demand claims.
8. Fabricated comments or testimonials.
9. Implied partnerships that do not exist.
10. Guarantees of growth, revenue, virality, or business results.
11. Unauthorized assumptions about creator intellectual property.
12. Language that presents a hypothesis as an established fact.

You MUST correct violations.

Do not merely report them.

Rewrite problematic language into accurate, commercially useful
language.

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
"Your highly successful creator business"

The creator has NOT agreed to the product.

Return JSON:

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

  const AuditSchema = z.object({
    passed: z.boolean(),
    issues: z.array(z.string()),
    corrected: z.object({
      product: ProductRecommendationSchema,
      workbook: WorkbookSchema,
      branding: BrandingBriefSchema,
      outreach: z.array(
        z.object({
          channel: z.enum(["email", "twitter_dm", "instagram_dm"]),
          tone: z.enum(["professional", "enthusiastic", "casual"]),
          subject: z.string().optional(),
          body: z.string(),
        })
      ),
    }),
  });

  return parseJson(text, AuditSchema);
}
