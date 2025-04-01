import { type NextRequest, NextResponse } from "next/server";

import db from "@/db/drizzle";
import { getIsAdmin } from "@/lib/admin";
import { vocabularyItems } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET: Lấy tất cả dữ liệu
export const GET = async () => {
  const isAdmin = getIsAdmin();
  if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

  const data = await db.query.vocabularyItems.findMany();
  return NextResponse.json(data);
};

// POST: Thêm từ vựng mới
export const POST = async (req: NextRequest) => {
  const isAdmin = getIsAdmin();
  if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

  interface VocabularyItem {
    id: number;
    word: string;
    meaning: string;
    order: number;
  }

  interface RequestBody {
    vocabularyId: number;
    vocabularies: Omit<VocabularyItem, "id">[];
  }

  const body = (await req.json()) as RequestBody;

  if (!body.vocabularyId || !Array.isArray(body.vocabularies)) {
    return new NextResponse("Invalid data format", { status: 400 });
  }

  // Chèn dữ liệu vào database
  const data = await db
    .insert(vocabularyItems)
    .values(
      body.vocabularies.map((item) => ({
        ...item,
        vocabularyId: body.vocabularyId,
      }))
    )
    .returning();
console.log('dataposst', data)
  // Đảm bảo phản hồi có dạng { data: { id: 123, ... } }
  return NextResponse.json(data[0]);
};  



// PUT: Cập nhật từ vựng (cần truyền id trong body)
export const PUT = async (req: NextRequest) => {
  const isAdmin = getIsAdmin();
  if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

  const body = (await req.json()) as typeof vocabularyItems.$inferInsert & { id: number };

  if (!body.id) {
    return new NextResponse("Missing vocabulary id.", { status: 400 });
  }

  const updated = await db
    .update(vocabularyItems)
    .set({ ...body })
    .where(eq(vocabularyItems.id, body.id))
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
    .delete(vocabularyItems)
    .where(eq(vocabularyItems.id, Number(id)))
    .returning();

  return NextResponse.json(deleted[0]);
};
