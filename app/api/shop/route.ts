import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "";
  const orderCode = searchParams.get("orderCode") || "";

  return NextResponse.json({ status, orderCode });
}
