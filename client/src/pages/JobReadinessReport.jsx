import React, { useEffect, useState, useMemo } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BackButton from "../components/BackButton";
import { ServerUrl } from "../App";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  FaUserTie,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaAward,
  FaFilePdf,
  FaSyncAlt,
  FaGraduationCap,
  FaClock,
  FaChartLine,
  FaShieldAlt,
  FaArrowRight,
  FaMicrophone,
  FaTasks,
  FaBookOpen,
  FaBriefcase,
  FaRegCheckCircle,
  FaLock,
} from "react-icons/fa";
import {
  BsShieldCheck,
  BsBarChartSteps,
  BsCheck2Circle,
  BsPatchCheckFill,
  BsArrowUpRight,
  BsBullseye,
} from "react-icons/bs";
import { HiSparkles } from "react-icons/hi";
import { generateCompetencyPDF } from "../utils/pdfGenerator";
import PageTransition from "../components/PageTransition";
import { useDiagnostic } from "../context/DiagnosticContext";

const JobReadinessReport = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);
  const { isIntakePending, triggerLockedError } = useDiagnostic();

  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [report, setReport] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");

  const fetchReadinessReport = async (roleOverride = null, isSync = false) => {
    try {
      if (isSync) setSyncing(true);
      else setLoading(true);

      const targetParam = roleOverride || selectedRole;
      const url = targetParam
        ? `${ServerUrl}/api/competencies/job-readiness?targetRole=${encodeURIComponent(targetParam)}`
        : `${ServerUrl}/api/competencies/job-readiness`;

      const res = await axios.get(url, { withCredentials: true });
      if (res.data.success) {
        setReport(res.data);
        if (!selectedRole && res.data.targetRole) {
          setSelectedRole(res.data.targetRole);
        }
        if (isSync) {
          toast.success("Job readiness audit recalculated! ✨");
        }
      }
    } catch (error) {
      console.error("Fetch job readiness error:", error);
      toast.error("Failed to load target job readiness report.");
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchReadinessReport();

    const handleRealtimeSync = () => {
      fetchReadinessReport(null, true);
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

  const handleRoleChange = (newRole) => {
    setSelectedRole(newRole);
    fetchReadinessReport(newRole, false);
  };

  const handleDownloadDossier = () => {
    if (isIntakePending) {
      triggerLockedError("Target Job Readiness Dossier Export");
      return;
    }
    if (!report || !userData) {
      toast.error("No readiness data available to export.");
      return;
    }
    toast.success("Generating Official Target Job Readiness Dossier (PDF)... 📄");
    generateCompetencyPDF({
      user: userData,
      profile: {
        ...userData,
        jobRole: report.targetRole || userData.jobRole,
        overallCompetencyScore: report.readinessIndex || 0,
        overallLevel: report.readinessTitle || "Novice",
      },
      competencies: report.requiredSkillsAudited || [],
      skillGaps: (report.keyBlockers || []).map((b) => ({
        competencyName: b.skillName,
        gapScore: b.gap,
        priority: "High",
        domain: b.domain,
      })),
      learningPath: userData.learningPath || [],
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "DEPLOYMENT_READY":
        return {
          bg: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
          icon: <BsPatchCheckFill size={15} className="text-emerald-500" />,
          label: "Ready for Cadre Deployment",
        };
      case "CONDITIONALLY_READY":
        return {
          bg: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30",
          icon: <FaCheckCircle size={14} className="text-blue-500" />,
          label: "Conditionally Ready (Practicum Pending)",
        };
      case "ACTIVE_DEVELOPMENT":
        return {
          bg: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
          icon: <FaExclamationTriangle size={13} className="text-amber-500" />,
          label: "Under Active Development",
        };
      case "FOUNDATIONAL_STAGE":
      default:
        return {
          bg: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30",
          icon: <FaTimesCircle size={14} className="text-rose-500" />,
          label: "Foundational Induction Mandated",
        };
    }
  };

  const statusMeta = report ? getStatusBadge(report.readinessStatus) : null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <PageTransition>
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-20 space-y-6">
          {/* Breadcrumb / Top Bar */}
          <div className="flex items-center justify-between">
            <BackButton fallbackUrl="/dashboard" label="Back to Dashboard" />
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
              <FaBriefcase className="text-blue-600 dark:text-blue-400" />
              <span>MoSPI NSSTA • Cadre Advancement & Deployment Audit</span>
            </div>
          </div>

          {/* Executive Header Card */}
          <div className="relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs">
            {/* Tricolor Ribbon Top Accent */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider">
                  <BsShieldCheck size={14} className="text-blue-600" />
                  <span>Statutory Cadre Audit Report</span>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                  Target Job Readiness & Cadre Audit
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                  Official statutory evaluation assessing officer qualifications, verified tenure, diagnostic rigor, and competency mastery against national benchmarks for promotional or lateral cadre posting.
                </p>
              </div>

              {/* Cadre Role Switcher & Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                <div className="bg-slate-50 dark:bg-slate-800/90 p-2 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
                    Audited Target Cadre
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => handleRoleChange(e.target.value)}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-blue-700 dark:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    {(report?.availableRoles || []).map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fetchReadinessReport(selectedRole, true)}
                    disabled={syncing}
                    title="Recalculate readiness with recent scores"
                    className="px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <FaSyncAlt className={`text-blue-600 ${syncing ? "animate-spin" : ""}`} />
                    <span className="hidden sm:inline">Recalculate</span>
                  </button>

                  <button
                    onClick={handleDownloadDossier}
                    className={`px-4 py-3 rounded-2xl text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer ${
                      isIntakePending
                        ? "bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-700"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-emerald-600/30"
                    }`}
                  >
                    <FaFilePdf size={13} className={isIntakePending ? "text-slate-400" : "text-white"} />
                    <span>Export Readiness Dossier</span>
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
            <div className="py-24 flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-bold text-slate-500">
                Auditing Cadre Qualifications, Tenure & Statutory Standards...
              </span>
            </div>
          ) : (
            <>
              {/* Top Readiness Index & Classification Banner */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Animated Readiness Gauge & Seal */}
                <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col items-center justify-center text-center space-y-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Cadre Deployment Readiness Index
                  </span>

                  {/* Circular Readiness Gauge */}
                  <div className="relative w-40 h-40 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        className="text-slate-100 dark:text-slate-800 stroke-current"
                        strokeWidth="10"
                        fill="transparent"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        className={`transition-all duration-1000 stroke-current ${
                          report.readinessIndex >= 85
                            ? "text-emerald-500"
                            : report.readinessIndex >= 70
                            ? "text-blue-600"
                            : report.readinessIndex >= 50
                            ? "text-amber-500"
                            : "text-rose-500"
                        }`}
                        strokeWidth="10"
                        strokeDasharray={264}
                        strokeDashoffset={264 - (264 * report.readinessIndex) / 100}
                        strokeLinecap="round"
                        fill="transparent"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                        {report.readinessIndex}%
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Readiness
                      </span>
                    </div>
                  </div>

                  {/* Status Seal Badge */}
                  <div
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl border text-xs font-black uppercase tracking-wider ${statusMeta?.bg}`}
                  >
                    {statusMeta?.icon}
                    <span>{statusMeta?.label}</span>
                  </div>

                  <div className="text-[11px] text-slate-500 max-w-xs leading-normal pt-1">
                    Audited for <strong>{report.targetRole}</strong> benchmark criteria.
                  </div>
                </div>

                {/* Right: Formal Recommendation & Score Weights */}
                <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col justify-between space-y-5">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400">
                      <HiSparkles />
                      <span>Cadre Examination Board Formal Recommendation</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {report.readinessTitle}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                      "{report.formalRecommendation}"
                    </p>
                  </div>

                  {/* 4 Pillars Scoring Breakdown */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Statutory Readiness Weighting Pillars
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] text-slate-500 font-bold block">
                          Competencies (50%)
                        </span>
                        <span className="text-lg font-black text-blue-600 dark:text-blue-400">
                          {report.scoresBreakdown?.competencyScoreWeight}%
                        </span>
                        <span className="text-[9px] text-slate-400 block mt-0.5">Cadre Benchmark Alignment</span>
                      </div>

                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] text-slate-500 font-bold block">
                          Testing Rigor (25%)
                        </span>
                        <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                          {report.scoresBreakdown?.evaluationRigorScore}%
                        </span>
                        <span className="text-[9px] text-slate-400 block mt-0.5">MCQ & Oral Viva Clearance</span>
                      </div>

                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] text-slate-500 font-bold block">
                          Tenure & Tenure (15%)
                        </span>
                        <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                          {report.scoresBreakdown?.experienceScore}%
                        </span>
                        <span className="text-[9px] text-slate-400 block mt-0.5">Documented Years in Field</span>
                      </div>

                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] text-slate-500 font-bold block">
                          iGOT Training (10%)
                        </span>
                        <span className="text-lg font-black text-amber-600 dark:text-amber-400">
                          {report.scoresBreakdown?.capacityBuildingScore}%
                        </span>
                        <span className="text-[9px] text-slate-400 block mt-0.5">Completed Course Modules</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Statutory Prerequisite Audit Checklist */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <FaShieldAlt className="text-blue-600" />
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      Statutory Deployment Criteria & Prerequisite Checklist
                    </h2>
                  </div>
                  <span className="text-xs font-semibold text-slate-500">
                    Official Statistical Service Rules, 2024
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-500 uppercase text-[10px] font-bold">
                      <tr>
                        <th className="p-3.5 rounded-l-xl">Statutory Criterion</th>
                        <th className="p-3.5">Cadre Rule Standard</th>
                        <th className="p-3.5">Officer Record</th>
                        <th className="p-3.5 rounded-r-xl text-center">Compliance Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {report.prerequisiteChecklist.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200">
                            {item.criterion}
                          </td>
                          <td className="p-3.5 text-slate-600 dark:text-slate-400">
                            {item.requirement}
                          </td>
                          <td className="p-3.5 font-medium text-slate-700 dark:text-slate-300">
                            {item.note}
                          </td>
                          <td className="p-3.5 text-center">
                            {item.met ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold border border-emerald-200 dark:border-emerald-800">
                                <FaCheckCircle size={10} />
                                <span>VERIFIED PASSED</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-[11px] font-bold border border-amber-200 dark:border-amber-800">
                                <FaExclamationTriangle size={10} />
                                <span>ACTION REQUIRED</span>
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 4-Domain Cadre Alignment Bars */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <BsBarChartSteps className="text-blue-600" />
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      4-Domain Knowledge Taxonomy Alignment
                    </h2>
                  </div>
                  <span className="text-xs font-semibold text-slate-500">
                    Cadre Benchmark vs Assessed Proficiency
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  {report.domainPillars.map((dom) => (
                    <div
                      key={dom.id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-800 dark:text-slate-200">{dom.title}</span>
                        <span className="text-blue-600 dark:text-blue-400 font-black">
                          {dom.currentScore}% / {dom.targetScore}% Benchmark
                        </span>
                      </div>

                      <div className="relative w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            dom.currentScore >= dom.targetScore
                              ? "bg-emerald-500"
                              : dom.currentScore >= dom.targetScore - 15
                              ? "bg-blue-600"
                              : "bg-amber-500"
                          }`}
                          style={{ width: `${Math.min(100, dom.currentScore)}%` }}
                        />
                        <div
                          className="absolute top-0 bottom-0 w-1 bg-slate-900 dark:bg-white z-10 shadow-xs"
                          style={{ left: `${Math.min(99, dom.targetScore)}%` }}
                          title={`Target: ${dom.targetScore}%`}
                        />
                      </div>

                      <div className="flex justify-between text-[11px] text-slate-500 pt-0.5">
                        <span>Pillar Alignment: {dom.complianceRate}%</span>
                        <span
                          className={`font-bold ${
                            dom.currentScore >= dom.targetScore ? "text-emerald-600" : "text-amber-600"
                          }`}
                        >
                          {dom.currentScore >= dom.targetScore
                            ? "Meets Cadre Standard"
                            : `${dom.targetScore - dom.currentScore}% Deficit`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Two Column: Key Strengths vs Deployment Blockers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Key Strengths */}
                <div className="bg-white dark:bg-slate-900 border border-emerald-200/80 dark:border-emerald-900/50 rounded-3xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-base">
                    <FaAward />
                    <h3>Key Strengths for {report.targetRole}</h3>
                  </div>

                  {report.keyStrengths.length === 0 ? (
                    <p className="text-xs text-slate-500">
                      Complete diagnostic assessments to highlight your top strengths.
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {report.keyStrengths.map((s, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-between"
                        >
                          <div>
                            <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                              {s.skillName}
                            </h4>
                            <span className="text-[10px] text-slate-500 uppercase">{s.domain}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                              {s.currentScore}%
                            </span>
                            <span className="text-[10px] font-bold text-emerald-500 block">
                              +{s.delta}% Surplus
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Critical Deployment Blockers */}
                <div className="bg-white dark:bg-slate-900 border border-rose-200/80 dark:border-rose-900/50 rounded-3xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-base">
                    <FaExclamationTriangle />
                    <h3>Deployment Blockers & Critical Deficits</h3>
                  </div>

                  {report.keyBlockers.length === 0 ? (
                    <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                      <FaCheckCircle />
                      <span>Zero deployment blockers identified for this role! 🎉</span>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {report.keyBlockers.map((b, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-2xl bg-rose-50/60 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/40 flex items-center justify-between"
                        >
                          <div>
                            <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                              {b.skillName}
                            </h4>
                            <span className="text-[10px] text-slate-500 uppercase">
                              Target: {b.targetScore}% ({b.targetLevel})
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-black text-rose-600 dark:text-rose-400">
                              {b.currentScore}%
                            </span>
                            <span className="text-[10px] font-bold text-rose-500 block">
                              -{b.gap} pts Gap
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Milestone Roadmap to 100% Readiness */}
              <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                      <HiSparkles />
                      <span>Actionable Bridge to 100% Cadre Clearance</span>
                    </div>
                    <h2 className="text-xl font-bold mt-1">Recommended Deployment Milestones</h2>
                  </div>

                  <button
                    onClick={() => navigate("/skill-gaps")}
                    className="px-4 py-2 rounded-xl bg-white text-blue-900 hover:bg-blue-50 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto shadow-md"
                  >
                    <span>View All Skill Gaps</span>
                    <FaArrowRight size={10} />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {report.milestones.map((m) => (
                    <div
                      key={m.step}
                      className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex flex-col justify-between space-y-3 hover:border-white/30 transition-all"
                    >
                      <div className="space-y-1.5">
                        <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-black flex items-center justify-center">
                          {m.step}
                        </span>
                        <h4 className="font-bold text-xs text-white leading-snug">
                          {m.title}
                        </h4>
                        <span className="text-[10px] text-amber-300 font-bold block">
                          Impact: {m.impact}
                        </span>
                      </div>

                      <button
                        onClick={() => navigate(m.link)}
                        className="w-full py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>Start Action</span>
                        <BsArrowUpRight size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </main>
      </PageTransition>

      <Footer />
    </div>
  );
};

export default JobReadinessReport;
