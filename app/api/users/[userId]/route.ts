import { type NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { getIsAdmin } from "@/lib/admin";

// Lấy thông tin user theo ID
export const GET = async (_req: NextRequest, { params }: { params: Promise<{ userId: string }> }) => {
    const { userId } = await params; // ✅ Đợi params resolve trước khi sử dụng
    const isAdmin = getIsAdmin();
    if (!isAdmin) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const user = await clerkClient.users.getUser(userId);
        if (!user) return new NextResponse("User not found", { status: 404 });

        return NextResponse.json({
            id: user.id,
            email: user.emailAddresses.find(email => email.id === user.primaryEmailAddressId)?.emailAddress || "Không có email",
            role: user.publicMetadata?.role || "user",
            firstName: user.firstName || "",
            lastName: user.lastName || "",
        });
    } catch (error) {
        console.error("Error fetching user:", error);
        return new NextResponse("Error fetching user", { status: 500 });
    }
};
