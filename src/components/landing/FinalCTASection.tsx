"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useInView } from "react-intersection-observer";

export default function FinalCTASection() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const { ref: containerRef, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      setTimeout(() => {
        setReducedMotion(true);
      }, 0);
    }
  }, []);

  const anim = <T,>(variants: T): T | Record<string, never> =>
    reducedMotion ? {} : variants;

  const words = "Stop preparing. Start practicing.".split(" ");

  return (
    <section
      ref={containerRef}
      className="bg-black py-32 px-6 w-full text-center relative overflow-hidden flex flex-col items-center justify-center"
    >
      {/* CSS Shimmer Keyframes Injector */}
      <style>{`
        @keyframes cta-shimmer {
          0% { background-position: -200% center }
          100% { background-position: 200% center }
        }
        .shimmer-btn {
          background: linear-gradient(90deg, #00FF87 0%, #00FF87 40%, #7fffd4 50%, #00FF87 60%, #00FF87 100%);
          background-size: 200% auto;
          animation: cta-shimmer 3s linear infinite;
        }
      `}</style>

      {/* Large Green Glow Background */}
      <motion.div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(0,255,135,0.1) 0%, transparent 60%)",
        }}
        animate={anim({
          scale: [1, 1.15, 1],
          opacity: [0.8, 1, 0.8],
        })}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="relative z-10 flex flex-col items-center max-w-3xl mx-auto">
        <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#00FF87] mb-4 select-none">
          The Outcome
        </span>

        {/* Animated Headline */}
        <h2 className="text-4xl md:text-6xl font-serif italic text-white font-light mb-6 leading-tight tracking-tight">
          {words.map((word, i) => (
            <motion.span
              key={i}
              initial={anim({ opacity: 0, y: 20 })}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.06, duration: 0.5 }}
              className="inline-block mr-3 md:mr-4"
            >
              {word}
            </motion.span>
          ))}
        </h2>

        {/* Subheading */}
        <motion.p
          initial={anim({ opacity: 0, y: 15 })}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-zinc-550 text-xs sm:text-sm font-semibold font-mono tracking-wider mb-10"
        >
          Your next interview could be your best one.
        </motion.p>

        {/* Shimmering CTA Button */}
        <Link href="/login">
          <motion.span
            whileHover={anim({
              scale: 1.06,
              boxShadow: "0 0 60px rgba(0,255,135,0.6)",
            })}
            whileTap={{ scale: 0.5 }}
            className="shimmer-btn rounded-full px-12 py-5 text-md md:text-md font-black text-black select-none cursor-pointer inline-block"
          >
            Get Started Free
          </motion.span>
        </Link>

        {/* Info label */}
        <div className="text-[#888888] text-xs font-semibold mt-5 select-none tracking-wide">
          No credit card required &bull; Takes 30 seconds
        </div>
      </div>
    </section>
  );
}
