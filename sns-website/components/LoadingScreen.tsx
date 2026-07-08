"use client";

import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";

const STATUS_MESSAGES = [
  "Initializing premium experience...",
  "Loading services...",
  "Preparing your garage...",
  "Almost ready...",
];

const MIN_DISPLAY_MS = 3000; // minimum time to show loading screen
const FAILSAFE_MS = 9000;    // force-hide after 9s regardless

export function LoadingScreen() {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [minTimeDone, setMinTimeDone] = useState(false);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const statusIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Animate progress bar over MIN_DISPLAY_MS
    const startTime = Date.now();
    const duration = MIN_DISPLAY_MS;

    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const rawProgress = Math.min((elapsed / duration) * 100, 95);
      setProgress(rawProgress);
    }, 30);

    // Cycle status messages
    statusIntervalRef.current = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % STATUS_MESSAGES.length);
    }, 750);

    // Minimum display timer
    const minTimer = setTimeout(() => {
      setMinTimeDone(true);
    }, MIN_DISPLAY_MS);

    // Listen for page load event
    const handleLoad = () => setIsReady(true);

    if (document.readyState === "complete") {
      setIsReady(true);
    } else {
      window.addEventListener("load", handleLoad);
    }

    // Failsafe: force hide after 9 seconds
    const failsafe = setTimeout(() => {
      setProgress(100);
      setVisible(false);
    }, FAILSAFE_MS);

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (statusIntervalRef.current) clearInterval(statusIntervalRef.current);
      clearTimeout(minTimer);
      clearTimeout(failsafe);
      window.removeEventListener("load", handleLoad);
    };
  }, []);

  // Dismiss when BOTH conditions are met
  useEffect(() => {
    if (isReady && minTimeDone) {
      setProgress(100);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (statusIntervalRef.current) clearInterval(statusIntervalRef.current);
      const dismissTimer = setTimeout(() => setVisible(false), 500);
      return () => clearTimeout(dismissTimer);
    }
  }, [isReady, minTimeDone]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="loading-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-between overflow-hidden"
          style={{ background: "#0A0E17" }}
        >
          {/* ── Top: Chrome shimmer line ── */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#3B82F6] to-transparent opacity-80" />

          {/* ── Corner glow blobs ── */}
          <div className="absolute top-0 left-0 w-[300px] h-[300px] bg-[#3B82F6] opacity-[0.04] rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#3B82F6] opacity-[0.04] rounded-full blur-[120px] translate-x-1/3 translate-y-1/3" />

          {/* ── Header row: Logo + Tag ── */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="w-full flex items-center justify-between px-6 md:px-10 pt-6 md:pt-8 z-10"
          >
            <Image
              src="/logo.jpg"
              alt="S.N.S Car Care"
              width={110}
              height={36}
              className="h-8 md:h-10 w-auto object-contain rounded-[4px] opacity-90"
              priority
            />
            <span className="px-2.5 py-1 rounded-full border border-[#3B82F6]/30 bg-[#3B82F6]/10 text-[#60A5FA] text-[10px] font-bold uppercase tracking-widest">
              Premium
            </span>
          </motion.div>

          {/* ── Center: Video ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative z-10 flex-1 flex items-center justify-center w-full px-4 py-4"
          >
            {/* Vignette overlay around video */}
            <div
              className="absolute inset-0 pointer-events-none z-20"
              style={{
                background:
                  "radial-gradient(ellipse 70% 65% at 50% 50%, transparent 40%, #0A0E17 100%)",
              }}
            />

            <div className="relative w-full max-w-[720px] aspect-video rounded-[12px] overflow-hidden">
              {/* Glowing border behind video */}
              <div className="absolute -inset-[1px] rounded-[13px] bg-gradient-to-br from-[#3B82F6]/20 via-transparent to-[#C0C8D4]/10 blur-[1px]" />

              <video
                src="/videos/loading-screen.mp4"
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover rounded-[12px]"
              />
            </div>
          </motion.div>

          {/* ── Footer: Progress bar + Tagline ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="w-full px-6 md:px-10 pb-8 md:pb-10 z-10 space-y-4"
          >
            {/* Status row */}
            <div className="flex items-center justify-between text-xs">
              <AnimatePresence mode="wait">
                <motion.span
                  key={statusIndex}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.25 }}
                  className="text-[#64748B] font-medium"
                >
                  {STATUS_MESSAGES[statusIndex]}
                </motion.span>
              </AnimatePresence>
              <span className="text-[#3B82F6] font-bold tabular-nums">
                {Math.round(progress)}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="relative h-[3px] w-full rounded-full bg-[#1E293B] overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  width: `${progress}%`,
                  background:
                    "linear-gradient(90deg, #2563EB 0%, #3B82F6 50%, #60A5FA 100%)",
                  boxShadow: "0 0 10px 1px rgba(59, 130, 246, 0.5)",
                }}
                transition={{ ease: "linear" }}
              />
              {/* Shimmer traveling across the bar */}
              <div
                className="absolute inset-0 opacity-60"
                style={{
                  background:
                    "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 1.2s ease-in-out infinite",
                }}
              />
            </div>

            {/* Tagline */}
            <p className="text-center text-[11px] tracking-[0.25em] uppercase text-[#2D3A52] font-semibold select-none">
              Care.&nbsp;&nbsp;Shine.&nbsp;&nbsp;Defend.
            </p>
          </motion.div>

          {/* ── Bottom chrome line ── */}
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C0C8D4]/20 to-transparent" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
