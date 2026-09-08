import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { creators } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [creator] = await db.select().from(creators).where(eq(creators.id, parseInt(id)));
    if (!creator) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ creator });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch creator" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, niche, instagramUrl, tiktokUrl, youtubeUrl, description, manualPosts, audienceInfo } = body;

    const [updated] = await db
      .update(creators)
      .set({
        name,
        niche,
        instagramUrl: instagramUrl || null,
        tiktokUrl: tiktokUrl || null,
        youtubeUrl: youtubeUrl || null,
        description: description || null,
        manualPosts: manualPosts || null,
        audienceInfo: audienceInfo || null,
        updatedAt: new Date(),
      })
      .where(eq(creators.id, parseInt(id)))
      .returning();

    return NextResponse.json({ creator: updated });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update creator" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.delete(creators).where(eq(creators.id, parseInt(id)));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete creator" }, { status: 500 });
  }
}
