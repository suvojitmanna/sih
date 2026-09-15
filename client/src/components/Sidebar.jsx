import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BsBarChartLine,
  BsShieldLock,
  BsSun,
  BsMoonStars,
  BsDisplay,
  BsBookHalf,
  BsRobot,
  BsChevronLeft,
  BsChevronRight,
  BsChevronUp,
  BsChevronDown,
  BsGearFill,
  BsLayoutSidebar,
  BsLayoutSidebarInsetReverse,
} from "react-icons/bs";
import {
  FaHome,
  FaBrain,
  FaTasks,
  FaHistory,
  FaFilePdf,
  FaUserGraduate,
  FaUpload,
  FaUsers,
  FaMicrophone,
} from "react-icons/fa";
import {
  HiSparkles,
  HiOutlineLogout,
  HiX,
  HiOutlineViewBoards,
} from "react-icons/hi";
import axios from "axios";
import { ServerUrl } from "../App";
import { setUserData } from "../redux/userSlice";
import { generateCompetencyPDF } from "../utils/pdfGenerator";
import { useTheme } from "../context/ThemeContext";
import { useNavigation } from "../context/NavigationContext";
import { useOutsideClick } from "../utils/outsideClick";
import toast from "react-hot-toast";

const Sidebar = ({ onOpenAuth }) => {
  const { userData } = useSelector((state) => state.user);
  const {
    navMode,
    setNavMode,
    toggleNavMode,
    isCollapsed,
    toggleCollapse,
    mobileOpen,
    setMobileOpen,
    openSettings,
  } = useNavigation();

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { theme, setTheme } = useTheme();

  const [hoveredLink, setHoveredLink] = useState(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const userCardRef = useOutsideClick(() => setShowUserDropdown(false));

  const userPhoto = userData?.image || userData?.picture || userData?.avatar || userData?.photoUrl || userData?.avatarUrl;

  const handleLogout = async () => {
    try {
      await axios.post(`${ServerUrl}/api/auth/logout`, {}, { withCredentials: true });
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.clear();
      dispatch(setUserData(null));
      setMobileOpen(false);
      navigate("/auth");
      toast.success("Successfully logged out");
    } catch (error) {
      console.log(error);
    }
  };

  const handleDownloadDossier = () => {
    if (!userData) {
      if (onOpenAuth) onOpenAuth();
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

  const handleNavigate = (path, isPublic = false) => {
    if (!userData && !isPublic) {
      if (onOpenAuth) onOpenAuth();
      return;
    }
    navigate(path);
    setMobileOpen(false);
  };

  const navSections = [
    {
      title: "Core Portal",
      links: [
        { label: "Home", path: "/", icon: FaHome, isPublic: true },
        ...(userData?.role !== "admin"
          ? [{ label: "Dashboard", path: "/dashboard", icon: BsBarChartLine }]
          : []),
        {
          label: "AI Models Hub",
          path: "/ai-models",
          icon: HiSparkles,
          isPublic: true,
          badge: "AI Core",
          isAi: true,
        },
      ],
    },
    {
      title: "Capacity Building",
      links: [
        { label: "Competencies", path: "/competencies", icon: FaBrain },
        { label: "Learning Path", path: "/learning-path", icon: BsBookHalf },
        { label: "Quizzes", path: "/quizzes", icon: FaTasks },
        { label: "Assignments", path: "/assignments", icon: FaFilePdf },
        { label: "Materials", path: "/materials", icon: FaUpload },
      ],
    },
    {
      title: "Intelligence & Board",
      links: [
        { label: "AI Copilot", path: "/chat", icon: BsRobot },
        { label: "Interview Viva", path: "/interview", icon: FaMicrophone },
        { label: "Viva History", path: "/history", icon: FaHistory },
        { label: "Community", path: "/community", icon: FaUsers, isPublic: true },
      ],
    },
    ...(userData?.role === "admin"
      ? [
        {
          title: "Governance",
          links: [
            { label: "Admin Portal", path: "/admin", icon: BsShieldLock, badge: "Officer" },
          ],
        },
      ]
      : []),
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-[110] bg-slate-950/60 backdrop-blur-xs md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Main Sidebar Component */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-[120] h-[100dvh] bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl border-r border-slate-200/80 dark:border-slate-800/80 shadow-2xl flex flex-col transition-all duration-300 ease-in-out select-none ${mobileOpen ? "translate-x-0 w-[280px] sm:w-72 max-w-[85vw]" : "-translate-x-full md:translate-x-0"
          } ${isCollapsed ? "md:w-[76px]" : "md:w-[260px]"}`}
      >
        {/* Tricolor Government Ribbon Accent */}
        <div className="h-1 w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808] shrink-0" />

        {/* Sidebar Header: Collapsed Rail vs Expanded View */}
        {isCollapsed && !mobileOpen ? (
          <div className="p-3 flex items-center justify-center border-b border-slate-200/70 dark:border-slate-800/70 shrink-0 relative group/logo">
            <button
              onClick={toggleCollapse}
              className="relative w-11 h-11 rounded-2xl flex items-center justify-center cursor-pointer transition-all duration-300 focus:outline-none"
              title="Expand Sidebar (260px)"
            >
              {/* Default State: Sleek Logo Emblem */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-900 text-white flex flex-col items-center justify-center shadow-lg border border-blue-400/30 overflow-hidden transition-all duration-300 group-hover/logo:opacity-0 group-hover/logo:scale-90 group-hover/logo:pointer-events-none">
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />
                <span className="font-black text-sm tracking-tight text-white drop-shadow-xs">
                  S
                </span>
                <span className="text-[7px] font-black tracking-widest text-amber-300 flex items-center gap-0.5">
                  <HiSparkles size={6} className="text-amber-400 animate-pulse" /> AI
                </span>
              </div>

              {/* Hover State: Expanded Arrow (Centered, smooth transition, ZERO overlap!) */}
              <div className="absolute inset-0 rounded-2xl bg-blue-600 dark:bg-blue-600 text-white flex flex-col items-center justify-center shadow-xl shadow-blue-500/30 border border-blue-400/50 transition-all duration-300 opacity-0 scale-90 pointer-events-none group-hover/logo:opacity-100 group-hover/logo:scale-100 group-hover/logo:pointer-events-auto">
                <BsChevronRight size={18} className="text-white" />
                <span className="text-[7px] font-black tracking-wider uppercase text-blue-100 mt-0.5">Expand</span>
              </div>
            </button>
          </div>
        ) : (
          <div className="p-3 sm:p-3.5 flex items-center justify-between border-b border-slate-200/70 dark:border-slate-800/70 shrink-0">
            <div
              onClick={() => handleNavigate("/", true)}
              className="flex items-center gap-2.5 cursor-pointer group min-w-0 overflow-hidden relative"
            >
              {/* Modern & Premium Logo Emblem */}
              <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-900 text-white flex flex-col items-center justify-center shadow-lg group-hover:scale-105 group-hover:shadow-blue-500/25 transition-all duration-300 border border-blue-400/30 shrink-0 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />
                <span className="font-black text-sm tracking-tight text-white drop-shadow-xs">
                  S
                </span>
                <span className="text-[7px] font-black tracking-widest text-amber-300 flex items-center gap-0.5">
                  <HiSparkles size={6} className="text-amber-400 animate-pulse" /> AI
                </span>
              </div>

              {/* Brand Title & Subtitle */}
              <div className="flex flex-col min-w-0 pr-1">
                <span className="font-black text-base text-slate-900 dark:text-white tracking-tight leading-tight">
                  SankhyaIQ <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">AI</span>
                </span>
                <span
                  className="text-[9px] text-slate-500 dark:text-slate-400 font-medium tracking-tight leading-tight mt-0.5 truncate"
                  title="National Statistical Systems Training Academy"
                >
                  National Statistical Systems Training Academy
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Close button on Mobile */}
              <button
                onClick={() => setMobileOpen(false)}
                className="md:hidden p-1.5 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Close Menu"
              >
                <HiX size={20} />
              </button>

              {/* Desktop Collapse / Expand Rail Toggle */}
              <button
                onClick={toggleCollapse}
                className="hidden md:flex p-1.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                title="Collapse Sidebar (76px)"
              >
                <BsChevronLeft size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Navigation Sections & Links */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-2.5 py-3 space-y-4">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {(!isCollapsed || mobileOpen) && (
                <div className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {section.title}
                </div>
              )}
              {isCollapsed && !mobileOpen && (
                <div className="my-1.5 mx-auto w-6 h-px bg-slate-200 dark:bg-slate-800" />
              )}

              {section.links.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;

                return (
                  <div
                    key={link.path}
                    className="relative"
                    onMouseEnter={() => setHoveredLink(link.path)}
                    onMouseLeave={() => setHoveredLink(null)}
                  >
                    <button
                      onClick={() => handleNavigate(link.path, link.isPublic)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer group ${isActive
                          ? link.isAi
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md font-black"
                            : "bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 font-black shadow-xs border border-blue-200/50 dark:border-blue-800/50"
                          : link.isAi
                            ? "text-blue-600 dark:text-blue-400 hover:bg-blue-50/60 dark:hover:bg-blue-950/40"
                            : "text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white"
                        } ${isCollapsed && !mobileOpen ? "justify-center px-0" : ""}`}
                    >
                      <div className="relative shrink-0">
                        <Icon
                          size={17}
                          className={`${isActive
                              ? link.isAi
                                ? "text-amber-300"
                                : "text-blue-600 dark:text-blue-400"
                              : link.isAi
                                ? "text-blue-500 group-hover:scale-110 transition-transform"
                                : "text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200"
                            }`}
                        />
                        {link.isAi && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                        )}
                      </div>

                      {(!isCollapsed || mobileOpen) && (
                        <div className="flex items-center justify-between flex-1 min-w-0">
                          <span className="truncate">{link.label}</span>
                          {link.badge && (
                            <span
                              className={`text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider ${isActive
                                  ? "bg-white/20 text-white"
                                  : "bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300"
                                }`}
                            >
                              {link.badge}
                            </span>
                          )}
                        </div>
                      )}
                    </button>

                    {/* Floating Tooltip when Collapsed */}
                    {isCollapsed && !mobileOpen && hoveredLink === link.path && (
                      <div className="fixed left-[84px] z-[130] -translate-y-9 px-2.5 py-1.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold rounded-xl shadow-xl whitespace-nowrap pointer-events-none flex items-center gap-1.5 animate-fadeIn">
                        <span>{link.label}</span>
                        {link.badge && (
                          <span className="text-[9px] font-extrabold px-1 rounded bg-blue-500 text-white uppercase">
                            {link.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Sidebar Footer: Officer Profile Card & Controls */}
        <div className="p-3 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 space-y-2 shrink-0">

          {/* Officer Dossier Quick PDF Export */}
          {(!isCollapsed || mobileOpen) && userData && userData.role !== "admin" && (
            <button
              onClick={handleDownloadDossier}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <FaFilePdf size={12} className="text-rose-600" />
                <span>Export Dossier (PDF)</span>
              </div>
              <span className="text-[10px] text-slate-400">PDF</span>
            </button>
          )}

          {/* User Profile Card (Click to open dropdown in Sidebar mode) */}
          {userData ? (
            <div ref={userCardRef} className="relative">
              <button
                type="button"
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className={`w-full flex items-center gap-2.5 p-2 rounded-2xl bg-white dark:bg-slate-800/90 hover:bg-slate-100/80 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-xs transition-all cursor-pointer group text-left ${isCollapsed && !mobileOpen ? "justify-center p-1.5" : ""
                  }`}
                title="Officer Account & Session • Click to open settings & options"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-700 text-white flex items-center justify-center font-black text-xs shadow-sm shrink-0 group-hover:scale-105 transition-transform overflow-hidden relative">
                  {userPhoto ? (
                    <img
                      src={userPhoto}
                      alt={userData?.name || "Officer"}
                      className="w-full h-full object-cover rounded-xl"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  ) : (
                    <span>{userData.name ? userData.name.charAt(0).toUpperCase() : <FaUserGraduate size={14} />}</span>
                  )}
                </div>

                {(!isCollapsed || mobileOpen) && (
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-black text-slate-900 dark:text-slate-100 truncate block">
                      {userData.name}
                    </span>
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold truncate block">
                      {userData.jobRole || userData.role || "Officer"}
                    </span>
                  </div>
                )}

                {(!isCollapsed || mobileOpen) && (
                  <div className="text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors p-1">
                    <BsChevronUp
                      size={12}
                      className={`transition-transform duration-200 ${showUserDropdown ? "rotate-180" : ""}`}
                    />
                  </div>
                )}
              </button>

              {/* User Dropdown Menu from Sidebar User Portion */}
              <AnimatePresence>
                {showUserDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.16 }}
                    className={`bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-[150] ${isCollapsed && !mobileOpen
                        ? "fixed left-[84px] bottom-3 w-80 shadow-[0_10px_40px_rgba(0,0,0,0.25)]"
                        : "absolute bottom-[calc(100%+8px)] left-0 right-0 w-full min-w-[250px] shadow-[0_10px_40px_rgba(0,0,0,0.25)]"
                      }`}
                  >
                    {/* Tricolor Government Ribbon Accent */}
                    <div className="h-1 w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />

                    {/* Officer Details Header */}
                    <div className="p-3.5 bg-gradient-to-br from-slate-50 to-blue-50/40 dark:from-slate-800/80 dark:to-blue-950/40 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-700 text-white flex items-center justify-center font-black text-sm shadow-md shrink-0 overflow-hidden relative">
                          {userPhoto ? (
                            <img
                              src={userPhoto}
                              alt={userData?.name || "Officer"}
                              className="w-full h-full object-cover rounded-2xl"
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                          ) : (
                            <span>{userData.name ? userData.name.charAt(0).toUpperCase() : "O"}</span>
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-black text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                            {userData.name}
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                            {userData.email}
                          </span>
                        </div>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[10.5px]">
                        <span className="font-semibold text-slate-600 dark:text-slate-300">Cadre:</span>
                        <span className="font-bold text-blue-700 dark:text-blue-400 truncate max-w-[150px]">
                          {userData.jobRole || "ISS Officer"}
                        </span>
                      </div>

                      <div className="mt-1 flex items-center justify-between text-[10.5px]">
                        <span className="font-semibold text-slate-600 dark:text-slate-300">Competency:</span>
                        <span className="font-black text-emerald-600 dark:text-emerald-400">
                          {userData.overallCompetencyScore || 65}% ({userData.overallLevel || "Intermediate"})
                        </span>
                      </div>
                    </div>

                    {/* Settings Option Button */}
                    <div className="p-2 border-b border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          openSettings();
                        }}
                        className="w-full text-left px-3 py-2 rounded-2xl hover:bg-blue-50/70 dark:hover:bg-blue-950/40 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-between transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 group-hover:rotate-45 transition-transform duration-300">
                            <BsGearFill size={13} />
                          </div>
                          <div>
                            <span className="block font-black text-slate-900 dark:text-white text-xs">Settings</span>
                            <span className="block text-[9.5px] text-slate-500 dark:text-slate-400 font-medium">Layout & Theme Preferences</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 border border-slate-200/60 dark:border-slate-700/60">
                          <span className="capitalize">{navMode}</span>
                          <span>•</span>
                          <span className="capitalize">{theme}</span>
                        </div>
                      </button>
                    </div>


                    {/* Quick Shortcuts */}
                    <div className="p-1.5 space-y-0.5">
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          navigate("/ai-models");
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <HiSparkles size={13} className="text-amber-500" />
                        <span>AI Models & Workflows Hub</span>
                      </button>

                      {userData?.role !== "admin" && (
                        <button
                          onClick={() => {
                            setShowUserDropdown(false);
                            handleDownloadDossier();
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <FaFilePdf size={13} className="text-rose-600" />
                          <span>Export Official Dossier (PDF)</span>
                        </button>
                      )}

                      {userData?.role !== "admin" && (
                        <button
                          onClick={() => {
                            setShowUserDropdown(false);
                            navigate("/history");
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <FaHistory size={13} className="text-indigo-600" />
                          <span>Interview History & Scorecards</span>
                        </button>
                      )}

                      {userData?.role === "admin" && (
                        <button
                          onClick={() => {
                            setShowUserDropdown(false);
                            navigate("/admin");
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl hover:bg-blue-50/60 dark:hover:bg-blue-950/40 text-xs font-bold text-blue-700 dark:text-blue-300 flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <BsShieldLock size={13} className="text-blue-600" />
                          <span>Executive Admin Portal</span>
                        </button>
                      )}
                    </div>

                    {/* Sign Out Button */}
                    <div className="p-1.5 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          handleLogout();
                        }}
                        className="w-full px-3 py-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/60 text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <HiOutlineLogout size={14} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button
              onClick={() => handleNavigate("/auth", true)}
              className={`w-full flex items-center justify-center gap-2 py-2 px-3 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white rounded-xl text-xs font-black shadow-md transition-all cursor-pointer ${isCollapsed && !mobileOpen ? "px-1.5" : ""
                }`}
            >
              <FaUserGraduate size={13} />
              {(!isCollapsed || mobileOpen) && <span>Officer Sign In</span>}
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
