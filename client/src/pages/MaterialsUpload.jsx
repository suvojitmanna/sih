import React, { useEffect, useState, useRef } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BackButton from "../components/BackButton";
import { ServerUrl } from "../App";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import {
  FaFileUpload,
  FaFilePdf,
  FaFileAlt,
  FaFileImage,
  FaFileWord,
  FaFilePowerpoint,
  FaListAlt,
  FaHandSparkles,
  FaBookOpen,
  FaDownload,
  FaExternalLinkAlt,
  FaCheckCircle,
  FaCalendarAlt,
  FaCopy,
  FaPlay,
  FaCheck,
  FaInfoCircle,
  FaArrowRight,
  FaSearch,
  FaPaperclip,
  FaClock,
  FaExclamationCircle,
  FaSyncAlt,
} from "react-icons/fa";
import {
  BsShieldCheck,
  BsFillSendFill,
  BsStars,
  BsLightningChargeFill,
  BsCheckCircleFill,
  BsClockHistory,
  BsInboxFill,
  BsSendCheckFill,
} from "react-icons/bs";

const formatDateTime = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const DOMAINS = [
  "Statistical Competencies",
  "Technical & Computational Competencies",
  "Digital Governance & Security",
  "Behavioural & Managerial Competencies",
];

const QUICK_SUGGESTIONS = [
  { topic: "Periodic Labour Force Survey (PLFS) Round 80 Sampling", domain: "Statistical Competencies" },
  { topic: "CPI Basket Revision & Hedonic Quality Adjustments", domain: "Statistical Competencies" },
  { topic: "National Accounts Supply & Use Tables (SUT)", domain: "Technical & Computational Competencies" },
  { topic: "Annual Survey of Industries (ASI) Verification Protocol", domain: "Statistical Competencies" },
  { topic: "Cybersecurity & Statistical Data Protection Norms", domain: "Digital Governance & Security" },
];

const getFileBadge = (fileType = "", fileName = "") => {
  const type = (fileType || fileName.split(".").pop() || "").toLowerCase();
  if (["ppt", "pptx", "odp", "pps", "ppsx"].includes(type)) {
    return {
      icon: <FaFilePowerpoint size={16} />,
      color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800",
      label: "PowerPoint Presentation",
      ext: type.toUpperCase(),
    };
  }
  if (["pdf"].includes(type)) {
    return {
      icon: <FaFilePdf size={16} />,
      color: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950 border-rose-200 dark:border-rose-800",
      label: "PDF Document",
      ext: "PDF",
    };
  }
  if (["doc", "docx", "odt", "rtf"].includes(type)) {
    return {
      icon: <FaFileWord size={16} />,
      color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800",
      label: "Word Document",
      ext: type.toUpperCase(),
    };
  }
  if (["png", "jpg", "jpeg", "webp", "svg", "bmp", "gif"].includes(type) || type.startsWith("image")) {
    return {
      icon: <FaFileImage size={16} />,
      color: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800",
      label: "Statistical Chart / Image",
      ext: type.toUpperCase(),
    };
  }
  return {
    icon: <FaFileAlt size={16} />,
    color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800",
    label: "Data / Text Document",
    ext: type.toUpperCase() || "DOC",
  };
};

