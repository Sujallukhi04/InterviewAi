import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getCoachResponse } from "@/services/coachService";

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

    const { message, chatHistory } = await request.json();

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json({ error: "Message is required and must be non-empty" }, { status: 400 });
    }

    if (!Array.isArray(chatHistory)) {
      return NextResponse.json({ error: "chatHistory must be an array" }, { status: 400 });
    }

    const responseText = await getCoachResponse(sessionId, userId, message, chatHistory);
    return NextResponse.json({ response: responseText });
  } catch (error) {
    console.error("Coach API error:", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Internal Server Error"
    }, { status: 500 });
  }
}
