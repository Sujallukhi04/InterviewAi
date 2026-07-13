"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useMotionTemplate } from "framer-motion";
import { Brain, MessageCircle, FileText } from "lucide-react";
import { useInView } from "react-intersection-observer";

interface SpotlightCardProps {
  className?: string;
  children: React.ReactNode;
  delay?: number;
  inView: boolean;
  anim: <T,>(variants: T) => T | Record<string, never>;
}

function SpotlightCard({ className = "", children, delay = 0, inView, anim }: SpotlightCardProps) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div
      initial={anim({ opacity: 0, scale: 0.95 })}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ delay, duration: 0.5 }}
      whileHover={anim({ y: -3 })}
      onMouseMove={handleMouseMove}
      className={`relative overflow-hidden group bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl p-6 transition-all duration-300 select-none cursor-pointer flex flex-col justify-between min-h-[220px] ${className}`}
    >
      {/* Spotlight highlight overlay */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              160px circle at ${mouseX}px ${mouseY}px,
              rgba(0, 255, 135, 0.08),
              transparent 80%
            )
          `
        }}
      />
      <div className="relative z-20 flex flex-col justify-between h-full w-full">
        {children}
      </div>
    </motion.div>
  );
}

export default function FeaturesSection() {
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
    <section ref={containerRef} className="bg-[#050505] py-24 px-6 w-full overflow-hidden">
      <div className="max-w-5xl mx-auto flex flex-col items-center">
        {/* Section Header */}
        <div className="text-center max-w-xl mb-16 space-y-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#00FF87]">
            Core Suite
          </span>
          <h2 className="text-3xl md:text-5xl font-serif italic text-white font-light tracking-tight leading-tight">
            Everything you need
          </h2>
          <p className="text-zinc-500 text-xs font-semibold font-mono tracking-wider">
            Ace your mock assessments with state-of-the-art tools.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl">
          
          {/* Card 1: Real voice conversation */}
          <SpotlightCard
            delay={0}
            className="col-span-1 md:col-span-2"
            inView={inView}
            anim={anim}
          >
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-white tracking-tight">
                Real voice conversation
              </h3>
              <p className="text-zinc-500 text-xs leading-relaxed max-w-md">
                Talk out loud naturally. Dynamic speech models process transcripts and reply dynamically without lags.
              </p>
            </div>
            
            {/* Waveform */}
            <div className="flex gap-1.5 items-end h-14 pt-4">
              {[...Array(9)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1.5 bg-[#00FF87] rounded-full"
                  animate={anim({
                    height: [16, 44, 16, 60, 20, 36, 16]
                  })}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    repeatType: "mirror",
                    delay: i * 0.08,
                    ease: "easeInOut"
                  }}
                  style={{ height: 16 }}
                />
              ))}
            </div>
          </SpotlightCard>

          {/* Card 2: Adaptive AI */}
          <SpotlightCard
            delay={0.08}
            className="col-span-1"
            inView={inView}
            anim={anim}
          >
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-white tracking-tight">
                Adaptive AI
              </h3>
              <p className="text-zinc-500 text-xs leading-relaxed">
                The conversation routes and scales difficulty based on the depth of your answers.
              </p>
            </div>
            
            {/* Brain icon with pulse */}
            <div className="flex items-center justify-center pt-2">
              <motion.div
                animate={anim({ scale: [1, 1.06, 1] })}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="w-14 h-14 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center text-[#00FF87]"
              >
                <Brain className="w-7 h-7" />
              </motion.div>
            </div>
          </SpotlightCard>

          {/* Card 3: Feedback report */}
          <SpotlightCard
            delay={0.16}
            className="col-span-1 md:col-span-2"
            inView={inView}
            anim={anim}
          >
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-white tracking-tight">
                Feedback report
              </h3>
              <p className="text-zinc-500 text-xs leading-relaxed">
                Analytical marks grading your delivery, composure, STAR organization, and technical accuracy.
              </p>
            </div>

            {/* Score bars */}
            <div className="space-y-2.5 pt-4">
              {[
                { label: "Communication", val: "80%" },
                { label: "Technical Depth", val: "70%" },
                { label: "Structure", val: "85%" },
                { label: "Confidence", val: "75%" }
              ].map((bar, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold text-zinc-400">
                    <span>{bar.label}</span>
                    <span>{bar.val}</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-900 border border-zinc-800/40 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-[#00FF87]"
                      initial={{ width: 0 }}
                      animate={inView ? { width: bar.val } : {}}
                      transition={{ delay: 0.4 + i * 0.1, duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </SpotlightCard>

          {/* Card 4: Progress tracking */}
          <SpotlightCard
            delay={0.24}
            className="col-span-1"
            inView={inView}
            anim={anim}
          >
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-white tracking-tight">
                Progress tracking
              </h3>
              <p className="text-zinc-500 text-xs leading-relaxed">
                Visually track your score progression over multiple sessions.
              </p>
            </div>

            {/* Hand-crafted line chart */}
            <div className="h-20 flex items-center justify-center pt-2">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40">
                <motion.path
                  d="M 10 35 L 30 25 L 50 28 L 70 15 L 90 8"
                  fill="none"
                  stroke="#00FF87"
                  strokeWidth="2"
                  strokeLinecap="round"
                  initial={anim({ pathLength: 0 })}
                  animate={inView ? { pathLength: 1 } : {}}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                />
                {[
                  { x: 10, y: 35 },
                  { x: 30, y: 25 },
                  { x: 50, y: 28 },
                  { x: 70, y: 15 },
                  { x: 90, y: 8 }
                ].map((pt, i) => (
                  <motion.circle
                    key={i}
                    cx={pt.x}
                    cy={pt.y}
                    r="2"
                    fill="#00FF87"
                    initial={anim({ opacity: 0, scale: 0 })}
                    animate={inView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: 0.5 + i * 0.15 }}
                  />
                ))}
              </svg>
            </div>
          </SpotlightCard>

          {/* Card 5: Interview coach */}
          <SpotlightCard
            delay={0.32}
            className="col-span-1"
            inView={inView}
            anim={anim}
          >
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-white tracking-tight">
                Interview coach
              </h3>
              <p className="text-zinc-500 text-xs leading-relaxed">
                Chat with an AI coach that knows your exact interview transcript.
              </p>
            </div>

            {/* Bubble with typing animation */}
            <div className="flex items-center space-x-3 pt-4">
              <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[#00FF87]">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div className="flex space-x-1 items-center bg-zinc-900 border border-zinc-850 rounded-full px-3 py-2 w-fit">
                <motion.span
                  className="w-1.5 h-1.5 bg-[#00FF87] rounded-full"
                  animate={anim({ y: [0, -4, 0] })}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                />
                <motion.span
                  className="w-1.5 h-1.5 bg-[#00FF87] rounded-full"
                  animate={anim({ y: [0, -4, 0] })}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                />
                <motion.span
                  className="w-1.5 h-1.5 bg-[#00FF87] rounded-full"
                  animate={anim({ y: [0, -4, 0] })}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                />
              </div>
            </div>
          </SpotlightCard>

          {/* Card 6: Full transcript */}
          <SpotlightCard
            delay={0.4}
            className="col-span-1 md:col-span-2"
            inView={inView}
            anim={anim}
          >
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-white tracking-tight">
                Full transcript
              </h3>
              <p className="text-zinc-500 text-xs leading-relaxed max-w-md">
                Access a full, detailed text transcription of the conversation with timestamps and roles.
              </p>
            </div>

            {/* Transcript skeleton */}
            <div className="space-y-3 pt-4">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-zinc-600 shrink-0" />
                <motion.div
                  initial={anim({ opacity: 0 })}
                  animate={inView ? { opacity: 0.8 } : {}}
                  transition={{ delay: 0.4 }}
                  className="h-2 w-3/4 bg-zinc-800 rounded"
                />
              </div>
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-zinc-600 shrink-0" />
                <motion.div
                  initial={anim({ opacity: 0 })}
                  animate={inView ? { opacity: 0.6 } : {}}
                  transition={{ delay: 0.55 }}
                  className="h-2 w-1/2 bg-zinc-800 rounded"
                />
              </div>
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-zinc-600 shrink-0" />
                <motion.div
                  initial={anim({ opacity: 0 })}
                  animate={inView ? { opacity: 0.4 } : {}}
                  transition={{ delay: 0.7 }}
                  className="h-2 w-2/3 bg-zinc-800 rounded"
                />
              </div>
            </div>
          </SpotlightCard>

        </div>
      </div>
    </section>
  );
}
