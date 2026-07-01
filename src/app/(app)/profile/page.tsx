import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProfileForm from "@/components/profile/ProfileForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/actions/auth";
import { Award, Layers, TrendingUp } from "lucide-react";
import Image from "next/image";

export default async function ProfilePage() {
  const userId = await getCurrentUser();
  if (!userId) {
    redirect("/login");
  }

  // Fetch full user details including completed session counts and average scores
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      interviewSessions: {
        include: {
          feedback: {
            select: { scores: true },
          },
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const interviewSessions = user.interviewSessions || [];
  const totalInterviews = interviewSessions.length;
  const completedInterviews = interviewSessions.filter((i) => i.status === "completed");
  const completedCount = completedInterviews.length;

  // Calculate average overall score
  let averageScore: string = "—";
  const completedWithFeedback = completedInterviews.filter((i) => i.feedback);
  if (completedWithFeedback.length > 0) {
    const totalScore = completedWithFeedback.reduce((sum: number, item) => {
      const scores = (item.feedback?.scores || {}) as { overall?: number };
      return sum + (scores.overall || 0);
    }, 0);
    averageScore = (totalScore / completedWithFeedback.length).toFixed(1);
  }

  const getInitials = () => {
    if (user.name) {
      return user.name.charAt(0).toUpperCase();
    }
    return user.email.charAt(0).toUpperCase();
  };

  // Safe defaults for ProfileForm
  const formInitialData = {
    name: user.name || "",
    role: user.role || "",
    experience: (user.experience as "Entry" | "Mid" | "Senior") || "Mid",
  };

  return (
    <div className="max-w-5xl w-full mx-auto px-6 py-10 space-y-8 select-none">
      
      {/* Page Header */}
      <div className="space-y-1.5 border-b border-[#1A1A1A] pb-5">
        <h1 className="text-2xl font-extrabold tracking-tight text-white">
          Profile Settings
        </h1>
        <p className="text-[#888888] text-xs">
          Manage your information and mock interview preferences.
        </p>
      </div>

      {/* Profile Info & Edit Form Card */}
      <Card className="bg-[#0A0A0A] border-[#1A1A1A] rounded-xl overflow-hidden shadow-xl">
        <CardContent className="p-6 md:p-8 space-y-6">
          
          {/* Avatar and Basic Info */}
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <div className="w-20 h-20 rounded-full border-2 border-[#1A1A1A] bg-zinc-900 flex items-center justify-center relative overflow-hidden shrink-0">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name || "Avatar"}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              ) : (
                <span className="text-[#00FF87] text-3xl font-extrabold">
                  {getInitials()}
                </span>
              )}
            </div>
            <div className="text-center sm:text-left space-y-1.5 flex-1">
              <h2 className="text-lg font-bold text-white leading-none">
                {user.name || "Candidate"}
              </h2>
              <p className="text-zinc-500 text-xs font-mono">{user.email}</p>
              {user.experience && (
                <Badge className="bg-[#00FF87]/10 text-[#00FF87] hover:bg-[#00FF87]/20 border-transparent text-[10px] font-bold mt-1 px-2.5 py-0.5 rounded-full select-none">
                  {user.experience} Level
                </Badge>
              )}
            </div>
          </div>

          <div className="border-t border-[#1A1A1A] my-6" />

          {/* Edit Form */}
          <ProfileForm initialData={formInitialData} />

        </CardContent>
      </Card>

      {/* Stats Section */}
      <Card className="bg-[#0A0A0A] border-[#1A1A1A] rounded-xl overflow-hidden shadow-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-extrabold uppercase tracking-wider text-zinc-400">
            Your Interview Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 md:p-8 pt-2">
          <div className="grid grid-cols-3 gap-4 text-center">
            
            {/* Stat 1 */}
            <div className="bg-[#111111]/40 border border-[#1A1A1A]/40 p-4 rounded-xl space-y-1 flex flex-col justify-center">
              <div className="flex justify-center mb-1 text-[#00FF87]/50">
                <Layers className="h-4.5 w-4.5" />
              </div>
              <span className="text-lg font-black text-white">{totalInterviews}</span>
              <span className="text-[10px] text-[#888888] font-semibold uppercase tracking-wider">
                Total
              </span>
            </div>

            {/* Stat 2 */}
            <div className="bg-[#111111]/40 border border-[#1A1A1A]/40 p-4 rounded-xl space-y-1 flex flex-col justify-center">
              <div className="flex justify-center mb-1 text-[#00FF87]/50">
                <Award className="h-4.5 w-4.5" />
              </div>
              <span className="text-lg font-black text-white">{completedCount}</span>
              <span className="text-[10px] text-[#888888] font-semibold uppercase tracking-wider">
                Completed
              </span>
            </div>

            {/* Stat 3 */}
            <div className="bg-[#111111]/40 border border-[#1A1A1A]/40 p-4 rounded-xl space-y-1 flex flex-col justify-center">
              <div className="flex justify-center mb-1 text-[#00FF87]/50">
                <TrendingUp className="h-4.5 w-4.5" />
              </div>
              <span className="text-lg font-black text-white">{averageScore}</span>
              <span className="text-[10px] text-[#888888] font-semibold uppercase tracking-wider">
                Avg Score
              </span>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="bg-[#0A0A0A] border-red-500/20 rounded-xl overflow-hidden shadow-xl border border-l-4 border-l-red-500">
        <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-extrabold text-white">Account Session</h3>
            <p className="text-zinc-500 text-xs leading-relaxed">
              Log out of your current session across this and other active devices.
            </p>
          </div>
          <form action={logoutAction}>
            <Button
              type="submit"
              variant="destructive"
              className="bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/20 transition-all font-bold text-xs shrink-0 cursor-pointer h-9 px-4 rounded-lg"
            >
              Log out of all devices
            </Button>
          </form>
        </CardContent>
      </Card>

    </div>
  );
}
