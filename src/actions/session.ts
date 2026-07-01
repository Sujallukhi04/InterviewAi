"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSessionSchema, CreateSessionInput } from "@/validators/session";
import { createSession, retrySession, markSessionFailed } from "@/services/sessionService";
import { deleteSession } from "@/services/dashboardService";
import { getCurrentUser } from "@/lib/auth";

export async function deleteSessionAction(
  sessionId: string
): Promise<{ success: boolean; error?: string }> {
  const userId = await getCurrentUser();
  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await deleteSession(sessionId, userId);
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Delete session server action error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred while deleting the session",
    };
  }
}

export async function createSessionAction(data: CreateSessionInput): Promise<{ success: boolean; sessionId?: string; error?: string }> {
  const userId = await getCurrentUser();
  if (!userId) {
    redirect("/login");
  }

  try {
    const parsed = createSessionSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Invalid input" };
    }

    const session = await createSession(userId, parsed.data.type);

    return { success: true, sessionId: session.id };
  } catch (error) {
    console.error("Session creation error:", error);
    return { success: false, error: "An unexpected error occurred while creating the session" };
  }
}

export async function retrySessionAction(sessionId: string): Promise<{ success: boolean; newSessionId?: string; error?: string }> {
  const userId = await getCurrentUser();
  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const newSessionId = await retrySession(sessionId, userId);
    revalidatePath("/dashboard");
    return { success: true, newSessionId };
  } catch (error) {
    console.error("Retry session server action error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred while retrying the session",
    };
  }
}

export async function markSessionFailedAction(sessionId: string): Promise<{ success: boolean; error?: string }> {
  const userId = await getCurrentUser();
  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await markSessionFailed(sessionId);
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Mark session failed action error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}
