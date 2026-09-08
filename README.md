# AI Creator Product Generator

Turn a content creator's niche and audience into a scored, evidence-backed digital product idea — analysis, opportunity discovery, product recommendation, a full workbook, a branding pass, and outreach drafts, end to end.

## How it works

```
Creator profile
      │
      ▼
1. Analyze        → real web evidence (Tavily) + manual input → niche/audience analysis
2. Opportunities   → 3–5 scored product ideas (10 weighted sub-scores each)
3. Recommend       → picks and justifies the single best opportunity
4. Workbook        → generates the full product content (exercises, worksheets, checklists)
5. Brand           → branding brief, then re-tones the workbook to match the creator's voice
6. Outreach        → 3 draft partnership messages (never auto-sent — human review required)
      │
      ▼
   Report          → everything above assembled into one exportable report
```

Every AI-generated claim is tagged by evidence type — `creator_post`, `audience_comment`, `ai_inference`, or `external_research` — so the output never quietly passes off a guess as a fact.

## Tech stack

- **Frontend/API:** Next.js 16 (App Router), TypeScript, Tailwind
- **Database:** PostgreSQL via Drizzle ORM
- **AI:** OpenAI-compatible chat completions (works with OpenAI, Groq, Mistral, local Ollama, etc. — set `OPENAI_BASE_URL`)
- **Evidence gathering:** [Tavily](https://tavily.com) web search API
- **Validation:** Zod schemas on every AI response, with an automatic retry on malformed output
- **Export:** jsPDF / html2canvas for PDF reports

## Getting started

```bash
npm install
cp .env.example .env   # fill in the values below
npm run dev
```

### Required environment variables

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | Yes | Postgres connection string |
| `OPENAI_API_KEY` | Yes | Or a key for whichever OpenAI-compatible provider you point `OPENAI_BASE_URL` at |
| `APP_API_KEY` | Yes in production | Shared key required in an `x-api-key` header on every `/api/*` request |
| `TAVILY_API_KEY` | Recommended | Free tier: 1,000 credits/month, no card. Without it, analysis falls back to LLM inference only, clearly labeled as such |
| `OPENAI_BASE_URL`, `AI_MODEL` | Optional | Point at Groq, Mistral, local Ollama, etc. — see `.env.example` for provider presets |

### Auth

Every request to `/api/*` must include the `APP_API_KEY` value in either header:

```
x-api-key: <your key>
```
or
```
Authorization: Bearer <your key>
```

This is a single shared key suited to a personal or small-team deployment, not per-user accounts — there's no `ownerId` on any table yet, so anyone with the key can read/write all creators.

## Project structure

```
src/
  app/api/          → one route per pipeline stage (analyze, opportunities, recommend, workbook, brand, outreach, report)
  components/        → UI for each stage's results
  db/schema.ts        → creators → analyses → opportunities → recommendations → workbooks → reports
  lib/ai.ts           → all prompts, response schemas, and the validated chat() wrapper
  lib/evidence.ts      → Tavily search + evidence formatting
  middleware.ts        → API key auth on /api/*
```

## Notes on reliability

- Every AI call is validated against a Zod schema and retried once with the validation error fed back to the model before failing outright.
- Untrusted, creator-supplied text (bios, pasted posts, audience notes) is fenced and explicitly marked as data, not instructions, before being sent to the model.
- `/api/analyze` and `/api/opportunities` skip regenerating results that already exist and are fresh, unless `forceRegenerate: true` is passed — keeps API costs down on repeat visits.
- Instagram/TikTok content isn't reliably indexed by general web search, so `creator_post` evidence for those platforms still depends on the creator's manually pasted posts rather than the automated search step.

## Disclaimer

Generated branding briefs and workbooks are drafts. The tool explicitly does not claim to write *as* the creator — a human review/approval step is expected before anything goes out, and outreach drafts are never sent automatically.
