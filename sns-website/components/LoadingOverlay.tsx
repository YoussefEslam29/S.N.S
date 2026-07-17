"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

interface LoadingOverlayProps {
  show: boolean;
  message?: string;
}

export function LoadingOverlay({ show, message = "Please wait..." }: LoadingOverlayProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-background/80 backdrop-blur-md"
        >
          {/* Glowing background blob */}
          <div className="absolute w-[250px] h-[250px] bg-[#3B82F6] opacity-[0.08] rounded-full blur-[80px]" />

          <div className="relative z-10 flex flex-col items-center space-y-4 p-6 rounded-[8px] border border-border bg-surface-elevated/40 max-w-xs text-center shadow-xl">
            {/* Spinning chrome loader */}
            <div className="relative flex items-center justify-center w-12 h-12">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <div className="absolute inset-0 rounded-full border border-primary/20 blur-[1px]" />
            </div>

            <div className="space-y-1.5">
              <p className="text-sm font-semibold text-text-primary">
                {message}
              </p>
              <p className="text-[10px] tracking-[0.2em] uppercase text-text-muted font-bold">
                Care. Shine. Defend.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
