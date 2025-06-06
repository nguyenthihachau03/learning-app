import { type NextRequest, NextResponse } from "next/server";

import db from "@/db/drizzle";
import {  challenges } from "@/db/schema";
import { getIsAdmin } from "@/lib/admin";
import { eq } from "drizzle-orm";

export const GET = async (
  _req: NextRequest,
  { params }: { params: Promise<{ challengeId: string }> }
) => {
  const resolvedParams = await params;
  const parsedId = Number(resolvedParams.challengeId);
  if (isNaN(parsedId)) {
    return new NextResponse("Invalid ID format.", { status: 400 });
  }

  const isAdmin = await getIsAdmin();
  if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });
  console.log("parsedId",parsedId);
  const data = await db.query.challenges.findFirst({
    where: eq(challenges.id, parsedId),
  });

  return NextResponse.json(data);
};
// export const GET = async (req: NextRequest) => {
//   const { searchParams } = new URL(req.url);
//   const challengeId = searchParams.get("challengeId");

//   if (!challengeId) {
//     return new NextResponse("Challenge ID is required.", { status: 400 });
//   }

//   const challenge = await db.query.challenges.findFirst({
//     where: eq(challenges.id, parseInt(challengeId)),
//     columns: {
//       id: true,
//       lessonId: true,
//       type: true,
//       question: true,
//       imageUrl: true,
//       audioUrl: true,
//       correctAnswer: true,
//       order: true,
//     },
//   });

//   if (!challenge) {
//     return new NextResponse("Challenge not found.", { status: 404 });
//   }

//   return NextResponse.json(challenge);
// };

export const POST = async (req: NextRequest) => {
  const isAdmin = getIsAdmin();
  if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

  const body = (await req.json()) as typeof challenges.$inferSelect;

  const data = await db
    .insert(challenges)
    .values({
      ...body,
    })
    .returning();

  return NextResponse.json(data[0]);
};
export const DELETE = async (
  _req: NextRequest,
  { params }: { params: Promise<{ challengeId: string }> } // ✅ Sửa kiểu params thành Promise
) => {
  const resolvedParams = await params;
  const parsedId = Number(resolvedParams.challengeId);
  if (isNaN(parsedId)) {
    return new NextResponse("Invalid ID format.", { status: 400 });
  }

  const isAdmin = await getIsAdmin();
  if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

  const data = await db
    .delete(challenges)
    .where(eq(challenges.id, parsedId))
    .returning();

  return NextResponse.json(data[0]);
};

export const PUT = async (req: NextRequest) => {
  const isAdmin = getIsAdmin();
  if (!isAdmin) return new NextResponse("Unauthorized.", { status: 401 });

  const body = await req.json();
  const { id, ...updateData } = body;

  if (!id) {
    return new NextResponse("Challenge ID is required.", { status: 400 });
  }

  const updatedChallenge = await db
    .update(challenges)
    .set(updateData)
    .where(eq(challenges.id, id))
    .returning();

  if (!updatedChallenge.length) {
    return new NextResponse("Challenge not found.", { status: 404 });
  }

  return NextResponse.json(updatedChallenge[0]);
};
