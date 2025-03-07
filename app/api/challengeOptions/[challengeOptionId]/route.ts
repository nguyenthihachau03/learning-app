import { eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import db from "@/db/drizzle";
import { challengeOptions } from "@/db/schema";
import { getIsAdmin } from "@/lib/admin";

export const GET = async (
  req: NextRequest,
  context: { params?: Promise<{ challengeOptionId?: string }> }
) => {
  const params = await context.params; // ✅ Giải quyết Promise một lần
  if (!params || !params.challengeOptionId) {
    return new NextResponse("Missing challengeOptionId.", { status: 400 });
  }

  const parsedId = Number(params.challengeOptionId);
  if (isNaN(parsedId)) {
    return new NextResponse("Invalid ID format.", { status: 400 });
  }

  const isAdmin = await getIsAdmin();
  if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

  const data = await db.query.challengeOptions.findFirst({
    where: eq(challengeOptions.id, parsedId),
  });

  if (!data) {
    return new NextResponse("Challenge Option not found.", { status: 404 });
  }

  return NextResponse.json(data);
};

export const PUT = async (
  req: NextRequest,
  context: { params?: Promise<{ challengeOptionId?: string }> }
) => {
  const params = await context.params; // ✅ Giải quyết Promise một lần
  if (!params || !params.challengeOptionId) {
    return new NextResponse("Missing challengeOptionId.", { status: 400 });
  }

  const parsedId = Number(params.challengeOptionId);
  if (isNaN(parsedId)) {
    return new NextResponse("Invalid ID format.", { status: 400 });
  }

  const isAdmin = await getIsAdmin();
  if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

  const body = (await req.json()) as Partial<typeof challengeOptions.$inferSelect>;

  const validFields: Record<string, any> = {};
  if (body.text !== undefined) validFields.text = body.text;
  if (body.correct !== undefined) validFields.correct = body.correct;
  if (body.imageSrc !== undefined) validFields.imageSrc = body.imageSrc;
  if (body.audioSrc !== undefined) validFields.audioSrc = body.audioSrc;

  if (Object.keys(validFields).length === 0) {
    return new NextResponse("No valid fields to update.", { status: 400 });
  }

  const data = await db
    .update(challengeOptions)
    .set(validFields)
    .where(eq(challengeOptions.id, parsedId))
    .returning();

  if (!data || data.length === 0) {
    return new NextResponse("Update failed. Challenge Option not found.", { status: 404 });
  }

  return NextResponse.json(data[0]);
};

export const DELETE = async (
  req: NextRequest,
  context: { params?: Promise<{ challengeOptionId?: string }> }
) => {
  const params = await context.params; // ✅ Giải quyết Promise một lần
  if (!params || !params.challengeOptionId) {
    return new NextResponse("Missing challengeOptionId.", { status: 400 });
  }

  const parsedId = Number(params.challengeOptionId);
  if (isNaN(parsedId)) {
    return new NextResponse("Invalid ID format.", { status: 400 });
  }

  const isAdmin = await getIsAdmin();
  if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

  const data = await db
    .delete(challengeOptions)
    .where(eq(challengeOptions.id, parsedId))
    .returning();

  if (!data || data.length === 0) {
    return new NextResponse("Delete failed. Challenge Option not found.", { status: 404 });
  }

  return NextResponse.json(data[0]);
};
