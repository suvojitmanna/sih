import React, { useState } from "react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import CountUpModule from "react-countup";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AuthModel from "../components/AuthModel";
import {
  FaUserGraduate,
  FaTasks,
  FaFileAlt,
  FaBrain,
  FaCertificate,
  FaFileUpload,
  FaArrowRight,
  FaAward,
  FaShieldAlt,
  FaUserTie,
  FaLayerGroup,
  FaCheckCircle,
  FaFilePdf,
  FaHistory,
  FaChartLine,
  FaLaptopCode,
  FaQuestionCircle,
  FaChevronDown,
  FaPlay,
  FaLock,
  FaCloud,
} from "react-icons/fa";
import {
  BsFillCameraVideoFill,
  BsRobot,
  BsBarChartLine,
  BsShieldCheck,
  BsLightningChargeFill,
  BsCheck2Circle,
} from "react-icons/bs";
import { HiSparkles } from "react-icons/hi";
import { generateCompetencyPDF } from "../utils/pdfGenerator";
import toast from "react-hot-toast";
import PageTransition from "../components/PageTransition";
import { ScrollReveal, ScrollRevealStagger, ScrollRevealItem } from "../components/ScrollReveal";

const CountUp = CountUpModule.default || CountUpModule;

const Home = () => {
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const { userData } = useSelector((state) => state.user);

  const handleProtectedAction = (route) => {
    if (userData) {
      navigate(route);
    } else {
      setShowAuth(true);
    }
  };

  const handleDownloadSampleDossier = () => {
    toast.success("Generating Official MoSPI Competency Dossier (PDF)... 📄");
    generateCompetencyPDF({
      user: userData || { name: "Cadre Statistical Officer", jobRole: "Indian Statistical Service (ISS) Officer" },
      profile: userData || { name: "Cadre Statistical Officer", jobRole: "Indian Statistical Service (ISS) Officer", department: "NSSO / MoSPI", overallCompetencyScore: 78, overallLevel: "Advanced" },
      competencies: [
        { competencyName: "Sampling Techniques & Estimation", domain: "Statistical", score: 85, level: "Advanced" },
        { competencyName: "National Accounts (SNA 2008)", domain: "Statistical", score: 80, level: "Advanced" },
        { competencyName: "Statistical Computing & Automated Survey Data Processing", domain: "Technical", score: 45, level: "Beginner" },
        { competencyName: "Price Statistics (CPI/WPI)", domain: "Statistical", score: 88, level: "Expert" },
        { competencyName: "Data Privacy & DPDP Compliance", domain: "Governance", score: 72, level: "Intermediate" },
      ],
      skillGaps: [
        { competencyName: "Statistical Computing & Automated Survey Data Processing", priority: "High", currentLevel: "Beginner", requiredLevel: "Intermediate", recommendedAction: "Complete iGOT Automated Statistical Computing 20-Hour Module" },
        { competencyName: "Microdata Analytics & Survey Weighting Methodologies", priority: "High", currentLevel: "Intermediate", requiredLevel: "Advanced", recommendedAction: "Attend NSSTA Residential Sampling Workshop" },
      ],
      learningPath: [
        { step: 1, title: "Automated Statistical Computing & Microdata Processing in Government", provider: "iGOT Karmayogi", skillAddressed: "Statistical Computing", duration: "20 Hours", priority: "High" },
        { step: 2, title: "Microdata Analytics & Survey Weighting Methodologies", provider: "NSSTA TPAC In-Service", skillAddressed: "Microdata Analytics", duration: "16 Hours", priority: "High" },
        { step: 3, title: "Periodic Labour Force Survey (PLFS) Methodology", provider: "iGOT Karmayogi (NSSO)", skillAddressed: "Labour Statistics", duration: "10 Hours", priority: "Medium" },
      ],
    });
  };

  const faqList = [
    {
      q: "How does the AI Skill Intelligence Platform identify competency gaps?",
      a: "The SankhyaIQ™ AI Neural Engine benchmarks the officer's verified profile (designation, cadre, previous training, and multi-domain self-ratings) against official MoSPI cadre benchmarks (ISS, SSS, FOD, DES). Any score falling below the cadre standard is classified into High, Medium, or Foundational priority gaps with actionable remediation targets.",
    },
    {
      q: "How are iGOT Karmayogi and NSSTA residential modules integrated into the learning pathway?",
      a: "The platform dynamically maps each evaluated deficit to verified iGOT Karmayogi digital courses and NSSTA TPAC in-service residential programmes. The pathway is ordered sequentially from foundational concepts to advanced practical workshops.",
    },
    {
      q: "How does the AI Cadre Mock Interview Bot evaluate oral viva voce answers?",
      a: "Using real-time speech recognition (Speech-to-Text) and Google Gemini AI, the interview studio analyzes spoken answers for conceptual correctness, communication clarity, and confidence. It provides question-by-question scoring and generates an official MoSPI PDF Scorecard.",
    },
    {
      q: "Can trainers author objective MCQs from custom survey circulars?",
      a: "Yes. In the MCQ Question Studio, trainers can upload any survey manual, circular, or methodology document (PDF/TXT). The AI extracts key principles and automatically generates 4-option MCQs with comprehensive pedagogical explanations.",
    },
    {
      q: "How are practical case studies and assignments evaluated?",
      a: "Officers submit written methodology briefs and solutions to real-world scenarios (e.g. NSSO sampling design, quarterly SNA GDP revisions). The AI evaluates submissions against a 4-criterion 100-mark rubric and awards immediate competency score boosts.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col transition-colors">
      <Navbar />

      <PageTransition>
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 space-y-24">
        {/* ======================================================== */}
        {/* 1. SAAS HERO SECTION                                     */}
        {/* ======================================================== */}
        <section className="relative overflow-hidden pt-8 pb-14 text-center space-y-8">
          {/* Background Ambient Glows */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] sm:w-[850px] h-[300px] sm:h-[500px] bg-gradient-to-r from-blue-500/15 via-indigo-500/10 to-teal-500/15 blur-3xl rounded-full pointer-events-none -z-10" />

          {/* Announcement Top Ribbon */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md shadow-slate-200/50 dark:shadow-none cursor-pointer hover:border-blue-300 transition-all">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-300">
              National Statistical Capacity Building Mandate • MoSPI & NSSTA
            </span>
          </div>

          {/* Main SaaS Headline */}
          <div className="max-w-4xl mx-auto space-y-5">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.12]">
              The AI Skill Intelligence &{" "}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                Capacity Building OS
              </span>{" "}
              for Official Statistics
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
              Empowering India's Official Statistical System with multi-domain competency mapping, automated skill-gap analysis, curated <strong>iGOT Karmayogi</strong> and <strong>NSSTA residential learning pathways</strong>, real-world case studies, and live mock viva voce boards.
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-3">
            <button
              onClick={() => handleProtectedAction("/learning-path")}
              className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 hover:from-blue-800 hover:to-indigo-800 text-white font-bold text-xs sm:text-sm shadow-xl shadow-blue-500/25 hover:shadow-blue-500/35 transition-all flex items-center gap-2.5 cursor-pointer active:scale-95"
            >
              <FaCertificate size={15} />
              <span>Start Learning (iGOT Pathways)</span>
              <FaArrowRight size={11} />
            </button>

            <button
              onClick={() => handleProtectedAction("/ai-models")}
              className="px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-black dark:hover:text-white text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <HiSparkles size={15} className="text-amber-500" />
              <span>Explore AI Models Hub</span>
            </button>

            {!userData ? (
              <button
                onClick={() => navigate("/auth")}
                className="px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <FaUserGraduate size={14} className="text-emerald-400" />
                <span>Officer Sign Up / Sign In</span>
              </button>
            ) : (
              <button
                onClick={() => navigate("/dashboard")}
                className="px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <BsBarChartLine size={13} className="text-emerald-400" />
                <span>Open Officer Dashboard</span>
              </button>
            )}
          </div>

          {/* Quick Pillar Ribbon */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <FaCheckCircle className="text-emerald-500" size={13} />
              <span>4-Domain Competency Framework</span>
            </span>
            <span className="flex items-center gap-1.5">
              <FaCheckCircle className="text-emerald-500" size={13} />
              <span>iGOT Karmayogi API Integration</span>
            </span>
            <span className="flex items-center gap-1.5">
              <FaCheckCircle className="text-emerald-500" size={13} />
              <span>NSSTA In-Service Residential Programmes</span>
            </span>
            <span className="flex items-center gap-1.5">
              <FaCheckCircle className="text-emerald-500" size={13} />
              <span>Google Gemini AI Engine</span>
            </span>
          </div>
        </section>

        <ScrollReveal direction="up" delay={0.05}>
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 text-center shadow-xs">
              <div className="text-2xl sm:text-3xl font-black text-blue-700 dark:text-blue-400">
                <CountUp end={12500} duration={2} separator="," />+
              </div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mt-1">
                Cadre Officers Mapped
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 text-center shadow-xs">
              <div className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">
                <CountUp end={450} duration={2} />+
              </div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mt-1">
                Curated iGOT & NSSTA Modules
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 text-center shadow-xs">
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                <CountUp end={96} duration={2} />%
              </div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mt-1">
                Skill-Gap Assessment Accuracy
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 text-center shadow-xs">
              <div className="text-2xl sm:text-3xl font-black text-amber-500">
                100% Real-Time
              </div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mt-1">
                SankhyaIQ AI Neural Grading
              </span>
            </div>
          </section>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={0.1}>
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xs space-y-8">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider">
              <BsShieldCheck size={13} />
              <span>Whole Website & Platform Architecture Overview</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              End-to-End Official Statistics Capacity Building Lifecycle
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-4xl">
              The platform bridges the gap between learner profiles, cadre standards, and national learning repositories through a structured 6-phase intelligent lifecycle.
            </p>
          </div>

          {/* 6 Lifecycle Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700 space-y-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs shadow-md">
                01
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Officer Profiling & Cadre Benchmarking
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Captures designation, department, work tenure, previous trainings, and cadre role (ISS, SSS, FOD, DES).
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700 space-y-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-md">
                02
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Multi-Domain Competency Assessment
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Evaluates competencies across 4 official domains (Statistical, Technical, Governance, Managerial) using self-ratings & AI inference.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700 space-y-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center font-black text-xs shadow-md">
                03
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Automated Skill-Gap Diagnostics
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Plots performance on interactive bar charts against the 75% benchmark, highlighting critical weaknesses in red (&lt;50%).
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700 space-y-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center font-black text-xs shadow-md">
                04
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Weakness-Driven Pathway Synthesis
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Maps each deficit directly to specific iGOT Karmayogi digital courses & NSSTA residential in-service workshops.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700 space-y-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xs shadow-md">
                05
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Continuous AI Assessment & Viva Voce
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Reinforces capacity with diagnostic quizzes, case study submissions, document-to-MCQ generation, and mock board interviews.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700 space-y-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-600 text-white flex items-center justify-center font-black text-xs shadow-md">
                06
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Official PDF Dossier & Cadre Records
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Generates verifiable MoSPI • NSSTA Performance Dossiers with national seals for official cadre career progression.
              </p>
            </div>
          </div>
        </section>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={0.1}>
          <section className="space-y-6">
            <div className="text-center max-w-3xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider">
                <FaLayerGroup size={12} />
                <span>Official Competency Framework (MoSPI / NSSTA)</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                The 4 Core Domains of Official Statistics
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Meticulously structured across statistical methods, computing pipelines, digital governance, and leadership.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Domain 1 */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600">
                  <FaBrain size={22} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    1. Statistical Competencies
                  </h3>
                  <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
                    Core Methodologies & National Indicator Governance
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Foundational concepts required for reliable national data collection, indicator compilation, and macroeconomic aggregation.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <BsCheck2Circle className="text-emerald-500 shrink-0" />
                  <span>Survey Design & Sampling Frames</span>
                </div>
                <div className="flex items-center gap-2">
                  <BsCheck2Circle className="text-emerald-500 shrink-0" />
                  <span>National Accounts (SNA 2008) & GVA</span>
                </div>
                <div className="flex items-center gap-2">
                  <BsCheck2Circle className="text-emerald-500 shrink-0" />
                  <span>Price Statistics (CPI, WPI, Inflation)</span>
                </div>
                <div className="flex items-center gap-2">
                  <BsCheck2Circle className="text-emerald-500 shrink-0" />
                  <span>Labour Statistics (PLFS Rounds)</span>
                </div>
                <div className="flex items-center gap-2">
                  <BsCheck2Circle className="text-emerald-500 shrink-0" />
                  <span>Industrial Statistics (ASI, IIP)</span>
                </div>
                <div className="flex items-center gap-2">
                  <BsCheck2Circle className="text-emerald-500 shrink-0" />
                  <span>Data Quality Assurance & UN-NQAF</span>
                </div>
              </div>
            </div>

            {/* Domain 2 */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600">
                  <FaLaptopCode size={22} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    2. Technical & Computational Competencies
                  </h3>
                  <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
                    Automated Data Pipelines, Spatial & Predictive Analytics
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Modern analytical methods for processing massive microdata sets, registry linkage, automated validation, and spatial mapping.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <BsCheck2Circle className="text-emerald-500 shrink-0" />
                  <span>Statistical Computing & Automation</span>
                </div>
                <div className="flex items-center gap-2">
                  <BsCheck2Circle className="text-emerald-500 shrink-0" />
                  <span>Microdata Analytics & Design Weights</span>
                </div>
                <div className="flex items-center gap-2">
                  <BsCheck2Circle className="text-emerald-500 shrink-0" />
                  <span>Database Systems & Registry Linkage</span>
                </div>
                <div className="flex items-center gap-2">
                  <BsCheck2Circle className="text-emerald-500 shrink-0" />
                  <span>Econometric Time-Series Modeling</span>
                </div>
                <div className="flex items-center gap-2">
                  <BsCheck2Circle className="text-emerald-500 shrink-0" />
                  <span>GIS & Geospatial Statistical Mapping</span>
                </div>
                <div className="flex items-center gap-2">
                  <BsCheck2Circle className="text-emerald-500 shrink-0" />
                  <span>Machine Learning & Predictive Analytics</span>
                </div>
              </div>
            </div>

            {/* Domain 3 */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600">
                  <FaShieldAlt size={22} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    3. Digital Governance & Security
                  </h3>
                  <span className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold">
                    DPDP Act Compliance, Data Protection & Cloud Infrastructure
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Protecting public data assets, ensuring statutory anonymization compliance, and leveraging sovereign cloud ecosystems.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <BsCheck2Circle className="text-emerald-500 shrink-0" />
                  <span>DPDP Act 2023 & Anonymization Audit</span>
                </div>
                <div className="flex items-center gap-2">
                  <BsCheck2Circle className="text-emerald-500 shrink-0" />
                  <span>Statistical Disclosure Control (k-Anonymity)</span>
                </div>
                <div className="flex items-center gap-2">
                  <BsCheck2Circle className="text-emerald-500 shrink-0" />
                  <span>Cybersecurity & CERT-In Guidelines</span>
                </div>
                <div className="flex items-center gap-2">
                  <BsCheck2Circle className="text-emerald-500 shrink-0" />
                  <span>Digital Public Infrastructure (DPI)</span>
                </div>
                <div className="flex items-center gap-2">
                  <BsCheck2Circle className="text-emerald-500 shrink-0" />
                  <span>MeghRaj Government Cloud Architecture</span>
                </div>
                <div className="flex items-center gap-2">
                  <BsCheck2Circle className="text-emerald-500 shrink-0" />
                  <span>e-Sign & Digital Signature Security</span>
                </div>
              </div>
            </div>

            {/* Domain 4 */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600">
                  <FaUserTie size={22} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    4. Behavioural & Managerial Competencies
                  </h3>
                  <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                    Cadre Leadership, Policy Translation & Project Oversight
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Strategic statistical administration, managing complex nation-wide surveys, and communicating data insights to top policy makers.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <BsCheck2Circle className="text-emerald-500 shrink-0" />
                  <span>Evidence-Based Policy & Decision Making</span>
                </div>
                <div className="flex items-center gap-2">
                  <BsCheck2Circle className="text-emerald-500 shrink-0" />
                  <span>Large-Scale Survey Project Management</span>
                </div>
                <div className="flex items-center gap-2">
                  <BsCheck2Circle className="text-emerald-500 shrink-0" />
                  <span>Statistical Leadership & Team Governance</span>
                </div>
                <div className="flex items-center gap-2">
                  <BsCheck2Circle className="text-emerald-500 shrink-0" />
                  <span>Strategic Dissemination & Communication</span>
                </div>
                <div className="flex items-center gap-2">
                  <BsCheck2Circle className="text-emerald-500 shrink-0" />
                  <span>Digital Transformation & Change Management</span>
                </div>
                <div className="flex items-center gap-2">
                  <BsCheck2Circle className="text-emerald-500 shrink-0" />
                  <span>Inter-Agency & State DES Coordination</span>
                </div>
              </div>
            </div>
          </div>
        </section>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={0.1}>
          <section className="space-y-6">
            <div className="text-center max-w-3xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider">
                <HiSparkles className="text-amber-400" size={14} />
                <span>Full AI Ecosystem (Powered by Google Gemini API)</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                The 5 AI Learning & Assessment Pillars
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Integrated, end-to-end intelligent tools built specifically for official statistics capacity building.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Pillar 1: Quizzes */}
            <div
              onClick={() => handleProtectedAction("/quizzes")}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs hover:shadow-xl hover:border-emerald-400 transition-all space-y-4 cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 w-fit group-hover:scale-110 transition-transform">
                  <FaTasks size={20} />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center justify-between">
                  <span>1. Diagnostic Quizzes</span>
                  <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                    Adaptive Tests
                  </span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Generate timed statistical diagnostic tests across official domains with question palettes, instant evaluation, and topic-level mastery heatmaps.
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 pt-2">
                <span>Launch Quiz Studio</span>
                <FaArrowRight size={10} />
              </span>
            </div>

            <div
              onClick={() => handleProtectedAction("/assignments")}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs hover:shadow-xl hover:border-amber-400 transition-all space-y-4 cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 w-fit group-hover:scale-110 transition-transform">
                  <FaFileAlt size={20} />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center justify-between">
                  <span>2. Case Study Assignments</span>
                  <span className="text-[10px] font-extrabold text-amber-600 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded-full">
                    Rubric Scoring
                  </span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Solve real-world MoSPI operational assignments (sampling frames, SNA GVA revision, DPDP anonymization) with instant rubric-based AI grading.
                </p>
              </div>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 pt-2">
                <span>Explore Case Studies</span>
                <FaArrowRight size={10} />
              </span>
            </div>

            <div
              onClick={() => handleProtectedAction("/materials")}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs hover:shadow-xl hover:border-purple-400 transition-all space-y-4 cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 w-fit group-hover:scale-110 transition-transform">
                  <FaFileUpload size={20} />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center justify-between">
                  <span>3. MCQ Question Studio</span>
                  <span className="text-[10px] font-extrabold text-purple-600 bg-purple-50 dark:bg-purple-950 px-2 py-0.5 rounded-full">
                    Document-to-MCQ
                  </span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Upload official survey manuals, circulars, or methodology PDFs/TXT to automatically author structured 4-option MCQs with pedagogical rationales.
                </p>
              </div>
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1.5 pt-2">
                <span>Upload & Generate MCQs</span>
                <FaArrowRight size={10} />
              </span>
            </div>

            <div
              onClick={() => handleProtectedAction("/interview")}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs hover:shadow-xl hover:border-blue-400 transition-all space-y-4 cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 w-fit group-hover:scale-110 transition-transform">
                  <BsFillCameraVideoFill size={20} />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center justify-between">
                  <span>4. AI Interview Bot & Report</span>
                  <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-full">
                    Avatar & Voice
                  </span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Practice board interviews with realistic video avatars, real-time voice speech recognition, and instant downloadable MoSPI PDF scorecards.
                </p>
              </div>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5 pt-2">
                <span>Start Mock Viva Voce</span>
                <FaArrowRight size={10} />
              </span>
            </div>

            <div
              onClick={() => handleProtectedAction("/chat")}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs hover:shadow-xl hover:border-indigo-400 transition-all space-y-4 cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 w-fit group-hover:scale-110 transition-transform">
                  <BsRobot size={20} />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center justify-between">
                  <span>5. SankhyaCopilot AI Tutor</span>
                  <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-full">
                    24/7 Domain Bot
                  </span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  24/7 official statistical methodology tutor explaining complex sampling formulas, national accounts sequence, CPI weights, and iGOT modules.
                </p>
              </div>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 pt-2">
                <span>Chat with SankhyaCopilot</span>
                <FaArrowRight size={10} />
              </span>
            </div>

            <div
              onClick={() => handleProtectedAction("/ai-models")}
              className="bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all space-y-4 cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="p-3 rounded-2xl bg-white/10 text-amber-300 w-fit group-hover:scale-110 transition-transform">
                  <HiSparkles size={20} />
                </div>
                <h3 className="font-bold text-base text-white flex items-center justify-between">
                  <span>AI Models & Workflows Hub</span>
                  <span className="text-[10px] font-black text-amber-300 bg-white/10 px-2 py-0.5 rounded-full uppercase">
                    7 Models Active
                  </span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Explore multi-phase workflow diagrams, step-by-step executions, input requirements, and launch any neural tool directly.
                </p>
              </div>
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5 pt-2">
                <span>Open Workflows Hub</span>
                <FaArrowRight size={10} />
              </span>
            </div>
          </div>
        </section>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={0.1}>
          <section className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 rounded-3xl p-6 sm:p-10 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider">
                <FaFilePdf className="text-red-500" size={13} />
                <span>Official Government of India Document Standard</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                Official MoSPI • NSSTA Performance Dossier
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Export comprehensive, verifiable PDF competency dossiers featuring official deep navy banners, the Indian tricolor ribbon, full competency score matrices, prioritized weakness breakdowns, and verified training roadmaps.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={handleDownloadSampleDossier}
                  className="px-6 py-3 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <FaFilePdf size={14} className="text-red-300" />
                  <span>Download Sample Official Dossier (PDF)</span>
                </button>

                <button
                  onClick={() => handleProtectedAction("/competencies")}
                  className="px-5 py-3 rounded-2xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-xs hover:bg-slate-50 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Assess My Competencies</span>
                  <FaArrowRight size={10} />
                </button>
              </div>
            </div>

            <div className="w-full lg:w-80 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-2xl p-4 shadow-xl space-y-3 shrink-0">
              <div className="h-3 w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808] rounded-full" />
              <div className="p-3 bg-blue-900 text-white rounded-xl text-center space-y-1">
                <span className="text-[9px] font-bold text-blue-200 uppercase tracking-wider block">MoSPI • NSSTA Official</span>
                <span className="text-xs font-black block">SkillIQ Intelligence Dossier</span>
              </div>
              <div className="space-y-1.5 text-[10px] text-slate-600 dark:text-slate-300">
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1">
                  <span>Verification Seal:</span>
                  <span className="font-bold text-emerald-600">SankhyaIQ™ AI</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1">
                  <span>Benchmark Cadre:</span>
                  <span className="font-bold text-blue-600">ISS / SSS / FOD</span>
                </div>
                <div className="flex justify-between">
                  <span>Training Framework:</span>
                  <span className="font-bold">iGOT & NSSTA TPAC</span>
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={0.1}>
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xs space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider">
                <FaQuestionCircle size={12} />
                <span>Frequently Asked Questions</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                Everything You Need to Know About the Platform
              </h2>
            </div>

            <div className="space-y-3">
              {faqList.map((faq, index) => {
                const isOpen = activeFaq === index;
                return (
                  <div
                    key={index}
                    className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden transition-all"
                  >
                    <button
                      onClick={() => setActiveFaq(isOpen ? null : index)}
                      className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-900 dark:text-white bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      <FaChevronDown
                        size={12}
                        className={`text-slate-400 shrink-0 transition-transform duration-200 ${
                          isOpen ? "rotate-180 text-blue-600" : ""
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="p-4 sm:p-5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed"
                        >
                          {faq.a}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </section>
        </ScrollReveal>

        <ScrollReveal direction="scale" delay={0.1}>
          <section className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase border border-blue-400/20">
                <HiSparkles className="text-amber-400" size={13} />
                <span>Future-Ready Statistical Workforce</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
                Begin Your Official Statistical Capacity Journey Today
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Join thousands of statistical officers from NSSO, CSO, and state DES. Complete your competency assessment and synthesize your personalized iGOT Karmayogi learning pathway.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <button
                onClick={() => handleProtectedAction("/learning-path")}
                className="px-7 py-3.5 rounded-2xl bg-white text-blue-900 hover:bg-slate-100 font-black text-xs sm:text-sm shadow-xl transition-all flex items-center gap-2 cursor-pointer"
              >
                <FaCertificate size={15} />
                <span>Start Learning Now</span>
              </button>

              {!userData && (
                <button
                  onClick={() => navigate("/auth")}
                  className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs sm:text-sm backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <FaUserGraduate size={14} />
                  <span>Create Officer Account</span>
                </button>
              )}
            </div>
          </section>
        </ScrollReveal>
      </main>
      </PageTransition>

      <Footer />

      {showAuth && <AuthModel onClose={() => setShowAuth(false)} />}
    </div>
  );
};

export default Home;
