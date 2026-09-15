import React, { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  BsChevronDown,
  BsBarChartLine,
  BsShieldLock,
  BsSun,
  BsMoonStars,
  BsDisplay,
  BsLayoutSidebar,
  BsLayoutSidebarInsetReverse,
  BsGearFill,
  BsRobot,
  BsBookHalf,
  BsStars,
  BsBarChartSteps,
} from "react-icons/bs";
import {
  FaUserGraduate,
  FaHistory,
  FaFilePdf,
  FaHome,
  FaComments,
  FaBrain,
  FaTasks,
  FaBookOpen,
  FaMicrophone,
  FaUserTie,
} from "react-icons/fa";
import {
  HiOutlineLogout,
  HiMenu,
  HiX,
  HiSparkles,
  HiOutlineViewBoards,
} from "react-icons/hi";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { ServerUrl } from "../App";
import { setUserData } from "../redux/userSlice";
import { useOutsideClick } from "../utils/outsideClick";
import { generateCompetencyPDF } from "../utils/pdfGenerator";
import { useTheme } from "../context/ThemeContext";
import { useNavigation } from "../context/NavigationContext";
import Sidebar from "./Sidebar";
import AuthModel from "./AuthModel";
import SettingsModal from "./SettingsModal";
import NotificationBell from "./NotificationBell";
import toast from "react-hot-toast";

