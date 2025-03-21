import { type NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { getIsAdmin } from "@/lib/admin"; // Kiểm tra quyền admin

// Lấy danh sách user
export const GET = async () => {
    const isAdmin = getIsAdmin();
    if (!isAdmin) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const users = await clerkClient.users.getUserList();
        const formattedUsers = users.map(user => {
            // ✅ Lấy email chính xác từ primaryEmailAddressId
            const primaryEmail = user.emailAddresses.find(
                (email) => email.id === user.primaryEmailAddressId
            )?.emailAddress || "Không có email";

            return {
                id: user.id,
                email: primaryEmail, // ✅ Đã sửa lỗi
                role: user.publicMetadata?.role || "user", // ✅ Đảm bảo có role mặc định
                fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim(), // ✅ Thay thế fullName
            };
        });

        return NextResponse.json(formattedUsers);
    } catch (error) {
        return new NextResponse("Error fetching users", { status: 500 });
    }
};

// Cập nhật quyền user
export const PUT = async (req: NextRequest) => {
    const isAdmin = getIsAdmin();
    if (!isAdmin) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const { userId, role } = await req.json();
        if (!userId || !role) return new NextResponse("Invalid data", { status: 400 });

        await clerkClient.users.updateUser(userId, { publicMetadata: { role } });
        return NextResponse.json({ message: "User role updated" });
    } catch (error) {
        return new NextResponse("Error updating user", { status: 500 });
    }
};

// Xóa user
export const DELETE = async (req: NextRequest) => {
    const isAdmin = getIsAdmin();
    if (!isAdmin) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("id");

        if (!userId) return new NextResponse("User ID required", { status: 400 });

        await clerkClient.users.deleteUser(userId);
        return NextResponse.json({ message: "User deleted successfully" });
    } catch (error) {
        return new NextResponse("Error deleting user", { status: 500 });
    }
};
