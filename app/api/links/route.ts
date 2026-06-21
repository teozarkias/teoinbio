import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { buildUrl, getPlatform } from "@/lib/platforms";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await db.profile.findUnique({
      where: { userId: session.user.id },
      include: { links: { orderBy: { position: "asc" } } },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json(profile.links);
  } catch (error) {
    console.error("GET /api/links error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { platformId, username } = await req.json();

    if (!platformId || !username) {
      return NextResponse.json(
        { error: "Platform and username are required" },
        { status: 400 },
      );
    }

    const platform = getPlatform(platformId);
    if (!platform) {
      return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
    }

    const url = buildUrl(platformId, username);
    const title = platform.name;

    const profile = await db.profile.findUnique({
      where: { userId: session.user.id },
      include: { links: true },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const link = await db.link.create({
      data: {
        title,
        url,
        platform: platformId,
        position: profile.links.length,
        profileId: profile.id,
      },
    });

    return NextResponse.json(link, { status: 201 });
  } catch (error) {
    console.error("POST /api/links error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
