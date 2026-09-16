import { useEffect, useState, useMemo } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BackButton from "../components/BackButton";
import { ServerUrl } from "../App";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaStar,
  FaSyncAlt,
  FaFilePdf,
  FaSearch,
  FaBookOpen,
  FaMicrophone,
  FaGraduationCap,
  FaLock,
} from "react-icons/fa";
import {
  BsShieldCheck,
  BsBarChartSteps,
  BsBullseye,
  BsArrowUpRight,
  BsExclamationOctagonFill,
  BsCircleHalf,
} from "react-icons/bs";
import { motion, AnimatePresence } from "framer-motion";
import { generateCompetencyPDF } from "../utils/pdfGenerator";
import PageTransition from "../components/PageTransition";
import { useDiagnostic } from "../context/DiagnosticContext";

const DOMAIN_OPTIONS = [
  { id: "all", label: "All Domains" },
  { id: "statistical", label: "Statistical" },
  { id: "technical", label: "Technical & Comp" },
  { id: "governance", label: "Digital Governance" },
  { id: "managerial", label: "Managerial" },
];

const CIRCULAR_PALETTES = [
  {
    id: "blue",
    name: "Royal Blue",
    stroke: "#2563eb",
    border: "border-blue-200 dark:border-blue-900/60 hover:border-blue-400 dark:hover:border-blue-600",
    glow: "hover:shadow-blue-500/15",
    badge: "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    accentText: "text-blue-600 dark:text-blue-400",
  },
  {
    id: "emerald",
    name: "Emerald Green",
    stroke: "#10b981",
    border: "border-emerald-200 dark:border-emerald-900/60 hover:border-emerald-400 dark:hover:border-emerald-600",
    glow: "hover:shadow-emerald-500/15",
    badge: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    accentText: "text-emerald-600 dark:text-emerald-400",
  },
  {
    id: "violet",
    name: "Purple Violet",
    stroke: "#8b5cf6",
    border: "border-purple-200 dark:border-purple-900/60 hover:border-purple-400 dark:hover:border-purple-600",
    glow: "hover:shadow-purple-500/15",
    badge: "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
    accentText: "text-purple-600 dark:text-purple-400",
  },
  {
    id: "amber",
    name: "Warm Amber",
    stroke: "#f59e0b",
    border: "border-amber-200 dark:border-amber-900/60 hover:border-amber-400 dark:hover:border-amber-600",
    glow: "hover:shadow-amber-500/15",
    badge: "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    accentText: "text-amber-600 dark:text-amber-400",
  },
  {
    id: "rose",
    name: "Crimson Rose",
    stroke: "#f43f5e",
    border: "border-rose-200 dark:border-rose-900/60 hover:border-rose-400 dark:hover:border-rose-600",
    glow: "hover:shadow-rose-500/15",
    badge: "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800",
    accentText: "text-rose-600 dark:text-rose-400",
  },
  {
    id: "cyan",
    name: "Electric Cyan",
    stroke: "#06b6d4",
    border: "border-cyan-200 dark:border-cyan-900/60 hover:border-cyan-400 dark:hover:border-cyan-600",
    glow: "hover:shadow-cyan-500/15",
    badge: "bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800",
    accentText: "text-cyan-600 dark:text-cyan-400",
  },
  {
    id: "indigo",
    name: "Deep Indigo",
    stroke: "#6366f1",
    border: "border-indigo-200 dark:border-indigo-900/60 hover:border-indigo-400 dark:hover:border-indigo-600",
    glow: "hover:shadow-indigo-500/15",
    badge: "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
    accentText: "text-indigo-600 dark:text-indigo-400",
  },
  {
    id: "teal",
    name: "Aqua Teal",
    stroke: "#14b8a6",
    border: "border-teal-200 dark:border-teal-900/60 hover:border-teal-400 dark:hover:border-teal-600",
    glow: "hover:shadow-teal-500/15",
    badge: "bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800",
    accentText: "text-teal-600 dark:text-teal-400",
  },
  {
    id: "pink",
    name: "Hot Pink",
    stroke: "#ec4899",
    border: "border-pink-200 dark:border-pink-900/60 hover:border-pink-400 dark:hover:border-pink-600",
    glow: "hover:shadow-pink-500/15",
    badge: "bg-pink-50 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800",
    accentText: "text-pink-600 dark:text-pink-400",
  },
  {
    id: "lime",
    name: "Vivid Lime",
    stroke: "#84cc16",
    border: "border-lime-200 dark:border-lime-900/60 hover:border-lime-400 dark:hover:border-lime-600",
    glow: "hover:shadow-lime-500/15",
    badge: "bg-lime-50 dark:bg-lime-950/60 text-lime-700 dark:text-lime-300 border-lime-200 dark:border-lime-800",
    accentText: "text-lime-600 dark:text-lime-400",
  },
  {
    id: "orange",
    name: "Tangerine Orange",
    stroke: "#ea580c",
    border: "border-orange-200 dark:border-orange-900/60 hover:border-orange-400 dark:hover:border-orange-600",
    glow: "hover:shadow-orange-500/15",
    badge: "bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800",
    accentText: "text-orange-600 dark:text-orange-400",
  },
  {
    id: "sky",
    name: "Sky Blue",
    stroke: "#0284c7",
    border: "border-sky-200 dark:border-sky-900/60 hover:border-sky-400 dark:hover:border-sky-600",
    glow: "hover:shadow-sky-500/15",
    badge: "bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800",
    accentText: "text-sky-600 dark:text-sky-400",
  },
];

