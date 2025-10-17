import { isAdmin } from "@/lib/auth";
import { db } from "@/lib/drizzle";
import { profiles, subscriptions } from "@/lib/drizzle";
import { eq } from "drizzle-orm";

export async function isPremium(userId: string): Promise<boolean> {
  try {
    if (await isAdmin(userId)) {
      return true;
    }

    // Check local DB for subscription status
    const user = await db.query.profiles.findFirst({
      where: eq(profiles.id, userId),
      with: {
        subscription: true
      }
    });

    if (user?.subscription?.isPremium) {
      // Check if subscription is still active
      if (user.subscription.currentPeriodEnd && new Date() < new Date(user.subscription.currentPeriodEnd)) {
        return true;
      }
    }

    return false;
  } catch {
    return false;
  }
}
