import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { outreachDrafts } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ opportunityId: string }> }
) {
  try {
    const { opportunityId } = await params;
    const drafts = await db
      .select()
      .from(outreachDrafts)
      .where(eq(outreachDrafts.opportunityId, parseInt(opportunityId)));

    return NextResponse.json({ drafts });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch outreach drafts" }, { status: 500 });
  }
}
