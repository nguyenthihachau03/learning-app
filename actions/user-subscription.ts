"use server";

import { auth } from "@clerk/nextjs/server";
import db from "@/db/drizzle";
import { userSubscriptionPayOS } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache"; // ✅ Import

// ✅ Hàm kiểm tra trạng thái subscription
export async function getUserSubscriptionPayOS() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return { isActive: false, error: "Unauthorized" };
        }

        // Lấy thông tin subscription mới nhất
        const subscription = await db.query.userSubscriptionPayOS.findFirst({
            where: eq(userSubscriptionPayOS.userId, userId),
            orderBy: desc(userSubscriptionPayOS.currentPeriodEnd),
        });

        if (!subscription || !subscription.currentPeriodEnd) { // ✅ Kiểm tra null trước
            return { isActive: false };
        }

        // Kiểm tra subscription còn hạn không
        const isActive = subscription.currentPeriodEnd > new Date();

        return {
            isActive,
            currentPeriodEnd: subscription.currentPeriodEnd,
        };
    } catch (error: any) {
        return { isActive: false, error: error.message };
    }
}

// ✅ Hàm cập nhật subscription sau khi thanh toán
export async function checkAndUpdateSubscription(orderCode: string) {
    try {
        // 🔍 Gọi API PayOS để lấy trạng thái thanh toán
        const response = await fetch(`https://api.payos.vn/v2/payment/status?orderCode=${orderCode}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "x-client-id": process.env.PAYOS_CLIENT_ID!,
                "x-api-key": process.env.PAYOS_API_KEY!,
            },
        });

        const paymentStatus = await response.json();
        console.log("🔍 Kết quả từ PayOS:", paymentStatus);

        if (!paymentStatus || paymentStatus.data.status !== "PAID") {
            console.warn("⚠️ Thanh toán chưa hoàn tất:", paymentStatus);
            return { success: false, error: "Thanh toán chưa hoàn tất." };
        }

        const transactionId = paymentStatus.data.transactionId;
        const userId = paymentStatus.data.metadata?.userId;

        if (!userId) {
            console.error("❌ Lỗi: Không tìm thấy userId trong metadata");
            return { success: false, error: "Thiếu thông tin userId!" };
        }

        console.log("✅ Thanh toán thành công! User:", userId, "Transaction ID:", transactionId);

        // 📌 Xác định thời gian hết hạn subscription
        const currentPeriodEnd = new Date();
        currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1); // Gia hạn 1 tháng

        // 🛠 Kiểm tra nếu subscription đã tồn tại
        const existingSubscription = await db.query.userSubscriptionPayOS.findFirst({
            where: eq(userSubscriptionPayOS.userId, userId),
        });

        if (existingSubscription) {
            console.log("🔄 Cập nhật subscription cho user:", userId);
            await db.update(userSubscriptionPayOS)
                .set({
                    status: "PAID",
                    currentPeriodEnd,
                    transactionId
                })
                .where(eq(userSubscriptionPayOS.userId, userId));
        } else {
            console.log("🆕 Thêm subscription mới vào DB:", { userId, orderCode, transactionId });
            await db.insert(userSubscriptionPayOS).values({
                userId,
                orderCode,
                transactionId,
                priceId: "UNLIMITED_HEARTS",
                status: "PAID",
                currentPeriodEnd,
            });
        }

        // ✅ Revalidate để cập nhật UI
        revalidatePath("/shop");
        revalidatePath("/learn");
        revalidatePath("/quests");
        revalidatePath("/leaderboard");

        return { success: true };
    } catch (error: any) {
        console.error("❌ Lỗi khi cập nhật subscription:", error);
        return { success: false, error: error.message };
    }
}
