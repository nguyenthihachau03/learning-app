//Hủy link thanh toán.

import { NextResponse } from "next/server";
import PayOS from "@payos/node";

const payOS = new PayOS(
    process.env.PAYOS_CLIENT_ID!,
    process.env.PAYOS_API_KEY!,
    process.env.PAYOS_CHECKSUM_KEY!
  );

export async function POST(req: Request) {
  try {
    const { orderId, reason } = await req.json();

    if (!orderId) return NextResponse.json({ success: false, error: "Thiếu orderId" }, { status: 400 });

    const response = await payOS.cancelPaymentLink(orderId, reason || "Khách hàng hủy đơn hàng");

    return NextResponse.json({ success: true, data: response });
  } catch (error: any) {
    console.error("Lỗi hủy thanh toán:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
