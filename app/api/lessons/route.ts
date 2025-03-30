import { type NextRequest, NextResponse } from "next/server";
import db from "@/db/drizzle";
import { lessons } from "@/db/schema";
import { getIsAdmin } from "@/lib/admin";
import { eq, asc, desc, sql } from "drizzle-orm";
export const GET = async (req: NextRequest) => {
  const isAdmin = getIsAdmin();
  if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

  const { searchParams } = new URL(req.url);

  const sortParam = searchParams.get("sort");
  let sortField = "unitId_order";
  let sortOrder = "asc";

  if (sortParam) {
    try {
      const [field, order] = JSON.parse(sortParam);
      sortField = field;
      sortOrder = order.toLowerCase();
    } catch (err) {
      console.warn("Invalid sort param", sortParam);
    }
  }

  // Sắp xếp đúng chiều theo sortOrder cho cả unitId + order
  let orderByClause;
  if (sortField === "order") {
    orderByClause = [
      asc(lessons.unitId),
      sortOrder === "desc" ? desc(lessons.order) : asc(lessons.order)
    ];
  } else {
    // fallback cho sort field khác
    const sortableFields = {
      id: lessons.id,
      title: lessons.title,
      unitId: lessons.unitId,
      order: lessons.order,
    };
    const column = sortableFields[sortField as keyof typeof sortableFields] || lessons.id;
    orderByClause = sortOrder === "desc" ? [desc(column)] : [asc(column)];
  }

  const [data, total] = await Promise.all([
    db.select().from(lessons).orderBy(...orderByClause),
    db.select({ count: sql<number>`COUNT(*)` }).from(lessons),
  ]);

  const totalCount = Number((total[0] as any).count);

  return new NextResponse(JSON.stringify(data), {
    status: 206,
    headers: {
      "Content-Range": `items 0-${data.length - 1}/${totalCount}`,
      "Access-Control-Expose-Headers": "Content-Range",
    },
  });
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