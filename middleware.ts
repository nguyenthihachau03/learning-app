import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(['/pageadmin(.*)', "/api/webhooks"]);

export default clerkMiddleware(async (auth, req) => {
  const url = req.nextUrl.pathname;

  // 🚀 Bỏ qua Clerk Middleware cho tất cả API `/api/payos/*`
  if (url.startsWith('/api')) {
    return NextResponse.next(); // Cho phép request mà không cần auth
  }

  if (isProtectedRoute(req)) {
    await auth.protect((has) => {
      return has({ permission: 'org:admin:example1' }) || has({ permission: 'org:admin:example2' });
    });
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
