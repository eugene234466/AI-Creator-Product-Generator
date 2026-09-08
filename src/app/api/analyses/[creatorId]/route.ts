import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { analyses } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ creatorId: string }> }
) {
  try {
    const { creatorId } = await params;
    const all = await db
      .select()
      .from(analyses)
      .where(eq(analyses.creatorId, parseInt(creatorId)))
      .orderBy(desc(analyses.createdAt));

    return NextResponse.json({ analyses: all });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch analyses" }, { status: 500 });
  }
}
