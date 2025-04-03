import { NextResponse } from "next/server";
import db from "@/db/drizzle";

export async function GET() {
  const count = await db.query.courses.findMany();
  return NextResponse.json({ count: count.length });
}
