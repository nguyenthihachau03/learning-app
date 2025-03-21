import { redirect } from "next/navigation";
import { getIsAdmin } from "@/lib/admin";
import AppWrapper from "./AppWrapper"; // Import Client Component

const AdminPage = async () => {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) redirect("/");

  return (
    <div>
      <h1>Quản lý Admin</h1>
      <AppWrapper />
    </div>
  );
};

export default AdminPage;
