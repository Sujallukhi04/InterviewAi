"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { useInView } from "react-intersection-observer";

export default function TestimonialSection() {
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
    <section ref={containerRef} className="bg-black py-24 px-6 w-full overflow-hidden text-center">
      <div className="max-w-3xl mx-auto flex flex-col items-center">
        <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#00FF87] mb-2 select-none">
          Candidate Story
        </span>
        {/* Large Quote Mark */}
        <motion.div
          initial={anim({ opacity: 0, scale: 0.8 })}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="text-[120px] leading-none text-[#00FF87]/15 font-serif select-none mb-0 h-16 flex items-center justify-center"
        >
          &ldquo;
        </motion.div>

        {/* Quote Text */}
        <motion.p
          initial={anim({ opacity: 0, y: 20 })}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="text-lg md:text-2xl text-zinc-100 font-semibold leading-relaxed tracking-tight max-w-2xl mt-8 mb-6"
        >
          The AI actually called me out when I gave a vague answer. It asked me exactly what I did — not what the team did. No prep tool has ever done that.
        </motion.p>

        {/* Attribution */}
        <motion.div
          initial={anim({ opacity: 0, y: 15 })}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-[#888888] text-sm font-medium mb-8 select-none"
        >
          &mdash; Computer Science student, SDE interview prep
        </motion.div>

        {/* Star Rating */}
        <div className="flex items-center space-x-1.5 justify-center">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              initial={anim({ opacity: 0, scale: 0 })}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.5 + i * 0.1, type: "spring", stiffness: 200 }}
              className="text-[#00FF87]"
            >
              <Star className="w-4 h-4 fill-[#00FF87]" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
