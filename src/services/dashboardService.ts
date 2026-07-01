import { prisma } from "@/lib/prisma";

export async function getUserSessions(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true },
  });

  const sessions = await prisma.interviewSession.findMany({
    where: { userId },
    orderBy: { startedAt: "desc" },
    include: {
      feedback: {
        select: {
          id: true,
          scores: true,
        },
      },
    },
  });

  return {
    userName: user?.name || "Candidate",
    sessions,
  };
}

export async function deleteSession(sessionId: string, userId: string): Promise<void> {
  // 1. Verify session belongs to the user
  const session = await prisma.interviewSession.findUnique({
    where: { id: sessionId },
    select: { userId: true },
  });

  if (!session) {
    throw new Error("Session not found");
  }

  if (session.userId !== userId) {
    throw new Error("Unauthorized: Session does not belong to this user");
  }

  // 2. Cascade delete Message, FeedbackReport, and InterviewSession
  await prisma.$transaction([
    prisma.message.deleteMany({
      where: { sessionId },
    }),
    prisma.feedbackReport.deleteMany({
      where: { sessionId },
    }),
    prisma.interviewSession.delete({
      where: { id: sessionId },
    }),
  ]);
}

export async function getProgressChartData(userId: string): Promise<Array<{
  sessionNumber: number;
  date: string;
  type: string;
  communication: number;
  depth: number;
  structure: number;
  confidence: number;
  overall: number;
}>> {
  const sessions = await prisma.interviewSession.findMany({
    where: {
      userId,
      status: "completed",
      feedback: {
        isNot: null,
      },
    },
    orderBy: {
      startedAt: "asc",
    },
    include: {
      feedback: {
        select: {
          scores: true,
        },
      },
    },
  });

  return sessions.map((session, index) => {
    const rawScores = (session.feedback?.scores as Record<string, unknown>) || {};
    
    const getNumScore = (val: unknown): number => {
      if (typeof val === "number") return val;
      if (typeof val === "string") {
        const num = parseFloat(val);
        return isNaN(num) ? 0 : num;
      }
      return 0;
    };

    return {
      sessionNumber: index + 1,
      date: new Date(session.startedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      type: session.type,
      communication: getNumScore(rawScores.communication),
      depth: getNumScore(rawScores.depth),
      structure: getNumScore(rawScores.structure),
      confidence: getNumScore(rawScores.confidence),
      overall: getNumScore(rawScores.overall),
    };
  });
}
