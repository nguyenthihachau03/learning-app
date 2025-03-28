import { eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";

import db from "@/db/drizzle";
import { courses } from "@/db/schema";
import { getIsAdmin } from "@/lib/admin";

export const GET = async (_req: NextRequest, props: { params: Promise<{ courseId: number }> }) => {
  const params = await props.params;
  const isAdmin = getIsAdmin();
  if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

  const data = await db.query.courses.findFirst({
    where: eq(courses.id, params.courseId),
  });

  return NextResponse.json(data);
};

export const PUT = async (req: NextRequest, props: { params: Promise<{ courseId: number }> }) => {
  const params = await props.params;
  const isAdmin = getIsAdmin();
  if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

  const body = (await req.json()) as typeof courses.$inferSelect;
  const data = await db
    .update(courses)
    .set({
      ...body,
    })
    .where(eq(courses.id, params.courseId))
    .returning();

  return NextResponse.json(data[0]);
};

export const POST = async (req: NextRequest) => {
  const isAdmin = getIsAdmin();
  if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

  const body = await req.json();
  console.log("Courses POST", body);

  const data = await db
    .insert(courses)
    .values(body)
    .returning();

  return NextResponse.json(data[0]);
};

export const DELETE = async (_req: NextRequest, props: { params: Promise<{ courseId: number }> }) => {
  const params = await props.params;
  const isAdmin = getIsAdmin();
  if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

  const data = await db
    .delete(courses)
    .where(eq(courses.id, params.courseId))
    .returning();

  return NextResponse.json(data[0]);
};