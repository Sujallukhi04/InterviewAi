import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getSessionById } from "@/services/sessionService";
import { generateFeedback } from "@/services/feedbackService";
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

    // Verify session status is "completed"
    if (session.status !== "completed") {
      return NextResponse.json({ error: "Session is not yet completed" }, { status: 400 });
    }

    const feedbackReport = await generateFeedback(sessionId);
    return NextResponse.json(feedbackReport);
  } catch (error) {
    console.error("Feedback generation POST error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(
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

    const feedbackReport = await prisma.feedbackReport.findUnique({
      where: { sessionId },
    });

    if (!feedbackReport) {
      return NextResponse.json({ error: "Feedback report not generated yet" }, { status: 404 });
    }

    return NextResponse.json(feedbackReport);
  } catch (error) {
    console.error("Feedback retrieval GET error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
