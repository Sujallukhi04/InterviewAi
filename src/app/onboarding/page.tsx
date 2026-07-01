import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getUserById } from "@/services/userService";
import OnboardingForm from "./onboarding-form";

export default async function OnboardingPage() {
  const userId = await getCurrentUser();
  if (!userId) {
    redirect("/login");
  }

  const user = await getUserById(userId);
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-black px-4 overflow-hidden select-none">
      
      {/* Subtle top-right green radial gradient decoration */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#00FF87]/3 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl p-8 shadow-xl shadow-black relative z-10">
        
        {/* Progress indicator */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex justify-center items-center space-x-2.5 mb-2">
            <div className="w-2.5 h-2.5 bg-[#00FF87] rounded-full" />
            <div className="w-2.5 h-2.5 border border-zinc-700 rounded-full" />
          </div>
          <span className="text-[10px] text-[#00FF87]/80 font-bold uppercase tracking-wider">
            Step 1 of 2 &mdash; Profile Setup
          </span>
        </div>

        {/* Heading & Subheading */}
        <div className="text-center space-y-2 mb-6">
          <h1 className="text-xl font-bold tracking-tight text-white">
            Create your profile
          </h1>
          <p className="text-[#888888] text-xs leading-relaxed max-w-[280px] mx-auto">
            Tell us a bit about yourself to customize your simulated interviews.
          </p>
        </div>

        <OnboardingForm initialName={user.name || ""} />

      </div>
    </div>
  );
}
