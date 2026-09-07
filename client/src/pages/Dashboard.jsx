import React, { useEffect, useState, useMemo } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useSelector, useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";
import { useNavigate } from "react-router-dom";
import { ServerUrl } from "../App";
import axios from "axios";
import toast from "react-hot-toast";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  ReferenceLine,
  LabelList,
  AreaChart,
  Area,
} from "recharts";
import {
  FaBrain,
  FaTasks,
  FaFire,
  FaClock,
  FaAward,
  FaArrowRight,
  FaExclamationTriangle,
  FaCheckCircle,
  FaPlayCircle,
  FaUserTie,
  FaHistory,
  FaMicrophone,
  FaFilePdf,
  FaSyncAlt,
  FaColumns,
  FaBullhorn,
  FaComments,
  FaChartLine,
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";
import {
  BsRobot,
  BsBarChartFill,
  BsShieldCheck,
  BsFillCameraVideoFill,
  BsLightningChargeFill,
  BsBookHalf,
} from "react-icons/bs";
import { generateCompetencyPDF } from "../utils/pdfGenerator";
import PageTransition from "../components/PageTransition";
import { ScrollReveal } from "../components/ScrollReveal";

const CustomXAxisTick = ({ x, y, payload }) => {
  if (!payload || !payload.value) return null;
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={14}
        textAnchor="end"
        transform="rotate(-24)"
        fill="currentColor"
        className="fill-slate-700 dark:fill-slate-200 text-[11px] font-bold select-none"
        style={{ fontSize: "11px", fontWeight: 700 }}
      >
        {payload.value}
      </text>
    </g>
  );
};

const getShortCompetencyName = (name = "") => {
  const lower = name.toLowerCase();
  if (lower.includes("sampling")) return "Sampling";
  if (lower.includes("national account") || lower.includes("sna") || lower.includes("gdp")) return "SNA 2008";
  if (lower.includes("price") || lower.includes("cpi") || lower.includes("wpi")) return "CPI / WPI";
  if (lower.includes("computing") || lower.includes("automated")) return "Computing";
  if (lower.includes("privacy") || lower.includes("dpdp") || lower.includes("ethics")) return "DPDP Act";
  if (lower.includes("labour") || lower.includes("plfs") || lower.includes("employment")) return "PLFS Labour";
  if (lower.includes("microdata") || lower.includes("weight")) return "Microdata";
  if (lower.includes("policy") || lower.includes("evidence")) return "Policy Lead";
  if (lower.includes("industrial") || lower.includes("asi") || lower.includes("iip")) return "ASI / IIP";
  if (lower.includes("sdg") || lower.includes("nif")) return "SDG NIF";
  if (lower.includes("quality") || lower.includes("nqaf")) return "UN-NQAF";
  if (lower.includes("survey design") || lower.includes("methodology")) return "Survey Design";
  if (lower.includes("cybersecurity") || lower.includes("protection")) return "Cybersec";
  if (lower.includes("leadership") || lower.includes("governance")) return "Leadership";
  return name.length > 12 ? name.substring(0, 12) + ".." : name;
};

const OFFICIAL_BASELINE_COMPETENCIES = [
  { competencyName: "Sampling Techniques & Estimation", domain: "Statistical", score: 62 },
  { competencyName: "National Accounts & GDP (SNA 2008)", domain: "Statistical", score: 82 },
  { competencyName: "Price Statistics (CPI, WPI, Inflation)", domain: "Statistical", score: 78 },
  { competencyName: "Statistical Computing & Automated Processing", domain: "Technical", score: 48 },
  { competencyName: "Data Privacy, Ethics & DPDP Act", domain: "Governance", score: 72 },
  { competencyName: "Labour & Employment Statistics (PLFS)", domain: "Statistical", score: 84 },
  { competencyName: "Microdata Analytics & Survey Weighting", domain: "Technical", score: 52 },
  { competencyName: "Evidence-Based Policy & Decision Leadership", domain: "Managerial", score: 80 },
];

const DOMAIN_CATEGORIES = [
  { id: "all", label: "All Topics" },
  { id: "statistical", label: "Statistical" },
  { id: "technical", label: "Technical" },
  { id: "governance", label: "Governance" },
  { id: "managerial", label: "Managerial" },
];

