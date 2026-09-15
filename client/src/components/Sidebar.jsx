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
import toast from "react-hot-toast";

const Sidebar = ({ onOpenAuth }) => {
  const { userData } = useSelector((state) => state.user);
  const {
    navMode,
    toggleNavMode,
    isCollapsed,
    toggleCollapse,
    mobileOpen,
    setMobileOpen,
  } = useNavigation();

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { theme, setTheme } = useTheme();

  const [hoveredLink, setHoveredLink] = useState(null);

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
        className={`fixed top-0 bottom-0 left-0 z-[120] bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl border-r border-slate-200/80 dark:border-slate-800/80 shadow-2xl flex flex-col transition-all duration-300 ease-in-out select-none ${
          mobileOpen ? "translate-x-0 w-72" : "-translate-x-full md:translate-x-0"
        } ${isCollapsed ? "md:w-[76px]" : "md:w-[260px]"}`}
      >
        {/* Tricolor Government Ribbon Accent */}
        <div className="h-1 w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808] shrink-0" />

        {/* Sidebar Header: Brand & Conversion Controls */}
        <div className="p-3.5 flex items-center justify-between border-b border-slate-200/70 dark:border-slate-800/70 shrink-0">
          <div
            onClick={() => handleNavigate("/", true)}
            className="flex items-center gap-2.5 cursor-pointer group min-w-0 overflow-hidden"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-slate-950 via-blue-900 to-indigo-900 text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-all duration-300 border border-blue-500/30 shrink-0">
              <span className="font-black text-xs tracking-wider">NSSTA</span>
            </div>
            {(!isCollapsed || mobileOpen) && (
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-sm text-slate-900 dark:text-white tracking-tight truncate">
                    MoSPI <span className="text-blue-600 dark:text-blue-400">SkillIQ</span>
                  </span>
                </div>
                <span className="text-[9px] text-slate-500 dark:text-slate-400 font-semibold truncate">
                  National Statistical Academy
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* Close button on Mobile */}
            <button
              onClick={() => setMobileOpen(false)}
              className="md:hidden p-1.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Close Menu"
            >
              <HiX size={20} />
            </button>

            {/* Desktop Collapse / Expand Rail Toggle */}
            <button
              onClick={toggleCollapse}
              className="hidden md:flex p-1.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              title={isCollapsed ? "Expand Sidebar (260px)" : "Collapse Sidebar (76px)"}
            >
              {isCollapsed ? <BsChevronRight size={14} /> : <BsChevronLeft size={14} />}
            </button>
          </div>
        </div>

        {/* Quick Conversion Banner: Switch to Topbar */}
        {(!isCollapsed || mobileOpen) ? (
          <div className="px-3 pt-2.5 shrink-0">
            <button
              onClick={toggleNavMode}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200/70 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 text-xs font-bold transition-all cursor-pointer group shadow-2xs"
              title="Convert this sidebar into a horizontal top navbar"
            >
              <div className="flex items-center gap-2">
                <HiOutlineViewBoards size={15} className="group-hover:rotate-90 transition-transform duration-300 text-blue-600 dark:text-blue-400" />
                <span className="truncate">Convert to Navbar</span>
              </div>
              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-blue-200/60 dark:bg-blue-800/60">
                Layout
              </span>
            </button>
          </div>
        ) : (
          <div className="p-2 flex justify-center shrink-0">
            <button
              onClick={toggleNavMode}
              className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/70 transition-all cursor-pointer"
              title="Convert to Horizontal Navbar"
            >
              <HiOutlineViewBoards size={16} />
            </button>
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
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer group ${
                        isActive
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
                          className={`${
                            isActive
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
                              className={`text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                                isActive
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
              <span className="text-[10px] text-slate-400">MoSPI</span>
            </button>
          )}

          {/* User Profile Card */}
          {userData ? (
            <div
              className={`flex items-center gap-2.5 p-2 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-xs ${
                isCollapsed && !mobileOpen ? "justify-center p-1.5" : ""
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-700 text-white flex items-center justify-center font-black text-xs shadow-sm shrink-0">
                {userData.name ? userData.name.charAt(0).toUpperCase() : <FaUserGraduate size={14} />}
              </div>

              {(!isCollapsed || mobileOpen) && (
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 dark:text-slate-100 truncate">
                      {userData.name}
                    </span>
                  </div>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold truncate block">
                    {userData.jobRole || userData.role || "Officer"}
                  </span>
                </div>
              )}

              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer shrink-0"
                title="Sign Out"
              >
                <HiOutlineLogout size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleNavigate("/auth", true)}
              className={`w-full flex items-center justify-center gap-2 py-2 px-3 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white rounded-xl text-xs font-black shadow-md transition-all cursor-pointer ${
                isCollapsed && !mobileOpen ? "px-1.5" : ""
              }`}
            >
              <FaUserGraduate size={13} />
              {(!isCollapsed || mobileOpen) && <span>Officer Sign In</span>}
            </button>
          )}

          {/* Compact Appearance Switcher */}
          {(!isCollapsed || mobileOpen) ? (
            <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-1">
              <span className="font-bold flex items-center gap-1.5">
                {theme === "dark" ? (
                  <BsMoonStars className="text-indigo-400" size={11} />
                ) : theme === "light" ? (
                  <BsSun className="text-amber-500" size={11} />
                ) : (
                  <BsDisplay className="text-blue-500" size={11} />
                )}
                <span>Theme</span>
              </span>
              <div className="flex bg-slate-200/70 dark:bg-slate-800 p-0.5 rounded-lg text-[10px] font-black">
                <button
                  onClick={() => setTheme("light")}
                  className={`px-2 py-0.5 rounded cursor-pointer ${theme === "light" ? "bg-white dark:bg-slate-700 text-amber-600 shadow-2xs" : ""}`}
                >
                  Light
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={`px-2 py-0.5 rounded cursor-pointer ${theme === "dark" ? "bg-white dark:bg-slate-700 text-indigo-400 shadow-2xs" : ""}`}
                >
                  Dark
                </button>
                <button
                  onClick={() => setTheme("system")}
                  className={`px-2 py-0.5 rounded cursor-pointer ${theme === "system" ? "bg-white dark:bg-slate-700 text-blue-600 shadow-2xs" : ""}`}
                >
                  OS
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-1 flex justify-center">
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white"
                title={`Theme: ${theme}`}
              >
                {theme === "dark" ? <BsMoonStars size={13} /> : <BsSun size={13} />}
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
