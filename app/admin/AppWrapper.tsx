"use client";
import dynamic from "next/dynamic";
import { Suspense } from "react";

// Dùng dynamic import để tắt SSR
const AdminApp = dynamic(() => import("./app"), { ssr: false });
const AppWrapper = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminApp />
    </Suspense>
  );
};

export default AppWrapper;