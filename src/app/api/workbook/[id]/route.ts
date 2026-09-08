import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { workbooks } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [workbook] = await db.select().from(workbooks).where(eq(workbooks.id, parseInt(id)));
    if (!workbook) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ workbook });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch workbook" }, { status: 500 });
  }
}
