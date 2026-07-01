"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Loader2, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (error) {
      console.error("Sign in error:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-black px-4 overflow-hidden select-none">
      {/* Subtle top-right green radial gradient decoration */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#00FF87]/3 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl p-8 shadow-xl shadow-black relative z-10 flex flex-col items-center">
        {/* Logo Mark */}
        <div className="flex items-center space-x-2.5 mb-6">
          <div className="w-8 h-8 bg-[#00FF87] rounded-full flex items-center justify-center shrink-0">
            <Mic className="h-4.5 w-4.5 text-black" />
          </div>
          <span className="text-white font-extrabold tracking-tight text-lg">
            InterviewAI
          </span>
        </div>

        {/* Header content */}
        <div className="text-center space-y-2 mb-6">
          <h1 className="text-xl font-bold tracking-tight text-white">
            Welcome back
          </h1>
          <p className="text-[#888888] text-xs leading-relaxed max-w-[240px] mx-auto">
            Sign in to continue your interview practice
          </p>
        </div>

        {/* Continue with Google Button */}
        <Button
          onClick={handleSignIn}
          disabled={isLoading}
          className="w-full flex items-center justify-center py-2.5 h-11 rounded-lg font-bold transition-all active:scale-[0.98] border border-[#1A1A1A] bg-[#111111] hover:border-[#00FF87] text-white hover:bg-green-700/30 cursor-pointer text-xs"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
              Connecting...
            </>
          ) : (
            <>
              <svg
                className="mr-2.5 h-4 w-4 shrink-0 text-white"
                aria-hidden="true"
                focusable="false"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 488 512"
              >
                <path
                  fill="currentColor"
                  d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                />
              </svg>
              Continue with Google
            </>
          )}
        </Button>

        {/* Terms footer */}
        <span className="text-[9px] text-zinc-600 text-center leading-relaxed mt-6 max-w-[200px] block font-medium">
          By continuing you agree to our Terms of Service and Privacy Policy
        </span>
      </div>
    </div>
  );
}
