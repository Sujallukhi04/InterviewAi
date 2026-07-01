"use server";

import { redirect } from "next/navigation";
import { profileSchema, ProfileInput } from "@/validators/profile";
import { updateUserProfile } from "@/services/userService";
import { getCurrentUser } from "@/lib/auth";

export async function updateProfileAction(data: ProfileInput): Promise<{ success: boolean; error?: string }> {
  const userId = await getCurrentUser();
  if (!userId) {
    redirect("/login");
  }

  try {
    const parsed = profileSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Invalid input" };
    }

    await updateUserProfile(userId, parsed.data);

    return { success: true };
  } catch (error) {
    console.error("Profile update error:", error);
    return { success: false, error: "An unexpected error occurred while updating your profile" };
  }
}
