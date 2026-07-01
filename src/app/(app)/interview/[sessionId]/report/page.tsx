import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateFeedback } from "@/services/feedbackService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  Award,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  FileText,
  User,
  Calendar,
} from "lucide-react";
import CoachChat from "@/components/coach/CoachChat";

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function ReportPage({ params }: PageProps) {
  const { sessionId } = await params;
  const userId = await getCurrentUser();
  if (!userId) {
    redirect("/login");
  }

  // Fetch the session
  const session = await prisma.interviewSession.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });

  if (!session || session.userId !== userId) {
    notFound();
  }

  // Redirect back to the interview page if session status is not completed
  if (session.status !== "completed") {
    redirect(`/interview/${sessionId}`);
  }

  // Calculate session number among all completed sessions (ordered by startedAt ascending)
  const completedSessions = await prisma.interviewSession.findMany({
    where: {
      userId,
      status: "completed",
    },
    orderBy: {
      startedAt: "asc",
    },
    select: { id: true },
  });

  const sessionIndex = completedSessions.findIndex((s) => s.id === sessionId);
  const sessionNumber = sessionIndex !== -1 ? sessionIndex + 1 : 1;

  // Fetch or generate the feedback report
  let report = await prisma.feedbackReport.findUnique({
    where: { sessionId },
  });

  if (!report) {
    try {
      report = await generateFeedback(sessionId);
    } catch (err) {
      console.error("Failed to generate feedback on-the-fly:", err);
      throw err;
    }
  }

  // Exclude null type for TypeScript safety below this check
  if (!report) {
    notFound();
  }

  // Safe cast for scores JSON
  const scores = (report.scores || {}) as {
    communication?: number;
    depth?: number;
    structure?: number;
    confidence?: number;
    overall?: number;
  };

  const overallScore = scores.overall || 0;

  const formattedDate = session.endedAt
    ? new Date(session.endedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });

  const scoreMetrics = [
    {
      label: "Communication",
      value: scores.communication || 0,
      desc: "Clarity, pacing, and verbal articulation",
    },
    {
      label: "Technical Depth",
      value: scores.depth || 0,
      desc: "Knowledge precision and details provided",
    },
    {
      label: "Structure",
      value: scores.structure || 0,
      desc: "Logical organization of ideas (e.g. STAR method)",
    },
    {
      label: "Confidence",
      value: scores.confidence || 0,
      desc: "Tone assurance and composure under pressure",
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 p-4 md:p-8 flex flex-col justify-between">
      <div className="max-w-5xl w-full mx-auto space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-zinc-400 text-sm">
              <User className="h-4 w-4" />
              <span>{session.user.name || "Candidate"}</span>
              <span>•</span>
              <Calendar className="h-4 w-4" />
              <span>{formattedDate}</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white capitalize">
              {session.type.replace(/([A-Z])/g, " $1").trim()} Interview Report
            </h1>
            <p className="text-zinc-400 text-sm">
              Target role:{" "}
              <span className="text-zinc-200 font-medium">
                {session.user.role || "Software Engineer"}
              </span>{" "}
              ({session.user.experience || "mid"} level)
            </p>
          </div>

          {/* Action Links */}
          <div className="flex items-center space-x-3">
            <Link
              href="/dashboard"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "border-zinc-800 hover:bg-zinc-900 text-zinc-300 flex items-center",
              )}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>

            <Link
              href="/interview/new"
              className={cn(
                buttonVariants({ variant: "default" }),
                "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/10 flex items-center",
              )}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Practice Again
            </Link>
          </div>
        </div>

        {/* Dashboard Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Overall Score & Breakdown */}
          <div className="lg:col-span-1 space-y-6">
            {/* Overall Card */}
            <Card className="bg-zinc-900/60 border-zinc-800 backdrop-blur-md relative overflow-hidden">
              <div className="absolute top-0 right-0 h-24 w-24 bg-emerald-500/10 rounded-full blur-2xl" />
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-zinc-400 text-sm font-semibold uppercase tracking-wider">
                  Overall Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-6 text-center">
                <div className="relative flex items-center justify-center h-36 w-36 rounded-full border-4 border-emerald-500/20 shadow-inner">
                  <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-pulse" />
                  <div className="text-center">
                    <span className="text-5xl font-black text-white">
                      {overallScore}
                    </span>
                    <span className="text-zinc-500 text-xl"> / 10</span>
                  </div>
                </div>
                <div className="mt-4 flex items-center space-x-2 text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full text-xs font-semibold">
                  <Award className="h-4 w-4" />
                  <span>Evaluation Completed</span>
                </div>
              </CardContent>
            </Card>

            {/* Score Breakdown Card */}
            <Card className="bg-zinc-900/60 border-zinc-800 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <TrendingUp className="h-5 w-5 text-emerald-400" />
                  <span>Skill Metrics</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {scoreMetrics.map((metric) => (
                  <div key={metric.label} className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium text-zinc-200">
                        {metric.label}
                      </span>
                      <span className="font-bold text-zinc-50">
                        {metric.value} / 10
                      </span>
                    </div>
                    {/* Background Track */}
                    <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                      {/* Active Progress Bar */}
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${metric.value * 10}%` }}
                      />
                    </div>
                    <p className="text-xs text-zinc-500">{metric.desc}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Session Metadata Note */}
            <div className="text-center text-xs text-zinc-500 font-mono mt-3 select-none">
              Session #{sessionNumber} &middot;{" "}
              {session.type.replace(/([A-Z])/g, " $1").trim()} &middot;{" "}
              {formattedDate}
            </div>
          </div>

          {/* Right Column - Summary, Strengths, Areas for Improvement */}
          <div className="lg:col-span-2 space-y-6">
            {/* Summary Card */}
            <Card className="bg-zinc-900/60 border-zinc-800 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <FileText className="h-5 w-5 text-emerald-400" />
                  <span>Overall Evaluation Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-zinc-300 leading-relaxed text-sm">
                  {report.summary || "No evaluation summary generated."}
                </p>
              </CardContent>
            </Card>

            {/* Strengths Card */}
            <Card className="bg-zinc-900/60 border-zinc-800 border-l-4 border-l-emerald-500 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-emerald-400">
                  <Sparkles className="h-5 w-5" />
                  <span>Key Strengths</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-zinc-300 leading-relaxed text-sm whitespace-pre-line">
                  {report.strengths || "No specific strengths identified."}
                </div>
              </CardContent>
            </Card>

            {/* Weaknesses Card */}
            <Card className="bg-zinc-900/60 border-zinc-800 border-l-4 border-l-amber-500 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-amber-500">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Areas for Improvement</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-zinc-300 leading-relaxed text-sm whitespace-pre-line">
                  {report.weaknesses || "No areas for improvement identified."}
                </div>
              </CardContent>
            </Card>

            {/* Session Metadata Note */}
            <div className="text-center text-xs text-zinc-500 font-mono mt-3 select-none">
              Session #{sessionNumber} &middot;{" "}
              {session.type.replace(/([A-Z])/g, " $1").trim()} &middot;{" "}
              {formattedDate}
            </div>
          </div>
        </div>

        {/* Interview Coach Chat Component */}
        <div className="space-y-4 pt-6 border-t border-zinc-900">
          <div className="flex flex-col space-y-1">
            <h2 className="text-xl font-bold tracking-tight text-white">
              Interview Coach
            </h2>
            <p className="text-zinc-400 text-xs font-medium">
              Ask questions about your performance and get specific coaching.
            </p>
          </div>
          <CoachChat
            sessionId={sessionId}
            initialContext={{
              interviewType: session.type,
              overallScore: overallScore,
              candidateName: session.user.name,
            }}
          />
        </div>
      </div>
    </div>
  );
}
