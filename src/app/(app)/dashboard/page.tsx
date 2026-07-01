import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getUserSessions } from "@/services/dashboardService";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { Plus, MessageSquare, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import InterviewHistoryTable from "@/components/dashboard/InterviewHistoryTable";
import { getFailedSessions } from "@/services/sessionService";
import FailedSessionBanner from "@/components/dashboard/FailedSessionBanner";
import { getProgressChartData } from "@/services/dashboardService";
import ProgressChart from "@/components/dashboard/ProgressChart";

export default async function DashboardPage() {
  const userId = await getCurrentUser();
  if (!userId) {
    redirect("/login");
  }

  const { userName, sessions } = await getUserSessions(userId);
  const failedSessions = await getFailedSessions(userId);
  const progressData = await getProgressChartData(userId);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 p-4 md:p-8 flex flex-col justify-between">
      <div className="max-w-5xl w-full mx-auto space-y-8">
        {/* Header Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900 pb-6">
          <div className="space-y-1.5">
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              Welcome back, {userName || "Candidate"}
            </h1>
            <p className="text-zinc-400 text-sm">
              Here are your past mock interview sessions.
            </p>
          </div>
          <Link
            href="/interview/new"
            className={cn(
              buttonVariants({ variant: "default" }),
              "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/10 flex items-center self-start md:self-center",
            )}
          >
            <Plus className="mr-2 h-4 w-4" />
            Start New Interview
          </Link>
        </div>

        {failedSessions.length > 0 && (
          <FailedSessionBanner expiredCount={failedSessions.length} />
        )}

        {/* Sessions Content */}
        {sessions.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-xl py-20 text-center bg-zinc-900/10 backdrop-blur-xs">
            <div className="p-4 bg-zinc-900/50 rounded-full border border-zinc-800 text-zinc-500 mb-4">
              <MessageSquare className="h-10 w-10" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">
              No interviews yet
            </h3>
            <p className="text-zinc-500 text-sm max-w-sm mb-6">
              Start your first AI-conducted interview to see your detailed
              report cards here.
            </p>
            <Link
              href="/interview/new"
              className={cn(
                buttonVariants({ variant: "default" }),
                "bg-emerald-600 hover:bg-emerald-500 text-white flex items-center",
              )}
            >
              <Play className="mr-2 h-4.5 w-4.5" />
              Start Interview
            </Link>
          </div>
        ) : (
          /* Sessions list */
          <div className="space-y-8">
            {/* Chart Section */}
            <div className="space-y-4">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-zinc-500">
                  {progressData.length} interview
                  {progressData.length === 1 ? "" : "s"} tracked
                </span>
              </div>
              <ProgressChart data={progressData} />
            </div>

            {/* History Section */}
            <div className="space-y-4">
              <div className="flex items-baseline space-x-2">
                <h2 className="text-xl font-bold tracking-tight text-white">
                  Interview History
                </h2>
                <span className="text-xs text-zinc-500">
                  {sessions.length}{" "}
                  {sessions.length === 1 ? "session" : "sessions"} total
                </span>
              </div>
              <InterviewHistoryTable sessions={sessions} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
