import { NextResponse } from "next/server";
import PayOS from "@payos/node";
import { absoluteUrl } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server"; // ✅ Lấy userId từ Clerk
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
    const { orderCode, amount, description } = await req.json();
    const { userId } = await auth(); // ✅ Lấy userId từ Clerk

    if (!userId) {
      console.error("❌ Lỗi: Không tìm thấy userId!");
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    console.log("📌 [API] Nhận request tạo thanh toán:", { userId, orderCode, amount, description });

    // ✅ Kiểm tra xem user đã có bản ghi subscription chưa
    const existingSubscription = await db.query.userSubscriptionPayOS.findFirst({
      where: eq(userSubscriptionPayOS.userId, userId),
    });

    if (existingSubscription) {
      console.log("🔄 User đã có subscription, cập nhật orderCode...");
      await db.update(userSubscriptionPayOS)
        .set({ orderCode, status: "PENDING" }) // ✅ Cập nhật trạng thái thanh toán
        .where(eq(userSubscriptionPayOS.userId, userId));
    } else {
      console.log("🆕 Tạo subscription mới...");
      await db.insert(userSubscriptionPayOS).values({
        userId,
        orderCode,
        status: "PENDING", // Chưa thanh toán
        priceId: "UNLIMITED_HEARTS",
        transactionId: null, // ✅ Để trống vì chưa có giao dịch
        currentPeriodEnd: null, // ✅ Để trống vì chưa có hạn sử dụng
      });
    }

    const body = {
      orderCode,
      amount,
      description,
      items: [{ name: "Nâng cấp tài khoản VIP", quantity: 1, price: amount }],
      cancelUrl: absoluteUrl("/shop"),
      returnUrl: absoluteUrl("/shop"),
      embedded: false, // Không dùng iframe
    };

    console.log("🚀 [API] Gửi request đến PayOS:", body);
    const response = await payOS.createPaymentLink(body);
    console.log("✅ [API] Phản hồi từ PayOS:", response);

    return NextResponse.json({ success: true, data: response });

  } catch (error: any) {
    console.error("❌ [API] Lỗi khi tạo link thanh toán:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
