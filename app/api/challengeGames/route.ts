import { type NextRequest, NextResponse } from "next/server";

import db from "@/db/drizzle";
import { getIsAdmin } from "@/lib/admin";
import { challengeGames } from "@/db/schema";
import { eq } from "drizzle-orm";

export const GET = async () => {
  const isAdmin = getIsAdmin();
  if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

  const data = await db.query.challengeGames.findMany();
  console.log('challengeGames')
  return NextResponse.json(data);
};

export const POST = async (req: NextRequest) => {
  const isAdmin = getIsAdmin();
  if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

  const body = (await req.json()) as typeof challengeGames.$inferSelect;
  console.log('challengeGames', body)
  const data = await db
    .insert(challengeGames)
    .values({
      ...body,
    })
    .returning();
  return NextResponse.json(data[0]);
};

export const PUT = async (req: NextRequest) => {
  const isAdmin = getIsAdmin();
  if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

  const body = await req.json();
  const { id, ...updateData } = body;

  if (!id) {
    return new NextResponse("Challenge Game ID is required.", { status: 400 });
  }

  const updatedChallengeGame = await db
    .update(challengeGames)
    .set(updateData)
    .where(eq(challengeGames.id, id))
    .returning();

  if (!updatedChallengeGame.length) {
    return new NextResponse("Challenge Game not found.", { status: 404 });
  }

  return NextResponse.json(updatedChallengeGame[0]);
};

// Xóa challengeGame theo ID
export const DELETE = async (req: NextRequest) => {
  const isAdmin = getIsAdmin();
  if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return new NextResponse("Challenge Game ID is required.", { status: 400 });
  }

  const deletedChallengeGame = await db
    .delete(challengeGames)
    .where(eq(challengeGames.id, parseInt(id)))
    .returning();

  if (!deletedChallengeGame.length) {
    return new NextResponse("Challenge Game not found.", { status: 404 });
  }

  return NextResponse.json({ message: "Challenge Game deleted successfully" });
};