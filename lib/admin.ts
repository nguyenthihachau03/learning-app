import { auth } from "@clerk/nextjs/server";
  // const adminIdsString = process.env.CLERK_ADMIN_IDS || ""; // Đảm bảo không bị undefined
  // const adminIds = adminIdsString.split(", "); // Tách danh sách admin ID
  const adminIds = ["user_2s2F1FlejNirKZlvQOVrKvuh4Yq","user_2uYxZpO4TPhj6ixgPAtpoy5im7m","user_2uZqV69x3frmVxQf7QajqGNLSgZ"]; // Tách danh sách admin ID

export const getIsAdmin = async () => { // Đánh dấu hàm là async
  const { userId } = await auth(); // Bây giờ có thể sử dụng await
 console.log(userId);
  if (!userId) return false;

  return adminIds.includes(userId); // Dùng includes() thay vì indexOf() cho code rõ ràng hơn
};