import React, { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Markdown from "react-markdown";
import toast from "react-hot-toast";

import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useSpring,
  useMotionValueEvent,
} from "framer-motion";

import { ServerUrl } from "../App";
import { generateModelHistoryPDF } from "../utils/pdfGenerator";

import {
  FaCalendarAlt,
  FaBriefcase,
  FaChartLine,
  FaTrophy,
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaFilePdf,
  FaFileAlt,
  FaBrain,
  FaTasks,
  FaComments,
  FaSearch,
  FaTrashAlt,
  FaExternalLinkAlt,
  FaCheckCircle,
  FaTimes,
  FaCopy,
  FaCheck,
  FaUserTie,
  FaLayerGroup,
  FaGraduationCap,
  FaUndo,
  FaChevronLeft,
  FaChevronRight,
  FaArrowUp,
  FaSpinner,
} from "react-icons/fa";

import {
  BsFillCameraVideoFill,
  BsRobot,
  BsShieldCheck,
  BsArrowRight,
  BsSortDown,
  BsMouse,
} from "react-icons/bs";

import { HiOutlineArrowNarrowRight, HiSparkles } from "react-icons/hi";

const MODEL_FILTERS = [
  {
    id: "all",
    label: "All AI Models",
    icon: FaLayerGroup,
    badgeColor: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700",
    activeColor: "from-blue-600 via-indigo-600 to-blue-700 text-white shadow-blue-500/25",
  },
  {
    id: "chat",
    label: "SankhyaCopilot Chat",
    icon: BsRobot,
    badgeColor: "bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
    activeColor: "from-indigo-600 via-purple-600 to-indigo-800 text-white shadow-indigo-500/25",
  },
  {
    id: "interview",
    label: "Mock Viva Voce",
    icon: BsFillCameraVideoFill,
    badgeColor: "bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    activeColor: "from-blue-600 via-indigo-600 to-blue-700 text-white shadow-blue-500/25",
  },
  {
    id: "assignment",
    label: "Case Study Practicum",
    icon: FaFileAlt,
    badgeColor: "bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    activeColor: "from-amber-500 via-orange-600 to-amber-700 text-white shadow-amber-500/25",
  },
  {
    id: "quiz",
    label: "Diagnostic Quizzes",
    icon: FaTasks,
    badgeColor: "bg-teal-50 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800",
    activeColor: "from-teal-500 via-emerald-600 to-teal-700 text-white shadow-teal-500/25",
  },
  {
    id: "competency",
    label: "Competency Radar",
    icon: FaBrain,
    badgeColor: "bg-cyan-50 dark:bg-cyan-950/70 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800",
    activeColor: "from-cyan-600 via-blue-700 to-indigo-800 text-white shadow-cyan-500/25",
  },
];

