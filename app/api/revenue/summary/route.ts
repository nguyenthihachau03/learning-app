import { NextRequest, NextResponse } from "next/server";
import db from "@/db/drizzle";
import { userSubscriptionPayOS } from "@/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  if (!start || !end) {
    return NextResponse.json({ error: "Missing date range" }, { status: 400 });
  }

  const subs = await db.query.userSubscriptionPayOS.findMany({
    where: and(
      eq(userSubscriptionPayOS.status, "PAID"),
      gte(userSubscriptionPayOS.currentPeriodEnd, new Date(start)),
      lte(userSubscriptionPayOS.currentPeriodEnd, new Date(end))
    )
  });

  const total = subs.length;
  const revenue = subs.reduce((acc, curr) => acc + 2000, 0); // Hoặc lấy từ amount nếu có

  return NextResponse.json({ totalOrders: total, totalRevenue: revenue });
}
