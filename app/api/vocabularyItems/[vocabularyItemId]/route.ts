import { eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";

import db from "@/db/drizzle";
import { getIsAdmin } from "@/lib/admin";
import { vocabularyItems } from "@/db/schema";


export const GET = async (_req: NextRequest, props: { params: Promise<{ vocabularyItemId: number }> }) => {
  const params = await props.params;
  const isAdmin = getIsAdmin();
  if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

  const data = await db.query.vocabularyItems.findFirst({
    where: eq(vocabularyItems.id, params.vocabularyItemId),
  });

  return NextResponse.json(data);
};

export const PUT = async (req: NextRequest, props: { params: Promise<{ vocabularyItemId: number }> }) => {
  const params = await props.params;
  const isAdmin = getIsAdmin();
  if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

  const body = (await req.json()) as typeof vocabularyItems.$inferSelect;
  const data = await db
    .update(vocabularyItems)
    .set({
      ...body,
    })
    .where(eq(vocabularyItems.id, params.vocabularyItemId))
    .returning();

  return NextResponse.json(data[0]);
};

export const DELETE = async (_req: NextRequest, props: { params: Promise<{ vocabularyItemId: number }> }) => {
  const params = await props.params;
  const isAdmin = getIsAdmin();
  if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

  const data = await db
    .delete(vocabularyItems)
    .where(eq(vocabularyItems.id, params.vocabularyItemId))
    .returning();

  return NextResponse.json(data[0]);
};