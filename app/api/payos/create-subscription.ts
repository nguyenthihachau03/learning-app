import { NextResponse } from "next/server";
import PayOS from "@payos/node";
import { absoluteUrl } from "@/lib/utils";
import { auth, currentUser } from "@clerk/nextjs/server";
import db from "@/db/drizzle";
import { userSubscriptionPayOS } from "@/db/schema";
import { eq } from "drizzle-orm";

const payOS = new PayOS(
  process.env.PAYOS_CLIENT_ID!,
  process.env.PAYOS_API_KEY!,
  process.env.PAYOS_CHECKSUM_KEY!
);

export async function POST() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  // Kiểm tra nếu user đã có Subscription còn hiệu lực
  const existingSubscription = await db.query.userSubscriptionPayOS.findFirst({
    where: eq(userSubscriptionPayOS.userId, userId),
  });

  if (existingSubscription && existingSubscription.currentPeriodEnd && existingSubscription.currentPeriodEnd > new Date()) {
    return NextResponse.json({ success: false, error: "Bạn đã có gói Unlimited" });
}

  const body = {
    orderCode: Date.now(),
    amount: 2000,
    description: "Nâng cấp lên gói VIP (Unlimited Hearts)",
    items: [{ name: "Unlimited Hearts", quantity: 1, price: 2000 }],
    returnUrl: absoluteUrl("/shop"),
    cancelUrl: absoluteUrl("/shop"),
    embedded: true, // ✅ Bật chế độ nhúng
    metadata: { userId },
  };

  try {
    const response = await payOS.createPaymentLink(body);
    return NextResponse.json({ success: true, data: response.checkoutUrl });
  } catch (error: any) {
    console.error("Lỗi tạo link thanh toán:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
