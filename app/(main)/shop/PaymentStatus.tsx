"use client";

import { useSearchParams } from "next/navigation";

const PaymentStatus = () => {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const orderCode = searchParams.get("orderCode");

  return (
    <div>
      {status === "PAID" && (
        <div className="bg-green-100 text-green-700 px-4 py-2 rounded-md w-full text-center">
          ✅ Thanh toán thành công! Mã đơn hàng: {orderCode}
        </div>
      )}
      {status === "CANCELLED" && (
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded-md w-full text-center">
          ❌ Thanh toán thất bại hoặc bị hủy!
        </div>
      )}
    </div>
  );
};

export default PaymentStatus;
