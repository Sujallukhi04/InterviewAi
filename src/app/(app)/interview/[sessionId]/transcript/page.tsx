import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, MessageSquare, Bot, User } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function TranscriptPage({ params }: PageProps) {
  const { sessionId } = await params;
  const userId = await getCurrentUser();
  if (!userId) {
    redirect("/login");
  }

  // Fetch the session to verify ownership
  const session = await prisma.interviewSession.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });

  if (!session || session.userId !== userId) {
    notFound();
  }

  // Fetch messages directly
  const messages = await prisma.message.findMany({
    where: { sessionId },
    orderBy: { createdAt: "asc" },
  });

  console.log("Transcript messages for session", sessionId, ":", messages);

  const formattedDate = session.startedAt.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const formattedType = session.type.replace(/([A-Z])/g, " $1").trim();

  return (
    <div className="min-h-screen bg-black text-zinc-50 p-4 md:p-8 flex flex-col justify-between">
      <div className="max-w-5xl w-full mx-auto space-y-6 flex-1 flex flex-col">
        {/* Navigation & Header */}
        <div className="flex flex-col space-y-3 border-b border-[#1A1A1A] pb-5 shrink-0">
          <Link
            href={`/interview/${sessionId}/report`}
            className="inline-flex items-center text-xs text-emerald-400 hover:text-emerald-300 font-semibold transition-colors w-fit"
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Back to Report
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center">
                <MessageSquare className="mr-2.5 h-5 w-5 text-emerald-400" />
                Interview Transcript
              </h1>
              <p className="text-[#888888] text-xs">
                {formattedType} &bull; {formattedDate}
              </p>
            </div>
            <Link
              href="/dashboard"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "border-[#1A1A1A] hover:bg-zinc-900 text-zinc-300 self-start md:self-center text-xs",
              )}
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Messages List Area */}
        <div className="flex-grow space-y-4 overflow-y-auto pr-1">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-3 bg-[#0A0A0A] border border-[#1A1A1A] rounded-xl">
              <MessageSquare className="h-8 w-8 text-zinc-600" />
              <p className="text-[#888888] text-sm">
                No transcript messages available for this session.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isInterviewer = msg.role === "interviewer";
              return (
                <div
                  key={msg.id}
                  className={cn(
                    "flex flex-col max-w-[85%] space-y-1.5",
                    isInterviewer ? "mr-auto items-start" : "ml-auto items-end",
                  )}
                >
                  <span
                    className={cn(
                      "text-[10px] font-bold tracking-wider uppercase",
                      isInterviewer ? "text-emerald-500/80" : "text-zinc-500",
                    )}
                  >
                    {isInterviewer ? "Interviewer" : "Candidate"}
                  </span>
                  <div className="flex items-start space-x-2">
                    {isInterviewer && (
                      <div className="h-7 w-7 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                        <Bot className="h-4 w-4 text-emerald-400" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "p-3 rounded-lg text-sm leading-relaxed break-words",
                        isInterviewer
                          ? "bg-[#0A0A0A] border border-[#1A1A1A] text-white rounded-tl-none"
                          : "bg-[rgba(0,255,135,0.06)] border border-[#00FF87]/15 text-white rounded-tr-none",
                      )}
                    >
                      {msg.content}
                    </div>
                    {!isInterviewer && (
                      <div className="h-7 w-7 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                        <User className="h-4 w-4 text-zinc-500" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
