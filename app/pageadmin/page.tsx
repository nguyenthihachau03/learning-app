// // "use client";
// import dynamic from "next/dynamic";
// import { redirect } from "next/navigation";

// import { getIsAdmin } from "@/lib/admin";
// import App from "../pageadmin/app";

// // Load App.tsx với dynamic import để tắt SSR
// // const AdminApp = dynamic(() => import("./app"), { ssr: false });

// const AdminPage = async () => {
//   const isAdmin = await getIsAdmin();

//   if (!isAdmin) redirect("/");

//   return <App/>;
//   // return <AdminApp />;
// };

// export default AdminPage;

//server component chỉ dùng logic server
import { redirect } from "next/navigation";
import { getIsAdmin } from "@/lib/admin";
import AppWrapper from "./AppWrapper"; // Import Client Component

const AdminPage = async () => {
  const isAdmin = await getIsAdmin();
  if (!isAdmin) redirect("/");

  return <AppWrapper />; // Chỉ render Client Component
};

export default AdminPage;
