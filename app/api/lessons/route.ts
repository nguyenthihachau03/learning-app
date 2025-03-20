import { type NextRequest, NextResponse } from "next/server";

import db from "@/db/drizzle";
import { lessons } from "@/db/schema";
import { getIsAdmin } from "@/lib/admin";
import { eq } from "drizzle-orm";

export const GET = async () => {
  const isAdmin = getIsAdmin();
  if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

  const data = await db.query.lessons.findMany();
  console.log('lessons')
  return NextResponse.json(data);
};

export const POST = async (req: NextRequest) => {
  const isAdmin = getIsAdmin();
  if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

  const body = (await req.json()) as typeof lessons.$inferSelect;

  const data = await db
    .insert(lessons)
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
    return new NextResponse("Lesson ID is required.", { status: 400 });
  }

  const updatedLesson = await db
    .update(lessons)
    .set(updateData)
    .where(eq(lessons.id, id))
    .returning();

  if (!updatedLesson.length) {
    return new NextResponse("Lesson not found.", { status: 404 });
  }

  return NextResponse.json(updatedLesson[0]);
};

export const DELETE = async (req: NextRequest) => {
  const isAdmin = getIsAdmin();
  if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return new NextResponse("Lesson ID is required.", { status: 400 });
  }

  const deletedLesson = await db
    .delete(lessons)
    .where(eq(lessons.id, parseInt(id)))
    .returning();

  if (!deletedLesson.length) {
    return new NextResponse("Lesson not found.", { status: 404 });
  }

  return NextResponse.json({ message: "Lesson deleted successfully" });
};