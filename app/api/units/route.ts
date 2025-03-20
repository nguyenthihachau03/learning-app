import { type NextRequest, NextResponse } from "next/server";

import db from "@/db/drizzle";
import { units } from "@/db/schema";
import { getIsAdmin } from "@/lib/admin";
import { eq } from "drizzle-orm";

export const GET = async () => {
  const isAdmin = getIsAdmin();
  if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

  const data = await db.query.units.findMany();

  return NextResponse.json(data);
};

export const POST = async (req: NextRequest) => {
  const isAdmin = getIsAdmin();
  if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

  const body = (await req.json()) as typeof units.$inferSelect;

  const data = await db
    .insert(units)
    .values({
      ...body,
    })
    .returning();

  return NextResponse.json(data[0]);
};

// Cập nhật một unit theo ID
export const PUT = async (req: NextRequest) => {
  const isAdmin = getIsAdmin();
  if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

  const body = await req.json();
  const { id, ...updateData } = body;

  if (!id) {
    return new NextResponse("Unit ID is required.", { status: 400 });
  }

  const updatedUnit = await db
    .update(units)
    .set(updateData)
    .where(eq(units.id, id))
    .returning();

  if (!updatedUnit.length) {
    return new NextResponse("Unit not found.", { status: 404 });
  }

  return NextResponse.json(updatedUnit[0]);
};

// Xóa một unit theo ID
export const DELETE = async (req: NextRequest) => {
  const isAdmin = getIsAdmin();
  if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return new NextResponse("Unit ID is required.", { status: 400 });
  }

  const deletedUnit = await db
    .delete(units)
    .where(eq(units.id, parseInt(id)))
    .returning();

  if (!deletedUnit.length) {
    return new NextResponse("Unit not found.", { status: 404 });
  }

  return NextResponse.json({ message: "Unit deleted successfully" });
};