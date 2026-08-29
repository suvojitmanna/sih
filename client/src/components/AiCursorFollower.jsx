import React, { useEffect, useState, useRef } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";
import { HiSparkles } from "react-icons/hi";
import { BsRobot, BsLightningChargeFill } from "react-icons/bs";
import { FaBrain } from "react-icons/fa";

const AiCursorFollower = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef(null);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Smooth spring physics for fluid follower feel
  const springConfig = { damping: 25, stiffness: 250, mass: 0.5 };
  const smoothX = useSpring(cursorX, springConfig);
  const smoothY = useSpring(cursorY, springConfig);

  useEffect(() => {
    // Only enable on non-touch devices
    if (window.matchMedia("(pointer: coarse)").matches) {
      return;
    }

    const handleMouseMove = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    // Detect hover over interactive elements
    const handleElementHover = (e) => {
      const target = e.target.closest("button, a, input, [role='button'], .cursor-pointer");
      setIsHovered(!!target);
    };

    // Detect mouse scroll animation state
    const handleScroll = () => {
      setIsScrolling(true);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 350);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseenter", handleMouseEnter);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("mouseover", handleElementHover);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseenter", handleMouseEnter);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("mouseover", handleElementHover);
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [cursorX, cursorY, isVisible]);

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[99999] overflow-hidden">
      {/* Outer Glowing Ambient Aura */}
      <motion.div
        style={{
          x: smoothX,
          y: smoothY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          scale: isScrolling ? 2.2 : isHovered ? 1.7 : 1,
          opacity: isScrolling ? 0.9 : isHovered ? 0.8 : 0.4,
        }}
        transition={{ duration: 0.2 }}
        className={`absolute w-12 h-12 rounded-full blur-md pointer-events-none ${
          isScrolling
            ? "bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600"
            : "bg-gradient-to-r from-blue-500/30 via-indigo-500/30 to-teal-400/30"
        }`}
      />

      {/* Floating AI Logo Follower Badge with Scroll Pulse */}
      <motion.div
        style={{
          x: smoothX,
          y: smoothY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          scale: isScrolling ? 1.35 : isHovered ? 1.25 : 1,
          rotate: isScrolling ? [0, 180, 360] : isHovered ? 15 : 0,
        }}
        transition={{
          rotate: isScrolling ? { repeat: Infinity, duration: 0.8, ease: "linear" } : { duration: 0.15 },
          scale: { duration: 0.15 },
        }}
        className="absolute flex items-center justify-center pointer-events-none"
      >
        <div
          className={`flex items-center justify-center p-1.5 rounded-full backdrop-blur-md border shadow-xl transition-all duration-200 ${
            isScrolling
              ? "bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-700 text-white border-cyan-300 shadow-cyan-500/50 scale-125"
              : isHovered
              ? "bg-gradient-to-tr from-blue-600 to-indigo-600 text-white border-amber-300/80 shadow-blue-500/50 scale-110"
              : "bg-white/90 dark:bg-slate-900/90 text-blue-600 dark:text-blue-400 border-blue-400/40 shadow-slate-900/20"
          }`}
        >
          {isScrolling ? (
            <HiSparkles size={14} className="text-amber-300 animate-spin" />
          ) : isHovered ? (
            <HiSparkles size={13} className="text-amber-300 animate-spin" />
          ) : (
            <BsRobot size={12} className="animate-pulse" />
          )}
        </div>

        {/* Mini orbiting energy trail */}
        <motion.div
          animate={{
            scale: isScrolling ? [1, 1.6, 1] : [0.8, 1.2, 0.8],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{ repeat: Infinity, duration: isScrolling ? 0.6 : 1.5 }}
          className={`absolute -top-1 -right-1 rounded-full shadow-xs ${
            isScrolling ? "w-3 h-3 bg-cyan-300 ring-2 ring-cyan-400" : "w-2 h-2 bg-amber-400"
          }`}
        />
      </motion.div>
    </div>
  );
};

export default AiCursorFollower;
