import React, { useEffect, useState, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import {
  motion,
  AnimatePresence,
  useScroll,
  useSpring,
  useMotionValue,
  animate,
} from "framer-motion";
import { FaArrowUp } from "react-icons/fa";
import { MdDragIndicator } from "react-icons/md";

const HELPDESK_ROUTES = new Set([
  "",
  "/",
  "/welcome",
  "/dashboard",
  "/history",
  "/admin",
]);

const isHelpdeskRoute = (pathname) => {
  const clean = (pathname || "").replace(/\/+$/, "") || "/";
  return HELPDESK_ROUTES.has(clean) || clean.startsWith("/admin");
};

const ScrollProgressBar = () => {
  const location = useLocation();
  const { scrollYProgress } = useScroll();
  const [scrollPercent, setScrollPercent] = useState(0);
  const [isScrollable, setIsScrollable] = useState(false);

  const boundaryRef = useRef(null);
  const isDraggingRef = useRef(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const hasHelpdesk = isHelpdeskRoute(location.pathname);

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const updateScroll = useCallback(() => {
    const scrollTop =
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;
    const scrollHeight = Math.max(
      document.documentElement.scrollHeight,
      document.body.scrollHeight,
      document.documentElement.offsetHeight,
      document.body.offsetHeight
    );
    const clientHeight =
      window.innerHeight || document.documentElement.clientHeight || 0;
    const maxScroll = scrollHeight - clientHeight;

    if (maxScroll <= 20) {
      setScrollPercent(0);
      setIsScrollable(false);
      return;
    }

    setIsScrollable(true);
    const pct = Math.min(
      100,
      Math.max(0, Math.round((scrollTop / maxScroll) * 100))
    );
    setScrollPercent(pct);
  }, []);

  useEffect(() => {
    updateScroll();

    window.addEventListener("scroll", updateScroll, { passive: true });
    window.addEventListener("resize", updateScroll, { passive: true });

    let observer;
    if (typeof ResizeObserver !== "undefined" && document.body) {
      observer = new ResizeObserver(() => {
        updateScroll();
      });
      observer.observe(document.body);
    }

    const t1 = setTimeout(updateScroll, 100);
    const t2 = setTimeout(updateScroll, 500);
    const t3 = setTimeout(updateScroll, 1200);

    return () => {
      window.removeEventListener("scroll", updateScroll);
      window.removeEventListener("resize", updateScroll);
      if (observer) observer.disconnect();
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [location.pathname, updateScroll]);

  const scrollToTop = () => {
    if (isDraggingRef.current) return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetPosition = (e) => {
    e?.stopPropagation?.();
    animate(x, 0, { type: "spring", stiffness: 350, damping: 25 });
    animate(y, 0, { type: "spring", stiffness: 350, damping: 25 });
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-[120] pointer-events-none h-1 bg-transparent">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 origin-left shadow-xs shadow-blue-500/50"
          style={{ scaleX }}
        />
      </div>

      <div
        ref={boundaryRef}
        className="fixed inset-1 pointer-events-none z-40"
      >
        <AnimatePresence>
          {isScrollable && (
            <motion.div
              drag
              style={{ x, y }}
              dragConstraints={boundaryRef}
              dragMomentum={false}
              dragElastic={0.08}
              onDragStart={() => {
                isDraggingRef.current = true;
              }}
              onDragEnd={() => {
                setTimeout(() => {
                  isDraggingRef.current = false;
                }, 120);
              }}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.2 }}
              whileHover={{ scale: 1.05 }}
              whileDrag={{ scale: 1.1, zIndex: 60 }}
              whileTap={{ scale: 0.95 }}
              onClick={scrollToTop}
              onDoubleClick={resetPosition}
              title={`Scroll to top (${scrollPercent}%) • Drag to move anywhere on screen • Double-click to reset`}
              aria-label={`Scroll progress ${scrollPercent}%, drag to move or click to scroll to top`}
              className={`pointer-events-auto absolute ${
                hasHelpdesk ? "bottom-20" : "bottom-2"
              } right-2 flex items-center gap-1.5 sm:gap-2 py-2 px-2.5 sm:py-2.5 sm:px-3 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 shadow-xl dark:shadow-2xl text-slate-700 dark:text-slate-200 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-grab active:cursor-grabbing group select-none`}
            >
              <div
                className="text-slate-400 dark:text-slate-500 group-hover:text-blue-500 transition-colors"
                title="Drag to move anywhere"
              >
                <MdDragIndicator size={16} />
              </div>

              <div className="relative w-6 h-6 flex items-center justify-center shrink-0">
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
                <FaArrowUp
                  size={8}
                  className="absolute text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:-translate-y-0.5 transition-transform"
                />
              </div>

              {/* Scroll percentage readout */}
              <span className="text-xs font-mono font-black tracking-tight pr-1">
                {scrollPercent}%
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default ScrollProgressBar;
