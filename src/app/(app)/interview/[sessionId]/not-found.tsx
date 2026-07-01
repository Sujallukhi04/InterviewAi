import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FileX } from "lucide-react";

export default function SessionNotFound() {
  return (
    <div className="relative min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center overflow-hidden">
      
      {/* Background Pulse Animation */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="h-64 w-64 rounded-full bg-[#00FF87]/5 blur-3xl animate-pulse duration-4000" />
      </div>

      <div className="relative z-10 space-y-6 max-w-md flex flex-col items-center">
        
        {/* Large Muted Green FileX Icon */}
        <div className="p-4 bg-zinc-900/50 rounded-full border border-zinc-800 text-emerald-500/80 mb-2">
          <FileX className="h-16 w-16" />
        </div>

        {/* Text Details */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Interview not found
          </h2>
          <p className="text-zinc-400 text-sm max-w-xs mx-auto">
            This session doesn&apos;t exist or you don&apos;t have access to it.
          </p>
        </div>

        {/* Redirection Link */}
        <div className="pt-4">
          <Link
            href="/dashboard"
            className={cn(
              buttonVariants({ variant: "default" }),
              "bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-600/10 px-6"
            )}
          >
            Back to Dashboard
          </Link>
        </div>

      </div>
    </div>
  );
}
