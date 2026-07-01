"use client";

import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";

interface FailedSessionBannerProps {
  expiredCount: number;
}

export default function FailedSessionBanner({ expiredCount }: FailedSessionBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible || expiredCount === 0) return null;

  const scrollToHistory = () => {
    // Smoothly scroll to the table title
    const tableHeader = document.querySelector("h2");
    if (tableHeader) {
      tableHeader.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/20 text-amber-400 px-4 py-3 rounded-lg shadow-sm transition-all duration-300">
      <div className="flex items-center space-x-2.5">
        <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 animate-pulse" />
        <span className="text-sm font-semibold">
          You have {expiredCount} interrupted interview session{expiredCount === 1 ? "" : "s"}.
        </span>
      </div>
      <div className="flex items-center space-x-4">
        <button
          onClick={scrollToHistory}
          className="text-xs font-semibold hover:underline cursor-pointer transition-all"
        >
          View in History
        </button>
        <button
          onClick={() => setIsVisible(false)}
          className="text-amber-400/80 hover:text-amber-400 p-0.5 rounded-md hover:bg-amber-500/10 transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
