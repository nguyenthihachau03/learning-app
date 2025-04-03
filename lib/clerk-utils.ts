// lib/clerk-utils.ts
import { clerkClient } from "@clerk/clerk-sdk-node";

export async function getAuthUserList() {
  const users = await clerkClient.users.getUserList();
  return users;
}