const SkillGapAnalysis = () => {
  const navigate = useNavigate();
  const { userData } = useSelector((state) => state.user);
  const { isIntakePending, triggerLockedError } = useDiagnostic();

  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [data, setData] = useState(null);

  const [selectedCadre, setSelectedCadre] = useState("");
  const [activeTab, setActiveTab] = useState("all_required");
  const [selectedDomain, setSelectedDomain] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [benchmarkViewMode, setBenchmarkViewMode] = useState("circles");

  const fetchGapAnalysis = async (cadreOverride = null, isSync = false) => {
    try {
      if (isSync) setSyncing(true);
      else setLoading(true);

      const cadreParam = cadreOverride || selectedCadre;
      const url = cadreParam
        ? `${ServerUrl}/api/competencies/skill-gap-analysis?cadre=${encodeURIComponent(cadreParam)}`
        : `${ServerUrl}/api/competencies/skill-gap-analysis`;

      const res = await axios.get(url, { withCredentials: true });
      if (res.data.success) {
        setData(res.data);
        if (!selectedCadre && res.data.cadre) {
          setSelectedCadre(res.data.cadre);
        }
        if (isSync) {
          toast.success("Skill gaps & benchmarks successfully synchronized! ✨");
        }
      }
    } catch (error) {
      console.error("Fetch skill gap analysis error:", error);
      toast.error("Failed to load skill gap analysis.");
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchGapAnalysis();

    const handleRealtimeSync = () => {
      fetchGapAnalysis(null, true);
    };

    window.addEventListener("assessmentCompleted", handleRealtimeSync);
    window.addEventListener("storage", handleRealtimeSync);
    window.addEventListener("focus", handleRealtimeSync);

    return () => {
      window.removeEventListener("assessmentCompleted", handleRealtimeSync);
      window.removeEventListener("storage", handleRealtimeSync);
      window.removeEventListener("focus", handleRealtimeSync);
    };
  }, []);

  const handleCadreChange = (newCadre) => {
    setSelectedCadre(newCadre);
    fetchGapAnalysis(newCadre, false);
  };

  const handleDownloadDossier = () => {
    if (isIntakePending) {
      triggerLockedError("Official Dossier PDF Export");
      return;
    }
    if (!data || !userData) {
      toast.error("No profile data available to export.");
      return;
    }
    toast.success("Preparing Official Skill Gap & Competency Dossier (PDF)... 📄");
    generateCompetencyPDF({
      user: userData,
      profile: {
        ...userData,
        jobRole: data.cadre || userData.jobRole,
        overallCompetencyScore: data.userProfile?.overallCompetencyScore || 0,
        overallLevel: data.userProfile?.overallLevel || "Novice",
      },
      competencies: data.requiredSkills || [],
      skillGaps: data.skillGaps || [],
      learningPath: userData.learningPath || [],
    });
  };

  const displayedSkills = useMemo(() => {
    if (!data) return [];

    let pool;
    switch (activeTab) {
      case "on_target":
        pool = data.skillsOnTarget || [];
        break;
      case "strong":
        pool = data.strongSkills || [];
        break;
      case "needs_improvement":
        pool = data.needsImprovement || [];
        break;
      case "critical":
        pool = data.criticalGaps || [];
        break;
      case "all_gaps":
        pool = data.skillGaps || [];
        break;
      case "all_required":
      default:
        pool = data.requiredSkills || [];
        break;
    }

    return pool.filter((skill) => {
      if (selectedDomain !== "all") {
        const d = (skill.domain || "").toLowerCase();
        if (selectedDomain === "statistical" && !d.includes("statistical")) return false;
        if (selectedDomain === "technical" && !d.includes("technical") && !d.includes("computational")) return false;
        if (selectedDomain === "governance" && !d.includes("governance") && !d.includes("security")) return false;
        if (selectedDomain === "managerial" && !d.includes("managerial") && !d.includes("behavioural")) return false;
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = skill.competencyName.toLowerCase().includes(query);
        const matchDomain = (skill.domain || "").toLowerCase().includes(query);
        const matchAction = (skill.recommendedAction || "").toLowerCase().includes(query);
        if (!matchName && !matchDomain && !matchAction) return false;
      }

      return true;
    });
  }, [data, activeTab, selectedDomain, searchQuery]);

  const chartData = useMemo(() => {
    if (!data?.requiredSkills) return [];
    return data.requiredSkills.map((s) => ({
      name: s.competencyName.length > 14 ? `${s.competencyName.substring(0, 14)}..` : s.competencyName,
      fullName: s.competencyName,
      current: s.currentScore,
      target: s.targetScore,
      delta: s.deltaScore,
    }));
  }, [data]);

  const summary = data?.summary || {
    totalRequiredSkills: 0,
    skillsOnTargetCount: 0,
    strongSkillsCount: 0,
    needsImprovementCount: 0,
    criticalGapsCount: 0,
    cadreComplianceRate: 0,
    averageGapScore: 0,
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <PageTransition>
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-20 space-y-6">
          <div className="flex items-center justify-between">
            <BackButton fallbackUrl="/dashboard" label="Back to Dashboard" />
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
              <BsBullseye className="text-blue-600 dark:text-blue-400" />
              <span>MoSPI NSSTA • Cadre Competency Gap Analytics</span>
            </div>
          </div>

          <div className="relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider">
                  <BsShieldCheck size={14} className="text-blue-600" />
                  <span>Official Cadre Benchmark Matrix</span>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                  Cadre Skill Gap Analysis & Target Audit
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                  Deep comparative analysis between officer current assessed proficiencies and statutory MoSPI cadre benchmarks. Identify skills on target, critical deficiencies, and targeted learning interventions.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                <div className="bg-slate-50 dark:bg-slate-800/90 p-2 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
                    Benchmark Cadre Role
                  </label>
                  <select
                    value={selectedCadre}
                    onChange={(e) => handleCadreChange(e.target.value)}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-blue-700 dark:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    {(data?.availableCadres || []).map((cadre) => (
                      <option key={cadre} value={cadre}>
                        {cadre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fetchGapAnalysis(selectedCadre, true)}
                    disabled={syncing}
                    title="Recalculate and sync with recent assessment scores"
                    className="px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <FaSyncAlt className={`text-blue-600 ${syncing ? "animate-spin" : ""}`} />
                    <span className="hidden sm:inline">Sync Gaps</span>
                  </button>

                  <button
                    onClick={handleDownloadDossier}
                    className={`px-4 py-3 rounded-2xl text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer ${isIntakePending
                        ? "bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-700"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-emerald-600/30"
                      }`}
                  >
                    <FaFilePdf size={13} className={isIntakePending ? "text-slate-400" : "text-white"} />
                    <span>Export Dossier (PDF)</span>
                    {isIntakePending && (
                      <span className="flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        <FaLock size={8} /> LOCKED
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-bold text-slate-500">
                Synthesizing Cadre Benchmarks & Gap Analytics...
              </span>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Compliance
                    </span>
                    <div className="w-7 h-7 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
                      <BsBullseye size={13} />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-2xl font-black text-slate-900 dark:text-white">
                      {summary.cadreComplianceRate}%
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {summary.skillsOnTargetCount} of {summary.totalRequiredSkills} on target
                    </p>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-emerald-200/80 dark:border-emerald-900/50 rounded-3xl p-4 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      On Target
                    </span>
                    <div className="w-7 h-7 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                      <FaCheckCircle size={12} />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                      {summary.skillsOnTargetCount}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">Meets Cadre Benchmark</p>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                      Required Skills
                    </span>
                    <div className="w-7 h-7 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
                      <FaGraduationCap size={13} />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-2xl font-black text-slate-900 dark:text-white">
                      {summary.totalRequiredSkills}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">Statutory Cadre Skills</p>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-indigo-200/80 dark:border-indigo-900/50 rounded-3xl p-4 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                      Strong Skills
                    </span>
                    <div className="w-7 h-7 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center">
                      <FaStar size={12} />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                      {summary.strongSkillsCount}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">High Mastery (≥80%)</p>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-amber-200/80 dark:border-amber-900/50 rounded-3xl p-4 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                      Needs Improv.
                    </span>
                    <div className="w-7 h-7 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 flex items-center justify-center">
                      <FaExclamationTriangle size={12} />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
                      {summary.needsImprovementCount}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">Moderate Gap (1-20%)</p>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-rose-200/80 dark:border-rose-900/50 rounded-3xl p-4 shadow-xs flex flex-col justify-between relative overflow-hidden">
                  {summary.criticalGapsCount > 0 && (
                    <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-rose-500 animate-ping m-2" />
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                      Critical Gaps
                    </span>
                    <div className="w-7 h-7 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 flex items-center justify-center">
                      <BsExclamationOctagonFill size={12} />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
                      {summary.criticalGapsCount}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">Urgent High Priority</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                        <BsCircleHalf size={16} />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-slate-900 dark:text-white">
                          Benchmark Proficiency vs Cadre Target Thresholds
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Smooth animated circular gauges & target thresholds for {selectedCadre}. Distinct color-coded arcs for each required competency.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="hidden sm:flex items-center gap-3 text-[11px] font-semibold bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
                        <span className="text-slate-600 dark:text-slate-300">Outer: Officer Score</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full border border-dashed border-slate-400 inline-block" />
                        <span className="text-slate-600 dark:text-slate-300">Inner: Cadre Target</span>
                      </div>
                    </div>

                    <div className="inline-flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 text-xs font-bold">
                      <button
                        onClick={() => setBenchmarkViewMode("circles")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${benchmarkViewMode === "circles"
                            ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                            : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                          }`}
                      >
                        <BsCircleHalf size={12} />
                        <span>Circular Rings</span>
                      </button>

                      <button
                        onClick={() => setBenchmarkViewMode("bars")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${benchmarkViewMode === "bars"
                            ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                            : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                          }`}
                      >
                        <BsBarChartSteps size={12} />
                        <span>Bar Chart</span>
                      </button>
                    </div>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {benchmarkViewMode === "circles" ? (
                    <motion.div
                      key="circles-view"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-1"
                    >
                      {data?.requiredSkills && data.requiredSkills.length > 0 ? (
                        data.requiredSkills.map((skill, idx) => {
                          const palette = CIRCULAR_PALETTES[idx % CIRCULAR_PALETTES.length];
                          const delta = skill.currentScore - skill.targetScore;
                          const C_outer = 276.46; // 2 * PI * 44
                          const C_inner = 207.35; // 2 * PI * 33
                          const currentClamped = Math.min(Math.max(skill.currentScore || 0, 0), 100);
                          const targetClamped = Math.min(Math.max(skill.targetScore || 0, 0), 100);

                          return (
                            <motion.div
                              key={skill.competencyName || idx}
                              initial={{ opacity: 0, scale: 0.92, y: 15 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              transition={{ duration: 0.45, delay: idx * 0.04, ease: "easeOut" }}
                              whileHover={{ y: -4, scale: 1.01, transition: { duration: 0.2 } }}
                              className={`relative bg-white dark:bg-slate-900/90 rounded-3xl p-4 sm:p-5 border ${palette.border} shadow-xs ${palette.glow} flex flex-col justify-between overflow-hidden transition-all duration-300 group`}
                            >
                              <div
                                className="absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-15 pointer-events-none group-hover:opacity-30 transition-opacity"
                                style={{ backgroundColor: palette.stroke }}
                              />

                              <div className="flex items-center justify-between gap-2 relative z-10">
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${palette.badge} capitalize truncate max-w-[110px]`}
                                >
                                  {skill.domain || "Core"}
                                </span>

                                {delta >= 0 ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/70 px-2 py-0.5 rounded-full border border-emerald-200/80 dark:border-emerald-800/50 shrink-0">
                                    <FaCheckCircle size={9} />
                                    +{delta}%
                                  </span>
                                ) : delta >= -20 ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/70 px-2 py-0.5 rounded-full border border-amber-200/80 dark:border-amber-800/50 shrink-0">
                                    <FaExclamationTriangle size={9} />
                                    {delta}%
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/70 px-2 py-0.5 rounded-full border border-rose-200/80 dark:border-rose-800/50 shrink-0">
                                    <BsExclamationOctagonFill size={9} />
                                    {delta}%
                                  </span>
                                )}
                              </div>

                              <div className="relative w-28 h-28 my-3 mx-auto flex items-center justify-center z-10">
                                <svg className="w-28 h-28" viewBox="0 0 112 112">
                                  <circle
                                    cx="56"
                                    cy="56"
                                    r="44"
                                    stroke="currentColor"
                                    strokeWidth="7"
                                    fill="transparent"
                                    className="text-slate-100 dark:text-slate-800/80"
                                  />

                                  <circle
                                    cx="56"
                                    cy="56"
                                    r="33"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeDasharray="3 3"
                                    fill="transparent"
                                    className="text-slate-200 dark:text-slate-700/60"
                                  />

                                  <motion.circle
                                    cx="56"
                                    cy="56"
                                    r="33"
                                    stroke={palette.stroke}
                                    strokeOpacity="0.4"
                                    strokeWidth="3"
                                    strokeDasharray={`${C_inner} ${C_inner}`}
                                    strokeLinecap="round"
                                    fill="none"
                                    initial={{ strokeDashoffset: C_inner }}
                                    animate={{ strokeDashoffset: C_inner - (C_inner * targetClamped) / 100 }}
                                    transition={{ duration: 1.2, ease: "easeOut", delay: 0.15 + idx * 0.04 }}
                                    transform="rotate(-90 56 56)"
                                  />

                                  <motion.circle
                                    cx="56"
                                    cy="56"
                                    r="44"
                                    stroke={palette.stroke}
                                    strokeWidth="7.5"
                                    strokeDasharray={`${C_outer} ${C_outer}`}
                                    strokeLinecap="round"
                                    fill="none"
                                    initial={{ strokeDashoffset: C_outer }}
                                    animate={{ strokeDashoffset: C_outer - (C_outer * currentClamped) / 100 }}
                                    transition={{ duration: 1.35, ease: "easeOut", delay: idx * 0.04 }}
                                    transform="rotate(-90 56 56)"
                                  />
                                </svg>

                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
                                  <motion.span
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.4, delay: 0.2 + idx * 0.04 }}
                                    className="text-lg font-black text-slate-900 dark:text-white leading-none tracking-tight"
                                  >
                                    {skill.currentScore}%
                                  </motion.span>
                                  <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-tight">
                                    Tgt {skill.targetScore}%
                                  </span>
                                </div>
                              </div>

                              <div className="space-y-2 relative z-10">
                                <h4
                                  className="text-xs font-bold text-slate-900 dark:text-white text-center line-clamp-2 h-8 flex items-center justify-center group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                                  title={skill.competencyName}
                                >
                                  {skill.competencyName}
                                </h4>

                                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden flex relative">
                                  <motion.div
                                    className="h-full rounded-full"
                                    style={{ backgroundColor: palette.stroke }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${currentClamped}%` }}
                                    transition={{ duration: 1.2, ease: "easeOut", delay: idx * 0.04 }}
                                  />
                                </div>

                                <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                                  <span>
                                    Score: <b className="text-slate-700 dark:text-slate-200">{skill.currentScore}%</b>
                                  </span>
                                  <span>
                                    Req: <b className="text-slate-700 dark:text-slate-200">{skill.targetScore}%</b>
                                  </span>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })
                      ) : (
                        <div className="col-span-full py-12 text-center text-slate-400 text-xs font-semibold">
                          No competencies found for this cadre benchmark.
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="bars-view"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="h-72 w-full pt-2"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={chartData}
                          margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} vertical={false} />
                          <XAxis
                            dataKey="name"
                            tick={{ fontSize: 10, fill: "#64748b" }}
                            interval={0}
                            angle={-20}
                            textAnchor="end"
                          />
                          <YAxis
                            domain={[0, 100]}
                            tick={{ fontSize: 10, fill: "#64748b" }}
                            ticks={[0, 25, 50, 75, 100]}
                          />
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const d = payload[0].payload;
                                const delta = d.current - d.target;
                                return (
                                  <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs border border-slate-700 space-y-1">
                                    <p className="font-bold text-blue-400">{d.fullName}</p>
                                    <div className="flex justify-between gap-4">
                                      <span className="text-slate-400">Current Proficiency:</span>
                                      <span className="font-bold">{d.current}%</span>
                                    </div>
                                    <div className="flex justify-between gap-4">
                                      <span className="text-slate-400">Cadre Target Benchmark:</span>
                                      <span className="font-bold">{d.target}%</span>
                                    </div>
                                    <div className="flex justify-between gap-4 pt-1 border-t border-slate-800">
                                      <span className="text-slate-400">Delta Status:</span>
                                      <span
                                        className={`font-bold ${delta >= 0 ? "text-emerald-400" : delta >= -20 ? "text-amber-400" : "text-rose-400"
                                          }`}
                                      >
                                        {delta >= 0 ? `+${delta}% (On Target)` : `${delta}% (Gap)`}
                                      </span>
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Bar dataKey="current" fill="#2563eb" radius={[6, 6, 0, 0]} maxBarSize={30} />
                          <Bar dataKey="target" fill="#64748b" opacity={0.35} radius={[6, 6, 0, 0]} maxBarSize={30} />
                        </BarChart>
                      </ResponsiveContainer>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-xs">
                  <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
                    <button
                      onClick={() => setActiveTab("all_required")}
                      className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${activeTab === "all_required"
                          ? "bg-blue-600 text-white shadow-xs"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                        }`}
                    >
                      <span>Required Skills</span>
                      <span className="px-1.5 py-0.5 rounded-md bg-white/20 text-[10px]">
                        {data?.requiredSkills?.length || 0}
                      </span>
                    </button>

                    <button
                      onClick={() => setActiveTab("on_target")}
                      className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${activeTab === "on_target"
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                        }`}
                    >
                      <FaCheckCircle size={11} />
                      <span>On Target</span>
                      <span className="px-1.5 py-0.5 rounded-md bg-white/20 text-[10px]">
                        {summary.skillsOnTargetCount}
                      </span>
                    </button>

                    <button
                      onClick={() => setActiveTab("strong")}
                      className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${activeTab === "strong"
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                        }`}
                    >
                      <FaStar size={11} />
                      <span>Strong Skills</span>
                      <span className="px-1.5 py-0.5 rounded-md bg-white/20 text-[10px]">
                        {summary.strongSkillsCount}
                      </span>
                    </button>

                    <button
                      onClick={() => setActiveTab("needs_improvement")}
                      className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${activeTab === "needs_improvement"
                          ? "bg-amber-600 text-white shadow-xs"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                        }`}
                    >
                      <FaExclamationTriangle size={11} />
                      <span>Needs Improvement</span>
                      <span className="px-1.5 py-0.5 rounded-md bg-white/20 text-[10px]">
                        {summary.needsImprovementCount}
                      </span>
                    </button>

                    <button
                      onClick={() => setActiveTab("critical")}
                      className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${activeTab === "critical"
                          ? "bg-rose-600 text-white shadow-xs"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                        }`}
                    >
                      <BsExclamationOctagonFill size={11} />
                      <span>Critical Gaps</span>
                      <span className="px-1.5 py-0.5 rounded-md bg-white/20 text-[10px]">
                        {summary.criticalGapsCount}
                      </span>
                    </button>

                    <button
                      onClick={() => setActiveTab("all_gaps")}
                      className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${activeTab === "all_gaps"
                          ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                        }`}
                    >
                      <span>All Gaps</span>
                      <span className="px-1.5 py-0.5 rounded-md bg-black/10 dark:bg-white/20 text-[10px]">
                        {data?.skillGaps?.length || 0}
                      </span>
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <div className="relative">
                      <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                      <input
                        type="text"
                        placeholder="Search competencies..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 pr-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-48"
                      />
                    </div>

                    <select
                      value={selectedDomain}
                      onChange={(e) => setSelectedDomain(e.target.value)}
                      className="px-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      {DOMAIN_OPTIONS.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {displayedSkills.length === 0 ? (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto text-xl">
                      <FaCheckCircle />
                    </div>
                    <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                      No competencies matching active filter criteria
                    </h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      All competencies under this category meet current criteria, or adjust your domain and search filters above.
                    </p>
                    <button
                      onClick={() => {
                        setActiveTab("all_required");
                        setSelectedDomain("all");
                        setSearchQuery("");
                      }}
                      className="px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 text-xs font-bold cursor-pointer"
                    >
                      Reset All Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {displayedSkills.map((skill, idx) => {
                      const isOnTarget = skill.currentScore >= skill.targetScore;
                      const isCritical = skill.category === "CRITICAL";
                      const isNeedsImprovement = skill.category === "NEEDS_IMPROVEMENT";

                      return (
                        <div
                          key={idx}
                          className={`bg-white dark:bg-slate-900 border rounded-3xl p-5 shadow-xs transition-all space-y-4 ${isCritical
                              ? "border-rose-300/80 dark:border-rose-900/60 hover:shadow-rose-500/10"
                              : isNeedsImprovement
                                ? "border-amber-200/80 dark:border-amber-900/40 hover:shadow-amber-500/10"
                                : "border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-800"
                            }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                {skill.domain}
                              </span>
                              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-snug">
                                {skill.competencyName}
                              </h3>
                            </div>

                            {isOnTarget ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold border border-emerald-200 dark:border-emerald-800 shrink-0">
                                <FaCheckCircle size={10} />
                                <span>On Target</span>
                              </span>
                            ) : isCritical ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 text-[11px] font-bold border border-rose-200 dark:border-rose-800 shrink-0 animate-pulse">
                                <BsExclamationOctagonFill size={10} />
                                <span>Critical Gap</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 text-[11px] font-bold border border-amber-200 dark:border-amber-800 shrink-0">
                                <FaExclamationTriangle size={10} />
                                <span>Needs Improv.</span>
                              </span>
                            )}
                          </div>

                          <div className="space-y-2 bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-700 dark:text-slate-300">
                                  Current: {skill.currentScore}% ({skill.currentLevel})
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-slate-500 font-medium">
                                  Target: {skill.targetScore}% ({skill.targetLevel})
                                </span>
                              </div>
                            </div>

                            <div className="relative w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${isOnTarget
                                    ? "bg-emerald-500"
                                    : isCritical
                                      ? "bg-rose-500"
                                      : "bg-amber-500"
                                  }`}
                                style={{ width: `${Math.min(100, skill.currentScore)}%` }}
                              />
                              <div
                                className="absolute top-0 bottom-0 w-1 bg-slate-900 dark:bg-white z-10 shadow-xs"
                                style={{ left: `${Math.min(99, skill.targetScore)}%` }}
                                title={`Cadre Target Threshold: ${skill.targetScore}%`}
                              />
                            </div>

                            <div className="flex items-center justify-between text-[11px] font-bold pt-0.5">
                              <span className="text-slate-500">Benchmark Gap Delta:</span>
                              <span
                                className={`${skill.deltaScore >= 0
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : skill.deltaScore >= -20
                                      ? "text-amber-600 dark:text-amber-400"
                                      : "text-rose-600 dark:text-rose-400"
                                  }`}
                              >
                                {skill.deltaScore >= 0
                                  ? `+${skill.deltaScore}% (Target Exceeded)`
                                  : `${skill.deltaScore}% (${skill.gapScore} pts deficit)`}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-1.5 text-xs">
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
                              <strong className="text-slate-800 dark:text-slate-200">Operational Impact: </strong>
                              {skill.impact}
                            </p>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
                              <strong className="text-blue-700 dark:text-blue-400">Action Plan: </strong>
                              {skill.recommendedAction}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
                            {skill.suggestedQuizzes && skill.suggestedQuizzes.length > 0 ? (
                              <button
                                onClick={() => navigate(`/quiz/${skill.suggestedQuizzes[0]._id}`)}
                                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                              >
                                <span>Take Remedial Quiz</span>
                                <BsArrowUpRight size={10} />
                              </button>
                            ) : (
                              <button
                                onClick={() => navigate("/quizzes")}
                                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                              >
                                <span>Practice Quizzes</span>
                                <BsArrowUpRight size={10} />
                              </button>
                            )}

                            {skill.suggestedCourses && skill.suggestedCourses.length > 0 ? (
                              <a
                                href={skill.suggestedCourses[0].url || "https://igotkarmayogi.gov.in"}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                              >
                                <FaBookOpen size={10} className="text-blue-600" />
                                <span>iGOT Module</span>
                              </a>
                            ) : (
                              <button
                                onClick={() => navigate("/learning-path")}
                                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                              >
                                <FaBookOpen size={10} className="text-blue-600" />
                                <span>Learning Path</span>
                              </button>
                            )}

                            <button
                              onClick={() => navigate("/interview")}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ml-auto"
                            >
                              <FaMicrophone size={10} className="text-indigo-500" />
                              <span>Oral Viva</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </PageTransition>

      <Footer />
    </div>
  );
};

export default SkillGapAnalysis;
