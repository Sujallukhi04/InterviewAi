"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, ArrowRight } from "lucide-react";
import { useInView } from "react-intersection-observer";

interface ChatMessage {
  role: "ai" | "user";
  label: string;
  text: string;
}

const presets = [
  {
    id: "tech",
    label: "Technical depth",
    prompt: "I spearheaded our backend database migration to PostgreSQL.",
    aiResponse: "Why PostgreSQL specifically? What specific trade-offs did you weigh against other engines, and how did you minimize live downtime?"
  },
  {
    id: "behavioral",
    label: "Conflict resolution",
    prompt: "We disagreed on API design, so I scheduled a 1-on-1 tradeoff review.",
    aiResponse: "Taking the initiative is great. But how did you handle it when they pushed back on your core schema proposals during that meeting?"
  },
  {
    id: "unstructured",
    label: "Situational choice",
    prompt: "Honestly, I just did what the product manager requested to ship on time.",
    aiResponse: "I see. As the engineer, how did you communicate the long-term technical debt and scaling implications of that shortcut to the team?"
  }
];

export default function DemoPreviewSection() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const { ref: sectionRef, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  // Conversation state
  const [chatLog, setChatLog] = useState<ChatMessage[]>([
    {
      role: "ai",
      label: "Alex (AI)",
      text: "Tell me about a technical decision you made on your last project, and the conflicts you faced."
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [aiState, setAiState] = useState<"idle" | "listening" | "speaking">("idle");
  const [activePreset, setActivePreset] = useState<string | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      setTimeout(() => {
        setReducedMotion(true);
      }, 0);
    }
  }, []);

  const anim = <T,>(variants: T): T | Record<string, never> => (reducedMotion ? {} : variants);

  const handleSimulate = async (presetId: string) => {
    if (isTyping || aiState !== "idle") return;
    const preset = presets.find((p) => p.id === presetId);
    if (!preset) return;

    setActivePreset(presetId);
    setIsTyping(true);
    setAiState("listening");

    // 1. Simulate user message typing out
    const userMsg: ChatMessage = {
      role: "user",
      label: "You",
      text: ""
    };
    setChatLog((prev) => [...prev, userMsg]);

    const words = preset.prompt.split(" ");
    for (let i = 0; i < words.length; i++) {
      await new Promise((r) => setTimeout(r, 120));
      setChatLog((prev) => {
        const copy = [...prev];
        const currentWords = words.slice(0, i + 1).join(" ");
        copy[copy.length - 1] = { ...copy[copy.length - 1], text: currentWords };
        return copy;
      });
    }

    setIsTyping(false);
    setAiState("speaking");

    // 2. Short lag while AI "thinks"
    await new Promise((r) => setTimeout(r, 1000));

    // 3. Simulate AI responding
    const aiMsg: ChatMessage = {
      role: "ai",
      label: "Alex (AI)",
      text: ""
    };
    setChatLog((prev) => [...prev, aiMsg]);

    const aiWords = preset.aiResponse.split(" ");
    for (let i = 0; i < aiWords.length; i++) {
      await new Promise((r) => setTimeout(r, 100));
      setChatLog((prev) => {
        const copy = [...prev];
        const currentWords = aiWords.slice(0, i + 1).join(" ");
        copy[copy.length - 1] = { ...copy[copy.length - 1], text: currentWords };
        return copy;
      });
    }

    setAiState("idle");
    setActivePreset(null);
  };

  const handleReset = () => {
    setChatLog([
      {
        role: "ai",
        label: "Alex (AI)",
        text: "Tell me about a technical decision you made on your last project, and the conflicts you faced."
      }
    ]);
    setAiState("idle");
    setActivePreset(null);
  };

  return (
    <section ref={sectionRef} className="bg-[#050505] py-24 px-6 w-full overflow-hidden">
      <div className="max-w-5xl mx-auto flex flex-col items-center">
        
        {/* Section Header */}
        <div className="text-center max-w-xl mb-16 space-y-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#00FF87]">
            Live Sandbox
          </span>
          <h2 className="text-3xl md:text-5xl font-serif italic text-white font-light tracking-tight leading-tight">
            Try a live response
          </h2>
          <p className="text-zinc-500 text-xs font-semibold font-mono tracking-wider">
            Test how the AI pushes back on your responses in real time.
          </p>
        </div>

        {/* Sandbox Console */}
        <motion.div
          initial={anim({ opacity: 0, y: 50, scale: 0.98 })}
          animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-2xl bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl overflow-hidden shadow-2xl relative flex flex-col h-[520px]"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-[#1A1A1A] flex items-center justify-between select-none">
            <div className="flex items-center space-x-2.5">
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${aiState !== "idle" ? "bg-[#00FF87] animate-ping" : "bg-zinc-700"}`} />
              <span className={`w-2.5 h-2.5 rounded-full absolute shrink-0 ${aiState !== "idle" ? "bg-[#00FF87]" : "bg-zinc-700"}`} />
              <span className="text-zinc-200 text-xs font-bold font-mono tracking-wider uppercase ml-1">
                Voice Sandbox &bull; {aiState === "speaking" ? "AI speaking" : aiState === "listening" ? "Listening" : "Ready"}
              </span>
            </div>
            <button
              onClick={handleReset}
              className="text-xs text-zinc-500 hover:text-white transition-colors font-mono font-semibold"
            >
              RESET
            </button>
          </div>

          {/* Interactive Wave Orb Area */}
          <div className="py-8 flex flex-col items-center justify-center border-b border-[#1A1A1A]/40 bg-[#070707]/30">
            <motion.div
              className={`w-16 h-16 rounded-full bg-[#111111] border-2 flex items-center justify-center select-none ${
                aiState === "speaking" ? "border-[#00FF87]/50" : "border-zinc-800"
              }`}
              animate={anim(aiState === "speaking" ? {
                scale: [1, 1.08, 1],
                boxShadow: [
                  "0 0 0 0px rgba(0,255,135,0)",
                  "0 0 0 12px rgba(0,255,135,0.08)",
                  "0 0 0 24px rgba(0,255,135,0)",
                ]
              } : { scale: 1 })}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Mic className={`w-6 h-6 ${aiState === "speaking" ? "text-[#00FF87]" : "text-zinc-500"}`} />
            </motion.div>
            <p className="text-[#888888] text-[10px] font-mono tracking-wider uppercase mt-3 select-none">
              {aiState === "speaking" ? "Alex is speaking..." : aiState === "listening" ? "Transcribing input..." : "Select a response below"}
            </p>
          </div>

          {/* Scrollable chat body */}
          <div className="flex-1 p-6 space-y-4 overflow-y-auto flex flex-col">
            <AnimatePresence initial={false}>
              {chatLog.map((msg, index) => {
                const isAi = msg.role === "ai";
                return (
                  <motion.div
                    key={index}
                    initial={anim({ opacity: 0, y: 10 })}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col"
                  >
                    <span
                      className={`text-[10px] font-mono font-bold tracking-wider mb-1 select-none ${
                        isAi ? "text-[#00FF87]" : "text-zinc-500 text-right"
                      }`}
                    >
                      {msg.label}
                    </span>
                    <div className={`flex w-full ${isAi ? "justify-start" : "justify-end"}`}>
                      <div
                        className={`max-w-[85%] text-sm px-4 py-3 rounded-2xl shadow-md border ${
                          isAi
                            ? "bg-[#111111] text-zinc-100 rounded-tl-sm border-[#1A1A1A]/40"
                            : "bg-[#00FF87]/5 text-[#00FF87] border-[#00FF87]/15 rounded-tr-sm"
                        }`}
                      >
                        {msg.text || (
                          <span className="flex items-center space-x-1">
                            <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                            <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                            <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Preset response panel */}
        <div className="mt-8 w-full max-w-2xl select-none">
          <div className="text-zinc-500 text-xs font-mono font-bold uppercase tracking-wider mb-3 text-center md:text-left">
            Choose what to say:
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {presets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleSimulate(preset.id)}
                disabled={isTyping || aiState !== "idle"}
                className={`border text-left p-4 rounded-xl flex flex-col justify-between h-32 transition-all duration-300 ${
                  activePreset === preset.id
                    ? "border-[#00FF87] bg-[#00FF87]/5"
                    : isTyping || aiState !== "idle"
                    ? "border-zinc-900 bg-black/20 opacity-40 cursor-not-allowed"
                    : "border-zinc-800 bg-[#0A0A0A] hover:border-[#00FF87]/30 hover:bg-[#0c0c0c]"
                }`}
              >
                <div className="space-y-1">
                  <span className={`text-[9px] font-mono uppercase tracking-wider ${activePreset === preset.id ? "text-[#00FF87]" : "text-zinc-500"}`}>
                    {preset.label}
                  </span>
                  <p className="text-xs text-zinc-300 font-medium leading-relaxed line-clamp-3">
                    &quot;{preset.prompt}&quot;
                  </p>
                </div>
                <div className="flex items-center text-[10px] font-bold text-[#00FF87] mt-2 group">
                  <span>Speak</span>
                  <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
