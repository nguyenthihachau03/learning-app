// import { NextResponse } from "next/server";
// import PayOS from "@payos/node";
// import { absoluteUrl } from "@/lib/utils";

// const payOS = new PayOS(
//   process.env.PAYOS_CLIENT_ID!,
//   process.env.PAYOS_API_KEY!,
//   process.env.PAYOS_CHECKSUM_KEY!
// );

// export async function POST(req: Request) {
//   try {
//     const { orderCode, amount, description } = await req.json();

//     const body = {
//       orderCode,
//       amount,
//       description,
//       items: [{ name: "Nâng cấp tài khoản VIP", quantity: 1, price: amount }],
//       cancelUrl: absoluteUrl("/shop"),
//       returnUrl: absoluteUrl("/shop"),
//       embedded: false, // ❌ Không nhúng iframe
//     };

//     const response = await payOS.createPaymentLink(body);
//     return NextResponse.json({ success: true, data: response });

//   } catch (error: any) {
//     console.error("Lỗi tạo link thanh toán:", error);
//     return NextResponse.json({ success: false, error: error.message }, { status: 500 });
//   }
// }
import { NextResponse } from "next/server";
import PayOS from "@payos/node";
import { absoluteUrl } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server"; // ✅ Import auth để lấy userId

const payOS = new PayOS(
  process.env.PAYOS_CLIENT_ID!,
  process.env.PAYOS_API_KEY!,
  process.env.PAYOS_CHECKSUM_KEY!
);

export async function POST(req: Request) {
  try {
    const { orderCode, amount, description } = await req.json();
    const { userId } = await auth(); // ✅ Lấy userId từ session

    console.log("📌 [API] Nhận request tạo thanh toán:", { userId, orderCode, amount, description });

    if (!userId) {
      console.error("❌ Lỗi: Không tìm thấy userId!");
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!orderCode || !amount || !description) {
      console.error("❌ Lỗi: Thiếu dữ liệu đầu vào!");
      return NextResponse.json({ success: false, error: "Thiếu dữ liệu!" }, { status: 400 });
    }

    const body = {
      orderCode,
      amount,
      description,
      items: [{ name: "Nâng cấp tài khoản VIP", quantity: 1, price: amount }],
      cancelUrl: absoluteUrl("/shop"),
      returnUrl: absoluteUrl("/shop"),
      embedded: false, // Không dùng iframe
      metadata: { userId }, // ✅ Gửi userId trong metadata
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
