import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { creators } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const all = await db.select().from(creators).orderBy(desc(creators.createdAt));
    return NextResponse.json({ creators: all });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch creators" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, niche, instagramUrl, tiktokUrl, youtubeUrl, description, manualPosts, audienceInfo } = body;

    if (!name || !niche) {
      return NextResponse.json({ error: "Name and niche are required" }, { status: 400 });
    }

    const [creator] = await db
      .insert(creators)
      .values({
        name,
        niche,
        instagramUrl: instagramUrl || null,
        tiktokUrl: tiktokUrl || null,
        youtubeUrl: youtubeUrl || null,
        description: description || null,
        manualPosts: manualPosts || null,
        audienceInfo: audienceInfo || null,
      })
      .returning();

    return NextResponse.json({ creator }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create creator" }, { status: 500 });
  }
}
