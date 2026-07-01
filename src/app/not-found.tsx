import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="relative min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center overflow-hidden">
      
      {/* Background Pulse Animation */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="h-64 w-64 rounded-full bg-[#00FF87]/5 blur-3xl animate-pulse duration-4000" />
      </div>

      <div className="relative z-10 space-y-6 max-w-md">
        
        {/* Large Monospace Header */}
        <h1 className="text-8xl font-mono font-black tracking-widest text-[#00FF87]/20 select-none">
          404
        </h1>

        {/* Text Details */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Page not found
          </h2>
          <p className="text-zinc-400 text-sm">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        {/* Redirection Links */}
        <div className="flex items-center justify-center gap-4 pt-4">
          <Link
            href="/dashboard"
            className={cn(
              buttonVariants({ variant: "default" }),
              "bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-600/10 px-5"
            )}
          >
            Go to Dashboard
          </Link>
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "border-zinc-800 hover:bg-zinc-900 text-zinc-300 px-5"
            )}
          >
            Go Home
          </Link>
        </div>

      </div>
    </div>
  );
}
