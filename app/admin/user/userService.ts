// Định nghĩa kiểu dữ liệu User
export interface User {
    id: string;
    email: string; // ✅ Thêm email
    role: string; // ✅ Thêm role
    firstName?: string;
    lastName?: string;
}

// Gọi API lấy danh sách User
export async function getUsers(): Promise<User[]> {
    const res = await fetch("/api/users");
    if (!res.ok) throw new Error("Không thể lấy danh sách user");
    return res.json();
}


// Gọi API lấy chi tiết User
export async function getUserDetail(userId: string): Promise<User> {
    const res = await fetch(`/api/users/${userId}`);
    if (!res.ok) throw new Error("Không thể lấy thông tin user");

    const data = await res.json();

    return {
        id: data.id,
        email: data.email || "Không có email",
        role: data.role || "user",
        firstName: data.firstName,
        lastName: data.lastName,
    };
}

// Gọi API cập nhật quyền user
export async function updateUserRole(userId: string, role: string) {
    const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role }),
    });
    return res.json();
}

// Gọi API xóa user
export async function deleteUser(userId: string) {
    const res = await fetch(`/api/users?id=${userId}`, { method: "DELETE" });
    return res.json();
}
