import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Mic,
  ArrowRight,
  TrendingUp,
  Bot,
  Sparkles,
  HelpCircle,
  Code,
  Server,
  UserCheck,
} from "lucide-react";

export default async function Home() {
  const userId = await getCurrentUser();
  const isLoggedIn = !!userId;

  const features = [
    {
      title: "Real-time Voice Interviews",
      description:
        "Speak naturally. Our conversational voice agent asks questions, listens to answers, and responds dynamically in real-time.",
      icon: Mic,
    },
    {
      title: "Granular Score Reports",
      description:
        "Get instant feedback on four core areas: Communication Clarity, Technical Depth, Answer Structure (STAR), and Composure.",
      icon: TrendingUp,
    },
    {
      title: "Tailored AI Coaching Chat",
      description:
        "Have questions about your report? Chat with your AI coach to understand your marks, get suggestions, and practice responses.",
      icon: Bot,
    },
    {
      title: "Personalized Onboarding",
      description:
        "Define your target engineering title and experience tier (Junior, Mid, Senior) to receive mock interview questions customized for you.",
      icon: Sparkles,
    },
  ];

  const types = [
    {
      name: "Behavioral",
      desc: "Communication, STAR structure, and situational judgment.",
      icon: HelpCircle,
      bg: "hover:border-emerald-500/30 hover:bg-emerald-500/5",
      iconColor: "text-emerald-400",
    },
    {
      name: "Technical",
      desc: "Coding design patterns, debugging, and tradeoff analysis.",
      icon: Code,
      bg: "hover:border-blue-500/30 hover:bg-blue-500/5",
      iconColor: "text-blue-400",
    },
    {
      name: "System Design",
      desc: "Distributed systems, architectural tradeoffs, and scaling.",
      icon: Server,
      bg: "hover:border-purple-500/30 hover:bg-purple-500/5",
      iconColor: "text-purple-400",
    },
    {
      name: "HR / Culture Fit",
      desc: "Team collaboration, leadership values, and soft skills.",
      icon: UserCheck,
      bg: "hover:border-amber-500/30 hover:bg-amber-500/5",
      iconColor: "text-amber-400",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#00FF87] selection:text-black">
      
      {/* Navigation */}
      <header className="border-b border-zinc-900 bg-black/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 bg-[#00FF87] rounded-full flex items-center justify-center">
              <Mic className="h-4 w-4 text-black" />
            </div>
            <span className="text-white font-extrabold tracking-tight text-sm">
              InterviewAI
            </span>
          </div>
          <Link
            href={isLoggedIn ? "/dashboard" : "/login"}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "border-zinc-800 hover:bg-zinc-900 text-zinc-300 text-xs px-4"
            )}
          >
            {isLoggedIn ? "Go to Dashboard" : "Sign In"}
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 md:pt-32 md:pb-24 border-b border-zinc-900">
        {/* Neon glow effect */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#00FF87]/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-5xl mx-auto px-6 flex flex-col items-center text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#00FF87]/20 bg-[#00FF87]/5 text-[#00FF87] text-[10px] font-bold tracking-wider uppercase select-none">
            <Sparkles className="h-3 w-3" />
            Next-Gen Interview Practice
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white max-w-3xl leading-[1.1] md:leading-[1.05]">
            Master Your Next Mock Interview with <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FF87] to-emerald-400">AI Voice</span>
          </h1>
          
          <p className="text-zinc-400 text-sm md:text-base max-w-2xl leading-relaxed">
            Practice realistic, interactive voice interviews customized for your role and level. Get real-time audio conversations, analytical feedback scores, and a dedicated AI coach to help you land the offer.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
            <Link
              href={isLoggedIn ? "/dashboard" : "/login"}
              className={cn(
                buttonVariants({ variant: "default", size: "lg" }),
                "bg-[#00FF87] hover:bg-[#00FF87]/90 text-black font-bold px-8 h-12 shadow-lg shadow-[#00FF87]/15 rounded-lg text-xs"
              )}
            >
              Start Free Practice <ArrowRight className="ml-2 h-4 w-4 text-black" />
            </Link>
            <Link
              href={isLoggedIn ? "/interview/new" : "/login"}
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "border-zinc-800 hover:bg-zinc-900 text-zinc-300 px-6 h-12 rounded-lg text-xs"
              )}
            >
              Choose Interview Type
            </Link>
          </div>

          {/* Animated visualizer mockup */}
          <div className="w-full max-w-md pt-12 md:pt-16 flex justify-center">
            <div className="relative flex items-center justify-center h-40 w-40">
              <div className="absolute inset-[-15px] rounded-full border border-[#00FF87]/10 animate-[ping_3s_infinite]" />
              <div className="absolute inset-[-5px] rounded-full border border-[#00FF87]/20 shadow-[0_0_20px_rgba(0,255,135,0.05)] animate-[pulse_2s_infinite]" />
              <div className="absolute h-20 w-20 rounded-full bg-[#00FF87] flex items-center justify-center shadow-[0_0_35px_#00FF87,inset_0_2px_6px_rgba(255,255,255,0.5)]">
                <Mic className="h-8 w-8 text-black" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 md:py-28 border-b border-zinc-900">
        <div className="max-w-5xl mx-auto px-6 space-y-12">
          <div className="space-y-3 max-w-xl">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              Features Built for Engineers
            </h2>
            <p className="text-zinc-400 text-xs md:text-sm">
              We skip the written questionnaires and give you true audio practice sessions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-xl p-6 space-y-4 hover:border-[#00FF87]/30 transition-all duration-300"
                >
                  <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[#00FF87]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-bold text-white">{feat.title}</h3>
                    <p className="text-zinc-500 text-xs leading-relaxed">{feat.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Interview Types Section */}
      <section className="py-20 md:py-28 border-b border-zinc-900">
        <div className="max-w-5xl mx-auto px-6 space-y-12">
          <div className="space-y-3 max-w-xl">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              Multiple Interview Formats
            </h2>
            <p className="text-zinc-400 text-xs md:text-sm">
              Prepare for every phase of the technical loop with tailored AI models.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {types.map((type) => {
              const Icon = type.icon;
              return (
                <div
                  key={type.name}
                  className={cn(
                    "bg-[#0A0A0A] border border-[#1A1A1A] rounded-xl p-6 flex items-start gap-4 transition-all duration-300",
                    type.bg
                  )}
                >
                  <div className={cn("w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0", type.iconColor)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1 mt-0.5">
                    <h3 className="text-sm font-bold text-white">{type.name}</h3>
                    <p className="text-zinc-500 text-xs leading-relaxed">{type.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 md:py-28 border-b border-zinc-900">
        <div className="max-w-5xl mx-auto px-6 space-y-16">
          <div className="text-center space-y-3 max-w-xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              How InterviewAI Works
            </h2>
            <p className="text-zinc-400 text-xs md:text-sm">
              An easy three-step cycle to level up your engineering communication.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="text-3xl font-black text-zinc-800 font-mono">01</div>
              <h3 className="text-sm font-bold text-white">Choose Parameters</h3>
              <p className="text-zinc-500 text-xs leading-relaxed">
                Configure your onboarding job profiles. Select Technical, Behavioral, System Design, or Cultural scenarios.
              </p>
            </div>
            <div className="space-y-4">
              <div className="text-3xl font-black text-zinc-800 font-mono">02</div>
              <h3 className="text-sm font-bold text-white">Speak Naturally</h3>
              <p className="text-zinc-500 text-xs leading-relaxed">
                Connect your microphone and speak out loud with our AI interviewer. It behaves like a real human coordinator.
              </p>
            </div>
            <div className="space-y-4">
              <div className="text-3xl font-black text-zinc-800 font-mono">03</div>
              <h3 className="text-sm font-bold text-white">Iterate with Coach</h3>
              <p className="text-zinc-500 text-xs leading-relaxed">
                Review your scores. Open the chat coach directly inside the report card to ask questions and practice better answers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call To Action Banner */}
      <section className="py-20 md:py-28 bg-[#030303]">
        <div className="max-w-5xl mx-auto px-6 text-center space-y-8">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-none">
            Ready to stand out?
          </h2>
          <p className="text-zinc-400 text-xs md:text-sm max-w-md mx-auto">
            Unlock confidence, sharpen your speech structure, and ace your technical assessments with InterviewAI.
          </p>
          <div className="pt-2">
            <Link
              href={isLoggedIn ? "/dashboard" : "/login"}
              className={cn(
                buttonVariants({ variant: "default", size: "lg" }),
                "bg-[#00FF87] hover:bg-[#00FF87]/90 text-black font-bold px-8 h-12 shadow-lg shadow-[#00FF87]/15 rounded-lg text-xs"
              )}
            >
              Get Started Now <ArrowRight className="ml-2 h-4 w-4 text-black" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-black py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-[#00FF87] rounded-full flex items-center justify-center">
              <Mic className="h-3 w-3 text-black" />
            </div>
            <span className="text-white text-xs font-bold tracking-tight">
              InterviewAI
            </span>
          </div>
          <span className="text-[10px] text-zinc-600 font-medium">
            &copy; {new Date().getFullYear()} InterviewAI. All rights reserved.
          </span>
        </div>
      </footer>

    </div>
  );
}