const Dashboard = () => {
  const { userData } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [profile, setProfile] = useState(null);
  const [broadcasts, setBroadcasts] = useState([]);
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [assignmentSubmissions, setAssignmentSubmissions] = useState([]);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState(new Date());
  const [generatingPath, setGeneratingPath] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [domainFilter, setDomainFilter] = useState("all");

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchDashboardData = async (isBackground = false) => {
    try {
      if (!isBackground) {
        setIsSyncing(true);
      }
      const [
        profileRes,
        broadcastsRes,
        quizAttemptsRes,
        interviewRes,
        assignmentSubmissionsRes,
        chatRes,
      ] = await Promise.allSettled([
        axios.get(`${ServerUrl}/api/competencies/my-profile`, { withCredentials: true }),
        axios.get(`${ServerUrl}/api/support/broadcasts`, { withCredentials: true }),
        axios.get(`${ServerUrl}/api/quizzes/history/my-attempts`, { withCredentials: true }),
        axios.get(`${ServerUrl}/api/interview/get-interview`, { withCredentials: true }),
        axios.get(`${ServerUrl}/api/assignments/history/my-submissions`, { withCredentials: true }),
        axios.get(`${ServerUrl}/api/chat/get`, { withCredentials: true }),
      ]);

      if (profileRes.status === "fulfilled" && profileRes.value.data?.success) {
        const p = profileRes.value.data.profile;
        setProfile(p);
        dispatch(setUserData({ ...userData, ...p }));
      }

      if (broadcastsRes.status === "fulfilled" && broadcastsRes.value.data?.success) {
        setBroadcasts(broadcastsRes.value.data.broadcasts || []);
      }

      if (quizAttemptsRes.status === "fulfilled" && quizAttemptsRes.value.data?.success) {
        setQuizAttempts(quizAttemptsRes.value.data.attempts || []);
      }

      if (interviewRes.status === "fulfilled" && interviewRes.value.data?.success) {
        setInterviews(interviewRes.value.data.interviews || []);
      }

      if (assignmentSubmissionsRes.status === "fulfilled" && assignmentSubmissionsRes.value.data?.success) {
        setAssignmentSubmissions(assignmentSubmissionsRes.value.data.submissions || []);
      }

      if (chatRes.status === "fulfilled" && chatRes.value.data?.success) {
        setChats(chatRes.value.data.chats || []);
      }
      setLastSyncedAt(new Date());
    } catch (error) {
      if (!isBackground) {
        console.error("Dashboard multi-source fetch error:", error);
      }
    } finally {
      if (!isBackground) {
        setLoading(false);
        setIsSyncing(false);
      }
    }
  };

  useEffect(() => {
    fetchDashboardData(false);

    // Periodic real-time background synchronization (every 3.5s)
    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, 3500);

    // Real-time custom event and focus listeners
    const handleAssessmentCompleted = (e) => {
      console.log("[REALTIME DASHBOARD SYNC] Assessment completed event triggered:", e.detail);
      fetchDashboardData(false);
      toast.success("Dashboard metrics updated with latest assessment results! 🎯", { id: "realtime-sync-toast" });
    };

    const handleWindowFocus = () => {
      fetchDashboardData(true);
    };

    const handleStorageChange = (e) => {
      if (e.key === "lastAssessmentUpdate") {
        fetchDashboardData(true);
      }
    };

    window.addEventListener("assessmentCompleted", handleAssessmentCompleted);
    window.addEventListener("focus", handleWindowFocus);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener("assessmentCompleted", handleAssessmentCompleted);
      window.removeEventListener("focus", handleWindowFocus);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const synthesizedCompetencies = useMemo(() => {
    const baseList =
      profile?.competencies && profile.competencies.length > 0
        ? profile.competencies.map((c) => ({
          competencyName: c.competencyName,
          domain: c.domain || "Statistical",
          score: Number(c.score) || 60,
          source: c.source || "assessment-derived",
        }))
        : OFFICIAL_BASELINE_COMPETENCIES;

    return baseList.map((comp) => {
      const lowerName = comp.competencyName.toLowerCase();
      let matchedQuizScores = [];
      (quizAttempts || []).forEach((attempt) => {
        const title = (attempt.quizTitle || attempt.topic || attempt.quizId?.title || attempt.title || "").toLowerCase();
        if (
          (lowerName.includes("sampling") && title.includes("sampling")) ||
          (lowerName.includes("national account") && (title.includes("national") || title.includes("sna") || title.includes("gdp"))) ||
          (lowerName.includes("price") && (title.includes("price") || title.includes("cpi") || title.includes("inflation"))) ||
          (lowerName.includes("computing") && (title.includes("computing") || title.includes("r") || title.includes("python"))) ||
          (lowerName.includes("privacy") && (title.includes("privacy") || title.includes("dpdp") || title.includes("ethics"))) ||
          (lowerName.includes("labour") && (title.includes("labour") || title.includes("plfs") || title.includes("employment"))) ||
          (lowerName.includes("microdata") && (title.includes("microdata") || title.includes("survey"))) ||
          (lowerName.includes("policy") && (title.includes("policy") || title.includes("governance")))
        ) {
          const sc = attempt.score !== undefined && attempt.score !== null
            ? attempt.score
            : (attempt.percentage || (attempt.totalQuestions ? Math.round((attempt.correctCount / attempt.totalQuestions) * 100) : null));
          if (sc !== null && sc !== undefined) matchedQuizScores.push(sc);
        }
      });

      let matchedAssignmentScores = [];
      (assignmentSubmissions || []).forEach((sub) => {
        const title = (sub.assignmentTitle || sub.targetCompetency || sub.assignmentId?.title || sub.title || "").toLowerCase();
        if (
          (lowerName.includes("sampling") && (title.includes("sampling") || title.includes("frame") || title.includes("multiplier"))) ||
          (lowerName.includes("national account") && (title.includes("national") || title.includes("sna") || title.includes("gdp") || title.includes("gva"))) ||
          (lowerName.includes("price") && (title.includes("price") || title.includes("cpi") || title.includes("wpi"))) ||
          (lowerName.includes("computing") && (title.includes("computing") || title.includes("cleaning") || title.includes("pipeline") || title.includes("data"))) ||
          (lowerName.includes("privacy") && (title.includes("privacy") || title.includes("dpdp") || title.includes("anonymization"))) ||
          (lowerName.includes("labour") && (title.includes("labour") || title.includes("plfs") || title.includes("employment"))) ||
          (lowerName.includes("microdata") && (title.includes("microdata") || title.includes("survey") || title.includes("weighting"))) ||
          (lowerName.includes("policy") && (title.includes("policy") || title.includes("governance") || title.includes("brief")))
        ) {
          const sc = sub.aiEvaluation?.overallScore !== undefined && sub.aiEvaluation?.overallScore !== null
            ? sub.aiEvaluation.overallScore
            : (sub.score !== undefined ? (sub.scoreMax === 10 ? sub.score * 10 : sub.score) : null);
          if (sc !== null && sc !== undefined) {
            matchedAssignmentScores.push(sc);
          }
        }
      });

      let finalScore = comp.score;
      if (matchedQuizScores.length > 0 || matchedAssignmentScores.length > 0) {
        const allEv = [...matchedQuizScores, ...matchedAssignmentScores];
        const evAvg = allEv.reduce((a, b) => a + b, 0) / allEv.length;
        finalScore = Math.round(comp.score * 0.6 + evAvg * 0.4);
      }

      return {
        ...comp,
        score: Math.min(100, Math.max(10, finalScore)),
        evaluationsCount: matchedQuizScores.length + matchedAssignmentScores.length,
      };
    });
  }, [profile, quizAttempts, assignmentSubmissions]);

  // 2. Computed Live Knowledge Index & Metric Stats
  const knowledgeStats = useMemo(() => {
    const totalScore = synthesizedCompetencies.reduce((acc, c) => acc + c.score, 0);
    const overallScore = Math.round(totalScore / (synthesizedCompetencies.length || 1));

    const criticalWeaknesses = synthesizedCompetencies.filter((c) => c.score < 50);
    const developingCount = synthesizedCompetencies.filter((c) => c.score >= 50 && c.score < 75);
    const masteredCount = synthesizedCompetencies.filter((c) => c.score >= 75);

    const completedQuizzes = quizAttempts.length;
    const avgQuizScore = completedQuizzes > 0
      ? Math.round(
        quizAttempts.reduce((acc, q) => acc + (q.percentage || (q.score && q.totalQuestions ? (q.score / q.totalQuestions) * 100 : 70)), 0) / completedQuizzes
      )
      : 0;

    const completedInterviews = interviews.length;
    const avgInterviewScore = completedInterviews > 0
      ? Math.round(
        interviews.reduce((acc, i) => acc + (i.score || (i.feedback?.rating ? i.feedback.rating * 10 : 75)), 0) / completedInterviews
      )
      : 0;

    const completedAssignments = assignmentSubmissions.length;
    const evaluatedAssignments = assignmentSubmissions.filter((s) => s.status === "evaluated" || s.score !== null).length;

    const totalConsultations = chats.reduce((acc, c) => acc + (c.messages?.length || 0), 0);

    const baseHours = profile?.learningHours || 12;
    const computedHours = baseHours + completedQuizzes * 0.5 + completedInterviews * 0.75 + completedAssignments * 1.5;

    let overallLevel = "Intermediate";
    if (overallScore >= 80) overallLevel = "Expert (ISS)";
    else if (overallScore >= 70) overallLevel = "Advanced (SSO)";
    else if (overallScore >= 55) overallLevel = "Intermediate (JSO)";
    else overallLevel = "Foundational";

    return {
      overallScore,
      overallLevel,
      criticalWeaknessesCount: criticalWeaknesses.length,
      criticalWeaknesses,
      developingCount: developingCount.length,
      masteredCount: masteredCount.length,
      completedQuizzes,
      avgQuizScore,
      completedInterviews,
      avgInterviewScore,
      completedAssignments,
      evaluatedAssignments,
      totalConsultations,
      learningHours: Math.round(computedHours),
      learningStreak: profile?.learningStreak || (completedQuizzes > 0 ? 4 : 2),
    };
  }, [synthesizedCompetencies, quizAttempts, interviews, assignmentSubmissions, chats, profile]);

  // 3. Radar Chart Data (4 Official MoSPI Domains)
  const radarData = useMemo(() => {
    const domainCalc = (pattern) => {
      const comps = synthesizedCompetencies.filter((c) =>
        c.domain?.toLowerCase().includes(pattern.toLowerCase())
      );
      if (!comps.length) return 70;
      return Math.round(comps.reduce((acc, c) => acc + c.score, 0) / comps.length);
    };

    return [
      {
        domain: "Statistical",
        fullName: "Statistical Competencies",
        score: domainCalc("Statistical"),
        fullMark: 100,
        benchmark: 75,
      },
      {
        domain: "Technical",
        fullName: "Technical & Computing",
        score: domainCalc("Technical"),
        fullMark: 100,
        benchmark: 75,
      },
      {
        domain: "Governance",
        fullName: "Digital Governance & Privacy",
        score: domainCalc("Governance"),
        fullMark: 100,
        benchmark: 75,
      },
      {
        domain: "Managerial",
        fullName: "Behavioural & Leadership",
        score: domainCalc("Managerial"),
        fullMark: 100,
        benchmark: 75,
      },
    ];
  }, [synthesizedCompetencies]);

  // 4. Bar Chart Column Data with Domain Filtering
  const columnBarData = useMemo(() => {
    let list = synthesizedCompetencies;
    if (domainFilter !== "all") {
      list = list.filter((c) => c.domain?.toLowerCase().includes(domainFilter.toLowerCase()));
    }

    return list.map((c) => {
      const shortName = getShortCompetencyName(c.competencyName);
      return {
        name: shortName,
        fullName: c.competencyName,
        domain: c.domain || "Statistical",
        score: c.score,
        benchmark: 75,
        deficit: Math.max(0, 75 - c.score),
        isWeakness: c.score < 50,
        isDeveloping: c.score >= 50 && c.score < 75,
        isMastered: c.score >= 75,
        evaluationsCount: c.evaluationsCount || 0,
      };
    });
  }, [synthesizedCompetencies, domainFilter]);

  // 5. Multi-Model Knowledge Evaluation Score Timeline (Progress Over Sessions)
  const knowledgeTimelineData = useMemo(() => {
    let events = [];

    (quizAttempts || []).forEach((q, idx) => {
      const sc = q.percentage || (q.score && q.totalQuestions ? Math.round((q.score / q.totalQuestions) * 100) : 70);
      events.push({
        date: q.createdAt ? new Date(q.createdAt) : new Date(Date.now() - ((quizAttempts?.length || 1) - idx) * 86400000 * 2),
        score: sc,
        type: "Quiz Test",
        title: q.quizId?.title || q.title || `Quiz Evaluation #${idx + 1}`,
        domain: q.quizId?.domain || "Statistical",
      });
    });

    (interviews || []).forEach((i, idx) => {
      const sc = i.score || (i.feedback?.rating ? i.feedback.rating * 10 : 75);
      events.push({
        date: i.createdAt ? new Date(i.createdAt) : new Date(Date.now() - ((interviews?.length || 1) - idx) * 86400000 * 3),
        score: sc,
        type: "Viva Voce",
        title: i.title || i.jobRole || `Cadre Board Viva #${idx + 1}`,
        domain: "Oral Board",
      });
    });

    (assignmentSubmissions || []).forEach((a, idx) => {
      if (a.score !== null && a.score !== undefined) {
        const sc = a.scoreMax === 10 ? a.score * 10 : a.score;
        events.push({
          date: a.createdAt ? new Date(a.createdAt) : new Date(Date.now() - ((assignmentSubmissions?.length || 1) - idx) * 86400000 * 2.5),
          score: sc,
          type: "Practicum",
          title: a.assignmentId?.title || a.title || `Practicum Case #${idx + 1}`,
          domain: a.assignmentId?.domain || "Technical",
        });
      }
    });

    events.sort((a, b) => a.date - b.date);

    if (events.length === 0) {
      const baseline = knowledgeStats.overallScore || 65;
      return [
        { label: "Baseline Cadre Entry", score: Math.max(40, baseline - 15), benchmark: 75, type: "Baseline Intake" },
        { label: "AI Competency Audit", score: Math.max(45, baseline - 8), benchmark: 75, type: "Self Assessment" },
        { label: "Survey Practicums", score: Math.max(50, baseline - 4), benchmark: 75, type: "Practicum Evaluation" },
        { label: "Cadre Vivas & Tests", score: baseline, benchmark: 75, type: "Live Knowledge Score" },
      ];
    }

    return events.map((ev, idx) => ({
      label: `Eval 0${idx + 1} (${ev.type})`,
      score: ev.score,
      benchmark: 75,
      type: ev.type,
      title: ev.title,
      formattedDate: ev.date.toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
    }));
  }, [quizAttempts, interviews, assignmentSubmissions, knowledgeStats.overallScore]);

  const handleDownloadPDF = () => {
    toast.success("Generating official MoSPI Competency Dossier (PDF)... 📄");
    generateCompetencyPDF({
      user: userData,
      profile: profile || userData,
      competencies: synthesizedCompetencies,
      skillGaps: profile?.skillGaps || knowledgeStats.criticalWeaknesses,
      learningPath: profile?.learningPath || userData?.learningPath || [],
    });
  };

  const handleRegeneratePathway = async () => {
    setGeneratingPath(true);
    try {
      const { data } = await axios.post(
        `${ServerUrl}/api/competencies/generate-pathway`,
        {},
        { withCredentials: true }
      );
      if (data.success) {
        toast.success("AI Learning Pathway regenerated based on your latest weaknesses! ✨");
        fetchDashboardData();
      }
    } catch (error) {
      toast.error("Failed to regenerate pathway.");
      console.log(error);
    } finally {
      setGeneratingPath(false);
    }
  };

  const handleUpdateCourseStatus = async (stepIndex, status) => {
    try {
      const { data } = await axios.put(
        `${ServerUrl}/api/competencies/pathway-progress`,
        { stepIndex, status },
        { withCredentials: true }
      );
      if (data.success) {
        toast.success(data.message);
        fetchDashboardData();
      }
    } catch (err) {
      console.log(err);
      toast.error("Failed to update progress.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      <Navbar />

      <PageTransition skeletonType="dashboard" isLoading={loading}>
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-6">

          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              National Statistical Portal • Official Skill Intelligence System
            </span>
          </div>

          {broadcasts.length > 0 && (
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border-2 border-amber-500/40 p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fadeIn">
              <div className="flex items-start gap-3.5">
                <div className="p-3 rounded-2xl bg-amber-500 text-white shadow-md shrink-0 mt-0.5">
                  <FaBullhorn size={16} className="animate-bounce" />
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-400 font-black text-[10px] uppercase tracking-wider border border-amber-500/30">
                      Official NSSTA Academy Announcement
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                      {new Date(broadcasts[0].createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })} • {new Date(broadcasts[0].createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    {broadcasts[0].senderName || "NSSTA Secretariat"}
                  </h3>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed max-w-3xl whitespace-pre-wrap">
                    {broadcasts[0].message}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent("open-nssta-helpdesk"))}
                className="px-4 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all shrink-0 flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
              >
                <FaComments size={13} />
                <span>Open Helpdesk Chat</span>
              </button>
            </div>
          )}

          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-950 text-white p-6 sm:p-8 shadow-2xl border border-slate-800">
            <div className="absolute right-0 top-0 w-96 h-full bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
                    <BsShieldCheck size={13} />
                    <span>National Statistical System • Official Portal</span>
                  </div>

                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-mono font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>IST: {currentTime.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })}</span>
                  </div>
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
                  Namaste, {profile?.name || userData?.name || "Statistical Officer"}
                </h1>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  <strong>{profile?.jobRole || "Indian Statistical Service (ISS) Officer"}</strong> — {profile?.department || "National Sample Survey Office (NSSO)"}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-bold shadow-sm">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span>Live Real-Time Sync</span>
                  <button
                    type="button"
                    onClick={() => fetchDashboardData(false)}
                    title="Force Refresh Live Data"
                    className="ml-1 p-1 hover:text-white transition rounded-lg hover:bg-emerald-500/20 cursor-pointer"
                  >
                    <FaSyncAlt size={11} className={isSyncing ? "animate-spin text-white" : ""} />
                  </button>
                </div>

                <button
                  onClick={handleDownloadPDF}
                  className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-lg hover:scale-105 transition-all cursor-pointer flex items-center gap-2"
                >
                  <FaFilePdf size={14} />
                  <span>Download Dossier (PDF)</span>
                </button>

                <button
                  onClick={() => navigate("/interview")}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-lg hover:scale-105 transition-all cursor-pointer flex items-center gap-2"
                >
                  <BsFillCameraVideoFill size={13} />
                  <span>AI Interview Bot</span>
                </button>
              </div>
            </div>
          </div>

          <ScrollReveal direction="up" delay={0.05}>
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white p-6 sm:p-8 shadow-xl border border-blue-500/20">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-3 max-w-3xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
                    <BsFillCameraVideoFill size={13} className="text-emerald-400" />
                    <span>Cadre Viva Voce & Oral Assessment Board</span>
                  </div>

                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight flex items-center gap-2.5">
                    <FaUserTie className="text-blue-400" />
                    <span>Cadre Mock Interview & Viva Voce Studio</span>
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Simulate high-stakes board interviews for <strong>Indian Statistical Service (ISS)</strong>, <strong>Subordinate Statistical Service (SSS)</strong>, and technical roles. Features realistic video avatars, instant speech-to-text response capture, resume tailoring, and in-depth performance scorecards with answer suggestions.
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
                    <span className="flex items-center gap-1.5 font-medium">
                      <FaMicrophone className="text-blue-400" size={13} />
                      <span>Real-Time Voice Recognition</span>
                    </span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <BsFillCameraVideoFill className="text-indigo-400" size={13} />
                      <span>Male / Female AI Interviewers</span>
                    </span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <HiSparkles className="text-amber-400" size={14} />
                      <span>SankhyaIQ AI Instant Feedback</span>
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
                  <button
                    onClick={() => navigate("/interview")}
                    className="px-6 py-3 rounded-2xl bg-white text-blue-900 hover:bg-blue-50 font-black text-xs shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <BsFillCameraVideoFill size={14} />
                    <span>Start New AI Interview</span>
                  </button>

                  <button
                    onClick={() => navigate("/history")}
                    className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs backdrop-blur-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <FaHistory size={13} />
                    <span>View Past Interview Reports</span>
                  </button>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.08}>
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Competency Index</span>
                  <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600">
                    <FaAward size={16} />
                  </div>
                </div>
                <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
                  {knowledgeStats.overallScore}%
                </div>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  {knowledgeStats.overallLevel}
                </span>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Critical Weaknesses</span>
                  <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600">
                    <FaExclamationTriangle size={16} />
                  </div>
                </div>
                <div className="mt-2 text-2xl font-black text-rose-600">
                  {knowledgeStats.criticalWeaknessesCount} Areas
                </div>
                <span className="text-[10px] font-bold text-rose-600">
                  Score &lt; 50% (Action Required)
                </span>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Quizzes Evaluated</span>
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
                    <FaTasks size={16} />
                  </div>
                </div>
                <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
                  {knowledgeStats.completedQuizzes}
                </div>
                <span className="text-[10px] font-bold text-emerald-600">
                  {knowledgeStats.completedQuizzes > 0 ? `Avg ${knowledgeStats.avgQuizScore}% Score` : "Take Tests"}
                </span>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Viva Voce Boards</span>
                  <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600">
                    <BsFillCameraVideoFill size={15} />
                  </div>
                </div>
                <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
                  {knowledgeStats.completedInterviews}
                </div>
                <span className="text-[10px] font-bold text-indigo-600">
                  {knowledgeStats.completedInterviews > 0 ? `Avg ${knowledgeStats.avgInterviewScore}% Viva` : "AI Interview"}
                </span>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Practicums Submitted</span>
                  <div className="p-2 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600">
                    <BsBookHalf size={15} />
                  </div>
                </div>
                <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
                  {knowledgeStats.completedAssignments}
                </div>
                <span className="text-[10px] font-bold text-violet-600">
                  {knowledgeStats.evaluatedAssignments} Evaluated
                </span>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Learning Hours</span>
                  <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-600">
                    <FaClock size={16} />
                  </div>
                </div>
                <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
                  {knowledgeStats.learningHours}h
                </div>
                <span className="text-[10px] font-bold text-orange-600 flex items-center gap-1">
                  <FaFire size={11} />
                  <span>{knowledgeStats.learningStreak} Days Streak</span>
                </span>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.1}>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-1">
                    <BsBarChartFill size={13} />
                    <span>Knowledge Performance Diagnostics</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Evaluated Competency Performance & Deficit Targets</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    Live dynamic scores synthesized across quizzes, viva evaluations, and self-assessments against the <strong>75% MoSPI Benchmark</strong>.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
                    {DOMAIN_CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setDomainFilter(cat.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${domainFilter === cat.id
                          ? "bg-blue-600 text-white shadow-xs"
                          : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                          }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => navigate("/competencies")}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>Assess Skills</span>
                    <FaArrowRight size={10} />
                  </button>
                </div>
              </div>

              <div className="h-96 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={columnBarData} margin={{ left: 10, right: 20, top: 25, bottom: 55 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                    <XAxis
                      dataKey="name"
                      interval={0}
                      tick={<CustomXAxisTick />}
                      height={60}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      axisLine={{ stroke: "#94a3b8", opacity: 0.3 }}
                      tickLine={{ stroke: "#94a3b8", opacity: 0.3 }}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(59, 130, 246, 0.08)", rx: 8, ry: 8 }}
                      formatter={(val, name, item) => [
                        `${val}%`,
                        `Score: ${item.payload.fullName} (${item.payload.domain})`,
                      ]}
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        borderRadius: "14px",
                        border: "1px solid #e2e8f0",
                        color: "#0f172a",
                        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                        fontSize: "12px",
                        fontWeight: "600",
                        padding: "10px 14px",
                      }}
                      itemStyle={{ color: "#2563eb", fontWeight: "700" }}
                      labelStyle={{ color: "#0f172a", fontWeight: "800", marginBottom: "4px" }}
                    />
                    <ReferenceLine
                      y={75}
                      stroke="#ef4444"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                      label={{
                        value: "Cadre Benchmark Target: 75%",
                        fill: "#ef4444",
                        fontSize: 11,
                        fontWeight: 800,
                        position: "top",
                      }}
                    />
                    <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                      {columnBarData.map((entry, index) => (
                        <Cell
                          key={`col-cell-${index}`}
                          fill={entry.score >= 75 ? "#10b981" : entry.score >= 50 ? "#3b82f6" : "#e11d48"}
                        />
                      ))}
                      <LabelList
                        dataKey="score"
                        position="top"
                        formatter={(val) => `${val}%`}
                        className="fill-slate-800 dark:fill-slate-100 font-extrabold text-[11px]"
                        style={{ fontSize: "11px", fontWeight: 800 }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <span className="w-3.5 h-3.5 rounded-md bg-emerald-500 shadow-xs" />
                    <span className="text-slate-700 dark:text-slate-300">Mastered (&ge;75%) • {knowledgeStats.masteredCount}</span>
                  </span>
                  <span className="flex items-center gap-1.5 font-semibold">
                    <span className="w-3.5 h-3.5 rounded-md bg-blue-500 shadow-xs" />
                    <span className="text-slate-700 dark:text-slate-300">Developing (50-74%) • {knowledgeStats.developingCount}</span>
                  </span>
                  <span className="flex items-center gap-1.5 font-bold text-rose-600">
                    <span className="w-3.5 h-3.5 rounded-md bg-rose-600 shadow-xs" />
                    <span>Critical Weakness (&lt;50%) • {knowledgeStats.criticalWeaknessesCount}</span>
                  </span>
                </div>

                <span className="text-xs text-slate-500">
                  Red bars highlight high-priority knowledge gaps mapped directly to iGOT remedial modules.
                </span>
              </div>
            </div>
          </ScrollReveal>

          {/* 4-Domain Taxonomy Radar & Balance Matrix */}
          <ScrollReveal direction="up" delay={0.1}>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider mb-1">
                    <FaBrain size={12} />
                    <span>4-Domain Knowledge Taxonomy</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>4-Domain Cadre Balance Matrix</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    Holistic multi-domain mastery across Statistical, Technical, Governance, and Managerial domains.
                  </p>
                </div>

                <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Official MoSPI Cadre Standards
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 h-80 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                      <PolarGrid stroke="#94a3b8" strokeDasharray="3 3" opacity={0.3} />
                      <PolarAngleAxis dataKey="domain" tick={{ fill: "#64748b", fontSize: 12, fontWeight: 700 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                      <Radar
                        name="Proficiency"
                        dataKey="score"
                        stroke="#4f46e5"
                        fill="#6366f1"
                        fillOpacity={0.4}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#ffffff",
                          borderRadius: "14px",
                          border: "1px solid #e2e8f0",
                          color: "#0f172a",
                          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                          fontSize: "12px",
                          fontWeight: "600",
                          padding: "10px 14px",
                        }}
                        itemStyle={{ color: "#4f46e5", fontWeight: "700" }}
                        labelStyle={{ color: "#0f172a", fontWeight: "800" }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {radarData.map((d) => (
                    <div
                      key={d.domain}
                      className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 space-y-2 hover:border-indigo-400 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                          {d.domain} Domain
                        </span>
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${d.score >= 75
                            ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-600"
                            : d.score >= 50
                              ? "bg-blue-100 dark:bg-blue-950 text-blue-600"
                              : "bg-rose-100 dark:bg-rose-950 text-rose-600"
                            }`}
                        >
                          {d.score >= 75 ? "Benchmark Met" : d.score >= 50 ? "Developing" : "Deficit"}
                        </span>
                      </div>

                      <div className="text-3xl font-black text-slate-900 dark:text-white">
                        {Math.round(d.score)}%
                      </div>

                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${d.score >= 75 ? "bg-emerald-500" : d.score >= 50 ? "bg-blue-500" : "bg-rose-500"
                            }`}
                          style={{ width: `${d.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.1}>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
                    <FaChartLine size={13} />
                    <span>Learning Trajectory</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Knowledge Evaluation & Progression Timeline</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    Score progression across chronological quizzes, practicums, and oral board viva sessions.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-extrabold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                    {knowledgeTimelineData.length} Evaluated Points
                  </span>
                  <button
                    onClick={() => navigate("/history")}
                    className="px-4 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Archive</span>
                    <FaArrowRight size={9} />
                  </button>
                </div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={knowledgeTimelineData} margin={{ top: 15, right: 20, left: 10, bottom: 25 }}>
                    <defs>
                      <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      axisLine={{ stroke: "#94a3b8", opacity: 0.3 }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      axisLine={{ stroke: "#94a3b8", opacity: 0.3 }}
                    />
                    <Tooltip
                      formatter={(val, name, item) => [
                        `${val}%`,
                        `Score: ${item.payload.title || item.payload.type}`,
                      ]}
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        borderRadius: "14px",
                        border: "1px solid #e2e8f0",
                        color: "#0f172a",
                        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                        fontSize: "12px",
                        fontWeight: "600",
                        padding: "10px 14px",
                      }}
                      itemStyle={{ color: "#2563eb", fontWeight: "700" }}
                      labelStyle={{ color: "#0f172a", fontWeight: "800", marginBottom: "4px" }}
                    />
                    <ReferenceLine
                      y={75}
                      stroke="#ef4444"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                      label={{
                        value: "Cadre Target 75%",
                        fill: "#ef4444",
                        fontSize: 10,
                        fontWeight: 800,
                        position: "top",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#scoreGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </ScrollReveal>

          {/* Competency Columns & Action Targets */}
          <ScrollReveal direction="up" delay={0.1}>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <FaColumns className="text-blue-600" />
                    <span>Topic Mastery & Remediation Targets</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Evaluated competency cards highlighting individual mastery percentages and 1-click remediation.
                  </p>
                </div>

                <span className="text-xs font-bold text-slate-400">
                  {columnBarData.length} Evaluated Topics
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {columnBarData.map((item, idx) => {
                  const isWeak = item.score < 50;
                  const isMastered = item.score >= 75;
                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${isWeak
                        ? "bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60"
                        : isMastered
                          ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60"
                          : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800"
                        }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                            {item.domain}
                          </span>
                          <span
                            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${isWeak
                              ? "bg-rose-100 dark:bg-rose-950 text-rose-600"
                              : isMastered
                                ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-600"
                                : "bg-blue-100 dark:bg-blue-950 text-blue-600"
                              }`}
                          >
                            {isWeak ? "Gap" : isMastered ? "Mastered" : "Developing"}
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 h-8">
                          {item.fullName}
                        </h4>

                        <div className="space-y-1 pt-1">
                          <div className="flex justify-between text-xs font-bold">
                            <span className={isWeak ? "text-rose-600" : isMastered ? "text-emerald-600" : "text-blue-600"}>
                              {item.score}%
                            </span>
                            <span className="text-slate-400 text-[10px]">Target 75%</span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${isWeak ? "bg-rose-500" : isMastered ? "bg-emerald-500" : "bg-blue-500"
                                }`}
                              style={{ width: `${item.score}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                        {isWeak ? (
                          <button
                            onClick={() => navigate("/learning-path")}
                            className="w-full py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <BsLightningChargeFill size={10} />
                            <span>Remediate in iGOT</span>
                          </button>
                        ) : isMastered ? (
                          <button
                            onClick={() => navigate("/interview")}
                            className="w-full py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <span>Practice Viva</span>
                            <FaArrowRight size={8} />
                          </button>
                        ) : (
                          <button
                            onClick={() => navigate("/quizzes")}
                            className="w-full py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-blue-600 hover:text-white text-slate-700 dark:text-slate-200 font-bold text-[11px] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <span>Take Quiz</span>
                            <FaArrowRight size={8} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </ScrollReveal>

          {/* Weakness-Driven AI Curriculum Engine */}
          <ScrollReveal direction="up" delay={0.1}>
            <div className="bg-white dark:bg-slate-900 border-2 border-blue-100 dark:border-blue-900/60 rounded-3xl p-6 sm:p-8 shadow-lg space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-1.5">
                    <HiSparkles size={14} className="text-amber-400" />
                    <span>Weakness-Driven AI Curriculum Engine</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    Personalized Learning Pathway (Generated from Your Evaluated Deficits)
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    SankhyaIQ™ AI Neural Engine analyzed your evaluated weaknesses across{" "}
                    <strong>
                      {knowledgeStats.criticalWeaknesses.map((w) => w.competencyName).slice(0, 3).join(", ") ||
                        "Statistical Computing, Sampling & DPDP Act"}
                    </strong>{" "}
                    and synthesized this sequential capacity roadmap.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleRegeneratePathway}
                    disabled={generatingPath}
                    className="px-4 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 text-blue-700 dark:text-blue-300 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <FaSyncAlt size={11} className={generatingPath ? "animate-spin" : ""} />
                    <span>{generatingPath ? "Synthesizing..." : "Regenerate AI Pathway"}</span>
                  </button>

                  <button
                    onClick={() => navigate("/learning-path")}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>View Full Pathway</span>
                    <FaArrowRight size={10} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(profile?.learningPath && profile.learningPath.length > 0
                  ? profile.learningPath
                  : [
                    {
                      title: "Statistical Computing in R & Python for Sample Surveys",
                      provider: "iGOT Karmayogi",
                      skillAddressed: "Statistical Computing & Automated Processing",
                      priority: "High",
                      duration: "14 Hours",
                      status: "not-started",
                      rationale: "Addresses your computing gap for NSSO survey data automation.",
                    },
                    {
                      title: "Digital Personal Data Protection (DPDP) Act Compliance",
                      provider: "iGOT Karmayogi",
                      skillAddressed: "Data Privacy & DPDP Compliance",
                      priority: "High",
                      duration: "8 Hours",
                      status: "not-started",
                      rationale: "Official MoSPI anonymization rules and DPDP governance.",
                    },
                    {
                      title: "Microdata Analytics & Survey Weighting Methodologies",
                      provider: "NSSTA TPAC",
                      skillAddressed: "Microdata Analytics & Survey Weights",
                      priority: "Medium",
                      duration: "12 Hours",
                      status: "in-progress",
                      rationale: "Advanced weighting techniques for multi-stage stratification.",
                    },
                    {
                      title: "National Accounts Statistics & GDP Compilation (SNA 2008)",
                      provider: "NSSTA TPAC",
                      skillAddressed: "National Accounts (SNA 2008)",
                      priority: "Medium",
                      duration: "16 Hours",
                      status: "completed",
                      rationale: "GVA estimation methodology and macroeconomic aggregation.",
                    },
                  ]
                ).map((step, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950 px-2.5 py-0.5 rounded-full uppercase">
                          Step 0{idx + 1} • {step.provider || "iGOT Karmayogi"}
                        </span>
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded-full">
                          {step.priority || "High"} Priority
                        </span>
                      </div>

                      <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-snug">
                        {step.title}
                      </h3>

                      <div className="p-2.5 rounded-xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900/60 text-xs">
                        <span className="font-bold text-rose-700 dark:text-rose-300 block">
                          🎯 Targeted Weakness: {step.skillAddressed}
                        </span>
                        <span className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 block">
                          {step.rationale || `Designed to bridge your competency deficit in ${step.skillAddressed}.`}
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                        <FaClock size={12} className="text-blue-500" />
                        <span>Duration: {step.duration || "12 Hours"}</span>
                      </span>

                      {step.status === "completed" ? (
                        <span className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
                          <FaCheckCircle size={12} />
                          <span>Completed (+10pts)</span>
                        </span>
                      ) : step.status === "in-progress" ? (
                        <button
                          onClick={() => handleUpdateCourseStatus(idx, "completed")}
                          className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-emerald-600 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <FaPlayCircle size={12} />
                          <span>In Progress (Done)</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateCourseStatus(idx, "in-progress")}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-blue-600 hover:text-white text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer"
                        >
                          Start Module
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* AI Copilot Knowledge Recommendation Card */}
          <ScrollReveal direction="scale" delay={0.1}>
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-blue-950/40 dark:to-slate-900 border border-blue-200/80 dark:border-blue-900/60 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-blue-600 text-white shadow-md">
                  <HiSparkles size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    SankhyaCopilot Statistical Learning Insights
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
                    Based on your cadre benchmark as an <strong>{profile?.jobRole || "ISS Officer"}</strong>, completing the{" "}
                    <em>Statistical Computing & Automated Processing</em> and <em>Periodic Labour Force Survey (PLFS)</em> practicums will raise your overall competency score by{" "}
                    <strong>+16%</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleDownloadPDF}
                  className="px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-xs hover:bg-slate-50 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <FaFilePdf size={13} className="text-red-500" />
                  <span>Export PDF</span>
                </button>

                <button
                  onClick={() => navigate("/chat")}
                  className="px-5 py-2.5 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <BsRobot size={14} />
                  <span>Open Copilot</span>
                </button>
              </div>
            </div>
          </ScrollReveal>
        </main>
      </PageTransition>
      <Footer />
    </div>
  );
};

export default Dashboard;
