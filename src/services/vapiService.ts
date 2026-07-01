import "dotenv/config";
export function buildAssistantConfig(
  session: { type: string },
  user: { name: string | null; role: string | null; experience: string | null },
  sessionId: string,
) {
  const name = user.name
    ? user.name.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
    : "Candidate";
  const role = user.role || "software engineer";

  let firstMessage = "";
  const type = session.type;

  if (type === "Behavioral") {
    firstMessage = `Hi ${name}, I'm Alex, your behavioral interviewer today. We'll explore how you've handled real situations in your past experience. Let's get started — tell me about yourself and the role you're targeting.`;
  } else if (type === "Technical") {
    firstMessage = `Hi ${name}, I'm Alex. Today we'll dive into your technical knowledge and problem-solving approach for a ${role} position. To start — walk me through how you typically approach debugging a production issue.`;
  } else if (type === "SystemDesign") {
    firstMessage = `Hi ${name}, I'm Alex. We'll be working through system design today — I want to understand how you think about architecture and tradeoffs. Let's begin — how would you design a URL shortener?`;
  } else {
    // Default to HR / Culture Fit
    firstMessage = `Hi ${name}, I'm Alex. Today is a culture and motivation conversation. There are no trick questions — I just want to understand what drives you. Start by telling me why you're looking for a new opportunity.`;
  }

  const appUrl = process.env.APP_URL || "http://localhost:3000";

  return {
    model: {
      provider: "custom-llm" as const,
      url: `${appUrl}/api/vapi/chat`,
      model: "custom-model",
      headers: {
        "bypass-tunnel-reminder": "true",
      },
    },
    voice: {
      provider: "11labs" as const,
      voiceId: "burt",
    },
    firstMessage,
    endCallFunctionEnabled: true,
    functions: [
      {
        name: "endCall",
        description:
          "End the interview call when the interviewer has concluded the session naturally.",
        parameters: {
          type: "object",
          properties: {},
        },
      },
    ],
    metadata: {
      sessionId,
    },
  };
}
