import { auth, currentUser } from "@clerk/nextjs/server";
import db from "@/db/drizzle";
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST() {
  const user = await currentUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  await db
    .insert(users)
    .values({
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress || '',
      name: user.firstName || user.username || 'User',
      image_url: user.imageUrl,
      role: 'user', // Mặc định là user
    })
    .onConflictDoUpdate({
      target: users.id,
      set: {
        email: user.emailAddresses[0]?.emailAddress,
        name: user.firstName || 'User',
        image_url: user.imageUrl
      },
    });

  return new Response('User synced', { status: 200 });
}
