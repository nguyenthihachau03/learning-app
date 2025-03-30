import { type NextRequest, NextResponse } from "next/server";
import db from "@/db/drizzle";
import { challengeOptions } from "@/db/schema";
import { getIsAdmin } from "@/lib/admin";
import { asc, desc, sql } from "drizzle-orm";

export const GET = async (req: NextRequest) => {
  const isAdmin = getIsAdmin();
  if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

  const { searchParams } = new URL(req.url);

  const sortParam = searchParams.get("sort");
  let sortField = "challengeId";
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

  // Sắp xếp theo challengeId
  const orderByClause = sortOrder === "desc"
    ? [desc(challengeOptions.challengeId)]
    : [asc(challengeOptions.challengeId)];

  const [data, total] = await Promise.all([
    db.select().from(challengeOptions).orderBy(...orderByClause),
    db.select({ count: sql<number>`COUNT(*)` }).from(challengeOptions),
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

  const body = (await req.json()) as typeof challengeOptions.$inferSelect;
  console.log('challengeOptions', body)
  const data = await db
    .insert(challengeOptions)
    .values({
      ...body,
    })
    .returning();

  return NextResponse.json(data[0]);
};