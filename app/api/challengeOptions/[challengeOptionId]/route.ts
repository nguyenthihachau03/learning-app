import { eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";

import db from "@/db/drizzle";
import { challengeOptions } from "@/db/schema";
import { getIsAdmin } from "@/lib/admin";

export const GET = async (
  _req: NextRequest,
  { params }: { params: Promise<{ challengeOptionId: string }> } // ✅ Sửa kiểu params thành Promise<{ challengeOptionId: string }>
) => {
  const resolvedParams = await params; // ✅ Giải quyết Promise
  const parsedId = Number(resolvedParams.challengeOptionId);
  if (isNaN(parsedId)) {
    return new NextResponse("Invalid ID format.", { status: 400 });
  }

  const isAdmin = await getIsAdmin();
  if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

  const data = await db.query.challengeOptions.findFirst({
    where: eq(challengeOptions.id, parsedId),
  });

  return NextResponse.json(data);
};

export const POST = async (req: NextRequest) => {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

  const body = await req.json();
  console.log("challengeOptions POST", body);

  const data = await db
    .insert(challengeOptions)
    .values(body)
    .returning();

  return NextResponse.json(data[0]);
};

export const PUT = async (
  req: NextRequest,
  { params }: { params: Promise<{ challengeOptionId: string }> } // ✅ Sửa kiểu params thành Promise
) => {
  const resolvedParams = await params;
  const parsedId = Number(resolvedParams.challengeOptionId);
  if (isNaN(parsedId)) {
    return new NextResponse("Invalid ID format.", { status: 400 });
  }

  const isAdmin = await getIsAdmin();
  if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

  const body = (await req.json()) as typeof challengeOptions.$inferSelect;
  const data = await db
    .update(challengeOptions)
    .set({
      ...body,
    })
    .where(eq(challengeOptions.id, parsedId))
    .returning();

  return NextResponse.json(data[0]);
};

export const DELETE = async (
  _req: NextRequest,
  { params }: { params: Promise<{ challengeOptionId: string }> } // ✅ Sửa kiểu params thành Promise
) => {
  const resolvedParams = await params;
  const parsedId = Number(resolvedParams.challengeOptionId);
  if (isNaN(parsedId)) {
    return new NextResponse("Invalid ID format.", { status: 400 });
  }

  const isAdmin = await getIsAdmin();
  if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

  const data = await db
    .delete(challengeOptions)
    .where(eq(challengeOptions.id, parsedId))
    .returning();

  return NextResponse.json(data[0]);
};
