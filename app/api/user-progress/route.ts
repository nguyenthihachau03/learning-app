import { auth } from "@clerk/nextjs/server";
import { getUserProgress } from "@/db/queries";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const progress = await getUserProgress();
  if (!progress) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ activeCourseId: progress.activeCourseId });
}
