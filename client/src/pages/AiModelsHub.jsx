import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  FaTasks,
  FaFileAlt,
  FaFileUpload,
  FaBrain,
  FaCertificate,
  FaArrowRight,
  FaCheckCircle,
  FaPlay,
  FaLayerGroup,
} from "react-icons/fa";
import {
  BsFillCameraVideoFill,
  BsRobot,
  BsShieldCheck,
  BsLightningChargeFill,
  BsSliders,
} from "react-icons/bs";
import { HiSparkles } from "react-icons/hi";
import AuthModel from "../components/AuthModel";
import PageTransition from "../components/PageTransition";
import BackButton from "../components/BackButton";

const AI_MODELS_DATA = [
  {
    id: "interview",
    title: "AI Cadre Mock Interview Bot & Viva Voce",
    shortName: "Mock Viva Voce",
    subtitle:
      "Realistic video avatar interview board with real-time speech-to-text voice recognition",
    icon: BsFillCameraVideoFill,
    badge: "Voice & Video AI",
    glowColor: "shadow-blue-500/20 ring-blue-500/30 border-blue-500/40",
    gradient: "from-blue-600 via-indigo-600 to-blue-700",
    textColor: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/60",
    route: "/interview",
    category: "Interview & Oral Assessment",
    summary:
      "Simulate high-stakes cadre selection and viva voce interviews. The AI generates cadre-specific technical questions, evaluates spoken voice responses in real time, and produces an official MoSPI PDF scorecard.",
    workflow: [
      {
        step: 1,
        title: "Cadre & Mode Selection",
        desc: "Choose target role (ISS Officer, SSS/JSO, FOD Investigator) and interview mode (Technical vs HR/Situational). Optionally upload bio-data.",
      },
      {
        step: 2,
        title: "Live Video Avatar Viva Voce",
        desc: "Interviewer asks sequential questions with voice readout. Answer using microphone with real-time speech recognition & live timer.",
      },
      {
        step: 3,
        title: "Diagnostic Scorecard & PDF Export",
        desc: "AI computes overall score, confidence, communication, and correctness ratings with official MoSPI PDF Scorecard download.",
      },
    ],
    features: [
      "Realistic male and female AI video avatar interviewers",
      "Real-time voice speech recognition (Speech-to-Text)",
      "Official Cadre presets (Indian Statistical Service, SSS, FOD)",
      "Question-by-question scoring and model answers",
      "MoSPI branded PDF Scorecard generation",
    ],
    metrics: {
      latency: "< 1.2s",
      accuracy: "97.4%",
      framework: "SankhyaIQ Oral Engine",
    },
  },
  {
    id: "assignments",
    title: "AI Generated Case Study Assignments",
    shortName: "Case Study Rubrics",
    subtitle:
      "Real-world MoSPI operational scenarios with instant rubric-based AI grading",
    icon: FaFileAlt,
    badge: "In-Service Practicum",
    glowColor: "shadow-amber-500/20 ring-amber-500/30 border-amber-500/40",
    gradient: "from-amber-500 via-orange-600 to-amber-700",
    textColor: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-950/60",
    route: "/assignments",
    category: "Practical Application",
    summary:
      "Solve real-world official statistical scenarios from NSSO, CSO, and state DES. Submit your analysis for instant in-depth AI grading across 4 official rubric dimensions.",
    workflow: [
      {
        step: 1,
        title: "Select Operational Case Study",
        desc: "Pick from sampling frame design, quarterly SNA 2008 GVA revision, survey data cleaning pipelines, or DPDP Act anonymization audits.",
      },
      {
        step: 2,
        title: "Formulate Solution & Deliverables",
        desc: "Draft your comprehensive response incorporating official formulas, stratification rules, multiplier derivations, and policy guidance.",
      },
      {
        step: 3,
        title: "Instant 4-Criterion Rubric Evaluation",
        desc: "AI evaluates Methodological Rigor, Accuracy, NQAF Compliance, and Policy Insight, awarding numerical marks and a direct Competency Index boost.",
      },
    ],
    features: [
      "Curated real-world official statistics problem statements",
      "Standard 100-mark rubric breakdown",
      "Instant AI feedback highlighting strengths & improvement areas",
      "Direct competency score integration",
    ],
    metrics: {
      latency: "< 2.0s",
      accuracy: "98.1%",
      framework: "SankhyaRubric Evaluator",
    },
  },
  {
    id: "copilot",
    title: "SankhyaCopilot AI Domain Assistant",
    shortName: "Statistical Copilot",
    subtitle:
      "24/7 official statistical methodology tutor and circular guidance copilot",
    icon: BsRobot,
    badge: "Domain Copilot",
    glowColor: "shadow-indigo-500/20 ring-indigo-500/30 border-indigo-500/40",
    gradient: "from-indigo-600 via-purple-600 to-indigo-800",
    textColor: "text-indigo-600 dark:text-indigo-400",
    bgColor: "bg-indigo-50 dark:bg-indigo-950/60",
    route: "/chat",
    category: "Conversational Intelligence",
    summary:
      "A dedicated domain copilot for officers and students to understand complex statistical methodologies, national account sequences, sampling designs, and MoSPI circulars.",
    workflow: [
      {
        step: 1,
        title: "Inquire on Methodology or Circulars",
        desc: "Ask questions on sampling design, GDP compilation formulas, CPI basket specifications, or metadata standards (NIC-2008, NPC-2011).",
      },
      {
        step: 2,
        title: "Context-Aware AI Synthesis",
        desc: "SankhyaCopilot consults official statistical frameworks and guidelines to generate mathematically sound, clear explanations.",
      },
      {
        step: 3,
        title: "Actionable Learning Suggestions",
        desc: "Receive step-by-step guidance, formula breakdowns, and direct links to relevant iGOT Karmayogi courses to deepen your expertise.",
      },
    ],
    features: [
      "Grounding in official MoSPI methodologies and UN standards",
      "Mathematical formula formatting and explanation",
      "Guidance on survey schedules and field procedures",
      "Direct integration with iGOT course catalogue",
    ],
    metrics: {
      latency: "< 0.8s",
      accuracy: "99.0%",
      framework: "SankhyaCopilot Neural",
    },
  },
  {
    id: "mcq",
    title: "AI MCQ Question Authoring Studio",
    shortName: "MCQ Authoring",
    subtitle:
      "Automated text extraction from survey manuals and circulars into 4-option MCQs",
    icon: FaFileUpload,
    badge: "Question Studio",
    glowColor: "shadow-purple-500/20 ring-purple-500/30 border-purple-500/40",
    gradient: "from-purple-600 via-pink-600 to-purple-800",
    textColor: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-950/60",
    route: "/materials",
    category: "Assessment Authoring",
    summary:
      "Upload official survey manuals, circulars, or training notes (PDF/TXT) to automatically generate structured 4-option MCQs with in-depth pedagogical explanations.",
    workflow: [
      {
        step: 1,
        title: "Upload Official Training Document",
        desc: "Upload NSS round manuals, National Accounts methodology notes, or statistical circulars in PDF or plain text format.",
      },
      {
        step: 2,
        title: "Automated Semantic Concept Extraction",
        desc: "The AI parses definitions, operational procedures, and mathematical rules from the uploaded document.",
      },
      {
        step: 3,
        title: "Author 4-Option MCQs & Explanations",
        desc: "Generates objective questions testing deep understanding with detailed explanations for correct and incorrect options.",
      },
    ],
    features: [
      "Instant PDF & TXT document parsing",
      "Generates 4 distinct options with one unambiguously correct answer",
      "Thorough pedagogical explanations for each question",
      "Direct export and inclusion into diagnostic test bank",
    ],
    metrics: {
      latency: "< 1.5s",
      accuracy: "96.8%",
      framework: "Doc2MCQ Parser",
    },
  },
  {
    id: "quizzes",
    title: "AI Diagnostic Quizzes & Test Engine",
    shortName: "Diagnostic Quizzes",
    subtitle:
      "On-demand timed diagnostic tests with question palettes and topic mastery diagnostics",
    icon: FaTasks,
    badge: "Adaptive Tests",
    glowColor:
      "shadow-emerald-500/20 ring-emerald-500/30 border-emerald-500/40",
    gradient: "from-emerald-500 via-teal-600 to-emerald-700",
    textColor: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/60",
    route: "/quizzes",
    category: "Diagnostic Testing",
    summary:
      "Take timed, adaptive diagnostic quizzes on sampling, price statistics, national accounts, and governance. View real-time scorecards and topic-level mastery insights.",
    workflow: [
      {
        step: 1,
        title: "Select Topic & Difficulty",
        desc: "Choose from standard MoSPI topics or enter a custom statistical topic with question count and difficulty level.",
      },
      {
        step: 2,
        title: "Take Timed Diagnostic Test",
        desc: "Navigate questions with interactive palette, flag for review, and submit before countdown timer expires.",
      },
      {
        step: 3,
        title: "Mastery Heatmap & Remediation",
        desc: "Instant score calculation, topic-wise breakdown (Mastered vs Needs Review), and adaptive iGOT remediation links.",
      },
    ],
    features: [
      "Custom on-demand quiz generation via AI",
      "Full examination mode with timer and question palette",
      "Topic-level strength and weakness breakdown",
      "Automatic linkage to remedial micro-courses",
    ],
    metrics: {
      latency: "< 1.0s",
      accuracy: "98.5%",
      framework: "Adaptive Diagnostic",
    },
  },
  {
    id: "competencies",
    title: "AI Multi-Domain Competency Engine",
    shortName: "Competency Radar",
    subtitle:
      "Automated skill-gap assessment against ISS, SSS, and FOD Cadre standards",
    icon: FaBrain,
    badge: "Skill Gap Matrix",
    glowColor: "shadow-cyan-500/20 ring-cyan-500/30 border-cyan-500/40",
    gradient: "from-cyan-600 via-blue-700 to-indigo-800",
    textColor: "text-cyan-600 dark:text-cyan-400",
    bgColor: "bg-cyan-50 dark:bg-cyan-950/60",
    route: "/competencies",
    category: "Competency Mapping",
    summary:
      "Evaluates officer proficiencies across 4 domains (Statistical, Technical & Computational, Digital Governance, Behavioural/Managerial) and computes priority skill gaps.",
    workflow: [
      {
        step: 1,
        title: "Set Cadre Profile & Self-Ratings",
        desc: "Provide designation, department, years of experience, and rate familiarity across core competencies.",
      },
      {
        step: 2,
        title: "AI Benchmark Synthesis",
        desc: "AI compares assessed scores against target role standards (ISS, SSS, FOD, DES) to identify deficits.",
      },
      {
        step: 3,
        title: "Competency Matrix & PDF Dossier",
        desc: "Generates full competency radar, prioritizes high-priority deficits, and enables 1-click Official Dossier PDF export.",
      },
    ],
    features: [
      "4-Domain official competency taxonomy",
      "Cadre-specific minimum benchmark profiles",
      "Automated skill gap prioritization (High / Medium / Low)",
      "Official Government of India PDF Dossier generation",
    ],
    metrics: {
      latency: "< 1.1s",
      accuracy: "99.2%",
      framework: "CadreMatrix Analyzer",
    },
  },
  {
    id: "learning-path",
    title: "AI Learning Pathway Synthesizer",
    shortName: "iGOT Synthesizer",
    subtitle:
      "Personalized capacity roadmaps combining iGOT digital courses & NSSTA residential programmes",
    icon: FaCertificate,
    badge: "iGOT & NSSTA",
    glowColor: "shadow-rose-500/20 ring-rose-500/30 border-rose-500/40",
    gradient: "from-rose-600 via-red-600 to-rose-800",
    textColor: "text-rose-600 dark:text-rose-400",
    bgColor: "bg-rose-50 dark:bg-rose-950/60",
    route: "/learning-path",
    category: "Curriculum Synthesis",
    summary:
      "Synthesizes an ordered, pedagogical learning pathway directly mapped to bridge your detected skill deficits using verified iGOT Karmayogi and NSSTA modules.",
    workflow: [
      {
        step: 1,
        title: "Weakness & Deficit Detection",
        desc: "Extracts identified competency deficits (<50% scores) from your diagnostic tests and assessments.",
      },
      {
        step: 2,
        title: "Course Catalogue Mapping",
        desc: "Maps each deficit to specific iGOT Karmayogi online modules and NSSTA residential in-service training.",
      },
      {
        step: 3,
        title: "Sequential Roadmap & Tracking",
        desc: "Follow a step-by-step roadmap with progress tracking, completion status, and dynamic 1-click AI regeneration.",
      },
    ],
    features: [
      "Direct mapping of weaknesses to remedial modules",
      "Integration of iGOT Karmayogi and NSSTA TPAC courses",
      "Interactive progress tracking (In Progress / Completed)",
      "1-Click Pathway Regeneration with SankhyaIQ AI",
    ],
    metrics: {
      latency: "< 1.4s",
      accuracy: "97.8%",
      framework: "PathSynthesizer Engine",
    },
  },
];

