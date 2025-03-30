import { type NextRequest, NextResponse } from "next/server";

import db from "@/db/drizzle";
import { getIsAdmin } from "@/lib/admin";
import { vocabularys } from "@/db/schema";
import { eq, asc, desc, sql } from "drizzle-orm";

export const GET = async (req: NextRequest) => {
  const isAdmin = getIsAdmin();
  if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

  const { searchParams } = new URL(req.url);

  // ✅ Phân tích sort=["field","ASC|DESC"]
  const sortParam = searchParams.get("sort");
  let sortField = "id";
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

  // ✅ Phân tích phân trang
  const page = parseInt(searchParams.get("page") || "1");
  const perPage = parseInt(searchParams.get("perPage") || "10");
  const offset = (page - 1) * perPage;

  // ✅ Chỉ cho phép các trường hợp lệ
  const sortableFields = {
    id: vocabularys.id,
    title: vocabularys.title,
    description: vocabularys.description,
    courseId: vocabularys.courseId,
    order: vocabularys.order,
  };

  const column = sortableFields[sortField as keyof typeof sortableFields] || vocabularys.id;

  // ✅ Truy vấn
  const [data, total] = await Promise.all([
    db
      .select()
      .from(vocabularys)
      .orderBy(sortOrder === "asc" ? asc(column) : desc(column))
      .offset(offset)
      .limit(perPage),
    db.select({ count: sql<number>`COUNT(*)` }).from(vocabularys),
  ]);

  const totalCount = Number((total[0] as any).count);

  // ✅ Trả kết quả
  return new NextResponse(JSON.stringify(data), {
    status: 206,
    headers: {
      "Content-Range": `items ${offset}-${offset + data.length - 1}/${totalCount}`,
      "Access-Control-Expose-Headers": "Content-Range",
    },
  });
};

// POST: Thêm từ vựng mới
export const POST = async (req: NextRequest) => {
  const isAdmin = getIsAdmin();
  if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

  const body = (await req.json()) as typeof vocabularys.$inferInsert;

  const data = await db.insert(vocabularys).values(body).returning();
  return NextResponse.json(data[0]);
};

// PUT: Cập nhật từ vựng (cần truyền id trong body)
export const PUT = async (req: NextRequest) => {
  const isAdmin = getIsAdmin();
  if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

  const body = (await req.json()) as typeof vocabularys.$inferInsert & { id: number };

  if (!body.id) {
    return new NextResponse("Missing vocabulary id.", { status: 400 });
  }

  const updated = await db
    .update(vocabularys)
    .set({ ...body })
    .where(eq(vocabularys.id, body.id))
    .returning();

  return NextResponse.json(updated[0]);
};

// DELETE: Xóa từ vựng (lấy id từ query)
export const DELETE = async (req: NextRequest) => {
  const isAdmin = getIsAdmin();
  if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return new NextResponse("Missing vocabulary id.", { status: 400 });
  }

  const deleted = await db
    .delete(vocabularys)
    .where(eq(vocabularys.id, Number(id)))
    .returning();

  return NextResponse.json(deleted[0]);
};
