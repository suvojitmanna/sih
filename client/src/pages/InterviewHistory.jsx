import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValueEvent,
} from "framer-motion";

import { ServerUrl } from "../App";

import {
  FaCalendarAlt,
  FaBriefcase,
  FaChartLine,
  FaTrophy,
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
} from "react-icons/fa";

import { HiOutlineArrowNarrowRight } from "react-icons/hi";

const InterviewHistory = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scrollDirection, setScrollDirection] = useState("down");
  const navigate = useNavigate();
  const { scrollY, scrollYProgress } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious();
    if (!previous) return;
    if (latest > previous) {
      setScrollDirection("down");
    } else {
      setScrollDirection("up");
    }
  });

  const y1 = useTransform(scrollY, [0, 1000], [0, 300]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -300]);
  const rotateGlow = useTransform(scrollY, [0, 1000], [0, 25]);
  const headerScale = useTransform(scrollY, [0, 200], [1, 0.96]);
  const headerOpacity = useTransform(scrollY, [0, 200], [1, 0.92]);
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    const getMyInterview = async () => {
      try {
        const result = await axios.get(
          `${ServerUrl}/api/interview/get-interview`,
          {
            withCredentials: true,
          },
        );
        const sortedData = result.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );

        setInterviews(sortedData);
      } catch (error) {
        console.error("Error fetching interviews:", error);
      } finally {
        setLoading(false);
      }
    };

    getMyInterview();
  }, []);

  const renderStars = (score) => {
    const starValue = score / 2;
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= starValue) {
        stars.push(<FaStar key={i} className="text-amber-400" />);
      } else if (i - 0.5 <= starValue) {
        stars.push(<FaStarHalfAlt key={i} className="text-amber-400" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-gray-300" />);
      }
    }
    return stars;
  };

  const deleteInterview = async (id) => {
    try {
      const result = await axios.delete(
        `${ServerUrl}/api/interview/delete-interview/${id}`,
        {
          withCredentials: true,
        },
      );

      console.log(result.data);

      setInterviews((prev) => prev.filter((item) => item._id !== id));
    } catch (error) {
      console.log(error);
    }
  };

  const completedInterviews = interviews.filter(
    (item) => item.status === "completed",
  );

  const averageScore =
    completedInterviews.length > 0
      ? (
        completedInterviews.reduce(
          (acc, curr) => acc + (curr.finalScore || 0),
          0,
        ) / completedInterviews.length
      ).toFixed(1)
      : 0;

  const bestScore =
    completedInterviews.length > 0
      ? Math.max(...completedInterviews.map((i) => i.finalScore || 0))
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950 pt-24 pb-12 px-4 transition-colors duration-300"
    >
      <Navbar />
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-500 to-cyan-500 origin-left z-[100]"
        style={{ scaleX }}
      />
      <motion.div
        style={{
          y: y1,
          rotate: rotateGlow,
        }}
        className="absolute top-0 left-0 w-[28rem] h-[28rem] bg-emerald-300/20 dark:bg-emerald-500/10 blur-3xl rounded-full"
      />
      <motion.div
        style={{
          y: y2,
          rotate: rotateGlow,
        }}
        className="absolute bottom-0 right-0 w-[28rem] h-[28rem] bg-cyan-300/20 dark:bg-cyan-500/10 blur-3xl rounded-full"
      />
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] bg-[radial-gradient(circle_at_center,black_1px,transparent_1px)] dark:bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="relative max-w-6xl mx-auto">
        <motion.div
          animate={{
            y: scrollDirection === "down" ? -8 : 0,
            scale: scrollDirection === "down" ? 0.985 : 1,
          }}
          transition={{
            duration: 0.35,
            ease: "easeOut",
          }}
          style={{
            scale: headerScale,
            opacity: headerOpacity,
          }}
          className="sticky top-4 z-50 backdrop-blur-2xl bg-white/80 dark:bg-slate-900/85 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xl mb-10"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4 sm:gap-5">
              <div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                  Interview <span className="text-emerald-600 dark:text-emerald-400">History</span>
                </h1>

                <p className="text-slate-500 dark:text-slate-400 mt-1 text-xs sm:text-sm font-medium">
                  Review your official cadre viva voce transcripts and performance scorecards.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full lg:w-auto">
              <motion.div
                whileHover={{ y: -4 }}
                className="bg-white/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700 rounded-2xl px-5 py-4 shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                    <FaBriefcase />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                      Total
                    </p>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                      {interviews.length}
                    </h3>
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -4 }}
                className="bg-white/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700 rounded-2xl px-5 py-4 shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400">
                    <FaChartLine />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                      Average
                    </p>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                      {averageScore}
                    </h3>
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -4 }}
                className="bg-white/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700 rounded-2xl px-5 py-4 shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                    <FaTrophy />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                      Best
                    </p>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                      {bestScore}
                    </h3>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="grid gap-5">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-36 rounded-3xl bg-slate-200 dark:bg-slate-800/60 animate-pulse border border-slate-300/40 dark:border-slate-700/50"
              />
            ))}
          </div>
        ) : interviews.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 rounded-3xl p-16 text-center shadow-xl"
          >
            <div className="max-w-sm mx-auto">
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-emerald-100 to-cyan-100 dark:from-emerald-950 dark:to-cyan-950 flex items-center justify-center mb-6 shadow-[0_0_60px_rgba(16,185,129,0.25)] animate-pulse">
                <FaBriefcase className="text-emerald-600 dark:text-emerald-400 text-3xl" />
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                No Interviews Recorded Yet
              </h2>

              <p className="text-slate-500 dark:text-slate-400 mt-3 text-xs sm:text-sm leading-relaxed">
                Take your first AI-driven Cadre Mock Viva Voce and track your growth on your official dashboard.
              </p>

              <button
                onClick={() => navigate("/interview")}
                className="mt-8 px-8 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all duration-300 shadow-lg hover:shadow-emerald-300 hover:scale-105 cursor-pointer"
              >
                Start Interview Session
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: {
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
            className="grid gap-6"
          >
            {interviews.map((item, index) => {
              const score = item.finalScore || 0;

              return (
                <motion.div
                  key={item.id || item._id || index}
                  initial={{
                    opacity: 0,
                    x: index % 2 === 0 ? -120 : 120,
                    y: 60,
                    scale: 0.9,
                    filter: "blur(10px)",
                  }}
                  whileInView={{
                    opacity: 1,
                    x: 0,
                    y: 0,
                    scale: 1,
                    filter: "blur(0px)",
                  }}
                  viewport={{
                    once: true,
                    amount: 0.2,
                  }}
                  transition={{
                    duration: 0.8,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  whileHover={{
                    y: -8,
                    scale: 1.01,
                    transition: {
                      duration: 0.3,
                    },
                  }}
                  onClick={() => navigate(`/report/${item._id}`)}
                  className={`group relative cursor-pointer rounded-[32px] p-[1px] overflow-hidden ${scrollDirection === "down"
                      ? "translate-y-[2px]"
                      : "-translate-y-[2px]"
                    }`}
                >
                  <motion.div
                    animate={{
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute inset-0 rounded-[32px] opacity-100 bg-[linear-gradient(120deg,#10B981,#06B6D4,#8B5CF6,#10B981)] bg-[length:300%_300%]"
                  />

                  <motion.div
                    animate={{
                      opacity: [0.3, 0.6, 0.3],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                    }}
                    className="absolute -top-20 -right-20 w-56 h-56 bg-emerald-400/20 dark:bg-emerald-500/10 blur-3xl rounded-full"
                  />

                  <div className="relative h-full rounded-[30px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-white/60 dark:border-slate-800 p-6 sm:p-8 overflow-hidden transition-all duration-500">
                    <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                          <span
                            className={`px-3.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest ${item.status === "completed"
                                ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                                : "bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                              }`}
                          >
                            {item.status || "Completed"}
                          </span>

                          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold">
                            <FaCalendarAlt size={11} />
                            <span>
                              {new Date(item.createdAt).toLocaleDateString(
                                undefined,
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                },
                              )}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (
                              window.confirm(
                                "Are you sure you want to delete this interview record?",
                              )
                            ) {
                              deleteInterview(item.id || item._id);
                            }
                          }}
                          className="absolute top-0 right-0 px-4 py-2 rounded-bl-2xl rounded-tr-[28px] bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white transition-all duration-300 text-[10px] font-extrabold uppercase tracking-widest shadow-xs z-10 cursor-pointer"
                        >
                          Delete
                        </button>

                        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-all duration-300">
                          {item.role}
                        </h2>

                        <div className="flex items-center gap-1 mt-2 mb-4">
                          {renderStars(item.finalScore || 0)}
                          <span className="text-xs font-bold text-slate-400 ml-2">
                            ({((item.finalScore || 0) / 2).toFixed(1)} / 5)
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5 mt-4">
                          <span className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold">
                            {item.experience}
                          </span>

                          <span className="text-slate-300 dark:text-slate-600">•</span>

                          <span className="px-3.5 py-1.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/70 text-cyan-700 dark:text-cyan-300 text-xs font-bold capitalize">
                            {item.mode || "Technical"} Mode
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between lg:justify-end gap-6 border-t lg:border-t-0 border-slate-100 dark:border-slate-800 pt-5 lg:pt-0">

                        <div className="relative w-24 h-24">
                          <svg className="w-24 h-24 rotate-[-90deg]">
                            <circle
                              cx="48"
                              cy="48"
                              r="36"
                              stroke="currentColor"
                              className="text-slate-200 dark:text-slate-800"
                              strokeWidth="7"
                              fill="none"
                            />

                            <motion.circle
                              cx="48"
                              cy="48"
                              r="36"
                              stroke={`url(#grad-${index})`}
                              strokeWidth="7"
                              fill="none"
                              strokeDasharray="226"
                              initial={{ strokeDashoffset: 226 }}
                              whileInView={{
                                strokeDashoffset:
                                  226 - (226 * (item.finalScore || 0)) / 10,
                              }}
                              transition={{
                                duration: 1.5,
                                ease: "easeOut",
                              }}
                              strokeLinecap="round"
                            />

                            <defs>
                              <linearGradient
                                id={`grad-${index}`}
                                x1="0%"
                                y1="0%"
                                x2="100%"
                                y2="100%"
                              >
                                <stop offset="0%" stopColor="#10B981" />
                                <stop offset="100%" stopColor="#06B6D4" />
                              </linearGradient>
                            </defs>
                          </svg>

                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span
                              className={`text-2xl font-black ${item.finalScore >= 8
                                  ? "text-emerald-500 dark:text-emerald-400"
                                  : item.finalScore >= 5
                                    ? "text-amber-500 dark:text-amber-400"
                                    : "text-rose-500 dark:text-rose-400"
                                }`}
                            >
                              {item.finalScore || 0}
                            </span>

                            <span className="text-[9px] uppercase text-slate-400 tracking-[2px] font-bold">
                              SCORE
                            </span>
                          </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-md">
                          <HiOutlineArrowNarrowRight size={22} />
                        </div>
                      </div>
                    </div>
                    <motion.div
                      initial={{ width: 0 }}
                      whileHover={{ width: "100%" }}
                      transition={{
                        duration: 0.5,
                      }}
                      className="absolute bottom-0 left-0 h-[3px] bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-500"
                    />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 w-full h-24 bg-gradient-to-t from-slate-50/80 dark:from-slate-950/80 to-transparent pointer-events-none z-10" />
      <div className="relative z-20 mt-12 -mx-4 -mb-12">
        <Footer />
      </div>
    </motion.div>
  );
};

export default InterviewHistory;
