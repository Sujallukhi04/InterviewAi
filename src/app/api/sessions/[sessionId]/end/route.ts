import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getSessionById } from "@/services/sessionService";
import { prisma } from "@/lib/prisma";

interface TranscriptMessage {
  role: "interviewer" | "candidate" | string;
  content: string;
}

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
    console.log("End session route body received:", body);
    const { transcript } = body as { transcript?: TranscriptMessage[] };

    // Update session status to completed and set endedAt to now
    await prisma.interviewSession.update({
      where: { id: sessionId },
      data: {
        status: "completed",
        endedAt: new Date(),
      },
    });

    // Bulk insert messages if transcript is provided and has items
    if (transcript && Array.isArray(transcript) && transcript.length > 0) {
      const messagesData = transcript.map((msg) => ({
        sessionId,
        role: msg.role === "interviewer" || msg.role === "candidate" ? msg.role : "interviewer",
        content: msg.content,
      }));

      // Delete existing messages to avoid duplicates, and save the complete ordered transcript
      await prisma.message.deleteMany({
        where: { sessionId },
      });

      await prisma.message.createMany({
        data: messagesData,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("End session error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
