import { isAdmin } from "@/lib/auth";
import { db } from "@/lib/drizzle";
import { profiles } from "@/lib/drizzle";
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

export async function getSubscriptionStatus(userId: string): Promise<{
  isPremium: boolean;
  plan: string;
  currentPeriodEnd: Date | null;
  stripeCustomerId: string | null;
}> {
  try {
    const user = await db.query.profiles.findFirst({
      where: eq(profiles.id, userId),
      with: {
        subscription: true
      }
    });

    if (!user) {
      return {
        isPremium: false,
        plan: 'free',
        currentPeriodEnd: null,
        stripeCustomerId: null,
      };
    }

    const isAdminUser = await isAdmin(userId);
    const subscription = user.subscription;

    return {
      isPremium: isAdminUser || (subscription?.isPremium && 
        subscription.currentPeriodEnd && 
        new Date() < new Date(subscription.currentPeriodEnd)) || false,
      plan: isAdminUser ? 'admin' : (subscription?.plan || 'free'),
      currentPeriodEnd: subscription?.currentPeriodEnd || null,
      stripeCustomerId: user.stripeCustomerId,
    };
  } catch {
    return {
      isPremium: false,
      plan: 'free',
      currentPeriodEnd: null,
      stripeCustomerId: null,
    };
  }
}
