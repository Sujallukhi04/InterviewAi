"use client";

import { useEffect } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error details for debugging
    console.error("Global boundary caught error:", error);
  }, [error]);

  const isUserFriendly = error.message && error.message.length < 150;

  return (
    <div className="relative min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center overflow-hidden">
      
      {/* Background Pulse Animation */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="h-64 w-64 rounded-full bg-red-500/5 blur-3xl animate-pulse duration-4000" />
      </div>

      <div className="relative z-10 space-y-6 max-w-md">
        
        {/* Large Monospace Header */}
        <h1 className="text-8xl font-mono font-black tracking-widest text-red-500/20 select-none">
          500
        </h1>

        {/* Text Details */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Something went wrong
          </h2>
          <p className="text-zinc-400 text-sm break-words px-2 max-w-sm mx-auto">
            {isUserFriendly ? error.message : "An unexpected error occurred. Please try again."}
          </p>
        </div>

        {/* Redirection / Retry Links */}
        <div className="flex items-center justify-center gap-4 pt-4">
          <button
            onClick={() => reset()}
            className={cn(
              buttonVariants({ variant: "default" }),
              "bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-600/10 px-5 cursor-pointer"
            )}
          >
            Try Again
          </button>
          <Link
            href="/dashboard"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "border-zinc-800 hover:bg-zinc-900 text-zinc-300 px-5"
            )}
          >
            Go to Dashboard
          </Link>
        </div>

      </div>
    </div>
  );
}
