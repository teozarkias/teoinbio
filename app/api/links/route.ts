import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { error } from "next/dist/build/output/log";

export async function GET() {
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
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, url } = await req.json();

  if (!title || !url) {
    return NextResponse.json(
      { error: "Both title and url are required." },
      { status: 400 },
    );
  }

  const profile = await db.profile.findUnique({
    where: { userId: session.user.id },
    include: { links: true },
  });

  if (!profile) {
    return NextResponse.json({ error: "Profile not found." }, { status: 404 });
  }

  const link = await db.link.create({
    data: {
      title,
      url,
      position: profile.links.length,
      profileId: profile.id,
    },
  });

  return NextResponse.json(link, { status: 201 });
}
