"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { getUserDetail, updateUserRole, deleteUser, User } from "../userService";

export default function UserDetail() {
    const router = useRouter();
    const { id } = router.query; // ✅ Lấy id từ URL
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState("");

    useEffect(() => {
        if (id) {
            getUserDetail(id as string).then((data) => {
                if (!data) {
                    alert("Không tìm thấy user!");
                    router.push("/admin/user"); // ✅ Quay về danh sách nếu không tìm thấy user
                    return;
                }
                setUser(data);
                setRole(data.role);
            });
        }
    }, [id]);

    const handleUpdateRole = async () => {
        await updateUserRole(id as string, role);
        alert("Cập nhật thành công!");
    };

    const handleDelete = async () => {
        if (confirm("Bạn có chắc muốn xóa user này?")) {
            await deleteUser(id as string);
            alert("Đã xóa user");
            router.push("/admin/user");
        }
    };

    if (!user) return <p>Loading...</p>; // ✅ Hiển thị "Loading" nếu chưa có dữ liệu

    return (
        <div>
            <h1>Chi tiết User</h1>
            <p><strong>ID:</strong> {user.id}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p>
                <strong>Vai trò:</strong>
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                </select>
            </p>
            <button onClick={handleUpdateRole}>Cập nhật vai trò</button>
            <button onClick={handleDelete}>Xóa User</button>
        </div>
    );
}
