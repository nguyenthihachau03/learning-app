import { NextResponse } from "next/server";
import db from "@/db/drizzle";
import { userSubscriptionPayOS } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
    try {
        const payload = await req.json();
        console.log("📌 Nhận webhook từ PayOS:", payload);

        const { orderCode, status, transactionId } = payload;

        // ✅ Kiểm tra `orderCode` trong DB
        const existingSubscription = await db.query.userSubscriptionPayOS.findFirst({
            where: eq(userSubscriptionPayOS.orderCode, orderCode),
        });

        if (!existingSubscription) {
            console.error("❌ Không tìm thấy orderCode trong database!");
            return NextResponse.json({ success: false, error: "Order không tồn tại" }, { status: 400 });
        }

        const userId = existingSubscription.userId; // ✅ Lấy userId từ DB

        if (status === "PAID") {
            const currentPeriodEnd = new Date();
            currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1); // ✅ Thêm 1 tháng

            console.log("🔄 Cập nhật subscription cho user:", userId);
            await db.update(userSubscriptionPayOS)
                .set({
                    status: "PAID",
                    currentPeriodEnd: currentPeriodEnd, // ✅ Cập nhật ngày hết hạn
                    transactionId: transactionId ?? "UNKNOWN", // ✅ Xử lý nếu `transactionId` bị `null`
                })
                .where(eq(userSubscriptionPayOS.userId, userId));

            console.log("✅ Subscription đã cập nhật thành công!");
            return NextResponse.json({ success: true });
        } else {
            console.warn("⚠️ Thanh toán không thành công, trạng thái:", status);
            return NextResponse.json({ success: false, error: "Thanh toán thất bại." });
        }
    } catch (error: any) {
        console.error("❌ Lỗi Webhook:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
