import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getSessionById } from "@/services/sessionService";
import VoiceSession from "@/components/interview/VoiceSession";

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function InterviewSessionPage({ params }: PageProps) {
  const { sessionId } = await params;
  const userId = await getCurrentUser();
  if (!userId) {
    redirect("/login");
  }

  const session = await getSessionById(sessionId);
  if (!session || session.userId !== userId) {
    notFound();
  }

  if (session.status === "completed") {
    redirect(`/interview/${sessionId}/report`);
  }

  const isExpired =
    session.status === "failed" ||
    (session.status === "in_progress" &&
      // eslint-disable-next-line react-hooks/purity
      new Date(session.startedAt).getTime() < Date.now() - 30 * 60 * 1000);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
      <VoiceSession
        sessionId={sessionId}
        sessionType={session.type}
        sessionStartedAt={session.startedAt}
        isExpired={isExpired}
      />
    </div>
  );
}
