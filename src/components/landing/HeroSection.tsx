"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ChevronDown, ArrowRight } from "lucide-react";

const ParticleBackground = dynamic(
  () => import("./ParticleBackground"),
  { ssr: false }
);

export default function HeroSection() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse coordinate values for reactive voice orb tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs to glide the orb
  const springX = useSpring(mouseX, { stiffness: 45, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 45, damping: 20 });

  // Map mouse coordinates to subtle translations
  const orbX = useTransform(springX, [-300, 300], [-30, 30]);
  const orbY = useTransform(springY, [-300, 300], [-30, 30]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      setTimeout(() => {
        setReducedMotion(true);
      }, 0);
    }
  }, []);

  const handleMouseMove = (event: React.MouseEvent) => {
    if (reducedMotion || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const anim = <T,>(variants: T): T | Record<string, never> => (reducedMotion ? {} : variants);

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-[100dvh] w-full bg-black flex flex-col justify-between overflow-hidden pt-32 pb-16 px-6 select-none"
    >
      {/* Dynamic Background Particles */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <ParticleBackground />
      </div>

      {/* Central Radial Light Aura */}
      <motion.div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background: "radial-gradient(circle at 50% 50%, rgba(0,255,135,0.04) 0%, transparent 60%)"
        }}
        animate={anim({
          opacity: [0.5, 0.8, 0.5],
          scale: [0.95, 1.05, 0.95]
        })}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Hero Content Column */}
      <div className="relative z-10 max-w-4xl mx-auto w-full flex flex-col items-center text-center my-auto">
        
        {/* Eyebrow tag */}
        <motion.span
          initial={anim({ opacity: 0, y: 15 })}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-[#00FF87] mb-6"
        >
          InterviewAI &bull; Next-Gen Voice Mocking
        </motion.span>

        {/* Display Headline */}
        <motion.h1
          initial={anim({ opacity: 0, y: 25 })}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="text-4xl sm:text-6xl md:text-7xl font-serif italic text-white font-light tracking-tight leading-[1.1] mb-6 max-w-3xl"
        >
          The AI Voice Interviewer.
        </motion.h1>

        {/* Short Subheading */}
        <motion.p
          initial={anim({ opacity: 0, y: 15 })}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-base sm:text-lg text-zinc-400 max-w-md mb-8 leading-relaxed"
        >
          Talk to an AI interviewer that listens and responds to what you say in real time.
        </motion.p>

        {/* Floating rounded Action Button */}
        <motion.div
          initial={anim({ opacity: 0, y: 15 })}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mb-14"
        >
          <Link href="/login">
            <motion.span
              whileHover={anim({ scale: 1.04, boxShadow: "0 0 35px rgba(0,255,135,0.4)" })}
              whileTap={{ scale: 0.98 }}
              className="bg-[#00FF87] text-black font-extrabold rounded-full px-8 py-3.5 text-sm select-none cursor-pointer flex items-center justify-center space-x-2 inline-flex"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </motion.span>
          </Link>
        </motion.div>

        {/* Immersive voice sphere device mockup */}
        <motion.div
          initial={anim({ opacity: 0, y: 35 })}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-lg border border-zinc-800/40 bg-zinc-950/40 rounded-2xl p-8 relative overflow-hidden backdrop-blur-sm flex flex-col items-center justify-center h-52 group"
        >
          {/* Subtle Grid backdrop */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

          {/* Mouse-reactive morphing voice orb */}
          <motion.div
            className="w-24 h-24 rounded-full bg-[#00FF87] filter blur-[40px] absolute opacity-20 pointer-events-none"
            style={{ x: orbX, y: orbY }}
            animate={anim({
              scale: [1, 1.2, 1],
              opacity: [0.18, 0.25, 0.18]
            })}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Core Interactive Ring */}
          <motion.div
            className="w-16 h-16 rounded-full border border-[#00FF87]/30 bg-black/40 flex items-center justify-center relative shadow-[0_0_30px_rgba(0,255,135,0.1)]"
            style={{ x: orbX, y: orbY }}
            whileHover={anim({ scale: 1.08 })}
          >
            {/* Morphing waves inside ring */}
            <motion.div
              className="absolute inset-2.5 rounded-full border-2 border-dashed border-[#00FF87]/40"
              animate={anim({ rotate: 360 })}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            />
            <span className="w-2 h-2 rounded-full bg-[#00FF87] animate-pulse" />
          </motion.div>

          <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mt-6 select-none group-hover:text-zinc-400 transition-colors">
            Interactive voice sphere &bull; Hover viewport
          </span>
        </motion.div>

      </div>

      {/* Bottom Scroll anchor */}
      <motion.div
        className="relative z-10 flex flex-col items-center cursor-pointer mt-4"
        animate={anim({ y: [0, 6, 0] })}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <ChevronDown className="w-5 h-5 text-zinc-650 hover:text-[#00FF87] transition-colors" />
      </motion.div>
    </section>
  );
}
