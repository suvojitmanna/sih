import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ServerUrl } from "../App";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BackButton from "../components/BackButton";
import {
  FaTasks,
  FaCheckCircle,
  FaClock,
  FaArrowRight,
  FaBrain,
  FaFilter,
  FaLock,
} from "react-icons/fa";
import { BsShieldCheck } from "react-icons/bs";
import toast from "react-hot-toast";
import { CardGridSkeleton } from "../components/SkeletonLoader";

const DOMAIN_OPTIONS = [
  "All",
  "Statistical Competencies",
  "Technical & Computational Competencies",
  "Digital Governance & Security",
];

const getAssignmentDeadlineInfo = (dueDateStr) => {
  if (!dueDateStr) return null;
  const due = new Date(dueDateStr);
  if (isNaN(due.getTime())) return null;

  const now = new Date();
  const diffMs = due.getTime() - now.getTime();

  if (diffMs <= 0) {
    return {
      status: "expired",
      label: "Deadline Expired",
      badgeClass:
        "bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-bold",
      isExpired: true,
    };
  }

  const totalSecs = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSecs / 86400);
  const hours = Math.floor((totalSecs % 86400) / 3600);
  const minutes = Math.floor((totalSecs % 3600) / 60);

  if (days > 0) {
    return {
      status: "active",
      label: `${days}d ${hours}h left`,
      badgeClass:
        "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold",
      isExpired: false,
    };
  }

  if (hours >= 6) {
    return {
      status: "active",
      label: `${hours}h ${minutes}m left`,
      badgeClass:
        "bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-bold",
      isExpired: false,
    };
  }

  return {
    status: "urgent",
    label: `🔥 Due in ${hours > 0 ? `${hours}h ` : ""}${minutes}m`,
    badgeClass:
      "bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-black animate-pulse",
    isExpired: false,
  };
};

