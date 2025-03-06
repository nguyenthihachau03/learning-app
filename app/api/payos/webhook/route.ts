import { createHmac } from "crypto";
import { NextResponse } from "next/server";
import db from "@/db/drizzle";
import { userSubscriptionPayOS } from "@/db/schema";
import { eq } from "drizzle-orm";

const CHECKSUM_KEY = process.env.PAYOS_CHECKSUM_KEY!; // 🔑 Lấy từ biến môi trường

// Hàm sắp xếp các key trong object theo thứ tự alphabet
function sortObjDataByKey(object: any) {
  return Object.keys(object)
    .sort()
    .reduce((obj: any, key: string) => {
      obj[key] = object[key];
      return obj;
    }, {});
}

// Hàm chuyển object thành query string
function convertObjToQueryStr(object: any) {
  return Object.keys(object)
    .filter((key) => object[key] !== undefined)
    .map((key) => {
      let value = object[key];

      // Nếu giá trị là một mảng, sắp xếp từng phần tử của mảng
      if (value && Array.isArray(value)) {
        value = JSON.stringify(value.map((val) => sortObjDataByKey(val)));
      }

      // Nếu giá trị là null hoặc undefined, thay bằng chuỗi rỗng
      if ([null, undefined, "undefined", "null"].includes(value)) {
        value = "";
      }

      return `${key}=${value}`;
    })
    .join("&");
}

// Hàm kiểm tra chữ ký webhook
function isValidSignature(data: any, receivedSignature: string): boolean {
  const sortedData = sortObjDataByKey(data); // Sắp xếp data theo thứ tự alphabet
  const queryStr = convertObjToQueryStr(sortedData); // Chuyển thành query string
  const computedSignature = createHmac("sha256", CHECKSUM_KEY) // Tạo chữ ký HMAC SHA-256
    .update(queryStr)
    .digest("hex");

  return computedSignature === receivedSignature; // So sánh chữ ký
}

// API xử lý webhook từ PayOS
export async function POST(req: Request) {
  try {
    const payload = await req.json();
    console.log("📌 Nhận webhook từ PayOS:", payload);

    const { code, desc, success, data, signature } = payload;

    // Kiểm tra chữ ký của webhook
    if (!isValidSignature(data, signature)) {
      console.error("❌ Chữ ký không hợp lệ!");
      return NextResponse.json({ success: false, error: "Invalid signature" }, { status: 400 });
    }

    console.log("✅ Chữ ký hợp lệ, tiếp tục xử lý...");

    const { orderCode, amount, description, paymentLinkId, code: status } = data;

    // Kiểm tra xem orderCode có trong DB không
    const existingSubscription = await db.query.userSubscriptionPayOS.findFirst({
      where: eq(userSubscriptionPayOS.orderCode, orderCode),
    });

    if (!existingSubscription) {
      console.error("❌ Không tìm thấy orderCode trong database!");
      return NextResponse.json({ success: false, error: "Order không tồn tại" }, { status: 400 });
    }

    const userId = existingSubscription.userId;
    console.log("✅ Đã tìm thấy orderCode trong DB, userId:", userId);

    if (status === "00") { // Trạng thái "00" nghĩa là đã thanh toán thành công
      console.log("🔄 Cập nhật subscription cho user:", userId);
      await db.update(userSubscriptionPayOS)
        .set({
          status: "PAID",
        })
        .where(eq(userSubscriptionPayOS.orderCode, orderCode));

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
