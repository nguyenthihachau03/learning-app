import { NextResponse } from "next/server";
import { getAuthUserList } from "@/lib/clerk-utils";

export async function GET() {
  const users = await getAuthUserList();
  return NextResponse.json({ count: users.length });
}