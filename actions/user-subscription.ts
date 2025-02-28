"use server";

import { auth } from "@clerk/nextjs/server";
import { eq, desc } from "drizzle-orm";
import db from "@/db/drizzle";
import { userSubscriptionPayOS } from "@/db/schema";

export const getUserSubscriptionPayOS = async () => {
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

        // Nếu không có subscription
        if (!subscription) {
            return { isActive: false };
        }

        // Kiểm tra hạn subscription
        const isActive = subscription.currentPeriodEnd > new Date();

        return {
            isActive,
            currentPeriodEnd: subscription.currentPeriodEnd,
        };

    } catch (error: any) {
        return { isActive: false, error: error.message };
    }
};
