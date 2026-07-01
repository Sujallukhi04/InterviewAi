"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, HelpCircle, Code, Server, UserCheck, CheckCircle2 } from "lucide-react";
import { createSessionAction } from "@/actions/session";
import { cn } from "@/lib/utils";

interface InterviewTypeOption {
  type: "Behavioral" | "Technical" | "SystemDesign" | "HRCultureFit";
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const interviewTypes: InterviewTypeOption[] = [
  {
    type: "Behavioral",
    title: "Behavioral",
    description: "Communication, STAR structure, situational judgment, and self-awareness.",
    icon: HelpCircle,
  },
  {
    type: "Technical",
    title: "Technical",
    description: "Technical depth, knowledge precision, code design, and tradeoff analysis.",
    icon: Code,
  },
  {
    type: "SystemDesign",
    title: "System Design",
    description: "High-level architecture, scalability tradeoffs, communicating complex graphs.",
    icon: Server,
  },
  {
    type: "HRCultureFit",
    title: "HR / Culture Fit",
    description: "Motivation alignment, leadership values, conflict resolution, and soft skills.",
    icon: UserCheck,
  },
];

export default function SelectionForm() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSelect = async (type: "Behavioral" | "Technical" | "SystemDesign" | "HRCultureFit") => {
    if (isLoading) return;
    setSelectedType(type);
    setIsLoading(true);

    try {
      const result = await createSessionAction({ type });
      if (result.success && result.sessionId) {
        toast.success(`Starting ${type} interview!`);
        router.push(`/interview/${result.sessionId}`);
      } else {
        toast.error(result.error || "Failed to create interview session");
        setIsLoading(false);
        setSelectedType(null);
      }
    } catch {
      toast.error("An unexpected error occurred");
      setIsLoading(false);
      setSelectedType(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl w-full">
      {interviewTypes.map((item) => {
        const Icon = item.icon;
        const isSelected = selectedType === item.type;
        const isCurrentLoading = isLoading && isSelected;
        const shouldDim = isLoading && !isSelected;

        return (
          <button
            key={item.type}
            onClick={() => handleSelect(item.type)}
            disabled={isLoading}
            className={cn(
              "w-full text-left bg-[#0A0A0A] border border-[#1A1A1A] rounded-xl p-6 relative cursor-pointer select-none transition-all duration-200 flex flex-col items-start min-h-[145px] focus:outline-none",
              isLoading ? "cursor-not-allowed" : "hover:border-[#00FF87] hover:shadow-[0_0_20px_rgba(0,255,135,0.06)] group",
              isSelected && "border-[#00FF87] bg-[rgba(0,255,135,0.03)]",
              shouldDim && "opacity-40"
            )}
          >
            {/* Top Icon */}
            <Icon
              className={cn(
                "w-8 h-8 text-zinc-600 transition-colors",
                !isLoading && "group-hover:text-[#00FF87]",
                isSelected && "text-[#00FF87]"
              )}
            />

            {/* Checkmark overlay */}
            {isSelected && !isCurrentLoading && (
              <CheckCircle2 className="absolute top-5 right-5 w-5 h-5 text-[#00FF87] animate-in zoom-in-75 duration-200" />
            )}

            {/* Title & Description */}
            <div className="space-y-1 mt-4">
              <h3 className="text-sm font-bold text-white">
                {item.title}
              </h3>
              <p className="text-zinc-500 text-[11px] leading-relaxed">
                {item.description}
              </p>
            </div>

            {/* Loader Overlay */}
            {isCurrentLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl animate-in fade-in duration-200">
                <Loader2 className="w-8 h-8 text-[#00FF87] animate-spin" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