const AiModelsHub = () => {
  const [selectedModelId, setSelectedModelId] = useState(AI_MODELS_DATA[0].id);
  const [showAuth, setShowAuth] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { userData } = useSelector((state) => state.user);
  const navigate = useNavigate();

  // Live real-time ticking clock
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const activeModel =
    AI_MODELS_DATA.find((m) => m.id === selectedModelId) || AI_MODELS_DATA[0];
  const ActiveIcon = activeModel.icon;

  const handleLaunch = (route) => {
    if (!userData && route !== "/") {
      setShowAuth(true);
      return;
    }
    navigate(route);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col transition-colors">
      <Navbar />

      <PageTransition>
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-6">
          {/* Back Navigation Bar */}
          <div className="flex items-center justify-between">
            <BackButton fallbackUrl="/dashboard" label="Back to Dashboard" />
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              SankhyaIQ™ AI Neural Models
            </span>
          </div>

          {/* Top Header Banner with Tricolor & Glassmorphism */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-950 text-white p-6 sm:p-7 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-blue-500/20"
          >
            {/* Top Indian Tricolor Strip */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />

            {/* Ambient Glow */}
            <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 blur-3xl rounded-full pointer-events-none" />

            <div className="space-y-2 max-w-2xl relative z-10">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider border border-blue-400/20">
                  <HiSparkles
                    className="text-amber-400 animate-spin"
                    size={13}
                  />
                  <span>SankhyaIQ™ AI Neural Architecture</span>
                </div>

                {/* Live IST Clock */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-mono font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>
                    IST:{" "}
                    {currentTime.toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: true,
                    })}
                  </span>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
                <span>AI Models & Intelligent Workflow Hub</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Explore the full suite of specialized AI engines built for
                India's Official Statistical System. Inspect multi-phase
                workflows, input/output specifications, and launch any neural
                tool directly.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl text-center shrink-0 min-w-[150px] relative z-10 shadow-lg">
              <span className="text-[10px] font-extrabold text-blue-200 uppercase tracking-wider block">
                Neural Engines
              </span>
              <span className="text-2xl font-black text-emerald-400">
                {AI_MODELS_DATA.length} Models
              </span>
              <span className="text-[10px] text-slate-300 block mt-0.5 flex items-center justify-center gap-1 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>100% Operational</span>
              </span>
            </div>
          </motion.div>

          {/* EQUAL HEIGHT 2-COLUMN APP CONTAINER */}
          {/* On desktop, both columns stretch equally to fill the viewport height */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch lg:h-[780px]">
            {/* ======================================================== */}
            {/* LEFT SIDEBAR: LIST OF ALL AI MODELS (EQUAL HEIGHT)       */}
            {/* ======================================================== */}
            <div className="lg:col-span-4 flex flex-col bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-4 shadow-xl overflow-hidden">
              {/* Sidebar Header */}
              <div className="px-2 py-2 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between shrink-0 mb-2">
                <div className="flex items-center gap-2">
                  <BsSliders
                    className="text-blue-600 dark:text-blue-400"
                    size={14}
                  />
                  <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Select AI Model
                  </span>
                </div>
                <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 dark:bg-blue-950 px-2.5 py-0.5 rounded-full border border-blue-200/60 dark:border-blue-800">
                  {AI_MODELS_DATA.length} Models
                </span>
              </div>

              {/* Scrollable Model List */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
                {AI_MODELS_DATA.map((model) => {
                  const Icon = model.icon;
                  const isSelected = model.id === selectedModelId;
                  return (
                    <motion.button
                      key={model.id}
                      onClick={() => setSelectedModelId(model.id)}
                      whileHover={{ scale: 1.015 }}
                      whileTap={{ scale: 0.985 }}
                      className={`w-full text-left p-3.5 rounded-2xl transition-all relative flex items-start gap-3.5 cursor-pointer select-none ${
                        isSelected
                          ? `bg-gradient-to-r from-blue-50 to-indigo-50/80 dark:from-slate-800/90 dark:to-blue-950/60 border-2 ${model.glowColor} shadow-md`
                          : "hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent"
                      }`}
                    >
                      {/* Glowing active indicator bar on the left edge */}
                      {isSelected && (
                        <motion.div
                          layoutId="activeModelIndicator"
                          className="absolute left-1 top-2.5 bottom-2.5 w-1.5 rounded-full bg-gradient-to-b from-blue-600 to-indigo-600 shadow-sm"
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30,
                          }}
                        />
                      )}

                      <div
                        className={`p-3 rounded-2xl text-white bg-gradient-to-tr ${model.gradient} shadow-md shrink-0 mt-0.5 transition-transform duration-300 ${
                          isSelected ? "scale-105" : "opacity-90"
                        }`}
                      >
                        <Icon size={18} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight truncate">
                            {model.title}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${model.bgColor} ${model.textColor}`}
                          >
                            {model.badge}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium truncate">
                            {model.category}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0 pt-2 text-slate-400">
                        <FaArrowRight
                          size={11}
                          className={
                            isSelected ? model.textColor : "opacity-40"
                          }
                        />
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Sidebar Bottom Status */}
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 shrink-0 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-2">
                <span className="flex items-center gap-1.5">
                  <BsShieldCheck className="text-emerald-500" size={13} />
                  <span>SankhyaIQ AI</span>
                </span>
                <span className="font-bold text-blue-600">v2.4 Active</span>
              </div>
            </div>
            <div className="lg:col-span-8 flex flex-col bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 sm:p-7 shadow-xl overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeModel.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="flex-1 flex flex-col overflow-y-auto pr-1 space-y-6 custom-scrollbar"
                >
                  {/* 1. Header Card with Category, Title & Launch CTA */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5 shrink-0">
                    <div className="flex items-start gap-4">
                      <div
                        className={`p-4 rounded-2xl text-white bg-gradient-to-tr ${activeModel.gradient} shadow-lg shrink-0`}
                      >
                        <ActiveIcon size={30} />
                      </div>
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-extrabold uppercase tracking-wider mb-1 border border-blue-200/60 dark:border-blue-800">
                          <FaLayerGroup size={10} />
                          <span>{activeModel.category}</span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-snug">
                          {activeModel.title}
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                          {activeModel.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <BackButton fallbackUrl="/dashboard" label="Back" variant="pill" />
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleLaunch(activeModel.route)}
                        className={`px-6 py-3.5 rounded-2xl bg-gradient-to-r ${activeModel.gradient} text-white font-black text-xs sm:text-sm shadow-xl shadow-blue-500/25 transition-all flex items-center gap-2.5 cursor-pointer shrink-0 active:scale-95`}
                      >
                        <FaPlay size={11} />
                        <span>Launch {activeModel.badge}</span>
                        <FaArrowRight size={11} />
                      </motion.button>
                    </div>
                  </div>

                  {/* 2. Model Performance Metric Strip */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 text-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Inference Speed
                      </span>
                      <span className="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400">
                        {activeModel.metrics.latency}
                      </span>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 text-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Benchmark Match
                      </span>
                      <span className="text-sm sm:text-base font-black text-blue-600 dark:text-blue-400">
                        {activeModel.metrics.accuracy}
                      </span>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 text-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Neural Engine
                      </span>
                      <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-200 truncate block mt-0.5">
                        {activeModel.metrics.framework}
                      </span>
                    </div>
                  </div>

                  {/* 3. Model Summary Description Box */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-50 to-blue-50/30 dark:from-slate-800/70 dark:to-blue-950/30 border border-slate-200/80 dark:border-slate-700/80 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-1">
                    <span className="font-black text-slate-900 dark:text-white flex items-center gap-1.5 text-xs uppercase tracking-wider">
                      <HiSparkles className="text-amber-400" />
                      <span>Domain & Capacity Mandate:</span>
                    </span>
                    <p>{activeModel.summary}</p>
                  </div>

                  {/* 4. Interactive 3-Phase Workflow Execution Steps */}
                  <div className="space-y-3">
                    <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                      <BsLightningChargeFill className="text-amber-500" />
                      <span>Multi-Phase Execution Workflow</span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                      {activeModel.workflow.map((w, idx) => (
                        <motion.div
                          key={w.step}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1, duration: 0.3 }}
                          className="p-4 rounded-2xl bg-gradient-to-b from-slate-50 to-white dark:from-slate-800/80 dark:to-slate-900 border border-slate-200/80 dark:border-slate-700/80 space-y-2 relative shadow-xs hover:border-blue-400 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className={`w-7 h-7 rounded-xl bg-gradient-to-tr ${activeModel.gradient} text-white text-xs font-black flex items-center justify-center shadow-xs`}
                            >
                              {w.step}
                            </span>
                            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                              Phase 0{w.step}
                            </span>
                          </div>
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-snug">
                            {w.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                            {w.desc}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* 5. Key Capabilities Checklist */}
                  <div className="space-y-3">
                    <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                      <BsShieldCheck className="text-emerald-500" />
                      <span>Key Architectural Capabilities</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {activeModel.features.map((feat, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-xs font-semibold text-slate-700 dark:text-slate-300"
                        >
                          <FaCheckCircle
                            className="text-emerald-500 shrink-0 mt-0.5"
                            size={13}
                          />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 6. Action Footer */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Ready to run this model? Click launch to open the live
                      interactive view.
                    </span>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <BackButton fallbackUrl="/dashboard" label="Back" variant="pill" />
                      <button
                        onClick={() => handleLaunch(activeModel.route)}
                        className={`w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r ${activeModel.gradient} hover:opacity-95 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md`}
                      >
                        <span>Open {activeModel.shortName}</span>
                        <FaArrowRight size={10} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </main>
      </PageTransition>

      <Footer />

      {/* Auth Modal Trigger */}
      {showAuth && <AuthModel onClose={() => setShowAuth(false)} />}
    </div>
  );
};

export default AiModelsHub;
