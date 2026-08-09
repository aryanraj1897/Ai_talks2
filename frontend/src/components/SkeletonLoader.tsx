"use client";

import React from "react";
import { motion } from "framer-motion";

interface SkeletonLoaderProps {
  type?: "card" | "chat" | "dashboard" | "table";
  count?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  type = "card",
  count = 3,
}) => {
  const shimmerAnimation = {
    initial: { opacity: 0.4 },
    animate: {
      opacity: [0.4, 0.8, 0.4],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut" as const,
      },
    },
  };

  if (type === "chat") {
    return (
      <div className="space-y-4 w-full">
        {Array.from({ length: count }).map((_, i) => (
          <motion.div
            key={i}
            {...shimmerAnimation}
            className={`p-4 rounded-2xl border border-[#1E2638] bg-[#0D111A] space-y-3 ${
              i % 2 === 0 ? "max-w-xl" : "max-w-xl ml-auto bg-[#121826]"
            }`}
          >
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-full bg-slate-800" />
              <div className="h-3 bg-slate-800 rounded w-24" />
            </div>
            <div className="h-3 bg-slate-800 rounded w-full" />
            <div className="h-3 bg-slate-800 rounded w-3/4" />
          </motion.div>
        ))}
      </div>
    );
  }

  if (type === "dashboard") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        {Array.from({ length: count }).map((_, i) => (
          <motion.div
            key={i}
            {...shimmerAnimation}
            className="p-5 rounded-2xl border border-[#1E2638] bg-[#090D16] space-y-3"
          >
            <div className="h-3 bg-slate-800 rounded w-1/3" />
            <div className="h-8 bg-slate-800 rounded w-1/2" />
            <div className="h-2 bg-slate-800 rounded w-full" />
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          {...shimmerAnimation}
          className="p-4 rounded-xl border border-[#1E2638] bg-[#121826] flex items-center space-x-4"
        >
          <div className="w-10 h-10 rounded-full bg-slate-800 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-slate-800 rounded w-1/3" />
            <div className="h-2.5 bg-slate-800 rounded w-2/3" />
          </div>
        </motion.div>
      ))}
    </div>
  );
};
