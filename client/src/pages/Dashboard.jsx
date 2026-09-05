import React, { useEffect, useState } from "react";
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
} from "recharts";
import {
  FaBrain,
  FaCertificate,
  FaTasks,
  FaFire,
  FaClock,
  FaAward,
  FaArrowRight,
  FaExclamationTriangle,
  FaExternalLinkAlt,
  FaCheckCircle,
  FaPlayCircle,
  FaUserTie,
  FaHistory,
  FaMicrophone,
  FaFilePdf,
  FaSyncAlt,
  FaLayerGroup,
  FaColumns,
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";
import { BsRobot, BsBarChartFill, BsShieldCheck, BsFillCameraVideoFill, BsDownload, BsLightningChargeFill, BsClockHistory } from "react-icons/bs";
import { generateCompetencyPDF } from "../utils/pdfGenerator";
import { DashboardSkeleton } from "../components/SkeletonLoader";
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
  if (lower.includes("national account") || lower.includes("sna")) return "SNA 2008";
  if (lower.includes("price") || lower.includes("cpi") || lower.includes("wpi")) return "CPI / WPI";
  if (lower.includes("computing") || lower.includes("automated")) return "Computing";
  if (lower.includes("privacy") || lower.includes("dpdp")) return "DPDP Act";
  if (lower.includes("labour") || lower.includes("plfs")) return "PLFS Labour";
  if (lower.includes("microdata") || lower.includes("weight")) return "Microdata";
  if (lower.includes("policy") || lower.includes("evidence")) return "Policy Lead";
  if (lower.includes("industrial") || lower.includes("asi") || lower.includes("iip")) return "ASI / IIP";
  if (lower.includes("sdg")) return "SDG NIF";
  if (lower.includes("quality") || lower.includes("nqaf")) return "UN-NQAF";
  return name.length > 12 ? name.substring(0, 12) + ".." : name;
};

