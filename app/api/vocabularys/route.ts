import { type NextRequest, NextResponse } from "next/server";

import db from "@/db/drizzle";
import { getIsAdmin } from "@/lib/admin";
import { vocabularys } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET: Lấy tất cả dữ liệu
export const GET = async () => {
  const isAdmin = getIsAdmin();
  if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

  const data = await db.query.vocabularys.findMany();
  return NextResponse.json(data);
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
