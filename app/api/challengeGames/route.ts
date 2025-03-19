import { type NextRequest, NextResponse } from "next/server";

import db from "@/db/drizzle";
import { getIsAdmin } from "@/lib/admin";
import { challengeGames } from "@/db/schema";

export const GET = async () => {
  const isAdmin = getIsAdmin();
  if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

  const data = await db.query.challengeGames.findMany();

  return NextResponse.json(data);
};

export const POST = async (req: NextRequest) => {
  const isAdmin = getIsAdmin();
  if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

  const body = (await req.json()) as typeof challengeGames.$inferSelect;

  const data = await db
    .insert(challengeGames)
    .values({
      ...body,
    })
    .returning();

  return NextResponse.json(data[0]);
};