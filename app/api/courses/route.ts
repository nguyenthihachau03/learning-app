import { type NextRequest, NextResponse } from "next/server";

import db from "@/db/drizzle";
import { courses } from "@/db/schema";
import { getIsAdmin } from "@/lib/admin";
import { eq } from "drizzle-orm";

export const GET = async () => {
  const isAdmin = getIsAdmin();
  if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

  const data = await db.query.courses.findMany();

  return NextResponse.json(data);
};

export const POST = async (req: NextRequest) => {
  const isAdmin = getIsAdmin();
  if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

  const body = (await req.json()) as typeof courses.$inferSelect;

  const data = await db
    .insert(courses)
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
    return new NextResponse("Course ID is required.", { status: 400 });
  }

  const updatedCourse = await db
    .update(courses)
    .set(updateData)
    .where(eq(courses.id, id))
    .returning();

  if (!updatedCourse.length) {
    return new NextResponse("Course not found.", { status: 404 });
  }

  return NextResponse.json(updatedCourse[0]);
};

// Xóa một course theo ID
export const DELETE = async (req: NextRequest) => {
  const isAdmin = getIsAdmin();
  if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return new NextResponse("Course ID is required.", { status: 400 });
  }

  const deletedCourse = await db
    .delete(courses)
    .where(eq(courses.id, parseInt(id)))
    .returning();

  if (!deletedCourse.length) {
    return new NextResponse("Course not found.", { status: 404 });
  }

  return NextResponse.json({ message: "Course deleted successfully" });
};