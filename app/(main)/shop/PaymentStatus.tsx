"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { checkStatus } from "@/actions/user-subscription"; // ✅ Import hàm checkStatus

const PaymentStatus = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const status = searchParams.get("status");
  const orderCode = searchParams.get("orderCode");

  const [hasChecked, setHasChecked] = useState(false); // ✅ Tránh gọi lại nhiều lần

  useEffect(() => {
    if (status && orderCode && !hasChecked) {
      setHasChecked(true); // ✅ Đánh dấu đã kiểm tra
      onCheckStatus(orderCode, status);
    }
  }, [status, orderCode, hasChecked]); // ✅ Chỉ chạy một lần

  const onCheckStatus = async (orderCode: string, status: string) => {
    const res = await checkStatus(orderCode, status);

    if (res.success) {
      toast.success("Cập nhật trạng thái thành công!");
      router.replace("/shop"); // ✅ Xóa query params mà không reload trang
    } else {
      toast.error("Không thể cập nhật trạng thái.");
    }
  };

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
