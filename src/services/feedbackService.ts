import { prisma } from "@/lib/prisma";
import { FeedbackReport } from "@/lib/generated/prisma/client";
import { groq } from "@/lib/groq";

interface FeedbackPayload {
  summary: string;
  strengths: string;
  weaknesses: string;
  scores: {
    communication: number;
    depth: number;
    structure: number;
    confidence: number;
    overall: number;
  };
}

function parseAndCleanJson(text: string): FeedbackPayload {
  let cleaned = text.trim();
  // Strip markdown fences if present
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(json)?/i, "");
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.replace(/```$/i, "");
  }
  cleaned = cleaned.trim();
  return JSON.parse(cleaned) as FeedbackPayload;
}

export async function generateFeedback(sessionId: string): Promise<FeedbackReport> {
  // 1. Fetch the full session with all messages and user details
  const session = await prisma.interviewSession.findUnique({
    where: { id: sessionId },
    include: {
      user: true,
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!session) {
    throw new Error(`Interview session not found: ${sessionId}`);
  }

  // 2. If a FeedbackReport already exists, return it immediately
  const existingReport = await prisma.feedbackReport.findUnique({
    where: { sessionId },
  });
  if (existingReport) {
    return existingReport;
  }

  // 3. Build a transcript string from messages
  const transcriptString = session.messages
    .map((msg) => `${msg.role === "interviewer" ? "Interviewer" : "Candidate"}: ${msg.content}`)
    .join("\n");

  const modelName = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

  // 4. Build prompt and invoke Groq
  const systemPrompt = `You are evaluating a ${session.type} interview between an AI interviewer and ${
    session.user.name || "a candidate"
  } targeting a ${session.user.role || "software engineering"} role at ${
    session.user.experience || "mid"
  } level.

Here is the full interview transcript:
${transcriptString}

Based on this transcript, provide a structured evaluation.
Respond ONLY with a valid JSON object in exactly this shape — no markdown, no code fences, no explanation, just raw JSON:
{
  "summary": "2-3 sentence overall summary of performance",
  "strengths": "2-4 specific strengths with examples from the transcript",
  "weaknesses": "2-4 specific areas for improvement with examples from the transcript",
  "scores": {
    "communication": <1-10>,
    "depth": <1-10>,
    "structure": <1-10>,
    "confidence": <1-10>,
    "overall": <1-10>
  }
}

Be specific and reference actual things the candidate said.
Do not give generic feedback that could apply to any interview.`;

  let responseText = "";
  try {
    const completion = await groq.chat.completions.create({
      model: modelName,
      messages: [{ role: "user", content: systemPrompt }],
      max_tokens: 1000,
      temperature: 0.3,
    });
    responseText = completion.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("Groq feedback generation error:", error);
    throw new Error("Failed to contact Groq API for feedback generation.");
  }

  // 5. Strip any markdown fences before parsing, retry once if it fails
  let parsedFeedback: FeedbackPayload;
  try {
    parsedFeedback = parseAndCleanJson(responseText);
  } catch (error) {
    console.warn("First JSON parse attempt failed. Retrying with a stricter prompt...", error);
    try {
      const completionRetry = await groq.chat.completions.create({
        model: modelName,
        messages: [
          { role: "user", content: systemPrompt },
          { role: "assistant", content: responseText },
          {
            role: "user",
            content: "Return ONLY raw JSON, no markdown, no backticks, nothing else. Your previous response could not be parsed.",
          },
        ],
        max_tokens: 1000,
        temperature: 0.1,
      });
      const retryText = completionRetry.choices[0]?.message?.content || "";
      parsedFeedback = parseAndCleanJson(retryText);
    } catch (retryError) {
      console.error("Stricter prompt retry failed:", retryError);
      throw new Error("Failed to parse LLM evaluation JSON response after retry.");
    }
  }

  // 6. Save as a FeedbackReport row and return it
  try {
    return await prisma.feedbackReport.create({
      data: {
        sessionId,
        summary: parsedFeedback.summary || "",
        strengths: parsedFeedback.strengths || "",
        weaknesses: parsedFeedback.weaknesses || "",
        scores: parsedFeedback.scores || {},
      },
    });
  } catch (err) {
    const prismaError = err as { code?: string };
    if (prismaError.code === "P2002") {
      const existing = await prisma.feedbackReport.findUnique({
        where: { sessionId },
      });
      if (existing) return existing;
    }
    throw err;
  }
}