const Navbar = () => {
  const { userData } = useSelector((state) => state.user);
  const userPhoto = userData?.image || userData?.picture || userData?.avatar || userData?.photoUrl || userData?.avatarUrl || userData?.profilePicture;
  const {
    navMode,
    toggleNavMode,
    setNavMode,
    isCollapsed,
    setMobileOpen,
    isSettingsOpen,
    openSettings,
    closeSettings,
  } = useNavigation();

  const [showUserPopup, setShowUserPopup] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownTimeoutRef = useRef(null);

  const handleDropdownEnter = (title) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setActiveDropdown(title);
  };

  const handleDropdownLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 180);
  };

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { theme, setTheme } = useTheme();
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
      toast.success("Successfully logged out");
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

  const navSections = [
    {
      title: "Core Portal",
      links: [
        { label: "Home", path: "/", icon: FaHome, isPublic: true, desc: "National Statistical Portal Overview" },
        ...(userData?.role !== "admin"
          ? [{ label: "Dashboard", path: "/dashboard", icon: BsBarChartLine, desc: "Performance & Gap Analytics" }]
          : []),
        { label: "Competency", path: "/competencies", icon: FaBrain, desc: "Statistical Competency Framework" },
        { label: "Skill Gaps", path: "/skill-gaps", icon: BsBarChartSteps, badge: "Cadre AI", desc: "Cadre Benchmark & Gap Analysis" },
        { label: "Job Readiness", path: "/job-readiness", icon: FaUserTie, badge: "Report", desc: "Target Cadre Readiness & Deployment Audit" },
        { label: "History", path: "/history", icon: FaHistory, desc: "Viva Records & Evaluation Logs" },
      ],
    },
    {
      title: "Capacity Building",
      links: [
        { label: "Learning Path", path: "/learning-path", icon: BsBookHalf, desc: "Adaptive Statistical Curriculum" },
        { label: "Quizzes", path: "/quizzes", icon: FaTasks, desc: "Cadre Knowledge Practice" },
        { label: "Assignment", path: "/assignments", icon: FaFilePdf, desc: "Survey & Data Practicum Tasks" },
        { label: "Material Request", path: "/materials", icon: FaBookOpen, desc: "NSSTA Study Material Requisitions" },
        { label: "MCQ Create", path: "/mcq-create", icon: BsStars, isAi: true, badge: "AI Gen", desc: "Diagnostic MCQ Studio" },
      ],
    },
    {
      title: "Intelligence Board",
      links: [
        {
          label: "AI Copilot",
          path: "/chat",
          icon: BsRobot,
          isAi: true,
          badge: "AI Copilot",
          desc: "Statistical Copilot & Assistant",
        },
        {
          label: "Interview Viva",
          path: "/interview",
          icon: FaMicrophone,
          badge: "Oral Board",
          desc: "AI Cadre Oral Examination",
        },
      ],
    },
    ...(userData?.role === "admin"
      ? [
          {
            title: "Governance",
            align: "right",
            links: [
              { label: "Admin Portal", path: "/admin", icon: BsShieldLock, badge: "Officer", desc: "Executive Analytics & Cadre Management" },
            ],
          },
        ]
      : []),
  ];

  const popupVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 8, scale: 0.95 },
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/") return "National Statistical Portal • Overview";
    if (path === "/dashboard") return "Officer Performance Dashboard";
    if (path === "/competencies") return "Official Statistical Competency Assessment";
    if (path === "/skill-gaps" || path === "/skill-gap-analysis") return "Official Cadre Skill Gap Analysis & Target Audit";
    if (path === "/job-readiness") return "Target Job Readiness & Cadre Deployment Audit";
    if (path === "/learning-path") return "AI Adaptive Learning Pathway";
    if (path === "/quizzes") return "Cadre Statistical Assessments & Quizzes";
    if (path === "/assignments") return "Survey & Data Practicum Assignments";
    if (path === "/materials") return "NSSTA Official Study Material Requisition";
    if (path === "/mcq-create") return "AI Diagnostic MCQ Creation Studio";
    if (path === "/ai-models") return "SankhyaIQ AI Models & Workflows Hub";
    if (path === "/admin") return "Executive Administrative Analytics";
    if (path === "/chat") return "AI Copilot & Statistical Assistant";
    if (path === "/community") return "National Statistical Officer Community";
    if (path === "/interview") return "Cadre Board Oral Viva Simulation";
    if (path === "/history") return "Viva Evaluation Records & History";
    if (path === "/settings") return "System Settings • Profile & Layout Options";
    return "SankhyaIQ AI • National Statistical Systems Training Academy";
  };

  // ==========================================
  // RENDER: SIDEBAR NAVIGATION MODE (Only when user is signed in)
  // ==========================================
  if (navMode === "sidebar" && userData) {
    return (
      <>
        {/* Render the Sidebar component */}
        <Sidebar onOpenAuth={() => setShowAuth(true)} />

        {/* Companion Top Utility Header in Sidebar Mode */}
        <header
          className={`fixed top-0 right-0 z-[90] h-14 bg-white/85 dark:bg-slate-950/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 transition-all duration-300 left-0 ${
            isCollapsed ? "md:left-[76px]" : "md:left-[260px]"
          } flex items-center justify-between px-3 sm:px-6 select-none`}
        >
          {/* Mobile: Hamburger Drawer Toggle & Logo */}
          <div className="flex items-center gap-2.5 md:hidden">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-1.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Open Navigation Menu"
            >
              <HiMenu size={22} />
            </button>

            <div
              onClick={() => navigate("/")}
              className="flex items-center gap-2 cursor-pointer select-none"
            >
              <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-900 text-white flex flex-col items-center justify-center font-black text-xs shadow-xs border border-blue-400/30 overflow-hidden shrink-0">
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />
                <span className="leading-none">S</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-black text-xs sm:text-sm text-slate-900 dark:text-white leading-tight truncate">
                  SankhyaIQ <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">AI</span>
                </span>
                <span className="text-[8px] text-slate-500 dark:text-slate-400 font-medium truncate">
                  National Statistical Systems Training Academy
                </span>
              </div>
            </div>
          </div>

          {/* Desktop: Page Title / Breadcrumb */}
          <div className="hidden md:flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
            <span className="text-xs font-black text-slate-800 dark:text-slate-200 truncate">
              {getPageTitle()}
            </span>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* AI Copilot Quick Button */}
            <button
              onClick={() => navigate("/chat")}
              className="relative p-2 sm:px-3 sm:py-1.5 rounded-2xl bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 hover:from-blue-600/20 hover:to-indigo-600/20 border border-blue-400/30 dark:border-blue-500/30 text-blue-600 dark:text-blue-400 flex items-center gap-2 transition-all shadow-xs cursor-pointer group"
              title="Open AI Copilot & Statistical Assistant"
            >
              <div className="relative flex items-center justify-center">
                <BsRobot size={17} className="text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400" />
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-[10px] font-black tracking-wider uppercase text-blue-600 dark:text-blue-300 leading-none">
                  AI Copilot
                </span>
                <span className="text-[8px] text-slate-400 font-bold leading-none mt-0.5">
                  Assistant
                </span>
              </div>
            </button>

            {/* Cadre Notifications & Mandatory Intake Bell */}
            <NotificationBell />

            {/* Officer Status Chip in Sidebar mode (Dropdown opens from the Sidebar user card) */}
            <div>
              {userData ? (
                <div
                  onClick={() => navigate("/settings")}
                  className="flex items-center gap-2 p-1 pl-2.5 rounded-2xl bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-400/50 shadow-xs select-none cursor-pointer transition-all"
                  title="Active Officer Session • Click to view Profile & Settings"
                >
                  <div className="flex flex-col text-right hidden sm:block max-w-[130px] overflow-hidden">
                    <span className="text-xs font-black text-slate-900 dark:text-slate-100 leading-tight truncate block max-w-[130px]">
                      {userData.name}
                    </span>
                    <span className="text-[9px] text-blue-600 dark:text-blue-400 font-bold truncate block max-w-[130px]">
                      {userData.jobRole || "Officer"}
                    </span>
                  </div>

                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-700 text-white flex items-center justify-center font-black text-xs shadow-md overflow-hidden relative shrink-0">
                    {userPhoto ? (
                      <img
                        src={userPhoto}
                        alt={userData?.name || "Officer"}
                        className="w-full h-full object-cover rounded-xl"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          if (e.currentTarget.nextElementSibling) {
                            e.currentTarget.nextElementSibling.style.display = "flex";
                          }
                        }}
                      />
                    ) : null}
                    <span className={userPhoto ? "hidden" : "flex items-center justify-center"}>
                      {userData.name ? userData.name.charAt(0).toUpperCase() : <FaUserGraduate size={14} />}
                    </span>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => navigate("/auth")}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-700 to-indigo-700 text-white rounded-xl text-xs font-black shadow-md transition-all cursor-pointer"
                >
                  <FaUserGraduate size={12} />
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {showAuth && <AuthModel onClose={() => setShowAuth(false)} />}
        <SettingsModal isOpen={isSettingsOpen} onClose={closeSettings} />
      </>
    );
  }

  // RENDER: HORIZONTAL TOP NAVBAR MODE
  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/85 dark:bg-slate-950/85 backdrop-blur-2xl border-b border-slate-200/70 dark:border-slate-800/80 shadow-[0_4px_30px_rgba(0,0,0,0.03)] transition-all">
        {/* Tricolor Government Ribbon Accent */}
        <div className="h-1 w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />

        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-18">
            <div className="flex items-center gap-2 sm:gap-3">
              <div
                onClick={() => navigate("/")}
                className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group select-none"
              >
                {/* Modern & Premium Logo Emblem */}
                <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-900 text-white flex flex-col items-center justify-center shadow-lg group-hover:scale-105 group-hover:shadow-blue-500/25 transition-all duration-300 border border-blue-400/30 shrink-0 overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />
                  <span className="font-black text-sm sm:text-base tracking-tight text-white drop-shadow-xs">
                    S
                  </span>
                  <span className="text-[7.5px] font-black tracking-widest text-amber-300 flex items-center gap-0.5">
                    <HiSparkles size={7} className="text-amber-400 animate-pulse" /> AI
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="font-black text-base sm:text-lg text-slate-900 dark:text-white tracking-tight leading-tight">
                    SankhyaIQ <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 dark:from-blue-400 dark:via-indigo-300 dark:to-violet-400">AI</span>
                  </span>
                  <span className="text-[9.5px] sm:text-[10.5px] text-slate-500 dark:text-slate-400 font-medium tracking-tight leading-tight mt-0.5">
                    National Statistical Systems Training Academy
                  </span>
                </div>
              </div>
            </div>

            {/* Desktop Navigation: 3 Category Dropdowns (Core Portal, Capacity Building, Intelligence Board) */}
            <div className="hidden md:flex items-center gap-1.5 bg-slate-100/80 dark:bg-slate-900/80 p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 shadow-inner">
              {navSections.map((section) => {
                const isSectionActive = section.links.some((l) => {
                  if (l.path === "/skill-gaps") {
                    return location.pathname === "/skill-gaps" || location.pathname === "/skill-gap-analysis";
                  }
                  return location.pathname === l.path;
                });
                const isOpen = activeDropdown === section.title;

                return (
                  <div
                    key={section.title}
                    className="relative"
                    onMouseEnter={() => handleDropdownEnter(section.title)}
                    onMouseLeave={handleDropdownLeave}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveDropdown(isOpen ? null : section.title)}
                      className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all cursor-pointer select-none text-xs font-bold ${
                        isSectionActive
                          ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs font-black border border-slate-200/60 dark:border-slate-700/60"
                          : isOpen
                          ? "bg-white/80 dark:bg-slate-800/80 text-slate-900 dark:text-white"
                          : "hover:bg-white/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <span>{section.title}</span>
                      <BsChevronDown
                        size={10}
                        className={`transition-transform duration-200 text-slate-400 ${
                          isOpen ? "rotate-180 text-blue-600 dark:text-blue-400" : ""
                        }`}
                      />
                    </button>

                    {/* Hover Dropdown Menu with all sub-elements */}
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 6, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 6, scale: 0.96 }}
                          transition={{ duration: 0.15, ease: "easeOut" }}
                          className={`absolute top-full pt-2 z-[110] ${
                            section.align === "right" ? "right-0" : "left-0"
                          }`}
                        >
                          <div className="w-72 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-slate-200/90 dark:border-slate-800/90 p-2 overflow-hidden ring-1 ring-black/5">
                            <div className="px-3 py-1.5 mb-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                              <span>{section.title}</span>
                              <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded">
                                {section.links.length} modules
                              </span>
                            </div>

                            <div className="space-y-0.5">
                              {section.links.map((link) => {
                                const Icon = link.icon;
                                const isLinkActive = link.path === "/skill-gaps"
                                  ? (location.pathname === "/skill-gaps" || location.pathname === "/skill-gap-analysis")
                                  : location.pathname === link.path;

                                return (
                                  <button
                                    key={link.path}
                                    onClick={() => {
                                      setActiveDropdown(null);
                                      if (!userData && !link.isPublic) {
                                        setShowAuth(true);
                                        return;
                                      }
                                      navigate(link.path);
                                    }}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all cursor-pointer group/sub ${
                                      isLinkActive
                                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black shadow-sm"
                                        : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <div
                                        className={`p-1.5 rounded-lg shrink-0 transition-colors ${
                                          isLinkActive
                                            ? "bg-white/20 text-white"
                                            : link.isAi
                                            ? "bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 group-hover/sub:bg-blue-100 dark:group-hover/sub:bg-blue-950/80"
                                            : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover/sub:text-blue-600 dark:group-hover/sub:text-blue-400"
                                        }`}
                                      >
                                        <Icon size={14} />
                                      </div>
                                      <div className="flex flex-col min-w-0">
                                        <span className="text-xs font-bold truncate block leading-tight">
                                          {link.label}
                                        </span>
                                        {link.desc && (
                                          <span
                                            className={`text-[9.5px] truncate block leading-tight mt-0.5 ${
                                              isLinkActive
                                                ? "text-blue-100"
                                                : "text-slate-400 dark:text-slate-500 font-medium"
                                            }`}
                                          >
                                            {link.desc}
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    {link.badge && (
                                      <span
                                        className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ml-2 shrink-0 ${
                                          isLinkActive
                                            ? "bg-white/20 text-white"
                                            : link.isAi
                                            ? "bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300/40"
                                            : "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200/50"
                                        }`}
                                      >
                                        {link.badge}
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-2 sm:gap-2.5">
              {/* AI Copilot Quick Button in Horizontal Mode */}
              <button
                onClick={() => navigate("/chat")}
                className="relative flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 hover:from-blue-600/20 hover:to-indigo-600/20 border border-blue-400/30 dark:border-blue-500/30 text-blue-600 dark:text-blue-400 transition-all shadow-xs cursor-pointer group"
                title="Open AI Copilot & Statistical Assistant"
              >
                <div className="relative flex items-center justify-center">
                  <BsRobot size={16} className="text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400" />
                </div>
                <span className="text-xs font-black text-blue-700 dark:text-blue-300 hidden sm:inline">
                  AI Copilot
                </span>
              </button>

              {/* Cadre Notifications & Mandatory Intake Bell */}
              <NotificationBell />

              {/* User Avatar & Popup */}
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

                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-700 text-white flex items-center justify-center font-black text-xs shadow-md overflow-hidden relative shrink-0">
                      {userPhoto ? (
                        <img
                          src={userPhoto}
                          alt={userData?.name || "Officer"}
                          className="w-full h-full object-cover rounded-xl"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            if (e.currentTarget.nextElementSibling) {
                              e.currentTarget.nextElementSibling.style.display = "flex";
                            }
                          }}
                        />
                      ) : null}
                      <span className={userPhoto ? "hidden" : "flex items-center justify-center"}>
                        {userData.name ? userData.name.charAt(0).toUpperCase() : <FaUserGraduate size={14} />}
                      </span>
                    </div>
                    <BsChevronDown
                      size={11}
                      className={`text-slate-400 transition-transform ${showUserPopup ? "rotate-180" : ""}`}
                    />
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
                          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-700 text-white flex items-center justify-center font-black text-sm shadow-md overflow-hidden relative shrink-0">
                            {userPhoto ? (
                              <img
                                src={userPhoto}
                                alt={userData?.name || "Officer"}
                                className="w-full h-full object-cover rounded-2xl"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                  if (e.currentTarget.nextElementSibling) {
                                    e.currentTarget.nextElementSibling.style.display = "flex";
                                  }
                                }}
                              />
                            ) : null}
                            <span className={userPhoto ? "hidden" : "flex items-center justify-center"}>
                              {userData.name ? userData.name.charAt(0).toUpperCase() : "O"}
                            </span>
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
                            {userData.overallCompetencyScore !== undefined && userData.overallCompetencyScore !== null ? userData.overallCompetencyScore : 0}% ({userData.overallLevel || "Novice"})
                          </span>
                        </div>
                      </div>

                      {/* Settings Option Button */}
                      <div className="p-2 border-b border-slate-100 dark:border-slate-800">
                        <button
                          onClick={() => {
                            setShowUserPopup(false);
                            navigate("/settings");
                          }}
                          className="w-full text-left px-3 py-2 rounded-2xl hover:bg-blue-50/70 dark:hover:bg-blue-950/40 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-between transition-colors cursor-pointer group"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="p-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 group-hover:rotate-45 transition-transform duration-300">
                              <BsGearFill size={14} />
                            </div>
                            <div>
                              <span className="block font-black text-slate-900 dark:text-white">Settings</span>
                              <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-medium">Layout & Theme Preferences</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] font-black px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 border border-slate-200/60 dark:border-slate-700/60">
                            <span className="capitalize">{navMode}</span>
                            <span>•</span>
                            <span className="capitalize">{theme}</span>
                          </div>
                        </button>
                      </div>


                      <div className="p-2 space-y-1">

                        {userData?.role !== "admin" && (
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
                        )}

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

                        {userData?.role !== "admin" && (
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
                        )}

                        {userData?.role !== "admin" && (
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
                        )}

                        {userData?.role === "admin" && (
                          <button
                            onClick={() => {
                              setShowUserPopup(false);
                              navigate("/admin");
                            }}
                            className="w-full text-left px-3.5 py-2.5 rounded-2xl hover:bg-blue-50/60 dark:hover:bg-blue-950/40 text-xs font-bold text-blue-700 dark:text-blue-300 flex items-center gap-2.5 transition-colors cursor-pointer"
                          >
                            <BsShieldLock size={14} className="text-blue-600" />
                            <span>Executive Admin Portal</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setShowUserPopup(false);
                            window.dispatchEvent(new CustomEvent("open-nssta-helpdesk"));
                          }}
                          className="w-full text-left px-3.5 py-2.5 rounded-2xl hover:bg-emerald-50/60 dark:hover:bg-emerald-950/40 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <FaComments size={14} className="text-emerald-500" />
                          <span>NSSTA Live Chat & Announcements</span>
                        </button>
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

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {mobileMenuOpen ? <HiX size={22} /> : <HiMenu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu in Navbar Mode */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl px-4 py-4 space-y-3"
            >
              {/* Convert to Sidebar option on mobile */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setNavMode("sidebar");
                }}
                className="w-full flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-2xl text-blue-700 dark:text-blue-300 text-xs font-bold"
              >
                <div className="flex items-center gap-2">
                  <BsLayoutSidebar size={16} />
                  <span>Switch to Sidebar Mode</span>
                </div>
                <span className="text-[10px] font-black uppercase bg-blue-200 dark:bg-blue-800 px-2 py-0.5 rounded">
                  Convert
                </span>
              </button>

              <div className="flex items-center justify-between p-3 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl">
                <div className="flex items-center gap-2">
                  <HiSparkles size={16} className="text-emerald-500 animate-pulse" />
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      Unlimited AI Access
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold">
                      All Models Active • No Tokens Required
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-black text-[10px] uppercase">
                  Enabled
                </span>
              </div>

              {/* Categorized Navigation Sections in Mobile Menu */}
              <div className="space-y-3">
                {navSections.map((section) => (
                  <div
                    key={section.title}
                    className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800"
                  >
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2">
                      {section.title}
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {section.links.map((link) => {
                        const Icon = link.icon;
                        const isActive = location.pathname === link.path;
                        return (
                          <button
                            key={link.path}
                            onClick={() => {
                              setMobileMenuOpen(false);
                              if (!userData && !link.isPublic) {
                                setShowAuth(true);
                                return;
                              }
                              navigate(link.path);
                            }}
                            className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold text-left transition-colors cursor-pointer ${
                              isActive
                                ? "bg-blue-600 text-white shadow-xs"
                                : "hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            <Icon size={14} className={isActive ? "text-white" : "text-slate-400"} />
                            <span className="truncate">{link.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Theme: {theme === "system" ? "System Default" : `${theme} Mode`}
                </span>
                <div className="grid grid-cols-3 gap-1 bg-slate-200/80 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
                  <button
                    onClick={() => setTheme("system")}
                    className={`py-1.5 rounded-lg text-center ${
                      theme === "system"
                        ? "bg-white dark:bg-slate-700 text-blue-600 font-black shadow-xs"
                        : "text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    System
                  </button>
                  <button
                    onClick={() => setTheme("light")}
                    className={`py-1.5 rounded-lg text-center ${
                      theme === "light"
                        ? "bg-white dark:bg-slate-700 text-amber-500 font-black shadow-xs"
                        : "text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    Light
                  </button>
                  <button
                    onClick={() => setTheme("dark")}
                    className={`py-1.5 rounded-lg text-center ${
                      theme === "dark"
                        ? "bg-white dark:bg-slate-700 text-indigo-400 font-black shadow-xs"
                        : "text-slate-600 dark:text-slate-400"
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
      <SettingsModal isOpen={isSettingsOpen} onClose={closeSettings} />
    </>
  );
};

export default Navbar;
