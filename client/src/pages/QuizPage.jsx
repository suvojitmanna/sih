import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BackButton from "../components/BackButton";
import { useParams, useNavigate } from "react-router-dom";
import { ServerUrl } from "../App";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaArrowRight,
  FaArrowLeft,
  FaAward,
  FaRedo,
  FaBookOpen,
  FaHandSparkles,
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";
import { BsShieldCheck } from "react-icons/bs";

const QuizPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes default
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch Quiz
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const { data } = await axios.get(`${ServerUrl}/api/quizzes/${id}`, {
          withCredentials: true,
        });
        if (data.success && data.quiz) {
          setQuiz(data.quiz);
          setUserAnswers(new Array(data.quiz.questions.length).fill(""));
          setTimeLeft((data.quiz.timeLimitMinutes || 10) * 60);
        } else {
          toast.error("Assessment not found.");
          navigate("/quizzes");
        }
      } catch (error) {
        toast.error("Failed to load quiz.");
        navigate("/quizzes");
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id]);

  // Timer Tick
  useEffect(() => {
    if (!submitted && timeLeft > 0 && !loading) {
      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [submitted, timeLeft, loading]);

  const handleSelectOption = (opt) => {
    const updated = [...userAnswers];
    updated[currentIdx] = opt;
    setUserAnswers(updated);
  };

  const handleSubmitQuiz = async () => {
    if (submitted) return;
    setSubmitting(true);

    const totalTime = (quiz?.timeLimitMinutes || 10) * 60;
    const timeTaken = totalTime - timeLeft;

    try {
      const { data } = await axios.post(
        `${ServerUrl}/api/quizzes/${id}/submit`,
        {
          userAnswers,
          timeTakenSeconds: Math.max(15, timeTaken),
        },
        { withCredentials: true },
      );

      if (data.success) {
        toast.success("Assessment evaluated successfully! 🎉");
        setResult(data);
        setSubmitted(true);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to submit assessment.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-slate-500">
            Loading NSSTA Assessment...
          </span>
        </div>
      </div>
    );
  }

  const currentQ = quiz?.questions[currentIdx];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-6">
        {/* Back Navigation Bar */}
        <div className="flex items-center justify-between">
          <BackButton
            to="/quizzes"
            label="Back to Quizzes"
            onClick={
              !submitted
                ? () => {
                    if (
                      window.confirm(
                        "Are you sure you want to exit this assessment? Unsaved answers will be discarded.",
                      )
                    ) {
                      navigate("/quizzes");
                    }
                  }
                : undefined
            }
          />
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Assessment Session
          </span>
        </div>
        {/* ========================================================== */}
        {/* STATE A: ACTIVE QUIZ TAKING VIEW */}
        {/* ========================================================== */}
        {!submitted ? (
          <div className="space-y-6">
            {/* Top Bar with Timer */}
            <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
              <div>
                <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 dark:bg-blue-950 px-2.5 py-0.5 rounded-full uppercase">
                  {quiz?.domain}
                </span>
                <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-1">
                  {quiz?.title}
                </h1>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-mono font-bold text-sm border ${
                    timeLeft < 120
                      ? "bg-rose-50 border-rose-200 text-rose-600 animate-pulse"
                      : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                  }`}
                >
                  <FaClock size={14} />
                  <span>{formatTime(timeLeft)}</span>
                </div>

                <button
                  onClick={handleSubmitQuiz}
                  disabled={submitting}
                  className="px-5 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit Test"}
                </button>
              </div>
            </div>

            {/* Question Progress Bar */}
            <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300 rounded-full"
                style={{
                  width: `${(userAnswers.filter(Boolean).length / quiz.questions.length) * 100}%`,
                }}
              />
            </div>

            {/* Question Navigation Palette */}
            <div className="flex items-center gap-2 overflow-x-auto p-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              {quiz.questions.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIdx(i)}
                  className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                    currentIdx === i
                      ? "bg-blue-600 text-white shadow-sm ring-2 ring-blue-400"
                      : userAnswers[i]
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            {/* Question Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center justify-between text-xs text-slate-500 pb-3 border-b border-slate-100 dark:border-slate-800">
                <span>
                  Question <strong>{currentIdx + 1}</strong> of{" "}
                  {quiz.questions.length}
                </span>
                <span className="font-semibold text-blue-600">
                  Topic: {currentQ?.topic}
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
                {currentQ?.question}
              </h3>

              {/* 4 Options */}
              <div className="space-y-3">
                {currentQ?.options.map((option, optIdx) => {
                  const isSelected = userAnswers[currentIdx] === option;
                  return (
                    <div
                      key={optIdx}
                      onClick={() => handleSelectOption(option)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? "border-blue-600 bg-blue-50/80 dark:bg-blue-950/60 shadow-xs"
                          : "border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-slate-50/50 dark:bg-slate-800/40"
                      }`}
                    >
                      <span className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200">
                        {option}
                      </span>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          isSelected
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-slate-300 dark:border-slate-600"
                        }`}
                      >
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  disabled={currentIdx === 0}
                  onClick={() => setCurrentIdx((prev) => prev - 1)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-slate-700 dark:text-slate-300 disabled:opacity-40 transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
                >
                  <FaArrowLeft size={10} />
                  <span>Previous</span>
                </button>

                {currentIdx < quiz.questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentIdx((prev) => prev + 1)}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <span>Next Question</span>
                    <FaArrowRight size={10} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmitQuiz}
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <FaCheckCircle size={12} />
                    <span>Finish & Submit</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================== */
          /* STATE B: DIAGNOSTIC SCORE & QUESTION REVIEW REPORT */
          /* ========================================================== */
          <div className="space-y-6">
            {/* Top Score Banner */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs text-center space-y-4">
              <div
                className={`w-16 h-16 rounded-3xl mx-auto flex items-center justify-center font-black text-2xl shadow-lg ${
                  result?.attempt?.passed
                    ? "bg-emerald-500 text-white"
                    : "bg-amber-500 text-white"
                }`}
              >
                {result?.attempt?.score}%
              </div>

              <div>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide mb-2 ${
                    result?.attempt?.passed
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {result?.attempt?.passed
                    ? "Assessment Passed"
                    : "Needs Further Conceptual Review"}
                </span>

                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {quiz?.title} — Diagnostic Report
                </h2>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-lg mx-auto">
                  {result?.attempt?.aiFeedback ||
                    "Evaluation completed. Topic diagnostic metrics recorded to your competency index."}
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3 max-w-md mx-auto pt-2">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">
                    Correct
                  </span>
                  <span className="text-base font-black text-emerald-600">
                    {result?.attempt?.correctCount} /{" "}
                    {result?.attempt?.totalQuestions}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">
                    Accuracy
                  </span>
                  <span className="text-base font-black text-blue-600">
                    {result?.attempt?.accuracy}%
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">
                    Time Taken
                  </span>
                  <span className="text-base font-black text-slate-700 dark:text-slate-200">
                    {formatTime(result?.attempt?.timeTakenSeconds || 60)}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <BackButton to="/quizzes" label="Back to Quizzes" />

                <button
                  onClick={() => window.location.reload()}
                  className="px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 cursor-pointer"
                >
                  <FaRedo size={12} />
                  <span>Retake Assessment</span>
                </button>

                <button
                  onClick={() => navigate("/learning-path")}
                  className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <FaBookOpen size={12} />
                  <span>View Recommended Learning</span>
                </button>
              </div>
            </div>

            {/* Topic Diagnostics */}
            {result?.attempt?.topicAnalysis &&
              result.attempt.topicAnalysis.length > 0 && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-3">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <FaHandSparkles className="text-amber-400" />
                    <span>Topic-Level Breakdown</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {result.attempt.topicAnalysis.map((t, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700 flex items-center justify-between"
                      >
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {t.topic}
                        </span>
                        <span
                          className={`text-[11px] font-black px-2 py-0.5 rounded-full ${
                            t.status === "Mastered"
                              ? "bg-emerald-100 text-emerald-700"
                              : t.status === "Developing"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-rose-100 text-rose-700"
                          }`}
                        >
                          {t.status} ({t.score}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Question by Question Review */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Detailed Solutions & Pedagogical Explanations
              </h3>

              <div className="space-y-4">
                {(result?.attempt?.userAnswers || []).map((ans, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border-2 space-y-2.5 ${
                      ans.isCorrect
                        ? "border-emerald-200 bg-emerald-50/40 dark:bg-emerald-950/20 dark:border-emerald-900"
                        : "border-rose-200 bg-rose-50/40 dark:bg-rose-950/20 dark:border-rose-900"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2">
                        {ans.isCorrect ? (
                          <FaCheckCircle
                            className="text-emerald-500 shrink-0 mt-0.5"
                            size={16}
                          />
                        ) : (
                          <FaTimesCircle
                            className="text-rose-500 shrink-0 mt-0.5"
                            size={16}
                          />
                        )}
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-snug">
                          {idx + 1}. {ans.questionText}
                        </h4>
                      </div>

                      <span className="text-[10px] font-bold text-slate-400 shrink-0">
                        {ans.topic}
                      </span>
                    </div>

                    <div className="text-xs space-y-1 pl-6">
                      <div className="text-slate-600 dark:text-slate-300">
                        Your Answer:{" "}
                        <strong
                          className={
                            ans.isCorrect ? "text-emerald-600" : "text-rose-600"
                          }
                        >
                          {ans.selectedOption || "Not Answered"}
                        </strong>
                      </div>
                      {!ans.isCorrect && (
                        <div className="text-emerald-700 dark:text-emerald-400 font-semibold">
                          Correct Answer: {ans.correctAnswer}
                        </div>
                      )}
                    </div>

                    {ans.explanation && (
                      <div className="mt-2 p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed pl-6">
                        <strong>Official Rationale:</strong> {ans.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default QuizPage;
