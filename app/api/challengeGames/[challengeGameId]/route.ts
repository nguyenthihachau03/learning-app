import { eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";

import db from "@/db/drizzle";
import { challengeGames } from "@/db/schema";
import { getIsAdmin } from "@/lib/admin";

export const GET = async (
  _req: NextRequest,
  { params }: { params: Promise<{ challengeGameId: string }> } // ✅ Sửa kiểu params thành Promise<{ challengeGameId: string }>
) => {
  const resolvedParams = await params; // ✅ Giải quyết Promise
  const parsedId = Number(resolvedParams.challengeGameId);
  if (isNaN(parsedId)) {
    return new NextResponse("Invalid ID format.", { status: 400 });
  }

  const isAdmin = await getIsAdmin();
  if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

  const data = await db.query.challengeGames.findFirst({
    where: eq(challengeGames.id, parsedId),
  });

  return NextResponse.json(data);
};

export const PUT = async (
  req: NextRequest,
  { params }: { params: Promise<{ challengeGameId: string }> } // ✅ Sửa kiểu params thành Promise
) => {
  const resolvedParams = await params;
  const parsedId = Number(resolvedParams.challengeGameId);
  if (isNaN(parsedId)) {
    return new NextResponse("Invalid ID format.", { status: 400 });
  }

  const isAdmin = await getIsAdmin();
  if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

  const body = (await req.json()) as typeof challengeGames.$inferSelect;
  const data = await db
    .update(challengeGames)
    .set({
      ...body,
    })
    .where(eq(challengeGames.id, parsedId))
    .returning();

  return NextResponse.json(data[0]);
};

export const DELETE = async (
  _req: NextRequest,
  { params }: { params: Promise<{ challengeGameId: string }> } // ✅ Sửa kiểu params thành Promise
) => {
  const resolvedParams = await params;
  const parsedId = Number(resolvedParams.challengeGameId);
  if (isNaN(parsedId)) {
    return new NextResponse("Invalid ID format.", { status: 400 });
  }

  const isAdmin = await getIsAdmin();
  if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

  const data = await db
    .delete(challengeGames)
    .where(eq(challengeGames.id, parsedId))
    .returning();

  return NextResponse.json(data[0]);
};