import { eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";

import db from "@/db/drizzle";
import { getIsAdmin } from "@/lib/admin";
import { vocabularys } from "@/db/schema";


export const GET = async (_req: NextRequest, props: { params: Promise<{ vocabularyId: number }> }) => {
  const params = await props.params;
  const isAdmin = getIsAdmin();
  if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

  const data = await db.query.vocabularys.findFirst({
    where: eq(vocabularys.id, params.vocabularyId),
  });

  return NextResponse.json(data);
};

export const PUT = async (req: NextRequest, props: { params: Promise<{ vocabularyId: number }> }) => {
  const params = await props.params;
  const isAdmin = getIsAdmin();
  if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

  const body = (await req.json()) as typeof vocabularys.$inferSelect;
  const data = await db
    .update(vocabularys)
    .set({
      ...body,
    })
    .where(eq(vocabularys.id, params.vocabularyId))
    .returning();

  return NextResponse.json(data[0]);
};

export const DELETE = async (_req: NextRequest, props: { params: Promise<{ vocabularyId: number }> }) => {
  const params = await props.params;
  const isAdmin = getIsAdmin();
  if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

  const data = await db
    .delete(vocabularys)
    .where(eq(vocabularys.id, params.vocabularyId))
    .returning();

  return NextResponse.json(data[0]);
};