const Dashboard = () => {
  const { userData } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingPath, setGeneratingPath] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await axios.get(`${ServerUrl}/api/competencies/my-profile`, {
        withCredentials: true,
      });
      if (data.success) {
        setProfile(data.profile);
        dispatch(setUserData({ ...userData, ...data.profile }));
      }
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleDownloadPDF = () => {
    toast.success("Generating official MoSPI Competency Dossier (PDF)... 📄");
    generateCompetencyPDF({
      user: userData,
      profile: profile || userData,
      competencies: profile?.competencies || userData?.competencies || [],
      skillGaps: profile?.skillGaps || userData?.skillGaps || [],
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
        fetchProfile();
      }
    } catch (error) {
      toast.error("Failed to regenerate pathway.");
    } finally {
      setGeneratingPath(false);
    }
  };

  const radarData = [
    {
      domain: "Statistical",
      score: profile?.competencies
        ?.filter((c) => c.domain?.includes("Statistical"))
        .reduce((acc, c, _, arr) => acc + c.score / (arr.length || 1), 0) || 75,
      fullMark: 100,
    },
    {
      domain: "Technical",
      score: profile?.competencies
        ?.filter((c) => c.domain?.includes("Technical"))
        .reduce((acc, c, _, arr) => acc + c.score / (arr.length || 1), 0) || 62,
      fullMark: 100,
    },
    {
      domain: "Governance",
      score: profile?.competencies
        ?.filter((c) => c.domain?.includes("Governance"))
        .reduce((acc, c, _, arr) => acc + c.score / (arr.length || 1), 0) || 70,
      fullMark: 100,
    },
    {
      domain: "Managerial",
      score: profile?.competencies
        ?.filter((c) => c.domain?.includes("Managerial") || c.domain?.includes("Behavioural"))
        .reduce((acc, c, _, arr) => acc + c.score / (arr.length || 1), 0) || 78,
      fullMark: 100,
    },
  ];

  const rawCompetencies = profile?.competencies && profile.competencies.length > 0
    ? profile.competencies
    : [
        { competencyName: "Sampling Techniques & Estimation", domain: "Statistical", score: 45 },
        { competencyName: "National Accounts (SNA 2008)", domain: "Statistical", score: 82 },
        { competencyName: "Price Statistics (CPI/WPI)", domain: "Statistical", score: 78 },
        { competencyName: "Statistical Computing & Automated Processing", domain: "Technical", score: 40 },
        { competencyName: "Data Privacy & DPDP Compliance", domain: "Governance", score: 70 },
        { competencyName: "Labour Statistics (PLFS Rounds)", domain: "Statistical", score: 85 },
        { competencyName: "Microdata Analytics & Survey Weights", domain: "Technical", score: 48 },
        { competencyName: "Evidence-Based Policy Leadership", domain: "Managerial", score: 80 },
      ];

  const columnBarData = rawCompetencies.map((c) => {
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
    };
  });
  const weakCompetencies = columnBarData.filter((b) => b.score < 75);

  const handleUpdateCourseStatus = async (stepIndex, status) => {
    try {
      const { data } = await axios.put(
        `${ServerUrl}/api/competencies/pathway-progress`,
        { stepIndex, status },
        { withCredentials: true }
      );
      if (data.success) {
        toast.success(data.message);
        fetchProfile();
      }
    } catch (err) {
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
              National Statistical Portal
            </span>
          </div>

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
              {profile?.overallCompetencyScore || 65}%
            </div>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              {profile?.overallLevel || "Intermediate"} Level
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
              {columnBarData.filter((b) => b.isWeakness).length} Areas
            </div>
            <span className="text-[10px] font-bold text-rose-600">
              Score &lt; 50% (Action Gap)
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Pathway Courses</span>
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600">
                <FaCertificate size={16} />
              </div>
            </div>
            <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
              {profile?.learningPath?.length || 5}
            </div>
            <span className="text-[10px] font-bold text-blue-600">
              iGOT & NSSTA TPAC
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Quizzes Taken</span>
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
                <FaTasks size={16} />
              </div>
            </div>
            <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
              {profile?.quizzesCompleted || 0}
            </div>
            <span className="text-[10px] font-bold text-emerald-600">
              Assessment Tests
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Learning Hours</span>
              <div className="p-2 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600">
                <FaClock size={16} />
              </div>
            </div>
            <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
              {profile?.learningHours || 14}h
            </div>
            <span className="text-[10px] font-bold text-violet-600">
              Capacity Logged
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Learning Streak</span>
              <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-600">
                <FaFire size={16} />
              </div>
            </div>
            <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
              {profile?.learningStreak || 3} Days
            </div>
            <span className="text-[10px] font-bold text-orange-600">
              Active Engagement
            </span>
          </div>
        </div>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={0.1}>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-1">
                  <BsBarChartFill size={13} />
                  <span>Performance Diagnostics</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Student Performance & Weakness Diagnostics</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Full-width column bars evaluated against the official <strong>75% Cadre Benchmark</strong>.
                </p>
              </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs font-extrabold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-3.5 py-1.5 rounded-full border border-blue-200 dark:border-blue-800">
                Cadre Benchmark: 75%
              </span>
              <button
                onClick={() => navigate("/competencies")}
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
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
                  formatter={(val, name, item) => [`${val}%`, `Score: ${item.payload.fullName} (${item.payload.domain})`]}
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderRadius: "14px",
                    border: "1px solid #334155",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <ReferenceLine
                  y={75}
                  stroke="#ef4444"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{ value: "Benchmark Target: 75%", fill: "#ef4444", fontSize: 11, fontWeight: 800, position: "top" }}
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
                <span className="text-slate-700 dark:text-slate-300">Mastered (&ge;75%)</span>
              </span>
              <span className="flex items-center gap-1.5 font-semibold">
                <span className="w-3.5 h-3.5 rounded-md bg-blue-500 shadow-xs" />
                <span className="text-slate-700 dark:text-slate-300">Developing (50-74%)</span>
              </span>
              <span className="flex items-center gap-1.5 font-bold text-rose-600">
                <span className="w-3.5 h-3.5 rounded-md bg-rose-600 shadow-xs" />
                <span>Critical Weakness (&lt;50%)</span>
              </span>
            </div>

            <span className="text-xs text-slate-500">
              Red bars highlight priority skill deficits mapped directly to iGOT remedial modules.
            </span>
          </div>
        </div>
        </ScrollReveal>
        <ScrollReveal direction="up" delay={0.1}>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider mb-1">
                  <FaBrain size={12} />
                  <span>4-Domain Balance</span>
                </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>Domain Taxonomy Radar & Balance Matrix</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Holistic multi-domain balance across Statistical, Technical, Governance, and Managerial domains.
              </p>
            </div>

            <span className="text-xs font-bold text-slate-500">
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
                      backgroundColor: "#0f172a",
                      borderRadius: "12px",
                      border: "none",
                      color: "#fff",
                      fontSize: "12px",
                    }}
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
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                      d.score >= 75
                        ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-600"
                        : d.score >= 50
                        ? "bg-blue-100 dark:bg-blue-950 text-blue-600"
                        : "bg-rose-100 dark:bg-rose-950 text-rose-600"
                    }`}>
                      {d.score >= 75 ? "Benchmark Met" : d.score >= 50 ? "Developing" : "Deficit"}
                    </span>
                  </div>

                  <div className="text-3xl font-black text-slate-900 dark:text-white">
                    {Math.round(d.score)}%
                  </div>

                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        d.score >= 75 ? "bg-emerald-500" : d.score >= 50 ? "bg-blue-500" : "bg-rose-500"
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
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <FaColumns className="text-blue-600" />
                  <span>Competency Columns & Action Targets</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Column-wise cards highlighting individual mastery levels and 1-click remediation links.
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
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                      isWeak
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
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                          isWeak ? "bg-rose-100 dark:bg-rose-950 text-rose-600" : isMastered ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-600" : "bg-blue-100 dark:bg-blue-950 text-blue-600"
                        }`}>
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
                          <span className="text-slate-400 text-[10px]">
                            Target 75%
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isWeak ? "bg-rose-500" : isMastered ? "bg-emerald-500" : "bg-blue-500"
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

        <ScrollReveal direction="up" delay={0.1}>
          <div className="bg-white dark:bg-slate-900 border-2 border-blue-100 dark:border-blue-900/60 rounded-3xl p-6 sm:p-8 shadow-lg space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-1.5">
                  <HiSparkles size={14} className="text-amber-400" />
                  <span>Weakness-Driven AI Curriculum Engine</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  Personalized Learning Pathway (Generated from Your Weaknesses)
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  SankhyaIQ™ AI Neural Engine analyzed your evaluated weaknesses across <strong>{weakCompetencies.map((w) => w.fullName).slice(0, 3).join(", ")}</strong> and synthesized this sequential capacity roadmap.
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
              {(profile?.learningPath || []).map((step, idx) => (
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
                        <span>Completed (+10)</span>
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
                  Based on your cadre benchmark as an <strong>{profile?.jobRole || "ISS Officer"}</strong>, completing the <em>Statistical Computing & Microdata Processing</em> and <em>Periodic Labour Force Survey (PLFS)</em> modules will raise your overall competency score by <strong>+18%</strong>.
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
