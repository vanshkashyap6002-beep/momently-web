"use client";

import { useEffect, useState } from "react";

export default function IntroOverlay() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    try {
      const lastShown = localStorage.getItem("momently_intro_timestamp");
      const oneDay = 24 * 60 * 60 * 1000;
      if (!lastShown || Date.now() - parseInt(lastShown, 10) > oneDay) {
        setVisible(true);
        localStorage.setItem("momently_intro_timestamp", Date.now().toString());
      }
    } catch {
      setVisible(false);
    }
  }, []);

  useEffect(() => {
    if (!visible) return;

    const t1 = setTimeout(() => setStep(1), 600);
    const t2 = setTimeout(() => setStep(2), 1200);
    const t3 = setTimeout(() => setStep(3), 1800);
    const t4 = setTimeout(() => setVisible(false), 3400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <aside
      aria-label="Welcome announcement"
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/95 backdrop-blur-md transition-opacity duration-700 motion-reduce:hidden"
    >
      <div className="text-center space-y-3 px-6">
        <h1 className="text-2xl md:text-3xl font-light tracking-wide text-gray-200">
          <span className={`block transition-all duration-700 ${step >= 0 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
            Every Memory
          </span>
          <span className={`block transition-all duration-700 ${step >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
            Deserves Its Own Place
          </span>
          <span className={`block font-serif italic text-rose-300 transition-all duration-700 ${step >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
            On The Internet
          </span>
        </h1>
        <p className={`text-sm text-gray-400 font-medium tracking-widest uppercase transition-all duration-700 ${step >= 3 ? "opacity-100" : "opacity-0"}`}>
          Create Yours &rarr;
        </p>
      </div>
    </aside>
  );
}