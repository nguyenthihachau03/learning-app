import { type NextRequest, NextResponse } from "next/server";

import db from "@/db/drizzle";
import { getIsAdmin } from "@/lib/admin";
import { quiz } from "@/db/schema";
import { eq } from "drizzle-orm";

export const GET = async (req: NextRequest) => {
  const isAdmin = getIsAdmin();
  if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });
  const url = new URL(req.url);
  const vocabularyId = Number(url.searchParams.get("vocabularyId"));
  const data = await db.query.quiz.findMany();
  if(vocabularyId){
    console.log("vocabularyId")
    const data = await db.query.quiz.findMany({
      where: eq(quiz.vocabularyId, vocabularyId),
    });
    return NextResponse.json(data);
  }
  console.log("vocabularyId")
  return NextResponse.json(data);
};

export const POST = async (req: NextRequest) => {
  const isAdmin = getIsAdmin();
  if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

  const body = (await req.json()) as typeof quiz.$inferSelect;
  console.log("body", body);
  const data = await db
    .insert(quiz)
    .values({
      ...body,
      options: body.options ? JSON.stringify(body.options) : JSON.stringify([]),

    })
    .returning();

  return NextResponse.json(data[0]);
};