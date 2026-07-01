import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getSessionById } from "@/services/sessionService";
import { getUserById } from "@/services/userService";
import { buildAssistantConfig } from "@/services/vapiService";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const userId = await getCurrentUser();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = await getSessionById(sessionId);
    if (!session || session.userId !== userId) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const assistantOverrides = buildAssistantConfig(session, user, sessionId);

    // Update session status to in_progress if not already set
    if (session.status !== "in_progress") {
      await prisma.interviewSession.update({
        where: { id: sessionId },
        data: { status: "in_progress" },
      });
    }

    return NextResponse.json({ assistantOverrides });
  } catch (error) {
    console.error("Start session error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
