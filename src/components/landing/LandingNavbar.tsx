"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Mic } from "lucide-react";

export default function LandingNavbar() {
  return (
    <motion.nav
      initial={{ y: -80, x: "-50%", opacity: 0 }}
      animate={{ y: 0, x: "-50%", opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-4 left-1/2 z-50 h-12 px-5 flex items-center justify-between bg-[#070707]/60 border border-zinc-800/40 rounded-full w-[90%] max-w-3xl shadow-[0_12px_40px_rgba(0,0,0,0.5)] backdrop-blur-md select-none"
    >
      {/* Left branding */}
      <Link href="/" className="flex items-center select-none group">
        <div className="w-6 h-6 bg-[#00FF87] rounded-full flex items-center justify-center transition-transform group-hover:scale-105 duration-200">
          <Mic className="w-3.5 h-3.5 text-black" />
        </div>
        <span className="text-white font-extrabold tracking-tight text-xs ml-2">
          InterviewAI
        </span>
      </Link>

      {/* Right CTAs */}
      <div className="flex items-center space-x-3.5">
        <Link href="/login">
          <motion.span
            className="text-zinc-400 hover:text-white text-xs font-semibold transition-colors select-none inline-block cursor-pointer"
            whileHover={{ y: -0.5 }}
          >
            Sign In
          </motion.span>
        </Link>
        <Link href="/login">
          <motion.span
            className="bg-[#00FF87] text-black font-extrabold rounded-full px-3.5 py-1.5 text-xs select-none inline-block cursor-pointer"
            whileHover={{
              scale: 1.03,
              boxShadow: "0 0 15px rgba(0,255,135,0.3)",
            }}
            whileTap={{ scale: 0.98 }}
          >
            Get Started Free
          </motion.span>
        </Link>
      </div>
    </motion.nav>
  );
}
