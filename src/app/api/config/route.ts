import { NextResponse } from "next/server";

export async function GET() {
  // Return non-sensitive config status only — never expose the actual key
  const hasApiKey = !!(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "placeholder");
  const model = process.env.AI_MODEL ?? "gpt-4o-mini";
  const baseUrl = process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1";

  return NextResponse.json({
    hasApiKey,
    model,
    baseUrl,
    configured: hasApiKey,
  });
}
