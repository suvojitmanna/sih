import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ServerUrl } from "../App";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaFileAlt,
  FaBrain,
  FaAward,
  FaLightbulb,
  FaExclamationTriangle,
  FaPaperPlane,
  FaHistory,
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";
import { BsShieldCheck } from "react-icons/bs";
import toast from "react-hot-toast";

const AssignmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [submissionText, setSubmissionText] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAssignmentDetails();
  }, [id]);

  const fetchAssignmentDetails = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${ServerUrl}/api/assignments/${id}`, {
        withCredentials: true,
      });
      if (res.data?.success) {
        setAssignment(res.data.assignment);
        if (res.data.submission) {
          setSubmission(res.data.submission);
          setSubmissionText(res.data.submission.submissionText || "");
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
        toast.success("Assignment evaluated by SankhyaIQ AI!");
        setSubmission(res.data.submission);
      }
    } catch (err) {
      console.error("Error submitting assignment:", err);
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-8">
        {/* Back Link */}
        <button
          onClick={() => navigate("/assignments")}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
        >
          <FaArrowLeft size={12} />
          <span>Back to All Assignments</span>
        </button>

        {/* Title Header */}
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
          {/* Left Column: Scenario & Instructions */}
          <div className="lg:col-span-6 space-y-6">
            {/* Scenario Description */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FaFileAlt className="text-blue-600" />
                <span>1. Official Scenario & Operational Context</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {assignment.scenario}
              </p>
            </div>

            {/* Step-by-Step Deliverables */}
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

            {/* Grading Rubric */}
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

          {/* Right Column: Submission & AI Evaluation */}
          <div className="lg:col-span-6 space-y-6">
            {/* If Already Evaluated, show Scorecard */}
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

                {/* Rubric Breakdown */}
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

                {/* Strengths & Improvement */}
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

                {/* Detailed Feedback Note */}
                <div className="bg-white/10 p-4 rounded-2xl text-xs text-slate-200 leading-relaxed">
                  <span className="font-bold text-amber-300 block mb-1">Evaluator Feedback:</span>
                  {evaluation.detailedFeedback}
                </div>
              </div>
            )}

            {/* Submission Workspace Form */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <HiSparkles className="text-amber-400" />
                  <span>{evaluation ? "Update / Re-Submit Solution" : "Officer Solution & Methodology Submission"}</span>
                </h3>
                <span className="text-[11px] font-semibold text-slate-400">
                  {submissionText.trim().split(/\s+/).filter(Boolean).length} Words
                </span>
              </div>

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
                      <span>{evaluation ? "Re-Submit for AI Evaluation (Gemini)" : "Submit Solution for AI Evaluation (Gemini)"}</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AssignmentDetails;
