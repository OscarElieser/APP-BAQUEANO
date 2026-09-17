"use client";

/**
 * WHY
 * Gives the public site a subtle exploration signal without distracting from reading.
 *
 * HOW
 * Tracks document scroll progress with a fixed transform bar and honors reduced motion via CSS.
 *
 * WHAT
 * Lightweight scroll progress indicator for public pages.
 */
import { useEffect, useState } from "react";

export function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function updateProgress() {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(scrollable > 0 ? window.scrollY / scrollable : 0);
    }

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  return <div className="fixed left-0 top-0 z-[60] h-1 origin-left bg-[#F65E01]" style={{ transform: `scaleX(${progress})`, width: "100%" }} />;
}
