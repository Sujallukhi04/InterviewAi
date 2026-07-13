"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useMotionTemplate } from "framer-motion";
import { MessageSquare, Code2, Network, Heart, ArrowRight } from "lucide-react";
import { useInView } from "react-intersection-observer";

const types = [
  {
    icon: MessageSquare,
    name: "Behavioral",
    desc: "Communication, STAR structure, and self-awareness.",
    color: "#3B82F6",
    delay: 0
  },
  {
    icon: Code2,
    name: "Technical",
    desc: "Depth of knowledge, data structures, and problem-solving approach.",
    color: "#8B5CF6",
    delay: 0.08
  },
  {
    icon: Network,
    name: "System Design",
    desc: "Architecture thinking, distributed tradeoffs, and complexity.",
    color: "#F97316",
    delay: 0.16
  },
  {
    icon: Heart,
    name: "HR / Culture Fit",
    desc: "Motivation alignment, leadership values, and situational judgment.",
    color: "#00FF87",
    delay: 0.24
  }
];

interface CardProps {
  className?: string;
  children: React.ReactNode;
  delay?: number;
  inView: boolean;
  themeColor: string;
  anim: <T,>(variants: T) => T | Record<string, never>;
}

function TypeCard({ className = "", children, delay = 0, inView, themeColor, anim }: CardProps) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div
      initial={anim({ opacity: 0, y: 30 })}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.6 }}
      whileHover={anim({ y: -4 })}
      onMouseMove={handleMouseMove}
      className={`relative overflow-hidden group bg-[#0A0A0A] border border-zinc-800/30 rounded-2xl p-6 transition-all duration-300 select-none cursor-pointer flex flex-col justify-between min-h-[200px] ${className}`}
    >
      {/* Spotlight overlay matching the card theme color */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              160px circle at ${mouseX}px ${mouseY}px,
              ${themeColor}12,
              transparent 80%
            )
          `
        }}
      />
      <div className="relative z-20 flex flex-col items-start w-full h-full">
        {children}
      </div>
    </motion.div>
  );
}

export default function InterviewTypesSection() {
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
    <section ref={containerRef} className="bg-black py-24 px-6 w-full overflow-hidden">
      <div className="max-w-5xl mx-auto flex flex-col items-center">
        {/* Section Header */}
        <div className="text-center max-w-xl mb-20 space-y-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#00FF87]">
            Specializations
          </span>
          <h2 className="text-3xl md:text-5xl font-serif italic text-white font-light tracking-tight leading-tight">
            Four types. One platform.
          </h2>
          <p className="text-zinc-500 text-xs font-semibold font-mono tracking-wider">
            Pick your focus. The AI adapts.
          </p>
        </div>

        {/* Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
          {types.map((type, index) => {
            const Icon = type.icon;
            return (
              <TypeCard
                key={index}
                delay={type.delay}
                themeColor={type.color}
                inView={inView}
                anim={anim}
              >
                {/* Icon Wrapper */}
                <div
                  className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800/40 flex items-center justify-center mb-6 shadow-inner group-hover:border-zinc-700 transition-colors"
                >
                  <Icon className="w-5 h-5 transition-transform group-hover:scale-105" style={{ color: type.color }} />
                </div>

                {/* Title */}
                <div className="flex items-center space-x-2.5 mb-2">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: type.color }}
                  />
                  <h3 className="text-base font-bold text-white tracking-tight">
                    {type.name}
                  </h3>
                </div>

                {/* Description */}
                <p className="text-zinc-500 text-xs sm:text-sm leading-relaxed max-w-md">
                  {type.desc}
                </p>

                {/* Glide indicator */}
                <ArrowRight
                  className="w-4 h-4 absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300"
                  style={{ color: type.color }}
                />
              </TypeCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
