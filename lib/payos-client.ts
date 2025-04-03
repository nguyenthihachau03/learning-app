import axios from "axios";

export async function getPaymentInfo(orderCode: string) {
  const response = await axios.get(
    `https://api-merchant.payos.vn/v2/payment-requests/${orderCode}`,
    {
      headers: {
        "x-client-id": process.env.PAYOS_CLIENT_ID!,
        "x-api-key": process.env.PAYOS_API_KEY!,
      },
    }
  );

  const data = response.data.data;

  if (!data || data.status !== "PAID") {
    throw new Error("Đơn chưa thanh toán hoặc không tồn tại");
  }

  const transactionDate = data.transactions?.[0]?.transactionDateTime;
  const paidAt = transactionDate
    ? new Date(transactionDate)
    : data.paidAt
    ? new Date(data.paidAt)
    : new Date(data.updatedAt || data.createdAt);

  return {
    amountPaid: data.amount,
    paidAt,
  };
}
