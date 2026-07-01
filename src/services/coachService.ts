import { prisma } from "@/lib/prisma";
import { groq } from "@/lib/groq";

type ChatHistoryItem = {
  role: "user" | "assistant";
  content: string;
};

export async function getCoachResponse(
  sessionId: string,
  userId: string,
  userMessage: string,
  chatHistory: ChatHistoryItem[]
): Promise<string> {
  // 1. Fetch session with messages, user, and feedback
  const session = await prisma.interviewSession.findUnique({
    where: { id: sessionId },
    include: {
      user: true,
      messages: {
        orderBy: { createdAt: "asc" },
      },
      feedback: true,
    },
  });

  if (!session) {
    throw new Error("Session not found");
  }

  if (session.userId !== userId) {
    throw new Error("Unauthorized: Session does not belong to this user");
  }

  if (!session.feedback) {
    throw new Error("Feedback report not generated yet for this session");
  }

  const feedback = session.feedback;
  const scores = (feedback.scores || {}) as {
    communication?: number;
    depth?: number;
    structure?: number;
    confidence?: number;
    overall?: number;
  };

  // 2. Build transcript string
  const transcriptString = session.messages
    .map((msg) => `${msg.role === "interviewer" ? "Interviewer" : "Candidate"}: ${msg.content}`)
    .join("\n");

  // 3. Build system prompt
  const systemPrompt = `You are an expert interview coach reviewing a completed ${session.type} interview with ${session.user.name || "a candidate"} targeting a ${session.user.role || "software engineering"} role.

FULL INTERVIEW TRANSCRIPT:
${transcriptString}

FEEDBACK SCORES:
Overall: ${scores.overall || 0}/10
Communication: ${scores.communication || 0}/10
Depth: ${scores.depth || 0}/10
Structure: ${scores.structure || 0}/10
Confidence: ${scores.confidence || 0}/10

FEEDBACK SUMMARY:
${feedback.summary}

STRENGTHS:
${feedback.strengths}

AREAS FOR IMPROVEMENT:
${feedback.weaknesses}

Your job as coach:
- Answer the candidate's questions specifically based on THIS interview transcript and feedback above.
- Reference actual moments from the transcript when relevant (e.g. "When you were asked about conflict resolution, you said X — a stronger answer would have been Y").
- Be encouraging but honest. Don't sugarcoat weak areas.
- Keep responses concise — 3-5 sentences max per response.
- If asked what to practice, give 2-3 specific, actionable recommendations based on the weak areas in their feedback.
- Never make up things the candidate said — only reference what is in the transcript above.
- If the user asks something unrelated to the interview, redirect them: "I'm here to help you improve based on this specific session — what would you like to work on?"`;

  // 4. Call Groq
  const modelName = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
  const chatCompletion = await groq.chat.completions.create({
    model: modelName,
    messages: [
      { role: "system", content: systemPrompt },
      ...chatHistory,
      { role: "user", content: userMessage },
    ],
    max_tokens: 500,
    temperature: 0.6,
  });

  return chatCompletion.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";
}