const MaterialsUpload = ({ initialTab = "material-request" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Determine active tab ("material-request" vs "mcq-create")
  const getInitialActiveTab = () => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "mcq-create") return "mcq-create";
    if (tabParam === "material-request" || tabParam === "request" || tabParam === "upload-request") {
      return "material-request";
    }
    if (location.pathname === "/mcq-create") return "mcq-create";
    return initialTab === "mcq-create" ? "mcq-create" : "material-request";
  };

  const [activeTab, setActiveTab] = useState(getInitialActiveTab);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (location.pathname === "/mcq-create") {
      setActiveTab("mcq-create");
    } else if (tabParam === "mcq-create") {
      setActiveTab("mcq-create");
    } else if (tabParam === "material-request" || tabParam === "request" || tabParam === "upload-request") {
      setActiveTab("material-request");
    }
  }, [location.pathname, searchParams]);

  const switchTab = (tab) => {
    setActiveTab(tab);
    if (tab === "mcq-create") {
      navigate("/mcq-create", { replace: true });
    } else {
      navigate("/materials?tab=material-request", { replace: true });
    }
  };

  // Shared Data
  const [materials, setMaterials] = useState([]);
  const [myRequests, setMyRequests] = useState([]);

  // Part 1: Material Request State
  const [requestForm, setRequestForm] = useState({
    topic: "",
    domain: DOMAINS[0],
    description: "",
    urgency: "Normal",
  });
  const [requestAttachment, setRequestAttachment] = useState(null);
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [requestFilter, setRequestFilter] = useState("all"); // "all" | "pending" | "fulfilled"
  const [requestSearch, setRequestSearch] = useState("");
  const [previewFile, setPreviewFile] = useState(null);

  // Part 2: MCQ Create State
  const [mcqSourceMode, setMcqSourceMode] = useState("direct"); // "direct" | "repository" | "dispatched"
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [directFile, setDirectFile] = useState(null);
  const [directTitle, setDirectTitle] = useState("");
  const [directDomain, setDirectDomain] = useState(DOMAINS[0]);
  const [directTopic, setDirectTopic] = useState("Statistical Sampling & Survey Methodologies");
  const [mcqMode, setMcqMode] = useState("all");
  const [numQuestions, setNumQuestions] = useState("all");
  const [difficulty, setDifficulty] = useState("Medium");
  const [genLoading, setGenLoading] = useState(false);
  const [generatedMcqs, setGeneratedMcqs] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [copied, setCopied] = useState(false);

  const prevFulfilledCountRef = useRef(null);

  // Fetch materials and user requests
  const fetchMaterials = async (isBackground = false) => {
    try {
      const [matRes, reqRes] = await Promise.all([
        axios.get(`${ServerUrl}/api/materials/list`, { withCredentials: true }),
        axios.get(`${ServerUrl}/api/materials/my-requests`, { withCredentials: true }),
      ]);

      if (matRes.data.success) {
        setMaterials(matRes.data.materials || []);
      }
      if (reqRes.data.success) {
        const reqs = reqRes.data.requests || [];
        setMyRequests(reqs);
        const fulfilledCount = reqs.filter(
          (r) => r.status === "fulfilled" || r.dispatchedMaterialUrl || r.adminResponseNote
        ).length;

        if (
          isBackground &&
          prevFulfilledCountRef.current !== null &&
          fulfilledCount > prevFulfilledCountRef.current
        ) {
          toast.success(
            "📦 NSSTA has fulfilled & dispatched your study material! Check your requests below. ✨",
            { duration: 6000 }
          );
        }
        prevFulfilledCountRef.current = fulfilledCount;
      }
    } catch (error) {
      if (!isBackground) {
        console.error("Fetch materials error:", error);
      }
    }
  };

  useEffect(() => {
    fetchMaterials(false);
    const interval = setInterval(() => {
      fetchMaterials(true);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Submit Requisition Form (Part 1)
  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    if (!requestForm.topic.trim() || !requestForm.description.trim()) {
      toast.error("Please fill in the topic and detailed learning requirement.");
      return;
    }
    setRequestSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("topic", requestForm.topic.trim());
      formData.append("domain", requestForm.domain);
      formData.append("description", requestForm.description.trim());
      formData.append("urgency", requestForm.urgency);
      if (requestAttachment) {
        formData.append("file", requestAttachment);
      }

      const { data } = await axios.post(`${ServerUrl}/api/materials/request`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      if (data.success) {
        toast.success("Study material requisition successfully submitted to NSSTA Secretariat! 📄✨");
        setRequestForm({
          topic: "",
          domain: DOMAINS[0],
          description: "",
          urgency: "Normal",
        });
        setRequestAttachment(null);
        fetchMaterials();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error submitting study material request.");
    } finally {
      setRequestSubmitting(false);
    }
  };

  // Switch to Part 2 with a dispatched material loaded
  const handleCreateMcqFromDispatched = (req) => {
    setMcqSourceMode("direct");
    setDirectTitle(req.dispatchedMaterialTitle || req.topic);
    setDirectDomain(req.domain || DOMAINS[0]);
    setDirectTopic(req.topic || "Survey Methodology");
    switchTab("mcq-create");
    toast.success(`Loaded "${req.topic}" for MCQ Question Studio! ⚡`);
  };

  // Generate MCQs from direct file (Part 2)
  const handleDirectFileMcqGenerate = async (e) => {
    if (e) e.preventDefault();
    if (!directFile && !directTitle) {
      toast.error("Please select a file to generate questions from.");
      return;
    }

    setGenLoading(true);
    const formData = new FormData();
    if (directFile) {
      formData.append("file", directFile);
    }
    formData.append("title", directTitle || (directFile ? directFile.name : "Study Material"));
    formData.append("domain", directDomain);
    formData.append("topic", directTopic);
    formData.append("autoGenerateMcqs", "true");
    formData.append("difficulty", difficulty);
    formData.append("numQuestions", mcqMode === "all" ? "all" : String(numQuestions));

    try {
      const { data } = await axios.post(`${ServerUrl}/api/materials/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      if (data.success) {
        if (data.mcqs && data.mcqs.length > 0) {
          setGeneratedMcqs(data.mcqs);
          setSelectedMaterial(data.material);
          if (data.quiz) setActiveQuiz(data.quiz);
          toast.success(`🎉 Uploaded & Generated ${data.mcqs.length} All-Possible MCQs covering entire document!`);
        } else {
          toast.success("Content analyzed. You can re-generate questions anytime.");
          setSelectedMaterial(data.material);
        }
        setDirectTitle("");
        setDirectFile(null);
        fetchMaterials();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to generate MCQs from file");
    } finally {
      setGenLoading(false);
    }
  };

  // Generate MCQs from existing repository document (Part 2)
  const handleGenerateFromExisting = async (material = selectedMaterial) => {
    if (!material) {
      toast.error("Please select a document from the repository.");
      return;
    }
    setSelectedMaterial(material);
    setGenLoading(true);

    const finalCount = mcqMode === "all" ? "all" : numQuestions;

    try {
      const { data } = await axios.post(
        `${ServerUrl}/api/materials/${material._id}/generate-mcqs`,
        {
          numQuestions: finalCount,
          difficulty,
          mode: finalCount === "all" ? "all" : "fixed",
        },
        { withCredentials: true }
      );

      if (data.success) {
        setGeneratedMcqs(data.mcqs || []);
        if (data.quiz) setActiveQuiz(data.quiz);
        toast.success(`Generated ${data.mcqs.length} Comprehensive MCQs with Pedagogical Rationale! 🎉`);
        fetchMaterials();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to generate questions");
    } finally {
      setGenLoading(false);
    }
  };

  // Copy questions & answers
  const handleCopyAll = () => {
    if (!generatedMcqs || generatedMcqs.length === 0) return;
    const formatted = generatedMcqs
      .map(
        (q, idx) =>
          `Q${idx + 1}: ${q.question}\n${(q.options || []).join("\n")}\nCorrect Answer: ${q.correctAnswer}\nRationale: ${q.explanation}\nSource: ${q.sourceReference || q.topic || "Document"}\n`
      )
      .join("\n---\n\n");

    navigator.clipboard.writeText(formatted);
    setCopied(true);
    toast.success("All questions, options, and explanations copied to clipboard!");
    setTimeout(() => setCopied(false), 3000);
  };

  // Request filtering
  const pendingCount = myRequests.filter((r) => r.status !== "fulfilled" && !r.dispatchedMaterialUrl).length;
  const fulfilledCount = myRequests.filter((r) => r.status === "fulfilled" || r.dispatchedMaterialUrl).length;

  const filteredRequests = myRequests.filter((r) => {
    const isFulfilled = r.status === "fulfilled" || !!r.dispatchedMaterialUrl;
    if (requestFilter === "pending" && isFulfilled) return false;
    if (requestFilter === "fulfilled" && !isFulfilled) return false;

    if (!requestSearch.trim()) return true;
    const term = requestSearch.toLowerCase();
    return (
      (r.topic && r.topic.toLowerCase().includes(term)) ||
      (r.domain && r.domain.toLowerCase().includes(term)) ||
      (r.description && r.description.toLowerCase().includes(term)) ||
      (r.dispatchedMaterialTitle && r.dispatchedMaterialTitle.toLowerCase().includes(term))
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-19 pb-16 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <BackButton fallbackUrl="/dashboard" label="Back to Dashboard" />
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Capacity Building • {activeTab === "material-request" ? "Material Request" : "AI MCQ Create Studio"}
          </span>
        </div>


        {/* BRAND NEW UI: PART 1 - MATERIAL REQUEST & DISPATCHES         */}
        {activeTab === "material-request" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Clean Executive Header Bar - Only in Part 1 */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative overflow-hidden">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/80 text-[11px] font-black uppercase tracking-wider">
                  <BsShieldCheck size={12} className="text-blue-600 dark:text-blue-400" />
                  <span>NSSTA Secretariat • Official Training Cadre Requisitions</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Official Study Material Request & Academy Dispatches
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
                  Submit formal training curriculum requisitions directly to the NSSTA Secretariat. Track dispatch status, review administrator notes, and download official study packs.
                </p>
              </div>

              {/* Quick Metrics */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="px-3.5 py-2 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/80 text-center">
                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 block uppercase">In Review</span>
                  <span className="text-base font-black text-amber-900 dark:text-amber-200">{pendingCount}</span>
                </div>
                <div className="px-3.5 py-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/80 text-center">
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 block uppercase">Dispatched</span>
                  <span className="text-base font-black text-emerald-900 dark:text-emerald-200">{fulfilledCount}</span>
                </div>
              </div>
            </div>
            {/* Main Grid: Requisition Form (Left) & Request Tracking Dashboard (Right) */}
            <div className="grid lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Direct In-Page Requisition Form */}
              <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <FaBookOpen className="text-blue-600 dark:text-blue-400" />
                    <span>Submit Study Material Requisition</span>
                  </h2>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                    NSSTA Portal
                  </span>
                </div>

                {/* Quick Suggestion Chips */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                    Frequently Requisitioned Topics:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_SUGGESTIONS.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setRequestForm({ ...requestForm, topic: item.topic, domain: item.domain })}
                        className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950 dark:hover:text-blue-300 transition cursor-pointer border border-slate-200/60 dark:border-slate-700/60"
                      >
                        + {item.topic.split(" ")[0]} {item.topic.split(" ")[1]}
                      </button>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleRequestSubmit} className="space-y-4 text-xs">
                  {/* Topic */}
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Requested Topic / Curriculum Framework *
                    </label>
                    <input
                      type="text"
                      required
                      value={requestForm.topic}
                      onChange={(e) => setRequestForm({ ...requestForm, topic: e.target.value })}
                      placeholder="e.g. Periodic Labour Force Survey (PLFS) Sampling Manual"
                      className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Domain & Urgency */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Competency Domain
                      </label>
                      <select
                        value={requestForm.domain}
                        onChange={(e) => setRequestForm({ ...requestForm, domain: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-hidden text-xs"
                      >
                        {DOMAINS.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Urgency Level
                      </label>
                      <select
                        value={requestForm.urgency}
                        onChange={(e) => setRequestForm({ ...requestForm, urgency: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-hidden text-xs font-semibold"
                      >
                        <option value="Normal">🟢 Normal (Routine Study)</option>
                        <option value="High">🟡 High (Cadre Assessment)</option>
                        <option value="Critical">🔴 Critical (Survey Launch)</option>
                      </select>
                    </div>
                  </div>

                  {/* Detailed Requirements */}
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Detailed Learning Requirement & Scope *
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={requestForm.description}
                      onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })}
                      placeholder="Explain why you need this material and any specific formulas, methodologies, survey rounds, or circulars you need covered..."
                      className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Supporting Document / Specimen */}
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Attach Reference Specimen or Circular (Optional)
                    </label>
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor="request-file"
                        className="flex-1 p-2.5 bg-slate-50 dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 text-xs flex items-center justify-center gap-2 cursor-pointer hover:border-blue-500 transition"
                      >
                        <FaPaperclip size={12} className="text-blue-500" />
                        <span className="truncate">
                          {requestAttachment ? requestAttachment.name : "Attach reference PDF, PPT, Word or Image"}
                        </span>
                        <input
                          id="request-file"
                          type="file"
                          accept=".pdf,.ppt,.pptx,.docx,.doc,.txt,.csv,.png,.jpg,.jpeg"
                          onChange={(e) => setRequestAttachment(e.target.files[0] || null)}
                          className="hidden"
                        />
                      </label>
                      {requestAttachment && (
                        <button
                          type="button"
                          onClick={() => setRequestAttachment(null)}
                          className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:text-rose-500 text-slate-400 font-bold text-xs"
                          title="Remove attached file"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Submission Button */}
                  <button
                    type="submit"
                    disabled={requestSubmitting}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {requestSubmitting ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Transmitting Requisition to NSSTA...</span>
                      </span>
                    ) : (
                      <>
                        <BsFillSendFill size={12} className="text-amber-300" />
                        <span>Submit Requisition to NSSTA Secretariat</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Right Column: Requisition Tracking & Dispatches Board */}
              <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <BsSendCheckFill className="text-blue-600" />
                      <span>Requisition Status & Academy Dispatches</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {myRequests.length} Total Submissions • {fulfilledCount} Dispatched by NSSTA
                    </p>
                  </div>

                  {/* Status Filters & Search */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 text-[11px] font-bold">
                      <button
                        onClick={() => setRequestFilter("all")}
                        className={`px-2.5 py-1 rounded-lg transition ${requestFilter === "all"
                            ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xs"
                            : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                          }`}
                      >
                        All ({myRequests.length})
                      </button>
                      <button
                        onClick={() => setRequestFilter("pending")}
                        className={`px-2.5 py-1 rounded-lg transition ${requestFilter === "pending"
                            ? "bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-300 shadow-xs"
                            : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                          }`}
                      >
                        In Review ({pendingCount})
                      </button>
                      <button
                        onClick={() => setRequestFilter("fulfilled")}
                        className={`px-2.5 py-1 rounded-lg transition ${requestFilter === "fulfilled"
                            ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-300 shadow-xs"
                            : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                          }`}
                      >
                        Dispatched ({fulfilledCount})
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search requisitions..."
                        value={requestSearch}
                        onChange={(e) => setRequestSearch(e.target.value)}
                        className="pl-7 pr-3 py-1 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-hidden focus:ring-1 focus:ring-blue-500"
                      />
                      <FaSearch size={10} className="absolute left-2.5 top-2.5 text-slate-400" />
                    </div>
                  </div>
                </div>

                {/* Requisitions List */}
                {filteredRequests.length === 0 ? (
                  <div className="text-center py-14 text-slate-400 space-y-3">
                    <BsInboxFill size={40} className="mx-auto opacity-30 text-blue-500" />
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      No material requisitions found in this view.
                    </p>
                    <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                      Fill in the requisition form on the left to request training slides, manuals, or survey documentation directly from the NSSTA Secretariat.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
                    {filteredRequests.map((req) => {
                      const isFulfilled = req.status === "fulfilled" || !!req.dispatchedMaterialUrl || !!req.dispatchedFileData;
                      const isRejected = req.status === "rejected";
                      const completedTime = req.completedAt || req.fulfilledAt || (isFulfilled ? req.updatedAt : null);

                      return (
                        <div
                          key={req._id}
                          className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3 shadow-xs hover:border-blue-400/60 transition-all"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 dark:border-slate-700/60 pb-2.5">
                            <div>
                              <span className="font-black text-sm text-slate-900 dark:text-white block">
                                {req.topic}
                              </span>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                                  {req.domain}
                                </span>
                                {req.urgency && (
                                  <span
                                    className={`text-[9px] font-black px-2 py-0.5 rounded-md ${req.urgency === "Critical"
                                        ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                                        : req.urgency === "High"
                                          ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                                          : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                                      }`}
                                  >
                                    {req.urgency} Urgency
                                  </span>
                                )}
                              </div>
                            </div>

                            <span
                              className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wide ${isFulfilled
                                  ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 border border-emerald-200 dark:border-emerald-800"
                                  : isRejected
                                    ? "bg-rose-50 dark:bg-rose-950 text-rose-600 border border-rose-200 dark:border-rose-800"
                                    : "bg-amber-50 dark:bg-amber-950 text-amber-600 border border-amber-200 dark:border-amber-800"
                                }`}
                            >
                              {isFulfilled ? "✓ Dispatched by NSSTA" : isRejected ? "✕ Closed / Rejected" : "⏳ Pending Secretariat"}
                            </span>
                          </div>

                          <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                            {req.description}
                          </p>

                          <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px]">
                            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 bg-white/70 dark:bg-slate-900/60 px-2.5 py-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                              <FaCalendarAlt size={10} className="text-blue-500" />
                              <span>
                                <strong>Requested:</strong> {formatDateTime(req.createdAt) || "Recorded"}
                              </span>
                            </div>

                            {completedTime && (
                              <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/60 px-2.5 py-1 rounded-xl border border-emerald-200/80 dark:border-emerald-800/80 font-semibold">
                                <FaCheckCircle size={11} className="text-emerald-500" />
                                <span>
                                  <strong>Fulfilled:</strong> {formatDateTime(completedTime)}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Reference Attachment Preview */}
                          {req.attachmentData && (
                            <div className="flex items-center gap-2 text-[11px] text-blue-600 dark:text-blue-400">
                              <span>Attached: {req.attachmentName || "Reference Document"}</span>
                              <button
                                onClick={() => setPreviewFile({ url: req.attachmentData, title: req.attachmentName })}
                                className="underline font-bold cursor-pointer"
                              >
                                (Preview)
                              </button>
                            </div>
                          )}

                          {/* Secretariat Fulfilled Dispatch Card */}
                          {isFulfilled && (
                            <div className="p-4 rounded-2xl bg-emerald-50/90 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 space-y-3 text-xs">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                                  <span>📦 Dispatched:</span>
                                  <strong>{req.dispatchedMaterialTitle || "Official Study Pack"}</strong>
                                </span>
                                {req.dispatchedMaterialUrl && (
                                  <a
                                    href={req.dispatchedMaterialUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 dark:text-blue-400 font-bold hover:underline inline-flex items-center gap-1"
                                  >
                                    <span>External Repository Link</span>
                                    <FaExternalLinkAlt size={10} />
                                  </a>
                                )}
                              </div>

                              {req.adminResponseNote && (
                                <p className="text-emerald-800 dark:text-emerald-200 text-[11px] bg-white/70 dark:bg-slate-900/60 p-2.5 rounded-xl border border-emerald-200/60 dark:border-emerald-800/60 leading-relaxed">
                                  <strong>Secretariat Feedback:</strong> {req.adminResponseNote}
                                </p>
                              )}

                              <div className="flex flex-wrap items-center gap-2 pt-1">
                                {req.dispatchedFileData && (
                                  <a
                                    href={req.dispatchedFileData}
                                    download={req.dispatchedFileName || "official-study-material"}
                                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-xs transition"
                                  >
                                    <FaDownload size={11} />
                                    <span>Download Dispatched Material</span>
                                  </a>
                                )}

                                {/* Quick bridge to Part 2 */}
                                <button
                                  onClick={() => handleCreateMcqFromDispatched(req)}
                                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                                  title="Author MCQs on this Dispatched Material"
                                >
                                  <BsStars size={12} className="text-amber-300" />
                                  <span>Create MCQs on this Material</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* PART 2: MCQ CREATE STUDIO VIEW                               */}
        {/* ============================================================ */}
        {activeTab === "mcq-create" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Generation Setup */}
              <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <BsStars className="text-emerald-500" />
                    <span>AI MCQ Question Studio</span>
                  </h2>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                    Cadre Diagnostic
                  </span>
                </div>

                {/* Choose Source Mode */}
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-2 text-xs">
                    Step 1: Choose Source Material
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setMcqSourceMode("direct")}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${mcqSourceMode === "direct"
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                          : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                        }`}
                    >
                      <span className="font-bold text-xs block">⚡ Upload File</span>
                      <span
                        className={`text-[10px] block mt-0.5 ${mcqSourceMode === "direct" ? "text-emerald-100" : "text-slate-400"
                          }`}
                      >
                        Drop presentation or PDF manual
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMcqSourceMode("repository")}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${mcqSourceMode === "repository"
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                          : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                        }`}
                    >
                      <span className="font-bold text-xs block">📚 Select Repository</span>
                      <span
                        className={`text-[10px] block mt-0.5 ${mcqSourceMode === "repository" ? "text-emerald-100" : "text-slate-400"
                          }`}
                      >
                        Pick an already uploaded deck/file
                      </span>
                    </button>
                  </div>
                </div>

                {/* Direct File Dropzone */}
                {mcqSourceMode === "direct" && (
                  <div className="space-y-3">
                    <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-4 text-center hover:border-emerald-500 transition-colors bg-slate-50/70 dark:bg-slate-800/40 group cursor-pointer">
                      <input
                        type="file"
                        id="direct-mcq-file"
                        accept=".pdf,.ppt,.pptx,.docx,.doc,.txt,.csv,.tsv,.md,.odp,.odt,.json,.jpg,.jpeg,.png,.webp"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0];
                            setDirectFile(file);
                            if (!directTitle) {
                              const cleanName = file.name
                                .replace(/\.[^/.]+$/, "")
                                .replace(/[-_]+/g, " ")
                                .trim();
                              setDirectTitle(cleanName);
                            }
                          }
                        }}
                        className="hidden"
                      />
                      <label htmlFor="direct-mcq-file" className="cursor-pointer flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-md">
                          {directFile ? getFileBadge("", directFile.name).icon : <BsStars size={20} />}
                        </div>
                        <div>
                          <span className="font-bold text-slate-800 dark:text-slate-200 text-xs block">
                            {directFile ? directFile.name : "Select presentation or document to analyze"}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            PowerPoint slides, PDF manuals, Word (.docx), or Images
                          </span>
                        </div>
                      </label>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 text-xs">
                        Document / Topic Title
                      </label>
                      <input
                        type="text"
                        value={directTitle}
                        onChange={(e) => setDirectTitle(e.target.value)}
                        placeholder="e.g. National Accounts Statistics 2026 Manual"
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-hidden text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 text-xs">
                          Domain
                        </label>
                        <select
                          value={directDomain}
                          onChange={(e) => setDirectDomain(e.target.value)}
                          className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-hidden text-xs"
                        >
                          {DOMAINS.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 text-xs">
                          Topic
                        </label>
                        <input
                          type="text"
                          value={directTopic}
                          onChange={(e) => setDirectTopic(e.target.value)}
                          placeholder="e.g. Deflators & Index Numbers"
                          className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-hidden text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Repository Document Selector */}
                {mcqSourceMode === "repository" && (
                  <div className="space-y-3">
                    <label className="font-bold text-slate-700 dark:text-slate-300 block text-xs">
                      Select Repository Document ({materials.length} available)
                    </label>
                    {materials.length === 0 ? (
                      <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200">
                        No materials in repository. Switch to "Upload File" above for direct question generation.
                      </div>
                    ) : (
                      <select
                        value={selectedMaterial?._id || ""}
                        onChange={(e) => {
                          const found = materials.find((m) => m._id === e.target.value);
                          setSelectedMaterial(found || null);
                        }}
                        className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-hidden text-xs font-semibold"
                      >
                        <option value="">-- Choose a document from repository --</option>
                        {materials.map((mat) => (
                          <option key={mat._id} value={mat._id}>
                            [{mat.domain.split(" ")[0]}] {mat.title} ({mat.topic})
                          </option>
                        ))}
                      </select>
                    )}

                    {selectedMaterial && (
                      <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-emerald-900 dark:text-emerald-200">Active Document:</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-200/80 dark:bg-emerald-800 font-extrabold text-emerald-900 dark:text-emerald-100 uppercase">
                            {selectedMaterial.fileType}
                          </span>
                        </div>
                        <p className="font-bold text-slate-900 dark:text-white">{selectedMaterial.title}</p>
                        <p className="text-[11px] text-slate-500">
                          Domain: {selectedMaterial.domain} • Topic: {selectedMaterial.topic}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Scope & Difficulty */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-700/60 pb-2">
                    <span className="font-black text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                      <BsLightningChargeFill className="text-amber-500" />
                      <span>Step 2: Generation Scope & Rigor</span>
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                      AI Tuned
                    </span>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 text-[11px]">
                      Coverage Scope
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setMcqMode("all");
                          setNumQuestions("all");
                        }}
                        className={`p-2 rounded-xl border text-left cursor-pointer transition-all ${mcqMode === "all"
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                            : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                          }`}
                      >
                        <span className="font-bold text-xs block">🌟 All Possible MCQs</span>
                        <span
                          className={`text-[9px] block mt-0.5 ${mcqMode === "all" ? "text-emerald-100" : "text-slate-400"
                            }`}
                        >
                          100% full coverage of all sections
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setMcqMode("custom");
                          if (numQuestions === "all") setNumQuestions(10);
                        }}
                        className={`p-2 rounded-xl border text-left cursor-pointer transition-all ${mcqMode === "custom"
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                            : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                          }`}
                      >
                        <span className="font-bold text-xs block">🎯 Fixed Count</span>
                        <span
                          className={`text-[9px] block mt-0.5 ${mcqMode === "custom" ? "text-emerald-100" : "text-slate-400"
                            }`}
                        >
                          Target 5, 10, 15, 20, 30 MCQs
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    {mcqMode === "custom" ? (
                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 text-[11px]">
                          Target Count
                        </label>
                        <select
                          value={numQuestions}
                          onChange={(e) => setNumQuestions(Number(e.target.value))}
                          className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-hidden text-xs font-semibold"
                        >
                          <option value={5}>5 Questions (Rapid Quiz)</option>
                          <option value={10}>10 Questions (Standard)</option>
                          <option value={15}>15 Questions (Thorough)</option>
                          <option value={20}>20 Questions (In-Depth)</option>
                          <option value={30}>30 Questions (Mastery)</option>
                        </select>
                      </div>
                    ) : (
                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 text-[11px]">
                          Extraction Depth
                        </label>
                        <div className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-1.5">
                          <BsLightningChargeFill size={11} className="text-amber-500 shrink-0" />
                          <span>Max 100% Comprehensive</span>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 text-[11px]">
                        Difficulty Rigor
                      </label>
                      <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                        className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-hidden text-xs font-semibold"
                      >
                        <option value="Easy">Easy (Foundational Concepts)</option>
                        <option value="Medium">Medium (Methodological/Analytical)</option>
                        <option value="Hard">Hard (Cadre Exam Rigor)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  type="button"
                  onClick={
                    mcqSourceMode === "repository"
                      ? () => handleGenerateFromExisting()
                      : handleDirectFileMcqGenerate
                  }
                  disabled={
                    genLoading ||
                    (mcqSourceMode === "repository" && !selectedMaterial) ||
                    (mcqSourceMode === "direct" && !directFile && !directTitle)
                  }
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {genLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Synthesizing Document & Authoring MCQs...</span>
                    </span>
                  ) : (
                    <>
                      <BsStars size={15} className="text-amber-300" />
                      <span>Generate {mcqMode === "all" ? "All Possible MCQs" : `${numQuestions} Questions`}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Right Column: Question Bank Display */}
              <div className="lg:col-span-7 space-y-6">
                {generatedMcqs.length > 0 ? (
                  <div className="bg-white dark:bg-slate-900 border-2 border-emerald-400/80 dark:border-emerald-600/60 rounded-3xl p-6 sm:p-7 shadow-xl space-y-5 animate-fadeIn">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                          <h3 className="font-black text-base text-slate-900 dark:text-white">
                            AI Generated Question Bank ({generatedMcqs.length} Questions)
                          </h3>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Source: <strong>{selectedMaterial?.title || directTitle || "Analyzed Material"}</strong>
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={handleCopyAll}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                          title="Copy all questions and answers"
                        >
                          {copied ? <FaCheck className="text-emerald-500" /> : <FaCopy />}
                          <span>{copied ? "Copied!" : "Copy Q&A"}</span>
                        </button>

                        {activeQuiz && (
                          <button
                            onClick={() => navigate(`/quiz/${activeQuiz._id}`)}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md flex items-center gap-2 transition cursor-pointer"
                          >
                            <FaPlay size={10} />
                            <span>Take in Timed Quiz Mode</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
                      {generatedMcqs.map((q, idx) => (
                        <div
                          key={idx}
                          className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3 shadow-xs hover:border-emerald-300 transition-all"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-snug flex-1">
                              <span className="inline-block w-6 text-emerald-600 dark:text-emerald-400 font-extrabold">
                                {idx + 1}.
                              </span>
                              {q.question}
                            </p>
                            <div className="flex items-center gap-1.5">
                              {q.sourceReference && (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                                  📍 {q.sourceReference}
                                </span>
                              )}
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${q.difficulty === "Easy"
                                    ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700"
                                    : q.difficulty === "Hard"
                                      ? "bg-rose-100 dark:bg-rose-950 text-rose-700"
                                      : "bg-amber-100 dark:bg-amber-950 text-amber-700"
                                  }`}
                              >
                                {q.difficulty || "Medium"}
                              </span>
                            </div>
                          </div>

                          {/* Options */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                            {(q.options || []).map((opt, oIdx) => {
                              const isCorrect =
                                opt.startsWith(q.correctAnswer) ||
                                (q.correctAnswer && opt.toLowerCase().includes(`(${q.correctAnswer.toLowerCase()})`));

                              return (
                                <div
                                  key={oIdx}
                                  className={`p-2.5 rounded-xl border flex items-center justify-between ${isCorrect
                                      ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-bold border-emerald-300 dark:border-emerald-700 shadow-xs"
                                      : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800"
                                    }`}
                                >
                                  <span>{opt}</span>
                                  {isCorrect && (
                                    <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-extrabold text-[10px] uppercase tracking-wider shrink-0 ml-2">
                                      Correct ✓
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* Rationale */}
                          <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                            <strong className="text-blue-700 dark:text-blue-300 flex items-center gap-1.5 mb-1">
                              <FaInfoCircle size={11} />
                              <span>Official Pedagogical Rationale:</span>
                            </strong>
                            {q.explanation}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-10 shadow-xs text-center space-y-6">
                    <div className="w-18 h-18 rounded-3xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center border border-emerald-400/30">
                      <BsStars size={34} />
                    </div>

                    <div className="max-w-md mx-auto space-y-2">
                      <h3 className="text-lg font-black text-slate-900 dark:text-white">
                        AI Question Bank Workspace Ready
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        Upload a PowerPoint presentation, PDF manual, or select an existing document from the repository to generate exhaustive cadre diagnostic questions.
                      </p>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-3 text-left pt-2">
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-1.5">
                        <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                          1
                        </span>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white">Slide Semantic Scan</h4>
                        <p className="text-[10px] text-slate-400">
                          Neural parser extracts formulas, sampling frames, definitions, and survey rules.
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-1.5">
                        <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                          2
                        </span>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white">Exhaustive Q&A</h4>
                        <p className="text-[10px] text-slate-400">
                          Authors 4-option MCQs with precise distractors and verifiable official rationales.
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-1.5">
                        <span className="w-6 h-6 rounded-lg bg-purple-600 text-white font-black text-xs flex items-center justify-center">
                          3
                        </span>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white">Timed Cadre Quiz</h4>
                        <p className="text-[10px] text-slate-400">
                          Interactive timed test linked directly to your 4-Domain Competency score.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">{previewFile.title}</h3>
              <button
                onClick={() => setPreviewFile(null)}
                className="text-slate-400 hover:text-white text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="max-h-[70vh] overflow-auto flex items-center justify-center">
              {previewFile.url?.startsWith("data:image/") ? (
                <img src={previewFile.url} alt={previewFile.title} className="max-w-full rounded-xl object-contain" />
              ) : (
                <div className="p-8 text-center space-y-3">
                  <FaFilePdf size={48} className="mx-auto text-rose-500" />
                  <p className="text-xs text-slate-400">Document / Presentation File</p>
                  <a
                    href={previewFile.url}
                    download={previewFile.title || "document"}
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs inline-block"
                  >
                    Download File
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default MaterialsUpload;
