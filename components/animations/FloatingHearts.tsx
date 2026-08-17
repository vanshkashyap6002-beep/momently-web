"use client";

import { useEffect, useState } from "react";

interface HeartItem {
  id: number;
  left: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
  color: string;
}

const COLORS = ["#FDA4AF", "#F43F5E", "#FFFFFF", "#FDE047"];

export default function FloatingHearts() {
  const [hearts, setHearts] = useState<HeartItem[]>([]);

  useEffect(() => {
    // Generate static values client-side to prevent hydration mismatch
    const items: HeartItem[] = Array.from({ length: 24 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: Math.floor(Math.random() * 7) + 6, // 6px - 12px
      opacity: (Math.random() * 0.2 + 0.1), // 10% - 30%
      duration: Math.random() * 6 + 12, // 12s - 18s
      delay: Math.random() * 10,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));
    setHearts(items);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 motion-reduce:hidden"
    >
      {hearts.map((heart) => (
        <svg
          key={heart.id}
          viewBox="0 0 24 24"
          fill={heart.color}
          className="absolute bottom-[-20px] animate-float-heart"
          style={{
            left: `${heart.left}%`,
            width: `${heart.size}px`,
            height: `${heart.size}px`,
            opacity: heart.opacity,
            animationDuration: `${heart.duration}s`,
            animationDelay: `${heart.delay}s`,
          }}
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      ))}
    </div>
  );
}