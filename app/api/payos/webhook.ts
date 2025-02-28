import { NextResponse } from "next/server";
import PayOS from "@payos/node";
import db from "@/db/drizzle";
import { userSubscriptionPayOS } from "@/db/schema";
import { eq } from "drizzle-orm";

const payOS = new PayOS(
  process.env.PAYOS_CLIENT_ID!,
  process.env.PAYOS_API_KEY!,
  process.env.PAYOS_CHECKSUM_KEY!
);

export async function POST(req: Request) {
  try {
    const webhookData = await req.json();
    console.log("🔗 Webhook nhận được:", webhookData); // 🚀 Log toàn bộ dữ liệu nhận được

    if (!payOS.verifyPaymentWebhookData(webhookData)) {
      console.error("❌ Webhook không hợp lệ:", webhookData);
      return NextResponse.json({ success: false, error: "Webhook không hợp lệ" }, { status: 400 });
    }

    const { orderCode, transactionId, metadata, status } = webhookData.data;

    if (!metadata?.userId || !transactionId) {
      console.error("❌ Thiếu `userId` hoặc `transactionId` trong Webhook:", webhookData);
      return NextResponse.json({ success: false, error: "Thiếu thông tin bắt buộc" }, { status: 400 });
    }

    const userId = metadata.userId;

    if (status !== "PAID") {
      console.warn("⚠️ Thanh toán chưa hoàn tất. Trạng thái:", status);
      return NextResponse.json({ success: false, error: "Thanh toán chưa hoàn tất" }, { status: 400 });
    }

    const existingSubscription = await db.query.userSubscriptionPayOS.findFirst({
      where: eq(userSubscriptionPayOS.userId, userId),
    });

    if (existingSubscription) {
      console.log("🔄 Cập nhật Subscription cho user:", userId);
      await db.update(userSubscriptionPayOS)
        .set({ currentPeriodEnd: new Date(new Date().setMonth(new Date().getMonth() + 1)) })
        .where(eq(userSubscriptionPayOS.userId, userId));
    } else {
      console.log("✅ Tạo mới Subscription cho user:", userId);
      await db.insert(userSubscriptionPayOS).values({
        userId,
        transactionId,
        orderCode,
        priceId: "UNLIMITED_HEARTS",
        currentPeriodEnd: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      });
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("❌ Lỗi Webhook:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
