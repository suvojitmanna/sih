import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";
import axios from "axios";
import { ServerUrl } from "../App";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BackButton from "../components/BackButton";
import {
  FaCheckCircle,
  FaFileAlt,
  FaBrain,
  FaAward,
  FaLightbulb,
  FaPaperPlane,
  FaArrowRight,
  FaTachometerAlt,
  FaLock,
  FaHourglassHalf,
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";
import { BsShieldCheck } from "react-icons/bs";
import toast from "react-hot-toast";

const formatDateTime = (dateStr) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const AssignmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [submissionText, setSubmissionText] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [countdown, setCountdown] = useState({
    text: "",
    isExpired: false,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const draftKey = `sankhyaiq_case_study_draft_${id}`;

  useEffect(() => {
    fetchAssignmentDetails();
  }, [id]);

  useEffect(() => {
    if (!assignment?.dueDate) {
      setCountdown({ text: "No Expiration", isExpired: false });
      return;
    }

    const updateTimer = () => {
      const due = new Date(assignment.dueDate);
      const now = new Date();
      const diffMs = due.getTime() - now.getTime();

      if (diffMs <= 0) {
        setCountdown({
          text: "Deadline Expired",
          isExpired: true,
          hours: 0,
          minutes: 0,
          seconds: 0,
        });
        return;
      }

      const totalSecs = Math.floor(diffMs / 1000);
      const days = Math.floor(totalSecs / 86400);
      const hours = Math.floor((totalSecs % 86400) / 3600);
      const minutes = Math.floor((totalSecs % 3600) / 60);
      const seconds = totalSecs % 60;

      let formattedText = "";
      if (days > 0) {
        formattedText = `${days}d ${hours}h ${minutes}m ${seconds}s`;
      } else {
        formattedText = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
      }

      setCountdown({
        text: formattedText,
        isExpired: false,
        hours: days * 24 + hours,
        minutes,
        seconds,
      });
    };

    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);
    return () => clearInterval(timerInterval);
  }, [assignment?.dueDate]);

  useEffect(() => {
    if (!id || loading) return;
    if (submissionText && submissionText.trim()) {
      try {
        localStorage.setItem(draftKey, submissionText);
      } catch (err) {
        console.error("Failed to save draft:", err);
      }
    }
  }, [submissionText, id, loading, draftKey]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (submissionText && submissionText.trim()) {
        try {
          localStorage.setItem(draftKey, submissionText);
        } catch (err) {}
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [submissionText, draftKey]);

  const fetchAssignmentDetails = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${ServerUrl}/api/assignments/${id}`, {
        withCredentials: true,
      });
      if (res.data?.success) {
        setAssignment(res.data.assignment);
        const savedDraft = localStorage.getItem(draftKey);

        if (res.data.submission) {
          setSubmission(res.data.submission);
          // If user had unsubmitted work in progress that differs from submitted text, restore it
          if (savedDraft && savedDraft.trim() && savedDraft !== res.data.submission.submissionText) {
            setSubmissionText(savedDraft);
          } else {
            setSubmissionText(res.data.submission.submissionText || "");
          }
        } else {
          // If not submitted yet, restore draft from localStorage if available
          if (savedDraft && savedDraft.trim()) {
            setSubmissionText(savedDraft);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching assignment:", err);
      toast.error("Failed to load assignment");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (countdown.isExpired) {
      toast.error("Submission deadline has expired. This case study is closed.");
      return;
    }

    if (!submissionText || submissionText.trim().length < 50) {
      toast.error("Please enter a comprehensive response (at least 50 characters).");
      return;
    }

    try {
      setSubmitting(true);
      const res = await axios.post(
        `${ServerUrl}/api/assignments/${id}/submit`,
        { submissionText },
        { withCredentials: true }
      );

      if (res.data?.success) {
        toast.success("Assignment evaluated by SankhyaIQ AI! 🎉");
        setSubmission(res.data.submission);
        if (res.data.user) {
          dispatch(setUserData(res.data.user));
        }
        window.dispatchEvent(new CustomEvent("assessmentCompleted", { detail: res.data }));
        localStorage.setItem("lastAssessmentUpdate", Date.now().toString());

        // Clear local draft upon successful submission
        try {
          localStorage.removeItem(draftKey);
        } catch (err) {}
      }
    } catch (err) {
      console.error("Error submitting assignment:", err);
      if (err.response?.data?.isExpired) {
        setCountdown((prev) => ({ ...prev, isExpired: true }));
      }
      toast.error(err.response?.data?.message || "Evaluation failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-slate-500">Loading Case Study...</span>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-10 text-center space-y-4">
        <h2 className="text-xl font-bold">Assignment Not Found</h2>
        <button onClick={() => navigate("/assignments")} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold">
          Back to Assignments
        </button>
      </div>
    );
  }

  const evaluation = submission?.aiEvaluation;
  const isExpired = countdown.isExpired;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-6">
        <BackButton to="/assignments" label="Back to All Assignments" />

        {/* TIMER & DEADLINE BANNER */}
        {assignment.dueDate && (
          <div
            className={`p-4 sm:p-5 rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all shadow-md ${
              isExpired
                ? "bg-rose-50 dark:bg-rose-950/70 border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200"
                : countdown.hours < 6
                ? "bg-amber-50 dark:bg-amber-950/70 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200"
                : "bg-blue-50 dark:bg-blue-950/70 border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-2xl ${
                  isExpired
                    ? "bg-rose-200/80 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300"
                    : "bg-blue-200/80 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300"
                }`}
              >
                {isExpired ? (
                  <FaLock size={20} className="text-rose-600 dark:text-rose-400" />
                ) : (
                  <FaHourglassHalf size={20} className="animate-spin text-blue-600 dark:text-blue-400" style={{ animationDuration: "6s" }} />
                )}
              </div>

              <div>
                <h3 className="font-black text-sm sm:text-base flex items-center gap-2">
                  {isExpired ? (
                    <span>⚠️ Submission Deadline Expired</span>
                  ) : (
                    <span>⏳ Active Case Study Timer</span>
                  )}
                </h3>
                <p className="text-xs opacity-90">
                  {isExpired ? (
                    <span>This case study closed on <strong>{formatDateTime(assignment.dueDate)}</strong>. Submissions are no longer accepted.</span>
                  ) : (
                    <span>Submission deadline: <strong>{formatDateTime(assignment.dueDate)}</strong>. Tasks submitted after deadline will be rejected.</span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <div
                className={`px-4 py-2 rounded-2xl text-center font-mono font-black text-sm sm:text-base border shadow-inner ${
                  isExpired
                    ? "bg-rose-200/60 dark:bg-rose-900/80 border-rose-300 text-rose-800 dark:text-rose-200"
                    : "bg-white/80 dark:bg-slate-900/80 border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                }`}
              >
                <span className="text-[9px] font-sans font-bold uppercase tracking-wider block opacity-70">
                  {isExpired ? "Status" : "Time Remaining"}
                </span>
                <span>{countdown.text || "Calculating..."}</span>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-black text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {assignment.domain}
            </span>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
              Target Cadre: {assignment.cadreTarget}
            </span>
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950 px-2.5 py-0.5 rounded-full">
              Level: {assignment.difficulty}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
            {assignment.title}
          </h1>

          <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-bold text-blue-900 dark:text-blue-200">
              <FaBrain size={14} className="text-blue-600" />
              <span>Competency Assessed: {assignment.targetCompetency}</span>
            </div>
            <span className="font-extrabold text-blue-700 dark:text-blue-300">Est. Time: {assignment.estimatedHours} Hours</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FaFileAlt className="text-blue-600" />
                <span>1. Official Scenario & Operational Context</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {assignment.scenario}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BsShieldCheck className="text-emerald-600" />
                <span>2. Required Deliverables & Tasks</span>
              </h2>
              <div className="space-y-2.5">
                {(assignment.instructions || []).map((inst, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs font-medium text-slate-700 dark:text-slate-300">
                    {inst}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FaAward className="text-amber-500" />
                <span>3. Evaluation Rubric (100 Marks Total)</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(assignment.rubric || []).map((rub, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                      <span>{rub.criterion}</span>
                      <span className="text-amber-700 dark:text-amber-300">{rub.maxMarks} Marks</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{rub.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            {evaluation && (
              <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase border border-emerald-400/20">
                    <FaCheckCircle size={12} />
                    <span>AI Evaluation Complete</span>
                  </div>
                  <span className="text-xs text-slate-300">Grade: <strong className="text-emerald-400 text-lg">{evaluation.grade}</strong></span>
                </div>

                <div className="flex items-center justify-between border-y border-white/10 py-4">
                  <div>
                    <span className="text-xs text-slate-300 block">Overall Score</span>
                    <h3 className="text-3xl font-black text-white">{evaluation.overallScore}/100</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-300 block">Competency Delta</span>
                    <span className="text-lg font-black text-emerald-400">+{evaluation.competencyScoreDelta || 5}% Boost</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Rubric Performance</h4>
                  {(evaluation.rubricScores || []).map((rub, idx) => (
                    <div key={idx} className="bg-white/10 backdrop-blur-md p-3 rounded-xl space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span>{rub.criterion}</span>
                        <span className="text-amber-300">{rub.score}/{rub.maxScore}</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-snug">{rub.feedback}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="bg-emerald-950/60 border border-emerald-500/30 p-3.5 rounded-xl space-y-1.5">
                    <h5 className="text-xs font-bold text-emerald-300 flex items-center gap-1">
                      <FaCheckCircle size={11} />
                      <span>Strengths</span>
                    </h5>
                    <ul className="text-[11px] text-slate-300 space-y-1 list-disc pl-3.5">
                      {(evaluation.strengths || []).map((st, i) => (
                        <li key={i}>{st}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-amber-950/60 border border-amber-500/30 p-3.5 rounded-xl space-y-1.5">
                    <h5 className="text-xs font-bold text-amber-300 flex items-center gap-1">
                      <FaLightbulb size={11} />
                      <span>Next Action Steps</span>
                    </h5>
                    <ul className="text-[11px] text-slate-300 space-y-1 list-disc pl-3.5">
                      {(evaluation.suggestedNextSteps || []).map((st, i) => (
                        <li key={i}>{st}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="bg-white/10 p-4 rounded-2xl text-xs text-slate-200 leading-relaxed space-y-2">
                  <span className="font-bold text-amber-300 block">Evaluator Feedback:</span>
                  <p>{evaluation.detailedFeedback}</p>
                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => navigate("/dashboard")}
                      className="px-4 py-2 rounded-xl bg-white text-blue-900 font-bold text-xs hover:bg-slate-100 transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <FaTachometerAlt size={12} className="text-blue-700" />
                      <span>View Updated Competencies in Dashboard</span>
                      <FaArrowRight size={10} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  {isExpired ? (
                    <>
                      <FaLock className="text-rose-500" />
                      <span>Submissions Closed</span>
                    </>
                  ) : (
                    <>
                      <HiSparkles className="text-amber-400" />
                      <span>{evaluation ? "Update / Re-Submit Solution" : "Officer Solution & Methodology Submission"}</span>
                    </>
                  )}
                </h3>
                <span className="text-[11px] font-semibold text-slate-400">
                  {submissionText.trim().split(/\s+/).filter(Boolean).length} Words
                </span>
              </div>

              {isExpired ? (
                <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-center space-y-3">
                  <FaLock size={32} className="mx-auto text-rose-500" />
                  <h4 className="font-black text-rose-900 dark:text-rose-200 text-sm">
                    Task Submissions Are No Longer Accepted
                  </h4>
                  <p className="text-xs text-rose-700 dark:text-rose-300 max-w-md mx-auto leading-relaxed">
                    The timer limit set by NSSTA Secretariat has expired for this case study. Late submissions cannot be evaluated.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate("/assignments")}
                    className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs shadow-sm hover:opacity-90 cursor-pointer"
                  >
                    Browse Active Case Studies
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                      Enter your comprehensive analytical report, formulas, and recommendations:
                    </label>
                    <textarea
                      rows={12}
                      value={submissionText}
                      onChange={(e) => setSubmissionText(e.target.value)}
                      placeholder="Provide your step-by-step resolution according to the deliverables specified above. Include sampling frame specifications, multiplier derivations, and policy rationale..."
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-xs font-mono focus:border-blue-500 focus:outline-none leading-relaxed"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || submissionText.trim().length < 50}
                    className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>SankhyaIQ AI is Evaluating Rubric & Formulas...</span>
                      </>
                    ) : (
                      <>
                        <FaPaperPlane size={12} />
                        <span>{evaluation ? "Re-Submit for AI Evaluation (SankhyaIQ AI)" : "Submit Solution for AI Evaluation (SankhyaIQ AI)"}</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AssignmentDetails;
