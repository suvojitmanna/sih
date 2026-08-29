import React, { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { FaArrowUp } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";

const ScrollProgressBar = () => {
  const { scrollYProgress, scrollY } = useScroll();
  const [scrollPercent, setScrollPercent] = useState(0);
  const [showScrollHUD, setShowScrollHUD] = useState(false);

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      const pct = Math.round(latest * 100);
      setScrollPercent(pct);
      setShowScrollHUD(latest > 0.04);
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {/* Top Gradient Progress Line */}
      <div className="fixed top-0 left-0 right-0 z-[120] pointer-events-none h-1 bg-transparent">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 origin-left shadow-sm shadow-blue-500/50"
          style={{ scaleX }}
        />
      </div>

      {/* Floating Bottom-Right Interactive Scroll HUD & Back to Top */}
      {showScrollHUD && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={scrollToTop}
          title="Scroll to Top"
          className="fixed bottom-6 right-6 z-[99] flex items-center gap-2 p-2.5 px-3.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-2xl text-slate-700 dark:text-slate-200 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all cursor-pointer group"
        >
          {/* Circular Percentage Ring */}
          <div className="relative w-6 h-6 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-200 dark:text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-blue-600 dark:text-blue-400 transition-all duration-150"
                strokeDasharray={`${scrollPercent}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <FaArrowUp size={8} className="absolute group-hover:-translate-y-0.5 transition-transform" />
          </div>

          <span className="text-[11px] font-mono font-black">{scrollPercent}%</span>
        </motion.button>
      )}
    </>
  );
};

export default ScrollProgressBar;
