import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { ServerUrl } from "../App";
import { motion, AnimatePresence } from "framer-motion";
import { useOutsideClick } from "../utils/outsideClick";
import {
  BsBellFill,
  BsBell,
  BsMegaphoneFill,
  BsCheckCircleFill,
  BsExclamationTriangleFill,
  BsArrowRight,
} from "react-icons/bs";
import {
  FaBullhorn,
  FaTasks,
  FaMicrophone,
  FaShieldAlt,
} from "react-icons/fa";
import { HiX } from "react-icons/hi";

const formatTimeAgo = (dateStr) => {
  if (!dateStr) return "Recently";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "Recently";
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));

  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
};

const NotificationBell = () => {
  const { userData } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // "all" | "intake" | "broadcasts"
  const [broadcasts, setBroadcasts] = useState([]);
  const [diagnosticStatus, setDiagnosticStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [readNotifications, setReadNotifications] = useState(() => {
    try {
      const stored = localStorage.getItem("sankhya_read_notifications");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const dropdownRef = useOutsideClick(() => setIsOpen(false));

  const targetRole =
    userData?.jobRole ||
    userData?.targetCadre ||
    "Indian Statistical Service (ISS) Officer";

  // Exact completion checks:
  // If Quiz is completed -> do NOT show Quiz
  const isQuizCompleted = Boolean(
    diagnosticStatus?.isQuizCompleted ||
    (userData?.quizzesCompleted && userData.quizzesCompleted > 0)
  );

  // If Oral Viva is completed -> do NOT show Viva
  const isInterviewCompleted = Boolean(
    diagnosticStatus?.isInterviewCompleted ||
    diagnosticStatus?.diagnosticInterview?.status === "completed"
  );

  // If both are completed, Intake count is 0 -> do NOT show Intake
  const isIntakePending = !isQuizCompleted || !isInterviewCompleted;

  // Auto-reset tab if intake or broadcasts become 0
  useEffect(() => {
    if (!isIntakePending && activeTab === "intake") {
      setActiveTab("all");
    }
    if (broadcasts.length === 0 && activeTab === "broadcasts") {
      setActiveTab("all");
    }
  }, [isIntakePending, broadcasts.length, activeTab]);

  // Dynamic directive body copy tailored to what is still pending
  const directiveMessageText = useMemo(() => {
    if (!isQuizCompleted && !isInterviewCompleted) {
      return "New officer profiles are initialized at a 0% baseline. Complete your AI-generated role diagnostic quiz and mock oral viva below to calculate your verified 4-Domain Knowledge Taxonomy, establish Cadre Skill Gaps, and activate your personalized training roadmap.";
    }
    if (!isQuizCompleted) {
      return "Complete your AI-generated role diagnostic quiz below to finalize your verified 4-Domain Knowledge Taxonomy, establish Cadre Skill Gaps, and activate your personalized training roadmap.";
    }
    if (!isInterviewCompleted) {
      return "Complete your AI-generated mock oral viva evaluation below to finalize your verified 4-Domain Knowledge Taxonomy, establish Cadre Skill Gaps, and activate your personalized training roadmap.";
    }
    return "";
  }, [isQuizCompleted, isInterviewCompleted]);

  const directiveSubTitle = useMemo(() => {
    if (!isQuizCompleted && !isInterviewCompleted) {
      return "Baseline Competency Diagnostic Assessment Required";
    }
    if (!isQuizCompleted) {
      return "Role Diagnostic Quiz Assessment Required";
    }
    if (!isInterviewCompleted) {
      return "Board Oral Viva Simulation Assessment Required";
    }
    return "Mandatory Assessment";
  }, [isQuizCompleted, isInterviewCompleted]);

  // Fetch admin broadcasts and diagnostic intake status
  useEffect(() => {
    let isMounted = true;

    const fetchNotificationsData = async () => {
      if (!userData || userData.role === "trainer") return;
      try {
        setLoading(true);
        const [broadcastRes, diagnosticRes] = await Promise.allSettled([
          axios.get(`${ServerUrl}/api/support/broadcasts`, {
            withCredentials: true,
          }),
          axios.get(`${ServerUrl}/api/competency/diagnostic-status`, {
            withCredentials: true,
          }),
        ]);

        if (isMounted) {
          if (
            broadcastRes.status === "fulfilled" &&
            broadcastRes.value?.data?.success
          ) {
            setBroadcasts(broadcastRes.value.data.broadcasts || []);
          }
          if (
            diagnosticRes.status === "fulfilled" &&
            diagnosticRes.value?.data?.success
          ) {
            setDiagnosticStatus(diagnosticRes.value.data);
          }
        }
      } catch (err) {
        console.error("Error fetching notification data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchNotificationsData();
    const interval = setInterval(fetchNotificationsData, 30000); // 30-sec refresh

    const handleRefetch = () => {
      fetchNotificationsData();
    };
    window.addEventListener("focus", handleRefetch);
    window.addEventListener("diagnostic-updated", handleRefetch);
    window.addEventListener("assessmentCompleted", handleRefetch);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener("focus", handleRefetch);
      window.removeEventListener("diagnostic-updated", handleRefetch);
      window.removeEventListener("assessmentCompleted", handleRefetch);
    };
  }, [userData, location.pathname]);

  // Compute unread count based on remaining intake tasks + unread broadcasts
  const unreadCount = useMemo(() => {
    let count = 0;

    // Count remaining intake items (quiz remaining + viva remaining)
    if (!isQuizCompleted) count += 1;
    if (!isInterviewCompleted) count += 1;

    // Unread broadcast announcements
    broadcasts.forEach((b) => {
      if (!readNotifications.includes(b._id)) count += 1;
    });

    return count;
  }, [isQuizCompleted, isInterviewCompleted, broadcasts, readNotifications]);

  const handleMarkAllRead = () => {
    const allIds = broadcasts.map((b) => b._id);
    setReadNotifications(allIds);
    try {
      localStorage.setItem(
        "sankhya_read_notifications",
        JSON.stringify(allIds)
      );
    } catch (e) {
      console.error(e);
    }
  };

  // Show tabs only when both intake AND broadcast messages exist
  const showTabs = isIntakePending && broadcasts.length > 0;

  if (!userData || userData.role === "trainer") {
    return null;
  }

  return (
    <div ref={dropdownRef} className="relative select-none">
      {/* Bell Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 sm:px-2.5 sm:py-2 rounded-2xl border transition-all cursor-pointer flex items-center justify-center ${
          isOpen
            ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
            : unreadCount > 0
            ? "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-300/60 dark:border-amber-700/60 hover:bg-amber-100 dark:hover:bg-amber-900/50 shadow-xs"
            : "bg-slate-100/90 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 shadow-xs"
        }`}
        title="Cadre Directives & Official Academy Announcements"
        aria-label="Cadre Notifications"
      >
        <div className="relative flex items-center justify-center">
          {isOpen ? (
            <BsBellFill size={16} className="text-white" />
          ) : (
            <BsBell
              size={16}
              className={unreadCount > 0 ? "animate-pulse" : ""}
            />
          )}

          {/* Glowing Ping indicator for Unread Directives */}
          {unreadCount > 0 && (
            <>
              <span className="absolute -top-1 -right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <span className="absolute -top-1 -right-1.5 min-w-3.5 h-3.5 px-1 rounded-full bg-rose-600 text-white text-[9px] font-black flex items-center justify-center shadow-xs border border-white dark:border-slate-900">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            </>
          )}
        </div>
      </motion.button>

      {/* Interactive Notification Center Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="absolute right-0 mt-2.5 w-[360px] sm:w-[460px] max-w-[calc(100vw-24px)] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/90 dark:border-slate-800/90 overflow-hidden z-[120] origin-top-right ring-1 ring-black/5"
          >
            {/* Tricolor Government Ribbon Accent */}
            <div className="h-1 w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />

            {/* Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-br from-slate-50 to-blue-50/50 dark:from-slate-800/90 dark:to-blue-950/40 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-700 text-white flex items-center justify-center shadow-md shrink-0">
                    <BsBellFill size={16} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight">
                        Cadre Notification Center
                      </h3>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[9.5px] font-black bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-300/40">
                          {unreadCount} Action{unreadCount > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                    <p className="text-[10.5px] text-slate-500 dark:text-slate-400 font-medium">
                      Official Directives & Academy Circulars
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {unreadCount > 0 && broadcasts.length > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline px-2 py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/60 transition-colors cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <HiX size={16} />
                  </button>
                </div>
              </div>

              {/* Tabs: Only show if both intake directive and broadcasts exist */}
              {showTabs && (
                <div className="flex items-center gap-1 mt-3 bg-slate-200/70 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300">
                  <button
                    onClick={() => setActiveTab("all")}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all cursor-pointer ${
                      activeTab === "all"
                        ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs font-black"
                        : "hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    All Notices
                  </button>
                  <button
                    onClick={() => setActiveTab("intake")}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all cursor-pointer relative ${
                      activeTab === "intake"
                        ? "bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs font-black"
                        : "hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <span>Intake Directive</span>
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500 ml-1.5 align-middle" />
                  </button>
                  <button
                    onClick={() => setActiveTab("broadcasts")}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all cursor-pointer ${
                      activeTab === "broadcasts"
                        ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs font-black"
                        : "hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    Broadcasts ({broadcasts.length})
                  </button>
                </div>
              )}
            </div>

            {/* Scrollable Notifications Feed */}
            <div className="max-h-[380px] overflow-y-auto p-4 space-y-3.5 divide-y divide-slate-100 dark:divide-slate-800/80">
              {/* 1. MANDATORY CADRE DIAGNOSTIC BASELINE INTAKE (ONLY SHOWN IF INTAKE NOT COMPLETED) */}
              {isIntakePending && (activeTab === "all" || activeTab === "intake") && (
                <div className="pt-2 first:pt-0">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-rose-500/10 border-2 border-amber-400/50 dark:border-amber-500/40 shadow-xs space-y-3 relative overflow-hidden">
                    {/* Top Ribbon & Priority Tag */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md text-[9.5px] font-black uppercase tracking-wider bg-rose-600 text-white shadow-xs">
                          Mandatory Cadre Directive
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[9.5px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300/40">
                          Priority 1 Intake
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                        Official NSSTA Secretariat
                      </span>
                    </div>

                    {/* Headline */}
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-snug">
                        Mandatory Cadre Diagnostic Baseline Intake
                      </h4>
                      <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-400">
                        <FaShieldAlt size={11} />
                        <span>Target Role: {targetRole}</span>
                      </div>
                      <p className="mt-0.5 text-[11px] font-extrabold text-amber-700 dark:text-amber-300">
                        {directiveSubTitle}
                      </p>
                    </div>

                    {/* Official Directive Body */}
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-white/70 dark:bg-slate-900/70 p-3 rounded-xl border border-amber-200/50 dark:border-amber-800/40">
                      {directiveMessageText}
                    </p>

                    {/* Status Breakdown: ONLY show what is still pending (if quiz complete not show quiz, vice versa viva) */}
                    <div className="flex items-center justify-between pt-1 text-[11px] flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        {!isQuizCompleted && (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold border border-amber-300/40 shadow-xs">
                            <BsExclamationTriangleFill size={11} className="text-amber-500" />
                            <span>Diagnostic Quiz: Pending</span>
                          </div>
                        )}

                        {!isInterviewCompleted && (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 font-bold border border-purple-300/40 shadow-xs">
                            <BsExclamationTriangleFill size={11} className="text-purple-500" />
                            <span>Oral Viva: Pending</span>
                          </div>
                        )}
                      </div>

                      <span className="text-[10px] text-slate-400 font-semibold">
                        4-Domain Taxonomy
                      </span>
                    </div>

                    {/* Action CTAs: if quiz complete not show quiz, vice-versa viva */}
                    <div className="flex flex-col sm:flex-row gap-2 pt-1">
                      {/* Diagnostic Quiz Button - HIDDEN IF QUIZ IS COMPLETE */}
                      {!isQuizCompleted && (
                        <button
                          onClick={() => {
                            setIsOpen(false);
                            if (diagnosticStatus?.diagnosticQuiz?._id) {
                              navigate(`/quiz/${diagnosticStatus.diagnosticQuiz._id}`);
                            } else {
                              navigate("/quizzes");
                            }
                          }}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-black shadow-md transition-all cursor-pointer group"
                        >
                          <FaTasks size={12} />
                          <span>Start Diagnostic Quiz</span>
                          <BsArrowRight
                            size={11}
                            className="group-hover:translate-x-0.5 transition-transform"
                          />
                        </button>
                      )}

                      {/* Oral Viva Button - HIDDEN IF VIVA IS COMPLETE */}
                      {!isInterviewCompleted && (
                        <button
                          onClick={() => {
                            setIsOpen(false);
                            navigate("/interview?type=intake");
                          }}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white rounded-xl text-xs font-black shadow-md transition-all cursor-pointer group"
                        >
                          <FaMicrophone size={12} />
                          <span>Start Oral Viva</span>
                          <BsArrowRight
                            size={11}
                            className="group-hover:translate-x-0.5 transition-transform"
                          />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 2. ADMIN BROADCAST MESSAGES - ONLY SHOWN IF BROADCASTS > 0 */}
              {broadcasts.length > 0 && (activeTab === "all" || activeTab === "broadcasts") && (
                <div className="pt-3 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                      <FaBullhorn size={11} className="text-blue-600" />
                      <span>Admin Broadcast Messages</span>
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      {broadcasts.length} total
                    </span>
                  </div>

                  {broadcasts.map((b) => (
                    <div
                      key={b._id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 border border-slate-200/70 dark:border-slate-800 transition-colors space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-600" />
                          <span className="text-[11px] font-black text-blue-700 dark:text-blue-400 truncate max-w-[220px]">
                            {b.senderCadre || "NSSTA Secretariat"}
                          </span>
                        </div>
                        <span className="text-[10px] font-medium text-slate-400 shrink-0">
                          {formatTimeAgo(b.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed whitespace-pre-wrap">
                        {b.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* ALL CLEAR STATE: When Intake is completed (0 remaining) AND Broadcast messages count is 0 */}
              {!isIntakePending && broadcasts.length === 0 && (
                <div className="p-6 text-center space-y-2.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs border border-emerald-200/70 dark:border-emerald-800/70">
                    <BsCheckCircleFill size={22} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">
                      All Cadre Directives Completed
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-1 leading-relaxed">
                      Your mandatory diagnostic quiz and oral viva evaluations are fully completed, and there are no active broadcast circulars from the NSSTA Secretariat.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
