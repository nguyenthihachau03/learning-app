import type { NextConfig } from "next";

const withPWA = require('next-pwa')({
  dest: 'public', // Thư mục đích cho service worker
  register: true, // Tự động đăng ký SW (không cần code trong layout nữa)
  skipWaiting: true, // Kích hoạt SW mới ngay lập tức
  disable: process.env.NODE_ENV === 'development', // Tắt PWA khi dev
  // buildExcludes: [/middleware-manifest.json$/], // Bỏ comment nếu gặp lỗi build liên quan
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Các cấu hình Next.js khác của bạn
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true, // Bỏ qua ESLint khi build
  },
  async headers() {
    return [
      {
        source: "/api/(.*)", // Chỉ áp dụng cho API, không phải trang
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, PUT, DELETE, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
          {
            key: "Content-Range",
            value: "bytes: 0-9/*",
          },
        ],
      },
    ];
  },

  reactStrictMode: true,
};

module.exports = withPWA(nextConfig);