import { NextResponse } from "next/server";
import PayOS from "@payos/node";
import { absoluteUrl } from "@/lib/utils";

const payOS = new PayOS(
  process.env.PAYOS_CLIENT_ID!,
  process.env.PAYOS_API_KEY!,
  process.env.PAYOS_CHECKSUM_KEY!
);

export async function POST(req: Request) {
  try {
    const { orderCode, amount, description } = await req.json();

    const body = {
      orderCode,
      amount,
      description,
      items: [{ name: "Nâng cấp tài khoản VIP", quantity: 1, price: amount }],
      cancelUrl: absoluteUrl("/shop?payment=failed"),
      returnUrl: absoluteUrl(`/shop?payment=success&orderCode=${orderCode}`), // ✅ Luôn về đúng /shop
      embedded: false, // ❌ Không nhúng iframe
    };

    const response = await payOS.createPaymentLink(body);
    return NextResponse.json({ success: true, data: response });

  } catch (error: any) {
    console.error("Lỗi tạo link thanh toán:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
