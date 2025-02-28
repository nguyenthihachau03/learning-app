"use client";

import { useEffect, useState } from "react";

type Props = {
  checkoutUrl: string;
  onClose: () => void; // Hàm callback để đóng giao diện
};

const EmbeddedPayment = ({ checkoutUrl, onClose }: Props) => {
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    if (!checkoutUrl) {
      setIsOpen(false);
    } else {
      // 🛠 Mở trang thanh toán trong tab mới thay vì nhúng iframe
      const paymentWindow = window.open(checkoutUrl, "_blank");
      if (!paymentWindow) {
        alert("⚠ Trình duyệt đã chặn cửa sổ popup. Hãy cho phép mở cửa sổ mới.");
      } else {
        setIsOpen(false);
      }
    }
  }, [checkoutUrl]);

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) onClose(); // Reset lại trạng thái checkout
    window.location.reload(); // Reload trang để cập nhật trạng thái Subscription
  };

  return isOpen ? (
    <div className="w-full max-w-lg mx-auto p-4 bg-white rounded-lg shadow-lg mt-4">
      <h2 className="text-center text-xl font-bold">Thanh toán</h2>
      <p className="text-center text-gray-600">
        Cửa sổ thanh toán đã được mở. Nếu bạn không thấy, hãy kiểm tra popup trình duyệt.
      </p>
      <button
        className="w-full mt-4 bg-red-500 text-white py-2 rounded"
        onClick={handleClose}
      >
        Đóng
      </button>
    </div>
  ) : null;
};

export default EmbeddedPayment;
