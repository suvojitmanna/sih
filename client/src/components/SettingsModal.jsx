import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BsLayoutSidebar,
  BsLayoutSidebarInsetReverse,
  BsSun,
  BsMoonStars,
  BsDisplay,
  BsCheckCircleFill,
  BsGearFill,
} from "react-icons/bs";
import { HiX } from "react-icons/hi";
import { FaUserGraduate } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useNavigation } from "../context/NavigationContext";
import { useTheme } from "../context/ThemeContext";
import toast from "react-hot-toast";

const SettingsModal = ({ isOpen, onClose }) => {
  const { navMode, setNavMode } = useNavigation();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { userData } = useSelector((state) => state.user);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleSelectNavMode = (mode) => {
    if (navMode === mode) return;
    setNavMode(mode);
    toast.success(`Navigation layout changed to ${mode === "sidebar" ? "Sidebar Rail" : "Horizontal Navbar"}`);
  };

  const handleSelectTheme = (mode) => {
    if (theme === mode) return;
    setTheme(mode);
    const label = mode === "system" ? "System Default" : mode === "dark" ? "Dark Mode" : "Light Mode";
    toast.success(`Theme updated to ${label}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 my-auto"
          >
            {/* Top Tricolor Accent Line */}
            <div className="h-1.5 w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />

            {/* Header */}
            <div className="p-5 sm:p-6 pb-4 flex items-start justify-between border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-xs">
                  <BsGearFill size={20} className="animate-spin-slow" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                    Preferences & Settings
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Configure your navigation layout, interface theme, and workspace.
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Close Settings (Esc)"
              >
                <HiX size={20} />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
              {/* SECTION 1: NAVIGATION LAYOUT */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <BsLayoutSidebar className="text-blue-600 dark:text-blue-400" size={14} />
                      Navigation Layout
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Choose how you navigate across modules and academy tools.
                    </p>
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/50">
                    Active: {navMode === "sidebar" ? "Sidebar" : "Navbar"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Option 1: Sidebar */}
                  <div
                    onClick={() => handleSelectNavMode("sidebar")}
                    className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between group ${
                      navMode === "sidebar"
                        ? "border-blue-600 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 shadow-md ring-2 ring-blue-500/20"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/40"
                    }`}
                  >
                    {navMode === "sidebar" && (
                      <div className="absolute top-3 right-3 text-blue-600 dark:text-blue-400">
                        <BsCheckCircleFill size={16} />
                      </div>
                    )}

                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
                          <BsLayoutSidebar size={16} />
                        </div>
                        <div>
                          <div className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                            Sidebar Dock
                          </div>
                          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                            Modern & Collapsible
                          </span>
                        </div>
                      </div>

                      {/* Visual Wireframe Diagram */}
                      <div className="h-16 w-full rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 p-1.5 flex gap-1.5 overflow-hidden">
                        <div className="w-1/4 h-full rounded-lg bg-blue-600/80 dark:bg-blue-500/80 flex flex-col gap-1 p-1">
                          <div className="w-full h-2 rounded bg-white/40" />
                          <div className="w-3/4 h-1.5 rounded bg-white/30" />
                          <div className="w-2/3 h-1.5 rounded bg-white/30" />
                        </div>
                        <div className="flex-1 h-full rounded-lg bg-white dark:bg-slate-800/60 p-1.5 flex flex-col gap-1">
                          <div className="w-full h-2 rounded bg-slate-200 dark:bg-slate-700" />
                          <div className="w-3/4 h-3 rounded bg-slate-200 dark:bg-slate-700" />
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        Fixed vertical dock on the left with collapsible rail (~76px / 260px) and fast navigation sections.
                      </p>
                    </div>
                  </div>

                  {/* Option 2: Top Navbar */}
                  <div
                    onClick={() => handleSelectNavMode("topbar")}
                    className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between group ${
                      navMode === "topbar"
                        ? "border-blue-600 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 shadow-md ring-2 ring-blue-500/20"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/40"
                    }`}
                  >
                    {navMode === "topbar" && (
                      <div className="absolute top-3 right-3 text-blue-600 dark:text-blue-400">
                        <BsCheckCircleFill size={16} />
                      </div>
                    )}

                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          <BsLayoutSidebarInsetReverse size={16} />
                        </div>
                        <div>
                          <div className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                            Top Navbar
                          </div>
                          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                            Classic Full-Width
                          </span>
                        </div>
                      </div>

                      {/* Visual Wireframe Diagram */}
                      <div className="h-16 w-full rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 p-1.5 flex flex-col gap-1.5 overflow-hidden">
                        <div className="w-full h-3.5 rounded-lg bg-blue-600/80 dark:bg-blue-500/80 flex items-center justify-between px-1.5">
                          <div className="w-8 h-1.5 rounded bg-white/60" />
                          <div className="flex gap-1">
                            <div className="w-3 h-1.5 rounded bg-white/40" />
                            <div className="w-3 h-1.5 rounded bg-white/40" />
                          </div>
                        </div>
                        <div className="flex-1 rounded-lg bg-white dark:bg-slate-800/60 p-1.5 flex flex-col gap-1">
                          <div className="w-full h-2 rounded bg-slate-200 dark:bg-slate-700" />
                          <div className="w-2/3 h-3 rounded bg-slate-200 dark:bg-slate-700" />
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        Horizontal top navbar keeping 100% full screen width available for wide tables and statistical charts.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: THEME & APPEARANCE */}
              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      {theme === "dark" ? (
                        <BsMoonStars className="text-indigo-400" size={14} />
                      ) : theme === "light" ? (
                        <BsSun className="text-amber-500" size={14} />
                      ) : (
                        <BsDisplay className="text-blue-500" size={14} />
                      )}
                      Theme & Color Mode
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Select daylight, dark obsidian, or synchronize with your OS.
                    </p>
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 capitalize border border-slate-200/60 dark:border-slate-700/60">
                    Active: {theme} ({resolvedTheme})
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  {/* Light Mode */}
                  <button
                    type="button"
                    onClick={() => handleSelectTheme("light")}
                    className={`relative p-3 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center gap-2 text-center ${
                      theme === "light"
                        ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 shadow-sm ring-2 ring-amber-500/20"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/40"
                    }`}
                  >
                    {theme === "light" && (
                      <div className="absolute top-2 right-2 text-amber-500">
                        <BsCheckCircleFill size={13} />
                      </div>
                    )}
                    <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-500 flex items-center justify-center shadow-2xs">
                      <BsSun size={18} />
                    </div>
                    <div>
                      <div className="font-extrabold text-xs text-slate-900 dark:text-white">Light</div>
                      <div className="text-[9px] text-slate-500 dark:text-slate-400">Daylight</div>
                    </div>
                  </button>

                  {/* Dark Mode */}
                  <button
                    type="button"
                    onClick={() => handleSelectTheme("dark")}
                    className={`relative p-3 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center gap-2 text-center ${
                      theme === "dark"
                        ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-sm ring-2 ring-indigo-500/20"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/40"
                    }`}
                  >
                    {theme === "dark" && (
                      <div className="absolute top-2 right-2 text-indigo-400">
                        <BsCheckCircleFill size={13} />
                      </div>
                    )}
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-400 flex items-center justify-center shadow-2xs">
                      <BsMoonStars size={18} />
                    </div>
                    <div>
                      <div className="font-extrabold text-xs text-slate-900 dark:text-white">Dark</div>
                      <div className="text-[9px] text-slate-500 dark:text-slate-400">Obsidian</div>
                    </div>
                  </button>

                  {/* System Default */}
                  <button
                    type="button"
                    onClick={() => handleSelectTheme("system")}
                    className={`relative p-3 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center gap-2 text-center ${
                      theme === "system"
                        ? "border-blue-600 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 shadow-sm ring-2 ring-blue-500/20"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/40"
                    }`}
                  >
                    {theme === "system" && (
                      <div className="absolute top-2 right-2 text-blue-600 dark:text-blue-400">
                        <BsCheckCircleFill size={13} />
                      </div>
                    )}
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-2xs">
                      <BsDisplay size={18} />
                    </div>
                    <div>
                      <div className="font-extrabold text-xs text-slate-900 dark:text-white">System</div>
                      <div className="text-[9px] text-slate-500 dark:text-slate-400">Sync OS</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* SECTION 3: OFFICER CADRE PROFILE SUMMARY */}
              {userData && (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-700 text-white flex items-center justify-center font-black text-xs shadow-xs">
                      {userData.name ? userData.name.charAt(0).toUpperCase() : <FaUserGraduate size={14} />}
                    </div>
                    <div>
                      <span className="font-black text-xs text-slate-900 dark:text-white block">
                        {userData.name}
                      </span>
                      <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold block">
                        {userData.jobRole || "ISS Officer"} • {userData.email}
                      </span>
                    </div>
                  </div>
                  <span className="text-[9px] font-black px-2 py-1 rounded-md bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300">
                    Active Session
                  </span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 sm:p-5 bg-slate-50/80 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                Preferences persist automatically in browser storage.
              </span>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-black rounded-xl shadow-md cursor-pointer transition-all active:scale-95"
              >
                Done
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SettingsModal;
