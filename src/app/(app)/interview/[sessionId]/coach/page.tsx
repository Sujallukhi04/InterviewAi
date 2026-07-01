import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Award, Calendar, Bot } from "lucide-react";
import CoachChat from "@/components/coach/CoachChat";

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function StandaloneCoachPage({ params }: PageProps) {
  const { sessionId } = await params;
  const userId = await getCurrentUser();
  if (!userId) {
    redirect("/login");
  }

  // Fetch the session
  const session = await prisma.interviewSession.findUnique({
    where: { id: sessionId },
    include: { user: true, feedback: true },
  });

  if (!session || session.userId !== userId) {
    notFound();
  }

  // If no feedback exists yet, redirect back to report to trigger feedback generation
  if (!session.feedback) {
    redirect(`/interview/${sessionId}/report`);
  }

  const feedback = session.feedback;
  const scores = (feedback.scores || {}) as { overall?: number };
  const overallScore = scores.overall || 0;

  const formattedDate = session.endedAt
    ? new Date(session.endedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : new Date(session.startedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });

  const formattedType = session.type.replace(/([A-Z])/g, " $1").trim();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 p-4 md:p-8 flex flex-col justify-between">
      <div className="max-w-5xl w-full mx-auto flex-1 flex flex-col space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900 pb-5 shrink-0">
          <div className="space-y-2">
            <Link
              href={`/interview/${sessionId}/report`}
              className="inline-flex items-center text-xs text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
            >
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              Back to Report Card
            </Link>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-extrabold tracking-tight text-white capitalize flex items-center">
                <Bot className="mr-2 h-6 w-6 text-emerald-400" />
                AI Interview Coaching
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400">
                Active
              </span>
            </div>
            <p className="text-zinc-400 text-xs">
              Deep dive into your{" "}
              <span className="text-zinc-200 font-medium">{formattedType}</span>{" "}
              mock interview.
            </p>
          </div>

          {/* Quick Context Summary */}
          <div className="flex items-center space-x-6 bg-zinc-900/40 border border-zinc-900 px-4 py-2.5 rounded-xl self-start md:self-center">
            <div className="flex items-center space-x-2">
              <Award className="h-4.5 w-4.5 text-[#00FF87]" />
              <div className="flex flex-col">
                <span className="text-[10px] text-zinc-500 uppercase font-semibold">
                  Overall Score
                </span>
                <span className="text-xs text-white font-bold">
                  {overallScore}/10
                </span>
              </div>
            </div>
            <div className="h-6 w-px bg-zinc-800" />
            <div className="flex items-center space-x-2">
              <Calendar className="h-4.5 w-4.5 text-zinc-500" />
              <div className="flex flex-col">
                <span className="text-[10px] text-zinc-500 uppercase font-semibold">
                  Session Date
                </span>
                <span className="text-xs text-zinc-300 font-medium">
                  {formattedDate}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Large Coach Chat Container */}
        <div className="flex-1 flex flex-col min-h-[500px]">
          <CoachChat
            sessionId={sessionId}
            initialContext={{
              interviewType: session.type,
              overallScore: overallScore,
              candidateName: session.user.name,
            }}
            className="flex-1 h-[calc(100vh-280px)] md:h-[calc(100vh-240px)]"
          />
        </div>
      </div>  
    </div>
  );
}
