import { type NextRequest, NextResponse } from "next/server";
import db from "@/db/drizzle";
import { getIsAdmin } from "@/lib/admin";
import { vocabularys, quiz } from "@/db/schema";
import { inArray } from "drizzle-orm";

export const GET = async (req: NextRequest) => {
  const isAdmin = getIsAdmin();
  if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

  // Lấy danh sách tất cả quiz để tìm các vocabularyId có quiz
  const vocabulary_items = await db.query.vocabularyItems.findMany({
    columns: { vocabularyId: true },
  });

  // Lấy danh sách vocabularyId duy nhất từ quizzes
  const vocabularyIdsWithItems = [...new Set(vocabulary_items.map((q) => q.vocabularyId))];

  // Nếu không có vocabulary nào có quiz, trả về mảng rỗng
  if (vocabularyIdsWithItems.length === 0) {
    return NextResponse.json([]);
  }

  // Lấy danh sách vocabularys có quiz
  const data = await db.query.vocabularys.findMany({
    where: inArray(vocabularys.id, vocabularyIdsWithItems),
    with: {
      course: true, // Nếu cần thông tin về course
    },
  });

  return NextResponse.json(data);
};