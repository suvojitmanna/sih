import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FaArrowLeft,
  FaBriefcase,
  FaChartLine,
  FaFileUpload,
  FaMicrophoneAlt,
  FaUserTie,
  FaAward,
  FaFilePdf,
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";
import { BsFillCameraVideoFill, BsShieldCheck } from "react-icons/bs";
import axios from "axios";
import { ServerUrl } from "../App";
import { useDispatch, useSelector } from "react-redux";
import { setUserData } from "../redux/userSlice";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const PRESET_ROLES = [
  "Indian Statistical Service (ISS) Officer",
  "Subordinate Statistical Service (SSS / JSO)",
  "FOD Field Investigator (NSSO)",
  "Data Scientist & Statistical Analyst",
  "Statistical Data Engineer & Systems Architect",
  "Director / Survey Methodologist",
];

const Step1 = ({ onStart }) => {
  const [role, setRole] = useState(PRESET_ROLES[0]);
  const [experience, setExperience] = useState("2 Years");
  const [mode, setMode] = useState("Technical");
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [resumeText, setResumeText] = useState("");
  const [analysisDone, setAnalysisDone] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [fileError, setFileError] = useState("");
  const navigate = useNavigate();

  const { userData } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFileError("");

    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setFileError("File size exceeds 5MB limit.");
        toast.error("File size exceeds 5MB limit.");
        setResumeFile(null);
      } else {
        setResumeFile(file);
      }
    }
  };

  const handleUploadResume = async () => {
    if (!resumeFile || analyzing) return;
    setAnalyzing(true);

    const formData = new FormData();
    formData.append("resume", resumeFile);

    try {
      const result = await axios.post(
        ServerUrl + "/api/interview/resume",
        formData,
        { withCredentials: true }
      );
      setRole(result.data.role || role);
      setExperience(result.data.experience || experience);
      setProjects(result.data.projects || []);
      setSkills(result.data.skills || []);
      setResumeText(result.data.resumeFile || "");
      setAnalysisDone(true);
      toast.success("Resume parsed & tailored questions ready! ✨");
    } catch (error) {
      console.log(error);
      toast.error("Failed to parse resume.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleStart = async () => {
    if (!role || !experience) {
      toast.error("Please fill in role and experience.");
      return;
    }
    setLoading(true);
    try {
      const result = await axios.post(
        ServerUrl + "/api/interview/generate-questions",
        { role, experience, mode, resumeText, projects, skills },
        { withCredentials: true }
      );
      if (userData && result.data.creditsLeft !== undefined) {
        dispatch(
          setUserData({ ...userData, credits: result.data.creditsLeft })
        );
      }
      toast.success("AI Interview session initialized! 🎙️");
      onStart(result.data);
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to start interview.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8"
    >
      <div className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 grid md:grid-cols-12 overflow-hidden">
        {/* Left Side — Branding & Features */}
        <motion.div
          initial={{ x: -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="md:col-span-5 relative bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-8 sm:p-10 text-white flex flex-col justify-between"
        >
          <div className="space-y-6">
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <FaArrowLeft size={14} />
              <span>Back to Dashboard</span>
            </button>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
                <BsShieldCheck size={13} />
                <span>MoSPI • NSSTA Viva Engine</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                AI Cadre Mock Interview & Viva Voce
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Practice high-stakes board interviews with interactive video avatars, real-time voice speech recognition, and instant SankhyaIQ AI evaluation.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {[
                {
                  icon: <BsFillCameraVideoFill className="text-blue-400 text-base" />,
                  title: "Interactive AI Video Avatar",
                  desc: "Realistic live interviewer with voice readout",
                },
                {
                  icon: <FaMicrophoneAlt className="text-emerald-400 text-base" />,
                  title: "Real-Time Voice Recognition",
                  desc: "Answer naturally using your microphone",
                },
                {
                  icon: <FaChartLine className="text-amber-400 text-base" />,
                  title: "In-Depth Diagnostic Scoring",
                  desc: "Scorecard with strengths & ideal answers",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3.5 bg-white/10 dark:bg-white/5 border border-white/10 p-3.5 rounded-2xl backdrop-blur-md"
                >
                  <div className="p-2 rounded-xl bg-white/10 mt-0.5">{item.icon}</div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{item.title}</h4>
                    <p className="text-[11px] text-slate-300">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-white/10 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Powered by SankhyaIQ™ AI Engine</span>
            <span className="font-bold text-emerald-400">● Live Voice AI</span>
          </div>
        </motion.div>

        {/* Right Side — Setup Form */}
        <motion.div
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="md:col-span-7 p-6 sm:p-10 bg-white dark:bg-slate-900 space-y-6 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  Configure Your Interview Session
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Customize your role, experience level, and upload an optional resume.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Target Cadre / Job Role
                </label>
                <div className="relative">
                  <FaUserTie className="absolute top-3.5 left-3.5 text-slate-400" size={14} />
                  <input
                    type="text"
                    placeholder="Enter or pick a role..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                    onChange={(e) => setRole(e.target.value)}
                    value={role}
                  />
                </div>

                {/* Preset Chips */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {PRESET_ROLES.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        role === r
                          ? "bg-blue-600 text-white shadow-xs"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Experience & Interview Mode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Experience Level
                  </label>
                  <div className="relative">
                    <FaBriefcase className="absolute top-3.5 left-3.5 text-slate-400" size={14} />
                    <input
                      type="text"
                      placeholder="e.g. 2 Years, 5+ Years"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:border-blue-500 outline-none transition"
                      onChange={(e) => setExperience(e.target.value)}
                      value={experience}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Interview Mode
                  </label>
                  <select
                    onChange={(e) => setMode(e.target.value)}
                    value={mode}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:border-blue-500 outline-none cursor-pointer"
                  >
                    <option value="Technical">Technical & Methodological Viva</option>
                    <option value="HR">HR, Cadre & Situational</option>
                  </select>
                </div>
              </div>

              {/* Resume Upload (Optional) */}
              {!analysisDone ? (
                <div
                  onClick={() => document.getElementById("resumeUpload").click()}
                  className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 rounded-2xl p-5 text-center cursor-pointer transition-all bg-slate-50/50 dark:bg-slate-800/40"
                >
                  <FaFileUpload className="text-2xl mx-auto text-blue-600 mb-2" />
                  <input
                    type="file"
                    accept="application/pdf"
                    id="resumeUpload"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    {resumeFile ? resumeFile.name : "Upload Resume / Bio-data (Optional PDF)"}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    SankhyaIQ AI will extract skills to tailor specific questions
                  </span>

                  {resumeFile && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUploadResume();
                      }}
                      className="mt-3 px-4 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                    >
                      {analyzing ? (
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <HiSparkles size={13} className="text-amber-300" />
                          <span>Analyze Resume with AI</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              ) : (
                <div className="bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                      <FaAward size={13} />
                      <span>Resume Parsed Successfully</span>
                    </span>
                    <button
                      onClick={() => setAnalysisDone(false)}
                      className="text-[10px] text-slate-400 hover:text-slate-600 underline"
                    >
                      Change
                    </button>
                  </div>
                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {skills.slice(0, 6).map((s, i) => (
                        <span
                          key={i}
                          className="bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded-md text-[10px] font-bold"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleStart}
            disabled={!role || !experience || analyzing || loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 hover:from-blue-800 hover:to-indigo-800 text-white font-black text-sm shadow-xl hover:shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <BsFillCameraVideoFill size={16} />
                <span>Launch Live AI Interview Session</span>
              </>
            )}
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Step1;
