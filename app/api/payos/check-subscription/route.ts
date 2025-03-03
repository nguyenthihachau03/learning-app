// import { NextResponse } from "next/server";
// import db from "@/db/drizzle";
// import { userSubscriptionPayOS } from "@/db/schema";
// import { auth } from "@clerk/nextjs/server";
// import { eq, desc } from "drizzle-orm";

// export async function GET() {
//   try {
//     const { userId } = await auth();
//     if (!userId) return NextResponse.json({ isActive: false });

//     const subscription = await db.query.userSubscriptionPayOS.findFirst({
//       where: eq(userSubscriptionPayOS.userId, userId),
//       orderBy: desc(userSubscriptionPayOS.currentPeriodEnd),
//     });

//     return NextResponse.json({ isActive: subscription && subscription.currentPeriodEnd > new Date() });

//   } catch (error) {
//     console.error("Lỗi kiểm tra Subscription:", error);
//     return NextResponse.json({ isActive: false });
//   }
// }

import { NextResponse } from "next/server";
import db from "@/db/drizzle";
import { userSubscriptionPayOS } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, desc } from "drizzle-orm";

export async function OPTIONS() {
  const headers = new Headers();
  headers.append("Access-Control-Allow-Origin", "*");
  headers.append("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  headers.append("Access-Control-Allow-Headers", "Content-Type");

  return new Response(null, { headers });
}

export async function GET() {
  const headers = new Headers(); // ✅ Khai báo biến headers trong phạm vi hàm
  headers.append("Access-Control-Allow-Origin", "*");
  headers.append("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  headers.append("Access-Control-Allow-Headers", "Content-Type");

  try {
    const { userId } = await auth();
    if (!userId) return new Response(JSON.stringify({ isActive: false }), { headers });

    const subscription = await db.query.userSubscriptionPayOS.findFirst({
      where: eq(userSubscriptionPayOS.userId, userId),
      orderBy: desc(userSubscriptionPayOS.currentPeriodEnd),
    });

    return new Response(
      JSON.stringify({ isActive: !!subscription && subscription.currentPeriodEnd > new Date() }),
      { headers }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"; // ✅ Ép kiểu cho error
    console.error("Lỗi kiểm tra Subscription:", errorMessage);
    return new Response(JSON.stringify({ isActive: false, error: errorMessage }), { headers });
  }
}
