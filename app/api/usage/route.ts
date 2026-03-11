import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

const FREE_USES = 5;

export async function GET() {
  const { userId, has } = await auth();

  if (!userId) {
    return NextResponse.json({ count: 0, limit: FREE_USES, isPro: false, isAuthenticated: false });
  }

  if (has({ plan: "pro" })) {
    return NextResponse.json({ count: 0, limit: FREE_USES, isPro: true, isAuthenticated: true });
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const count = (user.privateMetadata?.paraphraseCount as number) ?? 0;

  return NextResponse.json({ count, limit: FREE_USES, isPro: false, isAuthenticated: true });
}
