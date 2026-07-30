"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function AiRecommendButton({ onRecommend }: { onRecommend: () => void }) {
  const [loading, setLoading] = useState(false);

  function handleClick() {
    setLoading(true);
    onRecommend();
    setTimeout(() => setLoading(false), 900);
  }

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={handleClick}
      className="relative flex items-center justify-center gap-2 rounded-full bg-love px-6 py-4 text-sm font-medium text-paper shadow-card hover:bg-love-dark transition-colors shrink-0"
    >
      <motion.span
        animate={loading ? { rotate: 360 } : { rotate: 0 }}
        transition={{ duration: 0.9, ease: "easeInOut" }}
      >
        <Sparkles className="h-4 w-4" />
      </motion.span>
      {loading ? "Finding your match…" : "AI Recommend"}
    </motion.button>
  );
}
