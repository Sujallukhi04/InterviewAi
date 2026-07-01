import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getSessionById } from "@/services/sessionService";
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

    const body = await request.json();
    const { role, content } = body as { role?: string; content?: string };

    if (!role || !content) {
      return NextResponse.json({ error: "Role and content are required" }, { status: 400 });
    }

    const validatedRole = role === "interviewer" || role === "candidate" ? role : "interviewer";

    await prisma.message.create({
      data: {
        sessionId,
        role: validatedRole,
        content: content.trim(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Save message route error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
