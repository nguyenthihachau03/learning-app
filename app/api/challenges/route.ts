import { type NextRequest, NextResponse } from "next/server";
import db from "@/db/drizzle";
import { challenges } from "@/db/schema";
import { getIsAdmin } from "@/lib/admin";
import { eq, asc, desc, sql } from "drizzle-orm";

export const GET = async (req: NextRequest) => {
  const isAdmin = getIsAdmin();
  if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

  const { searchParams } = new URL(req.url);

  const sortParam = searchParams.get("sort");
  let sortField = "lesson_order";
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

  let orderByClause;
  if (sortField === "order") {
    orderByClause = [
      asc(challenges.lessonId),
      sortOrder === "desc" ? desc(challenges.order) : asc(challenges.order),
    ];
  } else {
    const sortableFields = {
      id: challenges.id,
      lessonId: challenges.lessonId,
      type: challenges.type,
      question: challenges.question,
      order: challenges.order,
    };
    const column =
      sortableFields[sortField as keyof typeof sortableFields] ||
      challenges.id;
    orderByClause = sortOrder === "desc" ? [desc(column)] : [asc(column)];
  }

  const [data, total] = await Promise.all([
    db.select().from(challenges).orderBy(...orderByClause),
    db.select({ count: sql<number>`COUNT(*)` }).from(challenges),
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

  const body = (await req.json()) as typeof challenges.$inferSelect;
  console.log('challenges post', body)
  const data = await db
    .insert(challenges)
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
    return new NextResponse("Challenge ID is required.", { status: 400 });
  }

  const updatedChallenge = await db
    .update(challenges)
    .set(updateData)
    .where(eq(challenges.id, id))
    .returning();

  if (!updatedChallenge.length) {
    return new NextResponse("Challenge not found.", { status: 404 });
  }

  return NextResponse.json(updatedChallenge[0]);
};
