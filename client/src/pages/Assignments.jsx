import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ServerUrl } from "../App";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  FaTasks,
  FaCheckCircle,
  FaClock,
  FaArrowRight,
  FaAward,
  FaFileAlt,
  FaChartLine,
  FaBrain,
  FaFilter,
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";
import { BsShieldCheck } from "react-icons/bs";
import toast from "react-hot-toast";
import { CardGridSkeleton } from "../components/SkeletonLoader";

const DOMAIN_OPTIONS = [
  "All",
  "Statistical Competencies",
  "Technical & Computational Competencies",
  "Digital Governance & Security",
];

const Assignments = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDomain, setSelectedDomain] = useState("All");
  const [mySubmissions, setMySubmissions] = useState([]);

  useEffect(() => {
    fetchAssignments();
    fetchMySubmissions();
  }, [selectedDomain]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${ServerUrl}/api/assignments/list${selectedDomain !== "All" ? `?domain=${encodeURIComponent(selectedDomain)}` : ""}`,
        { withCredentials: true }
      );
      if (res.data?.success) {
        setAssignments(res.data.assignments || []);
      }
    } catch (err) {
      console.error("Error fetching assignments:", err);
      toast.error("Failed to load assignments");
    } finally {
      setLoading(false);
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-8">
        {/* Header Banner */}
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

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mr-2">
            <FaFilter size={12} />
            <span>Filter Domain:</span>
          </div>
          {DOMAIN_OPTIONS.map((domain) => (
            <button
              key={domain}
              onClick={() => setSelectedDomain(domain)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                selectedDomain === domain
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-blue-300"
              }`}
            >
              {domain}
            </button>
          ))}
        </div>

        {/* Assignments Grid */}
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

              return (
                <div
                  key={asgn._id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 transition-all flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-black text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        {asgn.domain}
                      </span>

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

                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                      {asgn.title}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                      {asgn.scenario}
                    </p>

                    {/* Competency Tag */}
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
                          : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20"
                      }`}
                    >
                      <span>{isSubmitted ? "View Evaluation Report" : "Solve Case Study"}</span>
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
