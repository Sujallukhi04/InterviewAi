"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { UserCircle2, Mic, BarChart3 } from "lucide-react";
import { useInView } from "react-intersection-observer";

const steps = [
  {
    num: "01",
    icon: UserCircle2,
    title: "Set up your profile",
    desc: "Tell us your target role and experience. The AI personalizes every question to you."
  },
  {
    num: "02",
    icon: Mic,
    title: "Start your voice interview",
    desc: "Speak naturally. The AI listens to exactly what you said and decides what to ask next."
  },
  {
    num: "03",
    icon: BarChart3,
    title: "Get detailed feedback",
    desc: "A scored report with strengths, weaknesses, and real examples from your answers."
  }
];

export default function HowItWorksSection() {
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
    <section
      id="how-it-works"
      ref={containerRef}
      className="relative bg-black py-24 px-6 overflow-hidden w-full"
    >
      <div className="max-w-5xl mx-auto flex flex-col items-center relative">
        {/* Section Header */}
        <motion.div
          initial={anim({ opacity: 0, y: 20 })}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-xl mb-20 space-y-2"
        >
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#00FF87]">
            The Pipeline
          </span>
          <h2 className="text-3xl md:text-5xl font-serif italic text-white font-light tracking-tight leading-tight">
            How it works
          </h2>
          <p className="text-zinc-500 text-xs font-semibold font-mono tracking-wider">
            An easy three-step cycle to level up your engineering communication.
          </p>
        </motion.div>

        {/* Desktop Animated Connecting Line */}
        <div className="absolute top-[58%] left-12 right-12 h-0.5 z-0 pointer-events-none">
          <motion.svg className="hidden md:block w-full" height="2">
            <motion.line
              x1="0"
              y1="1"
              x2="100%"
              y2="1"
              stroke="#00FF87"
              strokeWidth="1"
              strokeDasharray="6 4"
              initial={anim({ pathLength: 0, opacity: 0 })}
              animate={inView ? { pathLength: 1, opacity: 0.3 } : {}}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
          </motion.svg>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full z-10">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={index}
                initial={anim({ opacity: 0, y: 50 })}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                whileHover={anim({
                  y: -8,
                  borderColor: "#00FF87",
                  boxShadow: "0 0 30px rgba(0,255,135,0.1)"
                })}
                className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl p-8 relative overflow-hidden transition-colors duration-300 select-none group"
              >
                {/* Large Background Step Number */}
                <div className="absolute top-4 right-4 text-8xl font-black text-[#00FF87]/5 select-none pointer-events-none">
                  {step.num}
                </div>

                {/* Icon Wrapper */}
                <motion.div
                  whileHover={anim({ rotate: 10, scale: 1.1 })}
                  className="w-12 h-12 bg-[#00FF87]/10 rounded-xl flex items-center justify-center mb-6 border border-[#00FF87]/10 group-hover:border-[#00FF87]/30 transition-colors"
                >
                  <Icon className="w-6 h-6 text-[#00FF87]" />
                </motion.div>

                {/* Content */}
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white group-hover:text-[#00FF87] transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
