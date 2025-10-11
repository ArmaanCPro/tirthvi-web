import {isAdmin} from "@/lib/auth";

import { db } from "@/lib/drizzle";
import { profiles, subscriptions} from "@/lib/drizzle";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function isPremium(clerkUserId: string): Promise<boolean> {
  try {

      if (await isAdmin(clerkUserId)) {
          return true;
      }

    // Step 1: Try local DB
      const user = await db.query.profiles.findFirst({
          where: eq(profiles.clerkId, clerkUserId),
          with: {
              subscription: true
          }
      });

      if (user?.subscription?.isPremium) {
          return true;
      }

      // Step 2: Fallback to Clerk Billing API
      const { has } = await auth();
      const hasPremium = has({ feature: "premium_access" }) || has({ plan: "premium" });

      // Step 3: Update DB cache for faster future lookups (if user exists)
      if (user) {
          await db
              .insert(subscriptions)
              .values({
                  userId: user.id,
                  plan: hasPremium ? "premium" : "free",
                  isPremium: hasPremium,
                  updatedAt: new Date(),
              })
              .onConflictDoUpdate({
                  target: subscriptions.userId,
                  set: {
                      plan: hasPremium ? "premium" : "free",
                      isPremium: hasPremium,
                      updatedAt: new Date(),
                  },
              });
      }

      return hasPremium;

  } catch {
    return false
  }
}
