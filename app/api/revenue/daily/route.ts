import { NextRequest, NextResponse } from "next/server";
import db from "@/db/drizzle";
import { userSubscriptionPayOS } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getPaymentInfo } from "@/lib/payos-client";

function formatDate(date: Date) {
  return date.toISOString().split("T")[0];
}

function generateDateRange(year: number, month: number) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0); // ngày cuối tháng
  const dates: string[] = [];

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(formatDate(new Date(d)));
  }

  return dates;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const month = url.searchParams.get("month") ?? "";
  const [year, monthNum] = month.split("-").map(Number);
  console.log(`[API] Bắt đầu xử lý yêu cầu cho tháng: ${month}`);

  const subs = await db.query.userSubscriptionPayOS.findMany({
    where: eq(userSubscriptionPayOS.status, "PAID"),
  });
  console.log(`[API] Tìm thấy ${subs.length} subscription có status PAID`);

  const dailyRevenue: Record<string, number> = {};

  for (const sub of subs) {
    try {
      const payLink = await getPaymentInfo(sub.orderCode);
      const paidDate = payLink.paidAt;
      console.log(`[API] Subscription ${sub.orderCode}: paidAt = ${paidDate}, amountPaid = ${payLink.amountPaid}`);

      if (
        paidDate.getFullYear() === year &&
        paidDate.getMonth() + 1 === monthNum
      ) {
        const day = formatDate(paidDate);
        dailyRevenue[day] = (dailyRevenue[day] || 0) + payLink.amountPaid;
        console.log(`[API] Cộng dồn doanh thu cho ngày ${day}: ${dailyRevenue[day]}`);
      }
    } catch (err) {
      console.error(`[API] Lỗi gọi PayOS cho orderCode ${sub.orderCode}:`, err);
    }
  }

  const allDates = generateDateRange(year, monthNum);
  const result = allDates.map((date) => ({
    date,
    revenue: dailyRevenue[date] || 0,
  }));

  console.log(`[API] Kết quả cuối cùng:`, result);
  return NextResponse.json(result);
}