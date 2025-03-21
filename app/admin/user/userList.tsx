"use client";

import { List, Datagrid, TextField, FunctionField } from "react-admin";
import { useRouter } from "next/navigation";
import { deleteUser, User } from "./userService";

export function UserList() {
  const router = useRouter();

  const handleEdit = (id: string) => {
    router.push(`/admin/user/${id}`);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa user này?")) {
      await deleteUser(id);
      alert("Đã xóa user");
    }
  };

  return (
    <List>
      <Datagrid rowClick="edit">
        <TextField source="id" label="ID" />
        <TextField source="fullName" label="Tên" />
        <TextField source="email" label="Email" />
        <TextField source="role" label="Vai trò" />

        {/* Sửa lại hiển thị nút Sửa/Xóa với khoảng cách */}
        <FunctionField
          label="Hành động"
          render={(record: User) => (
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                style={{ backgroundColor: "blue", color: "white", padding: "5px 10px", border: "none", cursor: "pointer" }}
                onClick={() => handleEdit(record.id)}
              >
                Sửa
              </button>
              <button
                style={{ backgroundColor: "red", color: "white", padding: "5px 10px", border: "none", cursor: "pointer" }}
                onClick={() => handleDelete(record.id)}
              >
                Xóa
              </button>
            </div>
          )}
        />
      </Datagrid>
    </List>
  );
}
