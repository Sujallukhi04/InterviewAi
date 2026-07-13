"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, Check } from "lucide-react";
import { useInView } from "react-intersection-observer";

const problems = [
  "A list of preset questions read aloud",
  "No reaction to what you actually said",
  "Generic feedback for any answer"
];

const solutions = [
  "Every response generated from your answer",
  "Follows up, probes, adapts in real time",
  "Feedback with real examples from your transcript"
];

export default function ProblemSection() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const { ref: containerRef, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      setTimeout(() => {
        setReducedMotion(true);
      }, 0);
    }
  }, []);

  const anim = <T,>(variants: T): T | Record<string, never> => (reducedMotion ? {} : variants);

  return (
    <section ref={containerRef} className="relative bg-[#050505] py-24 px-6 overflow-hidden w-full">
      <div className="max-w-5xl mx-auto flex flex-col items-center">
        {/* Section Header */}
        <motion.div
          initial={anim({ opacity: 0, y: 20 })}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mb-16 space-y-2"
        >
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#00FF87]">
            Core Defect
          </span>
          <h2 className="text-3xl md:text-5xl font-serif italic text-white font-light tracking-tight leading-tight">
            Most interview prep tools are broken.
          </h2>
          <p className="text-zinc-500 text-xs font-semibold font-mono tracking-wider">
            AI coaching is more than just reading questions off a checklist.
          </p>
        </motion.div>

        {/* Comparison grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full relative">
          
          {/* Vertical Divider (Desktop Only) */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-zinc-900 -translate-x-1/2">
            <motion.div
              className="absolute w-2 h-2 rounded-full bg-[#00FF87] left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 shadow-[0_0_10px_#00FF87]"
              animate={anim({ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] })}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          {/* Left Column (The Problem) */}
          <div className="space-y-6">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-red-500 tracking-widest uppercase">
                The Problem
              </span>
              <h3 className="text-xl font-bold text-white">Without InterviewAI</h3>
            </div>
            
            <div className="space-y-4">
              {problems.map((text, i) => (
                <motion.div
                  key={i}
                  initial={anim({ opacity: 0, x: -40 })}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: i * 0.15, duration: 0.5 }}
                  className="flex items-start gap-3 p-4 bg-[#0A0A0A] border border-[#1A1A1A] rounded-xl hover:border-red-500/20 transition-all duration-300 group"
                >
                  <div className="w-5 h-5 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shrink-0 mt-0.5 transition-colors group-hover:bg-red-500/20">
                    <X className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[#888888] text-sm group-hover:text-zinc-300 transition-colors">
                    {text}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Column (The Solution) */}
          <div className="space-y-6">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-[#00FF87] tracking-widest uppercase">
                The Solution
              </span>
              <h3 className="text-xl font-bold text-white">With InterviewAI</h3>
            </div>

            <div className="space-y-4">
              {solutions.map((text, i) => (
                <motion.div
                  key={i}
                  initial={anim({ opacity: 0, x: 40 })}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: i * 0.15, duration: 0.5 }}
                  className="flex items-start gap-3 p-4 bg-[#0A0A0A] border border-[#1A1A1A] rounded-xl hover:border-[#00FF87]/20 transition-all duration-300 group"
                >
                  <div className="w-5 h-5 rounded-full bg-[#00FF87]/10 border border-[#00FF87]/20 flex items-center justify-center text-[#00FF87] shrink-0 mt-0.5 transition-colors group-hover:bg-[#00FF87]/20">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-zinc-300 text-sm group-hover:text-white transition-colors">
                    {text}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