const Assignments = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDomain, setSelectedDomain] = useState("All");
  const [mySubmissions, setMySubmissions] = useState([]);
  const prevAssignmentsCountRef = useRef(null);

  useEffect(() => {
    fetchAssignments(false);
    fetchMySubmissions();
    const interval = setInterval(() => {
      fetchAssignments(true);
      fetchMySubmissions();
    }, 3500);
    return () => clearInterval(interval);
  }, [selectedDomain]);

  const fetchAssignments = async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      const res = await axios.get(
        `${ServerUrl}/api/assignments/list${selectedDomain !== "All" ? `?domain=${encodeURIComponent(selectedDomain)}` : ""}`,
        { withCredentials: true }
      );
      if (res.data?.success) {
        const asgns = res.data.assignments || [];
        setAssignments(asgns);
        if (
          isBackground &&
          prevAssignmentsCountRef.current !== null &&
          asgns.length > prevAssignmentsCountRef.current
        ) {
          toast("📋 New official Case Study Assignment published by NSSTA!", {
            icon: "📋",
            duration: 5000,
          });
        }
        prevAssignmentsCountRef.current = asgns.length;
      }
    } catch (err) {
      if (!isBackground) {
        console.error("Error fetching assignments:", err);
        toast.error("Failed to load assignments");
      }
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  const fetchMySubmissions = async () => {
    try {
      const res = await axios.get(`${ServerUrl}/api/assignments/history/my-submissions`, {
        withCredentials: true,
      });
      if (res.data?.success) {
        setMySubmissions(res.data.submissions || []);
      }
    } catch (err) {
      console.error("Error fetching submissions:", err);
    }
  };

  const completedCount = mySubmissions.length;
  const avgScore = completedCount > 0
    ? Math.round(mySubmissions.reduce((acc, s) => acc + (s.aiEvaluation?.overallScore || 0), 0) / completedCount)
    : 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-19 space-y-4">
        <div className="flex items-center justify-between">
          <BackButton fallbackUrl="/ai-models" label="Back to AI Models" />
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Case Studies Practicum
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider border border-blue-400/20">
              <BsShieldCheck size={13} />
              <span>MoSPI • NSSTA In-Service Practicum</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Official Statistics Practical Case Studies & Assignments
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Solve real-world official statistical scenarios from NSSO, CSO, and state DES. Submit your analysis for instant in-depth AI grading, rubric-based scorecards, and direct competency index boosts.
            </p>
          </div>

          <div className="relative z-10 flex sm:flex-col gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-md border border-white/10 p-3.5 rounded-2xl text-center min-w-[110px]">
              <span className="text-[10px] font-bold text-slate-300 uppercase block">Completed</span>
              <span className="text-xl font-black text-emerald-400">{completedCount} Case Studies</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/10 p-3.5 rounded-2xl text-center min-w-[110px]">
              <span className="text-[10px] font-bold text-slate-300 uppercase block">Average Score</span>
              <span className="text-xl font-black text-amber-400">{avgScore > 0 ? `${avgScore}%` : "—"}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mr-2">
            <FaFilter size={12} />
            <span>Filter Domain:</span>
          </div>
          {DOMAIN_OPTIONS.map((domain) => (
            <button
              key={domain}
              onClick={() => setSelectedDomain(domain)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${selectedDomain === domain
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-blue-300"
                }`}
            >
              {domain}
            </button>
          ))}
        </div>

        {loading ? (
          <CardGridSkeleton count={4} />
        ) : assignments.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-3">
            <FaTasks size={36} className="mx-auto text-slate-400" />
            <h3 className="font-bold text-base">No assignments found for this domain</h3>
            <p className="text-xs text-slate-500">Please select another domain or check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {assignments.map((asgn) => {
              const submission = asgn.submission;
              const isSubmitted = asgn.hasSubmitted;
              const deadlineInfo = getAssignmentDeadlineInfo(asgn.dueDate);
              const isExpired = deadlineInfo?.isExpired;

              return (
                <div
                  key={asgn._id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 transition-all flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          {asgn.domain}
                        </span>
                        {asgn.isCustomDispatched && (
                          <span className="text-[10px] font-black text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950 px-2.5 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
                            ★ Assigned by NSSTA
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {deadlineInfo && !isSubmitted && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1 ${deadlineInfo.badgeClass}`}
                          >
                            {isExpired ? <FaLock size={9} /> : <FaClock size={9} />}
                            <span>{deadlineInfo.label}</span>
                          </span>
                        )}

                        {isSubmitted ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-0.5 rounded-full">
                            <FaCheckCircle size={11} />
                            <span>Evaluated • {submission?.aiEvaluation?.overallScore || 80}/100</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950 px-2.5 py-0.5 rounded-full">
                            {asgn.difficulty} • {asgn.estimatedHours}h
                          </span>
                        )}
                      </div>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                      {asgn.title}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                      {asgn.scenario}
                    </p>

                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold truncate">
                        <FaBrain className="text-blue-600 shrink-0" size={13} />
                        <span className="truncate">Targets: {asgn.targetCompetency}</span>
                      </div>
                      <span className="text-[10px] font-extrabold text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-950 px-2 py-0.5 rounded-md shrink-0">
                        +5% Boost
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                      <FaClock size={12} className="text-blue-500" />
                      <span>Est. Duration: {asgn.estimatedHours || 4} Hours</span>
                    </span>

                    <button
                      onClick={() => navigate(`/assignments/${asgn._id}`)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer ${
                        isSubmitted
                          ? "bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 text-blue-600 dark:text-blue-400"
                          : isExpired
                          ? "bg-rose-100 dark:bg-rose-950/80 hover:bg-rose-200 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                          : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20"
                      }`}
                    >
                      <span>
                        {isSubmitted
                          ? "View Evaluation Report"
                          : isExpired
                          ? "View Closed Case Study"
                          : "Solve Case Study"}
                      </span>
                      <FaArrowRight size={10} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Assignments;
