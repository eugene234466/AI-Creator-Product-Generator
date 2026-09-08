import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { opportunities } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ creatorId: string }> }
) {
  try {
    const { creatorId } = await params;
    const all = await db
      .select()
      .from(opportunities)
      .where(eq(opportunities.creatorId, parseInt(creatorId)))
      .orderBy(desc(opportunities.overallScore));

    return NextResponse.json({ opportunities: all });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch opportunities" }, { status: 500 });
  }
}