const HistoryCardSkeleton = ({ index = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className="relative rounded-3xl p-[1px] overflow-hidden bg-gradient-to-r from-transparent via-slate-200/60 to-transparent dark:via-slate-700/60 shadow-sm"
    >
      <div className="relative h-full rounded-[23px] bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-slate-200/70 dark:border-slate-800 p-5 sm:p-6 overflow-hidden">
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-slate-200/40 dark:via-slate-700/25 to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="h-6 w-36 rounded-full bg-slate-200/90 dark:bg-slate-800/90 animate-pulse flex items-center gap-1.5 px-3">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                <div className="w-20 h-2 rounded-full bg-slate-300 dark:bg-slate-700" />
              </div>
              <div className="h-5 w-20 rounded-full bg-slate-200/70 dark:bg-slate-800/70 animate-pulse" />
              <div className="h-4 w-24 rounded-full bg-slate-200/50 dark:bg-slate-800/50 animate-pulse" />
            </div>

            <div className="h-6 w-3/4 max-w-md rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />

            <div className="space-y-1.5 pt-0.5">
              <div className="h-3.5 w-full max-w-2xl rounded-full bg-slate-200/70 dark:bg-slate-800/70 animate-pulse" />
              <div className="h-3.5 w-4/5 max-w-lg rounded-full bg-slate-200/50 dark:bg-slate-800/50 animate-pulse" />
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <div className="h-6 w-36 rounded-lg bg-slate-200/80 dark:bg-slate-800/80 animate-pulse" />
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <div key={s} className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between lg:justify-end gap-4 border-t lg:border-t-0 border-slate-100 dark:border-slate-800 pt-4 lg:pt-0">
            <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 w-24 h-16 animate-pulse space-y-1.5">
              <div className="h-5 w-12 rounded-lg bg-slate-300/80 dark:bg-slate-700/80" />
              <div className="h-2 w-8 rounded-full bg-slate-300/60 dark:bg-slate-700/60" />
            </div>

            <div className="flex items-center gap-2">
              <div className="w-16 h-9 rounded-xl bg-slate-200/80 dark:bg-slate-800/80 animate-pulse" />
              <div className="w-9 h-9 rounded-xl bg-slate-200/80 dark:bg-slate-800/80 animate-pulse" />
              <div className="w-9 h-9 rounded-xl bg-slate-200/80 dark:bg-slate-800/80 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const InterviewHistory = () => {
  const { userData } = useSelector((state) => state.user);
  const navigate = useNavigate();

  const [selectedFilter, setSelectedFilter] = useState("all");
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const modelScrollRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const [chats, setChats] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  const INITIAL_VISIBLE_COUNT = 6;
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isMouseScrolling, setIsMouseScrolling] = useState(false);
  const loadMoreTriggerRef = useRef(null);
  const scrollTimeoutRef = useRef(null);

  const [activeModalItem, setActiveModalItem] = useState(null);
  const [copiedMsgIdx, setCopiedMsgIdx] = useState(null);

  const checkScrollPosition = () => {
    if (modelScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = modelScrollRef.current;
      setCanScrollLeft(scrollLeft > 6);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 6);
    }
  };

  const scrollModels = (direction) => {
    if (modelScrollRef.current) {
      const scrollAmount = direction === "left" ? -280 : 280;
      modelScrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      setTimeout(checkScrollPosition, 320);
    }
  };

  useEffect(() => {
    checkScrollPosition();
    const el = modelScrollRef.current;
    if (el) {
      el.addEventListener("scroll", checkScrollPosition);
      window.addEventListener("resize", checkScrollPosition);
      return () => {
        el.removeEventListener("scroll", checkScrollPosition);
        window.removeEventListener("resize", checkScrollPosition);
      };
    }
  }, [loading]);

  const [scrollDirection, setScrollDirection] = useState("down");
  const { scrollY, scrollYProgress } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious();
    if (!previous) return;
    setScrollDirection(latest > previous ? "down" : "up");
  });

  const y1 = useTransform(scrollY, [0, 1000], [0, 300]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -300]);
  const rotateGlow = useTransform(scrollY, [0, 1000], [0, 25]);
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE_COUNT);
    setIsLoadingMore(false);
  }, [selectedFilter, searchQuery, statusFilter, sortBy]);

  const loadMoreItems = () => {
    if (isLoadingMore) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + 4);
      setIsLoadingMore(false);
    }, 600);
  };


  useEffect(() => {
    const fetchAllHistories = async () => {
      setLoading(true);
      try {
        const [chatRes, interviewRes, assignmentRes, quizRes] = await Promise.allSettled([
          axios.get(`${ServerUrl}/api/chat/get`, { withCredentials: true }),
          axios.get(`${ServerUrl}/api/interview/get-interview`, { withCredentials: true }),
          axios.get(`${ServerUrl}/api/assignments/history/my-submissions`, { withCredentials: true }),
          axios.get(`${ServerUrl}/api/quizzes/history/my-attempts`, { withCredentials: true }),
        ]);

        if (chatRes.status === "fulfilled" && chatRes.value?.data?.chats) {
          setChats(chatRes.value.data.chats);
        }
        if (interviewRes.status === "fulfilled" && Array.isArray(interviewRes.value?.data)) {
          setInterviews(interviewRes.value.data);
        }
        if (assignmentRes.status === "fulfilled" && assignmentRes.value?.data?.submissions) {
          setAssignments(assignmentRes.value.data.submissions);
        }
        if (quizRes.status === "fulfilled" && quizRes.value?.data?.attempts) {
          setQuizzes(quizRes.value.data.attempts);
        }
      } catch (err) {
        console.error("Error loading multi-model histories:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllHistories();
  }, []);

  const handleDeleteInterview = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this Viva Voce interview record?")) return;
    try {
      await axios.delete(`${ServerUrl}/api/interview/delete-interview/${id}`, { withCredentials: true });
      setInterviews((prev) => prev.filter((item) => item._id !== id));
      toast.success("Interview record deleted successfully.");
      if (activeModalItem?.id === id) setActiveModalItem(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete interview record.");
    }
  };

  const handleDeleteChat = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this Copilot chat session?")) return;
    try {
      await axios.delete(`${ServerUrl}/api/chat/${id}`, { withCredentials: true });
      setChats((prev) => prev.filter((item) => item._id !== id));
      toast.success("Chat session deleted successfully.");
      if (activeModalItem?.id === id) setActiveModalItem(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete chat session.");
    }
  };

  const renderStars = (score) => {
    const starValue = score / 2;
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= starValue) {
        stars.push(<FaStar key={i} className="text-amber-400 text-xs" />);
      } else if (i - 0.5 <= starValue) {
        stars.push(<FaStarHalfAlt key={i} className="text-amber-400 text-xs" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-slate-300 dark:text-slate-600 text-xs" />);
      }
    }
    return stars;
  };

  const unifiedHistory = useMemo(() => {
    const list = [];

    chats.forEach((c) => {
      const msgCount = c.messages?.length || 0;
      const lastMsg = msgCount > 0 ? c.messages[msgCount - 1]?.content : "No messages";
      list.push({
        id: c._id,
        type: "chat",
        title: c.name || "Statistical Methodology Consultation",
        subtitle: `${msgCount} exchanges • SankhyaCopilot AI`,
        topic: "MoSPI Methodology & Circulars",
        date: new Date(c.updatedAt || c.createdAt || Date.now()),
        score: null,
        previewText: lastMsg,
        status: "Active Session",
        modelName: "SankhyaCopilot AI",
        modelBadge: "Domain Chat",
        gradient: "from-indigo-600 via-purple-600 to-indigo-800",
        glowBorder: "border-indigo-500/30 dark:border-indigo-500/40 hover:border-indigo-500",
        icon: BsRobot,
        iconBg: "bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400",
        raw: c,
      });
    });

    interviews.forEach((i) => {
      const sc = i.finalScore || 0;
      const qList = i.question || i.questions || [];
      list.push({
        id: i._id,
        type: "interview",
        title: i.role || "Cadre Viva Voce",
        subtitle: `${i.experience || "Intermediate"} • ${(i.mode || "Technical").toUpperCase()} Mode`,
        topic: i.role,
        date: new Date(i.createdAt || Date.now()),
        score: sc,
        scoreMax: 10,
        scoreLabel: `${sc} / 10`,
        previewText: `Spoken Viva Voce session with ${qList.length} questions evaluated.`,
        status: i.status === "completed" ? "Completed" : "In Progress",
        modelName: "Cadre Mock Viva Voce",
        modelBadge: "Voice & Video AI",
        gradient: "from-blue-600 via-indigo-600 to-blue-700",
        glowBorder: "border-blue-500/30 dark:border-blue-500/40 hover:border-blue-500",
        icon: BsFillCameraVideoFill,
        iconBg: "bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400",
        raw: {
          ...i,
          questions: qList,
          question: qList,
        },
      });
    });

    assignments.forEach((a) => {
      const overallMarks = a.aiEvaluation?.overallScore || 0;
      const grade = a.aiEvaluation?.grade || "A";
      list.push({
        id: a._id,
        type: "assignment",
        title: a.assignmentTitle || "Operational Case Study Practicum",
        subtitle: `${a.targetCompetency || "Official Statistics"} • Grade: ${grade}`,
        topic: a.targetCompetency || "Practicum",
        date: new Date(a.createdAt || Date.now()),
        score: overallMarks,
        scoreMax: 100,
        scoreLabel: `${overallMarks} / 100`,
        previewText: a.aiEvaluation?.detailedFeedback || a.submissionText?.substring(0, 120) + "...",
        status: "Evaluated",
        modelName: "Case Study Rubric Evaluator",
        modelBadge: "4-Criterion Rubric",
        gradient: "from-amber-500 via-orange-600 to-amber-700",
        glowBorder: "border-amber-500/30 dark:border-amber-500/40 hover:border-amber-500",
        icon: FaFileAlt,
        iconBg: "bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400",
        raw: a,
      });
    });

    quizzes.forEach((q) => {
      const sc = q.score || 0;
      const totalQ = q.totalQuestions || 0;
      const correct = q.correctCount || 0;
      list.push({
        id: q._id,
        type: "quiz",
        title: q.quizTitle || `${q.topic} Assessment`,
        subtitle: `${q.topic || "Core Topic"} • ${correct}/${totalQ} Correct • ${q.difficulty || "Medium"}`,
        topic: q.topic || "Diagnostic",
        date: new Date(q.createdAt || Date.now()),
        score: sc,
        scoreMax: 100,
        scoreLabel: `${sc}%`,
        previewText: q.aiFeedback || `Timed diagnostic examination completed with ${q.accuracy || sc}% accuracy.`,
        status: q.passed ? "Passed" : "Needs Review",
        modelName: "Diagnostic Test Engine",
        modelBadge: "Timed Test",
        gradient: "from-teal-500 via-emerald-600 to-teal-700",
        glowBorder: "border-teal-500/30 dark:border-teal-500/40 hover:border-teal-500",
        icon: FaTasks,
        iconBg: "bg-teal-100 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400",
        raw: q,
      });
    });

    if (userData?.competencies && userData.competencies.length > 0) {
      list.push({
        id: "competency-profile-main",
        type: "competency",
        title: `${userData.jobRole || "Cadre"} Competency Radar & Skill Gap Analysis`,
        subtitle: `${userData.competencies.length} Assessed Competencies • ${userData.skillGaps?.length || 0} Priority Gaps`,
        topic: "Cadre Matrix Taxonomy",
        date: new Date(userData.updatedAt || Date.now()),
        score: userData.overallCompetencyScore || 72,
        scoreMax: 100,
        scoreLabel: `${userData.overallCompetencyScore || 72}%`,
        previewText: `Assessed across 4 domains (Statistical, Technical, Governance, Managerial) with targeted iGOT learning pathways.`,
        status: "Active Matrix",
        modelName: "Cadre Competency Engine",
        modelBadge: "Skill Gap Matrix",
        gradient: "from-cyan-600 via-blue-700 to-indigo-800",
        glowBorder: "border-cyan-500/30 dark:border-cyan-500/40 hover:border-cyan-500",
        icon: FaBrain,
        iconBg: "bg-cyan-100 dark:bg-cyan-950/80 text-cyan-600 dark:text-cyan-400",
        raw: userData,
      });
    }

    return list;
  }, [chats, interviews, assignments, quizzes, userData]);

  const filteredHistory = useMemo(() => {
    let result = unifiedHistory;

    if (selectedFilter !== "all") {
      result = result.filter((item) => item.type === selectedFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.title?.toLowerCase().includes(q) ||
          item.subtitle?.toLowerCase().includes(q) ||
          item.topic?.toLowerCase().includes(q) ||
          item.previewText?.toLowerCase().includes(q)
      );
    }

    if (statusFilter === "completed") {
      result = result.filter(
        (item) =>
          item.status === "Completed" ||
          item.status === "Evaluated" ||
          item.status === "Passed"
      );
    } else if (statusFilter === "high-score") {
      result = result.filter((item) => {
        if (item.score === null) return false;
        return item.scoreMax === 10 ? item.score >= 8 : item.score >= 75;
      });
    } else if (statusFilter === "needs-review") {
      result = result.filter(
        (item) =>
          item.status === "Needs Review" ||
          (item.score !== null &&
            (item.scoreMax === 10 ? item.score < 5 : item.score < 50))
      );
    }

    result.sort((a, b) => {
      if (sortBy === "newest") return b.date - a.date;
      if (sortBy === "oldest") return a.date - b.date;
      if (sortBy === "score") {
        const scoreA = a.score !== null ? (a.scoreMax === 10 ? a.score * 10 : a.score) : -1;
        const scoreB = b.score !== null ? (b.scoreMax === 10 ? b.score * 10 : b.score) : -1;
        return scoreB - scoreA;
      }
      return b.date - a.date;
    });

    return result;
  }, [unifiedHistory, selectedFilter, searchQuery, statusFilter, sortBy]);

  const visibleHistory = useMemo(() => {
    return filteredHistory.slice(0, visibleCount);
  }, [filteredHistory, visibleCount]);
  useEffect(() => {
    if (loading) return;
    const target = loadMoreTriggerRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && !isLoadingMore && visibleCount < filteredHistory.length) {
          loadMoreItems();
        }
      },
      { threshold: 0.1, rootMargin: "300px" }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [loading, isLoadingMore, visibleCount, filteredHistory.length]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollYVal = window.scrollY || document.documentElement.scrollTop;
      setShowScrollTop(scrollYVal > 400);

      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;

      if (
        scrollYVal + clientHeight >= scrollHeight - 350 &&
        !isLoadingMore &&
        visibleCount < filteredHistory.length &&
        !loading
      ) {
        loadMoreItems();
      }
    };

    const handleWheel = (e) => {
      if (e.deltaY > 0) {
        setIsMouseScrolling(true);
        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = setTimeout(() => {
          setIsMouseScrolling(false);
        }, 1200);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("wheel", handleWheel, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("wheel", handleWheel);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [isLoadingMore, visibleCount, filteredHistory.length, loading]);


  const counts = useMemo(() => {
    return {
      all: unifiedHistory.length,
      chat: chats.length,
      interview: interviews.length,
      assignment: assignments.length,
      quiz: quizzes.length,
      competency: userData?.competencies?.length ? 1 : 0,
    };
  }, [unifiedHistory, chats, interviews, assignments, quizzes, userData]);

  const headerMetrics = useMemo(() => {
    if (selectedFilter === "chat") {
      const totalMessages = chats.reduce((acc, c) => acc + (c.messages?.length || 0), 0);
      return [
        { label: "Total Chats", value: chats.length, icon: FaComments, color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-100 dark:bg-indigo-950" },
        { label: "Total Exchanges", value: totalMessages, icon: BsRobot, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-100 dark:bg-purple-950" },
        { label: "AI Engine", value: "SankhyaCopilot", icon: HiSparkles, color: "text-cyan-600 dark:text-cyan-400", bg: "bg-cyan-100 dark:bg-cyan-950" },
      ];
    }
    if (selectedFilter === "interview") {
      const completed = interviews.filter((i) => i.status === "completed");
      const avg = completed.length
        ? (completed.reduce((acc, i) => acc + (i.finalScore || 0), 0) / completed.length).toFixed(1)
        : "0.0";
      const best = completed.length ? Math.max(...completed.map((i) => i.finalScore || 0)) : 0;
      return [
        { label: "Total Interviews", value: interviews.length, icon: FaBriefcase, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-950" },
        { label: "Average Viva Score", value: `${avg} / 10`, icon: FaChartLine, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-950" },
        { label: "Best Score", value: `${best} / 10`, icon: FaTrophy, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-950" },
      ];
    }
    if (selectedFilter === "assignment") {
      const avgMarks = assignments.length
        ? Math.round(assignments.reduce((acc, a) => acc + (a.aiEvaluation?.overallScore || 0), 0) / assignments.length)
        : 0;
      return [
        { label: "Evaluated Case Studies", value: assignments.length, icon: FaFileAlt, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-950" },
        { label: "Average Marks", value: `${avgMarks} / 100`, icon: FaChartLine, color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-100 dark:bg-orange-950" },
        { label: "Rubric Criteria", value: "4 Dimensions", icon: BsShieldCheck, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-950" },
      ];
    }
    if (selectedFilter === "quiz") {
      const avgAccuracy = quizzes.length
        ? Math.round(quizzes.reduce((acc, q) => acc + (q.accuracy || q.score || 0), 0) / quizzes.length)
        : 0;
      const passedCount = quizzes.filter((q) => q.passed).length;
      return [
        { label: "Quizzes Attempted", value: quizzes.length, icon: FaTasks, color: "text-teal-600 dark:text-teal-400", bg: "bg-teal-100 dark:bg-teal-950" },
        { label: "Average Accuracy", value: `${avgAccuracy}%`, icon: FaChartLine, color: "text-cyan-600 dark:text-cyan-400", bg: "bg-cyan-100 dark:bg-cyan-950" },
        { label: "Passed Attempts", value: `${passedCount} / ${quizzes.length}`, icon: FaCheckCircle, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-950" },
      ];
    }
    if (selectedFilter === "competency") {
      return [
        { label: "Overall Competency Index", value: `${userData?.overallCompetencyScore || 72}%`, icon: FaBrain, color: "text-cyan-600 dark:text-cyan-400", bg: "bg-cyan-100 dark:bg-cyan-950" },
        { label: "Identified Skill Gaps", value: userData?.skillGaps?.length || 0, icon: FaChartLine, color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-100 dark:bg-rose-950" },
        { label: "Assigned Pathway Steps", value: userData?.learningPath?.length || 3, icon: FaGraduationCap, color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-100 dark:bg-indigo-950" },
      ];
    }
    return [
      { label: "Total AI Sessions", value: unifiedHistory.length, icon: FaLayerGroup, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-950" },
      { label: "Active AI Models", value: "6 Engines", icon: HiSparkles, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-100 dark:bg-purple-950" },
      { label: "Official PDF Dossiers", value: "Available", icon: FaFilePdf, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-950" },
    ];
  }, [selectedFilter, unifiedHistory, chats, interviews, assignments, quizzes, userData]);

  const handleDownloadPDF = (item, e) => {
    if (e) e.stopPropagation();
    toast.success(`Generating official MoSPI PDF for ${item.title}... 📄`);
    generateModelHistoryPDF({
      type: item.type,
      record: item.raw,
      user: userData,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950 pt-15 pb-10 px-4 sm:px-6 lg:px-8 transition-colors duration-300"
    >
      <Navbar />

      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 origin-left z-[100]"
        style={{ scaleX }}
      />

      <motion.div
        style={{ y: y1, rotate: rotateGlow }}
        className="absolute top-0 left-0 w-[32rem] h-[32rem] bg-blue-400/15 dark:bg-blue-500/10 blur-3xl rounded-full pointer-events-none"
      />
      <motion.div
        style={{ y: y2, rotate: rotateGlow }}
        className="absolute bottom-0 right-0 w-[32rem] h-[32rem] bg-indigo-400/15 dark:bg-indigo-500/10 blur-3xl rounded-full pointer-events-none"
      />
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] bg-[radial-gradient(circle_at_center,black_1px,transparent_1px)] dark:bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto space-y-8">
        <motion.div
          animate={{
            y: scrollDirection === "down" ? -6 : 0,
            scale: scrollDirection === "down" ? 0.99 : 1,
          }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="sticky top-4 z-40 backdrop-blur-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:px-7 sm:py-2 shadow-xl space-y-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 text-[10px] font-extrabold uppercase tracking-widest border border-blue-200 dark:border-blue-800 ">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>SankhyaIQ™ Multi-Model Intelligence Archive</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                AI Models <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500">History Hub</span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1 text-xs sm:text-sm font-medium max-w-2xl">
                Inspect your complete AI session transcripts, viva scorecards, rubric evaluations, and download official MoSPI PDF records.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-3.5 w-full lg:w-auto items-center">
              {headerMetrics.map((m, idx) => {
                const Icon = m.icon;
                return (
                  <motion.div
                    key={idx}
                    whileHover={{ y: -3 }}
                    className="bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl px-4 py-2.5 shadow-2xs flex items-center gap-3 min-w-[170px]"
                  >
                    <div className={`p-2.5 rounded-xl ${m.bg} ${m.color} text-base sm:text-lg shrink-0`}>
                      <Icon />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold leading-tight truncate">
                        {m.label}
                      </p>
                      <h3
                        className="text-sm sm:text-base lg:text-lg font-black text-slate-900 dark:text-white leading-tight truncate"
                        title={m.value}
                      >
                        {m.value}
                      </h3>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className=" space-y-4">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5 bg-slate-50/90 dark:bg-slate-800/60 p-3.5 sm:p-4 rounded-2xl border border-slate-200/70 dark:border-slate-700/70">
              <div className="relative flex-1 min-w-[260px]">
                <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                <input
                  type="text"
                  placeholder="Search across all AI transcripts, topics, cadres, questions, feedback..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium shadow-2xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs cursor-pointer"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2.5">

                <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-1 rounded-xl shadow-2xs">
                  <button
                    onClick={() => setStatusFilter("all")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${statusFilter === "all"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                  >
                    All Status
                  </button>
                  <button
                    onClick={() => setStatusFilter("completed")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${statusFilter === "completed"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                  >
                    Completed
                  </button>
                  <button
                    onClick={() => setStatusFilter("high-score")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${statusFilter === "high-score"
                      ? "bg-amber-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                  >
                    Top Score (≥75%)
                  </button>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 shadow-2xs">
                  <BsSortDown size={14} className="text-slate-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-transparent focus:outline-none cursor-pointer pr-1"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="score">Highest Score</option>
                  </select>
                </div>

                {(searchQuery || statusFilter !== "all" || sortBy !== "newest") && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setStatusFilter("all");
                      setSortBy("newest");
                    }}
                    title="Reset all search and filter options"
                    className="px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-xs font-bold hover:bg-rose-600 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <FaUndo size={10} />
                    <span>Reset</span>
                  </button>
                )}

                <span className="px-3 py-1.5 rounded-xl bg-slate-200/80 dark:bg-slate-700/80 text-slate-700 dark:text-slate-300 text-[11px] font-extrabold whitespace-nowrap">
                  {filteredHistory.length} Sessions
                </span>
              </div>
            </div>

            <div className="relative flex items-center gap-2">
              <AnimatePresence>
                {canScrollLeft && (
                  <motion.button
                    type="button"
                    initial={{ opacity: 0, scale: 0.8, width: 0 }}
                    animate={{ opacity: 1, scale: 1, width: "2.25rem" }}
                    exit={{ opacity: 0, scale: 0.8, width: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => scrollModels("left")}
                    title="Scroll AI Models Left"
                    aria-label="Scroll AI Models Left"
                    className="flex-shrink-0 w-9 h-9 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center transition-all shadow-sm hover:scale-105 active:scale-95 cursor-pointer overflow-hidden"
                  >
                    <FaChevronLeft size={12} />
                  </motion.button>
                )}
              </AnimatePresence>

              <div
                ref={modelScrollRef}
                onScroll={checkScrollPosition}
                className="flex-1 flex items-center gap-2 overflow-x-auto scroll-smooth px-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden select-none"
              >
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-400 whitespace-nowrap mr-1 hidden sm:inline">
                  AI Models:
                </span>
                {MODEL_FILTERS.map((f) => {
                  const Icon = f.icon;
                  const isSelected = selectedFilter === f.id;
                  const count = counts[f.id] || 0;

                  return (
                    <button
                      key={f.id}
                      onClick={() => setSelectedFilter(f.id)}
                      className={`flex-shrink-0 relative flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all duration-300 whitespace-nowrap cursor-pointer select-none ${isSelected
                        ? `bg-gradient-to-r ${f.activeColor} shadow-md scale-105`
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white border border-slate-200/60 dark:border-slate-700/60"
                        }`}
                    >
                      <Icon className={isSelected ? "text-white" : "text-slate-500 dark:text-slate-400"} />
                      <span>{f.label}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${isSelected
                          ? "bg-white/20 text-white"
                          : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                          }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              <AnimatePresence>
                {canScrollRight && (
                  <motion.button
                    type="button"
                    initial={{ opacity: 0, scale: 0.8, width: 0 }}
                    animate={{ opacity: 1, scale: 1, width: "2.25rem" }}
                    exit={{ opacity: 0, scale: 0.8, width: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => scrollModels("right")}
                    title="Scroll AI Models Right"
                    aria-label="Scroll AI Models Right"
                    className="flex-shrink-0 w-9 h-9 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center transition-all shadow-sm hover:scale-105 active:scale-95 cursor-pointer overflow-hidden"
                  >
                    <FaChevronRight size={12} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="grid gap-5">
            {[1, 2, 3, 4].map((n, idx) => (
              <HistoryCardSkeleton key={n} index={idx} />
            ))}
          </div>
        ) : filteredHistory.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 rounded-3xl p-16 text-center shadow-xl"
          >
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-950 dark:to-indigo-950 flex items-center justify-center mb-5 shadow-lg animate-pulse">
                <BsRobot className="text-blue-600 dark:text-blue-400 text-3xl" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                No History Found for {MODEL_FILTERS.find((f) => f.id === selectedFilter)?.label || "Selected Model"}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mt-2 text-xs sm:text-sm leading-relaxed">
                {searchQuery || statusFilter !== "all"
                  ? `No records matching your search/filters. Try clearing or changing your filters.`
                  : "Start a new session on this AI engine from the AI Models Hub to generate your official intelligence records."}
              </p>
              <div className="mt-6 flex items-center justify-center gap-3">
                {(searchQuery || statusFilter !== "all") && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setStatusFilter("all");
                    }}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all cursor-pointer"
                  >
                    Clear Search Filters
                  </button>
                )}
                <button
                  onClick={() => navigate("/ai-models")}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs transition-all shadow-md hover:scale-105 cursor-pointer inline-flex items-center gap-2"
                >
                  <span>Launch AI Models Hub</span>
                  <BsArrowRight />
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-5">
            <motion.div
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: {
                  transition: { staggerChildren: 0.08 },
                },
              }}
              className="grid gap-5"
            >
              {visibleHistory.map((item, index) => {
                const Icon = item.icon;

                return (
                  <motion.div
                    key={item.id || index}
                    initial={{ opacity: 0, y: 30, scale: 0.98 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, amount: 0.15 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    whileHover={{ y: -4, scale: 1.005 }}
                    onClick={() => setActiveModalItem(item)}
                    className={`group relative cursor-pointer rounded-3xl p-[1px] overflow-hidden bg-gradient-to-r from-transparent via-slate-200/50 to-transparent dark:via-slate-700/50 transition-all duration-300 shadow-sm hover:shadow-xl`}
                  >
                    <div
                      className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r ${item.gradient} p-[1.5px]`}
                    />

                    <div className="relative h-full rounded-[23px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/70 dark:border-slate-800 p-5 sm:p-6 transition-all duration-300">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                        {/* Left info column */}
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2.5 mb-3">
                            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${item.iconBg}`}>
                              <Icon size={12} />
                              <span>{item.modelName}</span>
                            </div>

                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                              {item.status}
                            </span>
                            <div className="flex items-center gap-1 text-slate-400 text-xs font-semibold">
                              <FaCalendarAlt size={10} />
                              <span>
                                {item.date.toLocaleDateString(undefined, {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            </div>
                          </div>

                          <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {item.title}
                          </h2>

                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium line-clamp-2">
                            {item.previewText}
                          </p>

                          <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
                            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 font-bold">
                              {item.subtitle}
                            </span>
                            {item.type === "interview" && item.score !== null && (
                              <div className="flex items-center gap-1">
                                {renderStars(item.score)}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between lg:justify-end gap-4 border-t lg:border-t-0 border-slate-100 dark:border-slate-800 pt-4 lg:pt-0">
                          {item.score !== null && (
                            <div className="flex flex-col items-center justify-center px-4 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 min-w-[80px]">
                              <span
                                className={`text-xl font-black ${(item.scoreMax === 10 ? item.score >= 8 : item.score >= 70)
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : (item.scoreMax === 10 ? item.score >= 5 : item.score >= 50)
                                    ? "text-amber-600 dark:text-amber-400"
                                    : "text-rose-600 dark:text-rose-400"
                                  }`}
                              >
                                {item.scoreLabel}
                              </span>
                              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">
                                {item.type === "assignment" ? "MARKS" : item.type === "quiz" ? "ACCURACY" : "SCORE"}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => handleDownloadPDF(item, e)}
                              title="Download Official MoSPI PDF Dossier"
                              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white text-xs font-bold transition-all shadow-xs hover:shadow-md cursor-pointer"
                            >
                              <FaFilePdf size={13} />
                              <span className="hidden sm:inline">PDF</span>
                            </button>

                            {item.type === "interview" && (
                              <button
                                onClick={(e) => handleDeleteInterview(item.id, e)}
                                title="Delete Interview Record"
                                className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white transition-all text-xs cursor-pointer"
                              >
                                <FaTrashAlt size={12} />
                              </button>
                            )}
                            {item.type === "chat" && (
                              <button
                                onClick={(e) => handleDeleteChat(item.id, e)}
                                title="Delete Chat Session"
                                className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white transition-all text-xs cursor-pointer"
                              >
                                <FaTrashAlt size={12} />
                              </button>
                            )}

                            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-xs">
                              <HiOutlineArrowNarrowRight size={18} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            {isLoadingMore && (
              <div className="space-y-4 pt-2">
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="p-4 rounded-3xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-emerald-500/10 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-emerald-900/20 border border-blue-500/20 dark:border-blue-500/30 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative flex items-center justify-center">
                      <span className="w-8 h-8 rounded-full bg-blue-500/20 dark:bg-blue-400/20 animate-ping absolute" />
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-sm shadow-md animate-spin">
                        <FaSpinner />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                          Retrieving Multi-Model Archive
                        </span>
                        <span className="flex gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        Loading next batch of session dossiers and evaluations on scroll...
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-[11px] font-bold text-slate-600 dark:text-slate-300 shadow-2xs">
                    <span>Loaded</span>
                    <span className="text-blue-600 dark:text-blue-400 font-extrabold">{visibleHistory.length}</span>
                    <span>of</span>
                    <span className="text-slate-900 dark:text-white font-extrabold">{filteredHistory.length}</span>
                  </div>
                </motion.div>

                <div className="grid gap-5">
                  <HistoryCardSkeleton index={0} />
                  <HistoryCardSkeleton index={1} />
                </div>
              </div>
            )}

            <div ref={loadMoreTriggerRef} className="h-6 w-full pointer-events-none" />

            {visibleCount < filteredHistory.length && !isLoadingMore && (
              <div className="flex flex-col items-center justify-center pt-2 pb-4">
                <button
                  onClick={loadMoreItems}
                  className="group px-6 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-blue-500/50 shadow-md hover:shadow-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all flex items-center gap-2.5 cursor-pointer hover:scale-102"
                >
                  <BsMouse className="text-blue-500 group-hover:animate-bounce" size={14} />
                  <span>Scroll mouse down or click to load more sessions ({filteredHistory.length - visibleCount} remaining)</span>
                  <BsArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      <AnimatePresence>
        {activeModalItem && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModalItem(null)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative w-full max-w-4xl max-h-[88vh] flex flex-col bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10"
            >
              <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 bg-slate-50/80 dark:bg-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-2xl ${activeModalItem.iconBg} text-xl shadow-xs`}>
                    <activeModalItem.icon />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-extrabold tracking-widest text-blue-600 dark:text-blue-400">
                        {activeModalItem.modelName}
                      </span>
                      <span className="text-slate-300 dark:text-slate-600">•</span>
                      <span className="text-xs text-slate-400 font-semibold">
                        {activeModalItem.date.toLocaleString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                      {activeModalItem.title}
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownloadPDF(activeModalItem)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                  >
                    <FaFilePdf />
                    <span>Download Official PDF</span>
                  </button>

                  <button
                    onClick={() => setActiveModalItem(null)}
                    className="p-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-rose-500 hover:text-white transition-all cursor-pointer"
                  >
                    <FaTimes size={14} />
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-6">
                {activeModalItem.type === "chat" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/60 rounded-2xl p-4">
                      <div className="flex items-center gap-3">
                        <BsRobot className="text-indigo-600 dark:text-indigo-400 text-2xl" />
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            SankhyaCopilot Official Statistical Transcript
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Total {activeModalItem.raw.messages?.length || 0} dialogue messages in this session.
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(`/chat/${activeModalItem.id}`)}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <span>Resume Chat</span>
                        <FaExternalLinkAlt size={10} />
                      </button>
                    </div>

                    <div className="space-y-4 pt-2">
                      {(activeModalItem.raw.messages || []).map((msg, idx) => {
                        const isUser = msg.role === "user";

                        return (
                          <div
                            key={idx}
                            className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
                          >
                            {!isUser && (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shrink-0 text-xs font-bold">
                                <BsRobot />
                              </div>
                            )}

                            <div
                              className={`relative max-w-[85%] rounded-2xl p-4 shadow-xs text-xs leading-relaxed ${isUser
                                ? "bg-blue-600 text-white font-medium"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700"
                                }`}
                            >
                              <div className="flex items-center justify-between gap-4 mb-1 text-[10px] opacity-70 font-semibold">
                                <span>{isUser ? userData?.name || "Statistical Officer" : "SankhyaCopilot AI"}</span>
                                <span>
                                  {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                                </span>
                              </div>

                              <div className="prose prose-xs dark:prose-invert max-w-none break-words">
                                <Markdown>{msg.content || ""}</Markdown>
                              </div>

                              {!isUser && (
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(msg.content);
                                    setCopiedMsgIdx(idx);
                                    toast.success("Copied to clipboard!");
                                    setTimeout(() => setCopiedMsgIdx(null), 2000);
                                  }}
                                  className="mt-2.5 flex items-center gap-1 text-[10px] text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold transition-colors cursor-pointer"
                                >
                                  {copiedMsgIdx === idx ? <FaCheck className="text-emerald-500" /> : <FaCopy />}
                                  <span>{copiedMsgIdx === idx ? "Copied" : "Copy Response"}</span>
                                </button>
                              )}
                            </div>

                            {isUser && (
                              <div className="w-8 h-8 rounded-full bg-slate-900 dark:bg-slate-700 text-white flex items-center justify-center shrink-0 text-xs font-bold">
                                <FaUserTie />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {activeModalItem.type === "interview" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                      <div className="text-center sm:border-r border-slate-200 dark:border-slate-700 sm:pr-4">
                        <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                          {activeModalItem.raw.finalScore || 0} / 10
                        </span>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                          Overall Score
                        </p>
                      </div>
                      <div className="text-center sm:border-r border-slate-200 dark:border-slate-700 sm:pr-4">
                        <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                          {activeModalItem.raw.confidence || 0} / 10
                        </span>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                          Confidence
                        </p>
                      </div>
                      <div className="text-center sm:border-r border-slate-200 dark:border-slate-700 sm:pr-4">
                        <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                          {activeModalItem.raw.communication || 0} / 10
                        </span>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                          Communication
                        </p>
                      </div>
                      <div className="text-center">
                        <span className="text-xl font-bold text-teal-600 dark:text-teal-400">
                          {activeModalItem.raw.correctness || 0} / 10
                        </span>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                          Correctness
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <span>Oral Question-by-Question Scoring</span>
                      </h4>

                      {(activeModalItem.raw.questions || activeModalItem.raw.question || []).map((q, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs space-y-2.5 text-xs"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <span className="font-extrabold text-blue-600 dark:text-blue-400">
                              Question {idx + 1}:
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-black text-[10px]">
                              {q.score !== undefined && q.score !== null
                                ? `${q.score} / 10`
                                : `${activeModalItem.raw.finalScore || 0} / 10`}
                            </span>
                          </div>
                          <p className="font-bold text-slate-900 dark:text-white">
                            {q.question || q.questionText || `Cadre Technical Question ${idx + 1}`}
                          </p>

                          {(q.answer || q.userAnswer) && (
                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                                Spoken Answer:
                              </span>
                              <p className="text-slate-700 dark:text-slate-300 italic">{q.answer || q.userAnswer}</p>
                            </div>
                          )}

                          {(q.feedback || q.aiFeedback) && (
                            <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300">
                              <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block mb-1">
                                AI Evaluator Analysis:
                              </span>
                              <p>{q.feedback || q.aiFeedback}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 text-center">
                      <button
                        onClick={() => navigate(`/report/${activeModalItem.id}`)}
                        className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-md cursor-pointer inline-flex items-center gap-2"
                      >
                        <span>View Full Interactive Diagnostic Report</span>
                        <FaExternalLinkAlt size={11} />
                      </button>
                    </div>
                  </div>
                )}

                {activeModalItem.type === "assignment" && (
                  <div className="space-y-6">
                    <div className="p-5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                          In-Service Practicum Evaluation
                        </span>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                          {activeModalItem.raw.aiEvaluation?.overallScore || 0} / 100 Marks
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                          Assigned Grade:{" "}
                          <span className="font-bold text-amber-600">
                            {activeModalItem.raw.aiEvaluation?.grade || "A"}
                          </span>{" "}
                          • Boosted Competency Index by +{activeModalItem.raw.aiEvaluation?.competencyScoreDelta || 5} pts
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                        4-Criterion Rubric Breakdown
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {(activeModalItem.raw.aiEvaluation?.rubricScores || []).map((r, idx) => (
                          <div
                            key={idx}
                            className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs space-y-1.5"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <h5 className="font-bold text-xs text-slate-900 dark:text-white">
                                {r.criterion}
                              </h5>
                              <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-extrabold text-[10px]">
                                {r.score} / {r.maxScore || 25}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                              {r.feedback}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2">
                        <span className="font-extrabold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
                          Demonstrated Strengths
                        </span>
                        <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300">
                          {(activeModalItem.raw.aiEvaluation?.strengths || ["Methodological correctness in sampling formula"]).map((s, idx) => (
                            <li key={idx}>{s}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 space-y-2">
                        <span className="font-extrabold text-rose-700 dark:text-rose-400 uppercase tracking-wider block">
                          Recommended Improvements
                        </span>
                        <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300">
                          {(activeModalItem.raw.aiEvaluation?.improvementAreas || ["Include numerical estimation examples"]).map((w, idx) => (
                            <li key={idx}>{w}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {activeModalItem.raw.submissionText && (
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
                        <span className="font-bold text-slate-400 uppercase tracking-wider block mb-2">
                          Submitted Response:
                        </span>
                        <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto custom-scrollbar">
                          {activeModalItem.raw.submissionText}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {activeModalItem.type === "quiz" && (
                  <div className="space-y-6">
                    <div className="p-5 rounded-2xl bg-teal-50/60 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-600 dark:text-teal-400">
                          Timed Diagnostic Assessment
                        </span>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                          {activeModalItem.raw.score}% Score • {activeModalItem.raw.correctCount} / {activeModalItem.raw.totalQuestions} Correct
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                          Topic: <span className="font-bold">{activeModalItem.raw.topic}</span> • Difficulty: {activeModalItem.raw.difficulty}
                        </p>
                      </div>
                      <span
                        className={`px-3.5 py-1.5 rounded-xl font-extrabold text-xs uppercase tracking-wider ${activeModalItem.raw.passed
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                          }`}
                      >
                        {activeModalItem.raw.passed ? "Passed" : "Needs Review"}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                        Question Breakdown & Explanations
                      </h4>

                      {(activeModalItem.raw.userAnswers || []).map((q, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs space-y-2 text-xs"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <span className="font-bold text-slate-900 dark:text-white">
                              {idx + 1}. {q.questionText}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full font-extrabold text-[10px] ${q.isCorrect
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                                }`}
                            >
                              {q.isCorrect ? "Correct" : "Incorrect"}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                            <p className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400">
                              <span className="font-bold">Your Selection:</span> {q.selectedOption || "Not Answered"}
                            </p>
                            <p className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold">
                              <span>Correct Option:</span> {q.correctAnswer}
                            </p>
                          </div>

                          {q.explanation && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 italic pt-1 border-t border-slate-100 dark:border-slate-700">
                              {q.explanation}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeModalItem.type === "competency" && (
                  <div className="space-y-6">
                    <div className="p-5 rounded-2xl bg-cyan-50/60 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">
                          Cadre Multi-Domain Framework
                        </span>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                          {userData?.overallCompetencyScore || 72}% Overall Index
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                          Role: {userData?.jobRole || "ISS Officer"} • {userData?.skillGaps?.length || 0} Priority Skill Gaps Detected
                        </p>
                      </div>
                      <button
                        onClick={() => navigate("/competencies")}
                        className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <span>Open Radar</span>
                        <FaExternalLinkAlt size={10} />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                        Assessed Competencies & Benchmarks
                      </h4>

                      <div className="space-y-2 text-xs">
                        {(userData?.competencies || []).map((c, idx) => (
                          <div
                            key={idx}
                            className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4"
                          >
                            <div>
                              <span className="font-bold text-slate-900 dark:text-white block">
                                {c.competencyName}
                              </span>
                              <span className="text-[10px] text-slate-400 font-semibold">
                                Domain: {c.domain || "Statistical"}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-24 bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                                <div
                                  className="bg-cyan-500 h-full rounded-full"
                                  style={{ width: `${c.score}%` }}
                                />
                              </div>
                              <span className="font-black text-slate-900 dark:text-white w-10 text-right">
                                {c.score}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
                  <BsShieldCheck className="text-emerald-500" />
                  <span>Official Government of India (MoSPI) Verified Record</span>
                </div>
                <button
                  onClick={() => handleDownloadPDF(activeModalItem)}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <FaFilePdf />
                  <span>Download PDF Dossier</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMouseScrolling && visibleCount < filteredHistory.length && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-slate-900/90 dark:bg-slate-800/90 text-white backdrop-blur-xl border border-white/20 shadow-2xl flex items-center gap-2.5 text-xs font-bold pointer-events-none"
          >
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
            <BsMouse className="text-blue-400 animate-bounce" />
            <span>Scrolling Archive • Loading Sessions...</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-20 mt-16 -mx-4 -mb-16">
        <Footer />
      </div>
    </motion.div>
  );
};


export default InterviewHistory;
