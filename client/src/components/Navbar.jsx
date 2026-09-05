import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  BsChevronDown,
  BsBarChartLine,
  BsShieldLock,
  BsSun,
  BsMoonStars,
  BsDisplay,
} from "react-icons/bs";
import {
  FaUserGraduate,
  FaHistory,
  FaFilePdf,
  FaHome,
} from "react-icons/fa";
import { HiOutlineLogout, HiMenu, HiX, HiSparkles } from "react-icons/hi";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { ServerUrl } from "../App";
import { setUserData } from "../redux/userSlice";
import { useOutsideClick } from "../utils/outsideClick";
import { generateCompetencyPDF } from "../utils/pdfGenerator";
import { useTheme } from "../context/ThemeContext";
import AuthModel from "./AuthModel";
import toast from "react-hot-toast";

const Navbar = () => {
  const { userData } = useSelector((state) => state.user);
  const [showUserPopup, setShowUserPopup] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { theme, setTheme, resolvedTheme } = useTheme();
  const userRef = useOutsideClick(() => setShowUserPopup(false));

  const handleLogout = async () => {
    try {
      await axios.post(`${ServerUrl}/api/auth/logout`, {}, { withCredentials: true });
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.clear();
      dispatch(setUserData(null));
      setShowUserPopup(false);
      navigate("/auth");
    } catch (error) {
      console.log(error);
    }
  };

  const handleDownloadDossier = () => {
    if (!userData) {
      setShowAuth(true);
      return;
    }
    toast.success("Preparing Official Performance Dossier (PDF)... 📄");
    generateCompetencyPDF({
      user: userData,
      profile: userData,
      competencies: userData.competencies || [],
      skillGaps: userData.skillGaps || [],
      learningPath: userData.learningPath || [],
    });
  };

  const navLinks = [
    { label: "Home", path: "/", icon: FaHome },
    { label: "Dashboard", path: "/dashboard", icon: BsBarChartLine },
    { label: "History", path: "/history", icon: FaHistory },
    { label: "AI Models", path: "/ai-models", icon: HiSparkles, isAiModel: true },
  ];

  if (userData?.role === "admin") {
    navLinks.push({ label: "Admin Portal", path: "/admin", icon: BsShieldLock });
  }

  const popupVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 8, scale: 0.95 },
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/85 dark:bg-slate-950/85 backdrop-blur-2xl border-b border-slate-200/70 dark:border-slate-800/80 shadow-[0_4px_30px_rgba(0,0,0,0.03)] transition-all">
        <div className="h-1 w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />

        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-18">
            <div className="flex items-center gap-2 sm:gap-3">
              <div
                onClick={() => navigate("/")}
                className="flex items-center gap-3 cursor-pointer group select-none"
              >
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-slate-950 via-blue-900 to-indigo-900 text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-all duration-300 border border-blue-500/30">
                  <span className="font-black text-xs sm:text-sm tracking-wider">NSSTA</span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-sm sm:text-base text-slate-900 dark:text-white tracking-tight">
                      MoSPI <span className="text-blue-600 dark:text-blue-400">SkillIQ</span>
                    </span>
                    <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 uppercase tracking-wider border border-blue-200/80 dark:border-blue-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>SankhyaIQ AI</span>
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold hidden md:block">
                    National Statistical Systems Training Academy
                  </span>
                </div>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-1.5 bg-slate-100/80 dark:bg-slate-900/80 p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 shadow-inner">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <button
                    key={link.path}
                    onClick={() => {
                      if (!userData && link.path !== "/" && link.path !== "/ai-models") {
                        setShowAuth(true);
                        return;
                      }
                      navigate(link.path);
                    }}
                    className={`relative flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${isActive
                      ? link.isAiModel
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md font-black"
                        : "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs font-black"
                      : link.isAiModel
                        ? "text-blue-700 dark:text-blue-300 hover:bg-blue-50/80 dark:hover:bg-blue-950/60 font-extrabold"
                        : "hover:bg-white/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
                      }`}
                  >
                    {link.isAiModel && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping mr-0.5" />
                    )}
                    <Icon size={14} className={isActive ? (link.isAiModel ? "text-amber-300" : "text-blue-600 dark:text-blue-400") : "text-slate-400"} />
                    <span>{link.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 sm:gap-2.5">

              <div ref={userRef} className="relative">
                {userData ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowUserPopup(!showUserPopup)}
                    className="flex items-center gap-2 p-1.5 pl-2.5 rounded-2xl bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200/70 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shadow-xs"
                  >
                    <div className="flex flex-col text-right hidden sm:block">
                      <span className="text-xs font-black text-slate-900 dark:text-slate-100 leading-tight truncate max-w-[130px]">
                        {userData.name}
                      </span>
                      <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold truncate max-w-[130px]">
                        {userData.jobRole || userData.role || "Officer"}
                      </span>
                    </div>

                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-700 text-white flex items-center justify-center font-black text-xs shadow-md">
                      {userData.name ? userData.name.charAt(0).toUpperCase() : <FaUserGraduate size={14} />}
                    </div>
                    <BsChevronDown size={11} className={`text-slate-400 transition-transform ${showUserPopup ? "rotate-180" : ""}`} />
                  </motion.button>
                ) : (
                  <button
                    onClick={() => navigate("/auth")}
                    className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white rounded-xl text-xs font-black shadow-md transition-all cursor-pointer"
                  >
                    <FaUserGraduate size={13} />
                    <span>Officer Sign In</span>
                  </button>
                )}

                <AnimatePresence>
                  {showUserPopup && userData && (
                    <motion.div
                      variants={popupVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50 origin-top-right"
                    >
                      <div className="p-4 bg-gradient-to-br from-slate-50 to-blue-50/40 dark:from-slate-800/80 dark:to-blue-950/40 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-700 text-white flex items-center justify-center font-black text-sm shadow-md">
                            {userData.name ? userData.name.charAt(0).toUpperCase() : "O"}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-black text-sm text-slate-900 dark:text-white truncate">
                              {userData.name}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                              {userData.email}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-700 flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-slate-600 dark:text-slate-300">Cadre:</span>
                          <span className="font-bold text-blue-700 dark:text-blue-400 truncate max-w-[180px]">
                            {userData.jobRole || "ISS Officer"}
                          </span>
                        </div>

                        <div className="mt-1 flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-slate-600 dark:text-slate-300">Competency:</span>
                          <span className="font-black text-emerald-600 dark:text-emerald-400">
                            {userData.overallCompetencyScore || 65}% ({userData.overallLevel || "Intermediate"})
                          </span>
                        </div>
                      </div>

                      <div className="p-2 space-y-1">
                        <button
                          onClick={() => {
                            setShowUserPopup(false);
                            navigate("/pricing");
                          }}
                          className="w-full text-left px-3.5 py-2.5 rounded-2xl hover:bg-amber-50/60 dark:hover:bg-amber-950/40 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-between transition-colors cursor-pointer group"
                        >
                          <div className="flex items-center gap-2.5">
                            <HiSparkles size={14} className="text-amber-500 group-hover:scale-110 transition-transform" />
                            <span>AI Credits & Plans</span>
                          </div>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 border border-amber-300/50 dark:border-amber-700/50">
                            {userData.credits ?? 0} Left
                          </span>
                        </button>

                        <button
                          onClick={() => {
                            setShowUserPopup(false);
                            navigate("/dashboard");
                          }}
                          className="w-full text-left px-3.5 py-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <BsBarChartLine size={14} className="text-blue-600" />
                          <span>My Performance Dashboard</span>
                        </button>

                        <button
                          onClick={() => {
                            setShowUserPopup(false);
                            navigate("/ai-models");
                          }}
                          className="w-full text-left px-3.5 py-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <HiSparkles size={14} className="text-amber-500" />
                          <span>AI Models & Workflows Hub</span>
                        </button>

                        <button
                          onClick={() => {
                            setShowUserPopup(false);
                            handleDownloadDossier();
                          }}
                          className="w-full text-left px-3.5 py-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <FaFilePdf size={14} className="text-rose-600" />
                          <span>Export Official Dossier (PDF)</span>
                        </button>

                        <button
                          onClick={() => {
                            setShowUserPopup(false);
                            navigate("/history");
                          }}
                          className="w-full text-left px-3.5 py-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <FaHistory size={14} className="text-indigo-600" />
                          <span>Interview History & Scorecards</span>
                        </button>
                      </div>

                      <div className="p-3 bg-slate-50/80 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 space-y-2">
                        <div className="flex items-center justify-between px-1">
                          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            {theme === "dark" ? (
                              <BsMoonStars className="text-indigo-400" size={12} />
                            ) : theme === "light" ? (
                              <BsSun className="text-amber-500" size={12} />
                            ) : (
                              <BsDisplay className="text-blue-500" size={12} />
                            )}
                            <span>Appearance</span>
                          </span>
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/50 capitalize">
                            {theme === "system" ? "System Default" : `${theme} Mode`}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-1 bg-slate-200/70 dark:bg-slate-900/80 p-1 rounded-2xl border border-slate-200/50 dark:border-slate-800 text-xs font-bold">
                          <button
                            onClick={() => setTheme("system")}
                            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl transition-all cursor-pointer ${theme === "system"
                              ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm font-black"
                              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                              }`}
                          >
                            <BsDisplay size={12} />
                            <span>System</span>
                          </button>

                          <button
                            onClick={() => setTheme("light")}
                            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl transition-all cursor-pointer ${theme === "light"
                              ? "bg-white dark:bg-slate-800 text-amber-500 shadow-sm font-black"
                              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                              }`}
                          >
                            <BsSun size={12} />
                            <span>Light</span>
                          </button>

                          <button
                            onClick={() => setTheme("dark")}
                            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl transition-all cursor-pointer ${theme === "dark"
                              ? "bg-white dark:bg-slate-800 text-indigo-400 shadow-sm font-black"
                              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                              }`}
                          >
                            <BsMoonStars size={12} />
                            <span>Dark</span>
                          </button>
                        </div>
                      </div>

                      <div className="p-2 border-t border-slate-100 dark:border-slate-800">
                        <button
                          onClick={handleLogout}
                          className="w-full px-3.5 py-2 rounded-2xl hover:bg-rose-50 dark:hover:bg-rose-950/60 text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <HiOutlineLogout size={16} />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {mobileMenuOpen ? <HiX size={22} /> : <HiMenu size={22} />}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl px-4 py-4 space-y-3"
            >
              {userData && (
                <div className="flex items-center justify-between p-3 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <HiSparkles size={16} className="text-amber-500 animate-pulse" />
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        AI Interaction Credits
                      </span>
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-extrabold">
                        {userData.credits ?? 0} Credits Available
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate("/pricing");
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black shadow-xs cursor-pointer uppercase tracking-wider text-[10px]"
                  >
                    Top Up
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = location.pathname === link.path;
                  return (
                    <button
                      key={link.path}
                      onClick={() => {
                        setMobileMenuOpen(false);
                        if (!userData && link.path !== "/" && link.path !== "/ai-models") {
                          setShowAuth(true);
                          return;
                        }
                        navigate(link.path);
                      }}
                      className={`flex items-center gap-2 p-3 rounded-2xl text-xs font-bold text-left transition-colors ${isActive
                        ? "bg-blue-600 text-white"
                        : "bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300"
                        }`}
                    >
                      <Icon size={15} />
                      <span>{link.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Theme: {theme === "system" ? "System Default" : `${theme} Mode`}
                </span>
                <div className="grid grid-cols-3 gap-1 bg-slate-200/80 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
                  <button
                    onClick={() => setTheme("system")}
                    className={`py-1.5 rounded-lg text-center ${theme === "system" ? "bg-white dark:bg-slate-700 text-blue-600 font-black shadow-xs" : "text-slate-600 dark:text-slate-400"
                      }`}
                  >
                    System
                  </button>
                  <button
                    onClick={() => setTheme("light")}
                    className={`py-1.5 rounded-lg text-center ${theme === "light" ? "bg-white dark:bg-slate-700 text-amber-500 font-black shadow-xs" : "text-slate-600 dark:text-slate-400"
                      }`}
                  >
                    Light
                  </button>
                  <button
                    onClick={() => setTheme("dark")}
                    className={`py-1.5 rounded-lg text-center ${theme === "dark" ? "bg-white dark:bg-slate-700 text-indigo-400 font-black shadow-xs" : "text-slate-600 dark:text-slate-400"
                      }`}
                  >
                    Dark
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {showAuth && <AuthModel onClose={() => setShowAuth(false)} />}
    </>
  );
};

export default Navbar;
