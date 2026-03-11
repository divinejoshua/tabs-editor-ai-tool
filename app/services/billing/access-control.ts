import "server-only";
import { auth, clerkClient } from "@clerk/nextjs/server";

const FREE_USES = 5;

export async function checkUsageAndAccess(): Promise<{
  canAccess: boolean;
  requiresUpgrade: boolean;
  usageCount: number;
  isAuthenticated: boolean;
}> {
  const { userId, has } = await auth();

  if (!userId) {
    return { canAccess: false, requiresUpgrade: false, usageCount: 0, isAuthenticated: false };
  }

  // Pro users have unlimited access
  if (has({ plan: "pro" })) {
    return { canAccess: true, requiresUpgrade: false, usageCount: 0, isAuthenticated: true };
  }

  // Check free usage count stored in Clerk private metadata
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const usageCount = (user.privateMetadata?.paraphraseCount as number) ?? 0;

  if (usageCount >= FREE_USES) {
    return { canAccess: false, requiresUpgrade: true, usageCount, isAuthenticated: true };
  }

  // Increment count before allowing access
  await client.users.updateUserMetadata(userId, {
    privateMetadata: { paraphraseCount: usageCount + 1 },
  });

  return { canAccess: true, requiresUpgrade: false, usageCount: usageCount + 1, isAuthenticated: true };
}

export async function getUserUsageCount(): Promise<number> {
  const { userId, has } = await auth();
  if (!userId) return 0;
  if (has({ plan: "pro" })) return -1; // -1 signals unlimited

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  return (user.privateMetadata?.paraphraseCount as number) ?? 0;
}
