import { prisma } from "@/lib/prisma";

export async function createSession(userId: string, type: string) {
  return prisma.interviewSession.create({
    data: {
      userId,
      type,
      status: "in_progress",
    },
  });
}

export async function getSessionById(sessionId: string) {
  return prisma.interviewSession.findUnique({
    where: { id: sessionId },
  });
}

export async function getFailedSessions(userId: string) {
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
  return prisma.interviewSession.findMany({
    where: {
      userId,
      OR: [
        { status: "failed" },
        {
          status: "in_progress",
          startedAt: {
            lt: thirtyMinutesAgo,
          },
        },
      ],
    },
    orderBy: {
      startedAt: "desc",
    },
  });
}

export async function markSessionFailed(sessionId: string) {
  await prisma.interviewSession.update({
    where: { id: sessionId },
    data: { status: "failed" },
  });
}

export async function retrySession(sessionId: string, userId: string): Promise<string> {
  const session = await prisma.interviewSession.findUnique({
    where: { id: sessionId },
  });

  if (!session) {
    throw new Error("Session not found");
  }

  if (session.userId !== userId) {
    throw new Error("Unauthorized: Session does not belong to this user");
  }

  // Create new session of the same type
  const newSession = await prisma.interviewSession.create({
    data: {
      userId,
      type: session.type,
      status: "in_progress",
    },
  });

  // Mark the old one as failed
  await markSessionFailed(sessionId);

  return newSession.id;
}
