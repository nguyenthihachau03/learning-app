import { eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";

import db from "@/db/drizzle";
import {  quiz } from "@/db/schema";
import { getIsAdmin } from "@/lib/admin";

export const GET = async (_req: NextRequest, props: { params: Promise<{ quizId: number }> }) => {
  const params = await props.params;
  const isAdmin = getIsAdmin();
  if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

  const data = await db.query.quiz.findFirst({
    where: eq(quiz.id, params.quizId),
  });

  return NextResponse.json(data);
};

export const PUT = async (req: NextRequest, props: { params: Promise<{ quizId: number }> }) => {
  const params = await props.params;
  const isAdmin = getIsAdmin();
  if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

  const body = (await req.json()) as typeof quiz.$inferSelect;
  const data = await db
    .update(quiz)
    .set({
      ...body,
      options: body.options ? JSON.stringify(body.options) : JSON.stringify([])
    })
    .where(eq(quiz.id, params.quizId))
    .returning();

  return NextResponse.json(data[0]);
};

export const DELETE = async (_req: NextRequest, props: { params: Promise<{ quizId: number }> }) => {
  const params = await props.params;
  const isAdmin = getIsAdmin();
  if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

  const data = await db
    .delete(quiz)
    .where(eq(quiz.id, params.quizId))
    .returning();

  return NextResponse.json(data[0]);
};