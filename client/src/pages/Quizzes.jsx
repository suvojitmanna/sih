import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BackButton from "../components/BackButton";
import { useNavigate } from "react-router-dom";
import { ServerUrl } from "../App";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FaTasks,
  FaPlus,
  FaPlay,
  FaHistory,
  FaClock,
  FaAward,
  FaCheckCircle,
  FaHandSparkles,
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";
import { BsShieldCheck } from "react-icons/bs";
import { CardGridSkeleton } from "../components/SkeletonLoader";

const SAMPLE_TOPICS = [
  "Sampling Techniques & Estimation",
  "National Accounts & GDP Compilation",
  "Price Statistics & CPI Compilation",
  "Labour & Employment Statistics (PLFS)",
  "Statistical Computing & Automated Survey Data Processing",
  "Data Quality Assurance & NQAF",
  "Data Privacy, Ethics & Anonymization",
];

const Quizzes = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("explore"); // "explore" | "history"
  const [quizzes, setQuizzes] = useState([]);
  const [myAttempts, setMyAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State for AI Generator
  const [showGenModal, setShowGenModal] = useState(false);
  const [topic, setTopic] = useState(SAMPLE_TOPICS[0]);
  const [customTopic, setCustomTopic] = useState("");
  const [domain, setDomain] = useState("Statistical Competencies");
  const [difficulty, setDifficulty] = useState("Medium");
  const [numQuestions, setNumQuestions] = useState(5);
  const [genLoading, setGenLoading] = useState(false);

  const fetchQuizzesAndAttempts = async () => {
    try {
      const [qRes, aRes] = await Promise.all([
        axios.get(`${ServerUrl}/api/quizzes/list`, { withCredentials: true }),
        axios.get(`${ServerUrl}/api/quizzes/history/my-attempts`, {
          withCredentials: true,
        }),
      ]);
      if (qRes.data.success) setQuizzes(qRes.data.quizzes || []);
      if (aRes.data.success) setMyAttempts(aRes.data.attempts || []);
    } catch (error) {
      console.error("Quizzes fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzesAndAttempts();
  }, []);

  const handleGenerateQuiz = async (e) => {
    e.preventDefault();
    const finalTopic = customTopic.trim() || topic;
    setGenLoading(true);

    try {
      const { data } = await axios.post(
        `${ServerUrl}/api/quizzes/generate`,
        {
          topic: finalTopic,
          domain,
          difficulty,
          numQuestions: Number(numQuestions),
        },
        { withCredentials: true },
      );

      if (data.success && data.quiz) {
        toast.success("AI Quiz successfully created! 🚀");
        setShowGenModal(false);
        navigate(`/quiz/${data.quiz._id}`);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to generate AI quiz.",
      );
    } finally {
      setGenLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-6">
        {/* Back Navigation Bar */}
        <div className="flex items-center justify-between">
          <BackButton fallbackUrl="/ai-models" label="Back to AI Models" />
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Diagnostic Assessments
          </span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-2">
              <BsShieldCheck size={13} />
              <span>NSSTA Examination Wing</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Official Statistical Assessments & Quizzes
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Benchmark your conceptual mastery, receive instant topic-level
              diagnostics, and update your competency profile.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
              <button
                onClick={() => setActiveTab("explore")}
                className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === "explore"
                    ? "bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Available Quizzes
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === "history"
                    ? "bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                My Past Attempts
              </button>
            </div>

            <button
              onClick={() => setShowGenModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer shrink-0"
            >
              <FaHandSparkles size={12} className="text-amber-300" />
              <span>Generate AI Quiz</span>
            </button>
          </div>
        </div>

        {/* TAB 1: EXPLORE QUIZZES */}
        {activeTab === "explore" && (
          <div className="space-y-6">
            {loading ? (
              <CardGridSkeleton count={6} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {quizzes.map((quiz) => (
                <div
                  key={quiz._id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs hover:border-blue-400 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2.5 py-0.5 rounded-full uppercase">
                        {quiz.domain}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          quiz.difficulty === "Hard"
                            ? "bg-rose-100 text-rose-700"
                            : quiz.difficulty === "Easy"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {quiz.difficulty}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-snug">
                      {quiz.title}
                    </h4>

                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <FaTasks size={11} className="text-blue-500" />
                        <span>{quiz.questions?.length || 5} Questions</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <FaClock size={11} className="text-amber-500" />
                        <span>{quiz.timeLimitMinutes || 10} Mins</span>
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-[11px] text-slate-600 dark:text-slate-400">
                      Topic: <strong>{quiz.topic}</strong>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400">
                      Pass Mark: 60%
                    </span>
                    <button
                      onClick={() => navigate(`/quiz/${quiz._id}`)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 hover:shadow-md transition-all cursor-pointer"
                    >
                      <FaPlay size={10} />
                      <span>Start Assessment</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            )}
          </div>
        )}

        {/* TAB 2: MY PAST ATTEMPTS */}
        {activeTab === "history" && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FaHistory className="text-blue-600" />
              <span>Assessment History & Performance Records</span>
            </h3>

            {myAttempts.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <FaTasks size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-xs">
                  No completed assessments yet. Start your first quiz!
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="p-3.5 rounded-l-xl">Assessment Title</th>
                      <th className="p-3.5">Topic</th>
                      <th className="p-3.5">Score</th>
                      <th className="p-3.5">Accuracy</th>
                      <th className="p-3.5">Result</th>
                      <th className="p-3.5 rounded-r-xl">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {myAttempts.map((att, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40"
                      >
                        <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200">
                          {att.quizTitle || "Official Statistics Test"}
                        </td>
                        <td className="p-3.5 text-slate-500 font-medium">
                          {att.topic}
                        </td>
                        <td className="p-3.5">
                          <span className="font-extrabold text-blue-600 dark:text-blue-400">
                            {att.score}%
                          </span>
                        </td>
                        <td className="p-3.5 font-semibold text-slate-600 dark:text-slate-300">
                          {att.correctCount}/{att.totalQuestions} (
                          {att.accuracy}%)
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              att.passed
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                                : "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                            }`}
                          >
                            {att.passed ? "Passed" : "Needs Review"}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-400 text-[11px]">
                          {new Date(att.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* AI QUIZ GENERATOR MODAL */}
      {showGenModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                <FaHandSparkles className="text-amber-400" />
                <span>NSSTA AI Quiz Generator</span>
              </div>
              <button
                onClick={() => setShowGenModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Generate Custom Statistical Assessment
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                SankhyaIQ™ AI Engine will author 4-option MCQs with detailed explanations
                aligned with MoSPI standards.
              </p>
            </div>

            <form onSubmit={handleGenerateQuiz} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Choose Standard Topic
                </label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:border-blue-500"
                >
                  {SAMPLE_TOPICS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Or Custom Official Topic
                </label>
                <input
                  type="text"
                  placeholder="e.g. Small Area Estimation, ASI Schedule Analysis..."
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Difficulty Level
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium focus:border-blue-500"
                  >
                    <option value="Easy">Easy (Foundational)</option>
                    <option value="Medium">Medium (Cadre Standard)</option>
                    <option value="Hard">Hard (Expert Methodologist)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Questions Count
                  </label>
                  <select
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium focus:border-blue-500"
                  >
                    <option value={3}>3 Questions (Quick Drill)</option>
                    <option value={5}>5 Questions (Standard)</option>
                    <option value={10}>10 Questions (Comprehensive)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowGenModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={genLoading}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {genLoading ? (
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <FaHandSparkles size={12} className="text-amber-300" />
                      <span>Generate & Start</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default Quizzes;
