import React, { useEffect, useState, useRef } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BackButton from "../components/BackButton";
import { ServerUrl } from "../App";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
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
} from "react-icons/fa";
import { BsShieldCheck, BsFillSendFill, BsStars, BsLightningChargeFill } from "react-icons/bs";

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

const MaterialsUpload = () => {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [title, setTitle] = useState("");
  const [domain, setDomain] = useState(DOMAINS[0]);
  const [topic, setTopic] = useState("Survey Methodologies");
  const [uploading, setUploading] = useState(false);
  const [genLoading, setGenLoading] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [generatedMcqs, setGeneratedMcqs] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null);

  const [mcqMode, setMcqMode] = useState("all");
  const [numQuestions, setNumQuestions] = useState("all");
  const [difficulty, setDifficulty] = useState("Medium");
  const [autoGenerateOnUpload, setAutoGenerateOnUpload] = useState(true);
  const [copied, setCopied] = useState(false);

  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showGenModalForMat, setShowGenModalForMat] = useState(null);
  const [requestForm, setRequestForm] = useState({
    topic: "",
    domain: DOMAINS[0],
    description: "",
    urgency: "Normal",
  });
  const [requestAttachment, setRequestAttachment] = useState(null);
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);

  const prevMaterialsCountRef = useRef(null);
  const prevFulfilledCountRef = useRef(null);
  const prevRequestsCountRef = useRef(null);

  const fetchMaterials = async (isBackground = false) => {
    try {
      const [matRes, reqRes] = await Promise.all([
        axios.get(`${ServerUrl}/api/materials/list`, { withCredentials: true }),
        axios.get(`${ServerUrl}/api/materials/my-requests`, { withCredentials: true }),
      ]);

      if (matRes.data.success) {
        const mats = matRes.data.materials || [];
        setMaterials(mats);
        if (
          isBackground &&
          prevMaterialsCountRef.current !== null &&
          mats.length > prevMaterialsCountRef.current
        ) {
          toast("📚 New study material available in repository!", {
            icon: "📚",
            duration: 5000,
          });
        }
        prevMaterialsCountRef.current = mats.length;
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
        prevRequestsCountRef.current = reqs.length;
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
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!title) {
        const cleanName = file.name
          .replace(/\.[^/.]+$/, "")
          .replace(/[-_]+/g, " ")
          .trim();
        setTitle(cleanName);
      }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("Please select a file to upload (PDF, PPT/PPTX, DOCX, TXT, CSV, or Image).");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("title", title);
    formData.append("domain", domain);
    formData.append("topic", topic);
    formData.append("autoGenerateMcqs", autoGenerateOnUpload ? "true" : "false");
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
          toast.success(`🎉 Uploaded & Generated ${data.mcqs.length} All-Possible MCQs covering entire file!`);
        } else {
          toast.success("Learning material uploaded & extracted successfully! ✨");
          setSelectedMaterial(data.material);
        }
        setTitle("");
        setSelectedFile(null);
        fetchMaterials();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to upload material");
    } finally {
      setUploading(false);
    }
  };

  const handleGenerateMcqs = async (material, customCount = null, customDiff = null) => {
    setSelectedMaterial(material);
    setGenLoading(true);
    const finalCount = customCount !== null ? customCount : (mcqMode === "all" ? "all" : numQuestions);
    const finalDiff = customDiff || difficulty;

    try {
      const { data } = await axios.post(
        `${ServerUrl}/api/materials/${material._id}/generate-mcqs`,
        {
          numQuestions: finalCount,
          difficulty: finalDiff,
          mode: finalCount === "all" ? "all" : "fixed",
        },
        { withCredentials: true }
      );

      if (data.success) {
        setGeneratedMcqs(data.mcqs || []);
        if (data.quiz) setActiveQuiz(data.quiz);
        toast.success(`Generated ${data.mcqs.length} Comprehensive MCQs with Pedagogical Rationale! 🎉`);
        setShowGenModalForMat(null);
        fetchMaterials();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to generate questions");
    } finally {
      setGenLoading(false);
    }
  };

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

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    if (!requestForm.topic || !requestForm.description) {
      toast.error("Please fill in topic and detailed requirement.");
      return;
    }
    setRequestSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("topic", requestForm.topic);
      formData.append("domain", requestForm.domain);
      formData.append("description", requestForm.description);
      formData.append("urgency", requestForm.urgency);
      if (requestAttachment) {
        formData.append("file", requestAttachment);
      }

      const { data } = await axios.post(`${ServerUrl}/api/materials/request`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      if (data.success) {
        toast.success("Study material request submitted to NSSTA Secretariat! 📄✨");
        setShowRequestModal(false);
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-19 pb-16 space-y-4">

        <div className="flex items-center justify-between">
          <BackButton fallbackUrl="/ai-models" label="Back to AI Models" />
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Document & MCQ Studio
          </span>
        </div>
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold uppercase tracking-wider mb-2">
              <BsShieldCheck size={13} />
              <span>SankhyaIQ™ AI Neural Document & Presentation Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Learning Materials, Presentation & Diagnostic MCQ Studio
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Upload PowerPoint slides (.ppt, .pptx), PDF manuals, Word documents (.docx), or images. Our AI neural engine extracts all content across every slide and generates <strong>all possible comprehensive questions, answers, and pedagogical rationales</strong>.
            </p>
          </div>

          <button
            onClick={() => setShowRequestModal(true)}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer w-fit"
          >
            <FaBookOpen size={13} />
            <span>Request Material from NSSTA</span>
          </button>
        </div>

        {myRequests.length > 0 && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <FaBookOpen className="text-amber-500" />
              <span>My Study Material Requests & Academy Dispatches</span>
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              {myRequests.map((req) => {
                const isFulfilled = req.status === "fulfilled" || !!req.fulfilledAt || !!req.completedAt;
                const isRejected = req.status === "rejected";
                const completedTime = req.completedAt || req.fulfilledAt || (isFulfilled ? req.updatedAt : null);

                return (
                  <div
                    key={req._id}
                    className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3 shadow-xs hover:border-blue-400/60 transition-all"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 dark:border-slate-700/60 pb-2.5">
                      <div>
                        <span className="font-black text-xs text-slate-900 dark:text-white block">
                          {req.topic}
                        </span>
                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                          {req.domain}
                        </span>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${isFulfilled
                            ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 border border-emerald-200 dark:border-emerald-800"
                            : isRejected
                              ? "bg-rose-50 dark:bg-rose-950 text-rose-600 border border-rose-200 dark:border-rose-800"
                              : "bg-amber-50 dark:bg-amber-950 text-amber-600 border border-amber-200 dark:border-amber-800"
                          }`}
                      >
                        {isFulfilled ? "Dispatched by NSSTA" : isRejected ? "Closed / Rejected" : "Pending Secretariat"}
                      </span>
                    </div>

                    <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                      {req.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px]">
                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 bg-white/70 dark:bg-slate-900/60 px-2.5 py-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                        <FaCalendarAlt size={10} className="text-blue-500" />
                        <span><strong>Requested:</strong> {formatDateTime(req.createdAt) || "Recorded"}</span>
                      </div>

                      {completedTime && (
                        <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/60 px-2.5 py-1 rounded-xl border border-emerald-200/80 dark:border-emerald-800/80 font-semibold">
                          <FaCheckCircle size={11} className="text-emerald-500" />
                          <span><strong>Completed:</strong> {formatDateTime(completedTime)}</span>
                        </div>
                      )}
                    </div>

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

                    {req.dispatchedMaterialTitle && (
                      <div className="p-3.5 rounded-2xl bg-emerald-50/90 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-emerald-900 dark:text-emerald-300">
                            📄 {req.dispatchedMaterialTitle}
                          </span>
                          {req.dispatchedMaterialUrl && (
                            <a
                              href={req.dispatchedMaterialUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 dark:text-blue-400 font-bold hover:underline inline-flex items-center gap-1"
                            >
                              <span>Link</span>
                              <FaExternalLinkAlt size={10} />
                            </a>
                          )}
                        </div>

                        {req.dispatchedFileData && (
                          <div className="pt-1 flex items-center gap-2">
                            <a
                              href={req.dispatchedFileData}
                              download={req.dispatchedFileName || "official-study-material"}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] inline-flex items-center gap-1.5 shadow-xs transition"
                            >
                              <FaDownload size={10} />
                              <span>Download {req.dispatchedFileName || "Dispatched File"}</span>
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Main Grid: Upload & Studio */}
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FaFileUpload className="text-blue-600" />
                <span>Upload Document & Generate MCQs</span>
              </h2>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                AI Auto-Extraction
              </span>
            </div>

            <form onSubmit={handleUpload} className="space-y-4 text-xs">
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-5 text-center hover:border-blue-500 transition-colors bg-slate-50/70 dark:bg-slate-800/40 group cursor-pointer">
                <input
                  type="file"
                  id="material-file"
                  accept=".pdf,.ppt,.pptx,.docx,.doc,.txt,.csv,.tsv,.md,.odp,.odt,.json,.jpg,.jpeg,.png,.webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="material-file" className="cursor-pointer flex flex-col items-center gap-2.5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                    {selectedFile ? (
                      getFileBadge("", selectedFile.name).icon
                    ) : (
                      <FaFileUpload size={22} />
                    )}
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-xs block">
                      {selectedFile ? selectedFile.name : "Click to select PDF, PPT/PPTX, DOCX, or Image"}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {selectedFile
                        ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for Extraction`
                        : "Supports PowerPoint (.ppt, .pptx), PDF, Word (.docx), TXT, CSV, Images (Max 25MB)"}
                    </span>
                  </div>
                </label>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Document / Presentation Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Sampling Methodologies & Estimation Lecture"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Domain
                  </label>
                  <select
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-hidden"
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
                    Topic
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Sampling Frames"
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-hidden"
                  >
                  </input>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs text-blue-950 dark:text-blue-200 flex items-center gap-1.5">
                    <BsStars className="text-amber-500" />
                    <span>MCQ Generation Engine Settings</span>
                  </span>
                  <span className="text-[10px] text-blue-700 dark:text-blue-300 font-bold bg-blue-100 dark:bg-blue-900/70 px-2 py-0.5 rounded-md">
                    Full Coverage
                  </span>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 text-[11px]">
                    Generation Scope
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMcqMode("all");
                        setNumQuestions("all");
                      }}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${mcqMode === "all"
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                          : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                        }`}
                    >
                      <span className="font-bold text-xs block">🌟 All Possible Questions</span>
                      <span className={`text-[10px] block mt-0.5 ${mcqMode === "all" ? "text-blue-100" : "text-slate-400"}`}>
                        Exhaustive coverage of every slide & section
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setMcqMode("custom");
                        if (numQuestions === "all") setNumQuestions(10);
                      }}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${mcqMode === "custom"
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                          : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                        }`}
                    >
                      <span className="font-bold text-xs block">🎯 Fixed Question Count</span>
                      <span className={`text-[10px] block mt-0.5 ${mcqMode === "custom" ? "text-blue-100" : "text-slate-400"}`}>
                        Choose 5, 10, 20, or 30 MCQs
                      </span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  {mcqMode === "custom" ? (
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 text-[11px]">
                        Target Question Count
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
                        Coverage Strategy
                      </label>
                      <div className="p-2.5 bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-[11px] text-blue-700 dark:text-blue-300 font-semibold flex items-center gap-1.5">
                        <BsLightningChargeFill size={11} className="text-amber-500 shrink-0" />
                        <span>Max Extraction (100% of Document)</span>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 text-[11px]">
                      Difficulty Level
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

                {/* Auto-generate on upload checkbox */}
                <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={autoGenerateOnUpload}
                    onChange={(e) => setAutoGenerateOnUpload(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-600 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Auto-generate All Possible MCQs immediately on upload
                  </span>
                </label>
              </div>

              {/* Submit Upload Button */}
              <button
                type="submit"
                disabled={uploading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {uploading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Extracting Full Content & Generating All MCQs...</span>
                  </span>
                ) : (
                  <>
                    <BsLightningChargeFill size={13} className="text-amber-300" />
                    <span>Upload & Generate All Possible Questions</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Column: Generated MCQs & Materials Repository */}
          <div className="lg:col-span-7 space-y-6">
            {/* Generated MCQs Display Box */}
            {generatedMcqs.length > 0 && (
              <div className="bg-white dark:bg-slate-900 border-2 border-emerald-400/80 dark:border-emerald-600/60 rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
                {/* Header of MCQs */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                      <h3 className="font-black text-base text-slate-900 dark:text-white">
                        AI Generated Question Bank ({generatedMcqs.length} Questions)
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Source: <strong>{selectedMaterial?.title || "Uploaded Material"}</strong> • Exhaustive Coverage
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

                {/* Question List */}
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                  {generatedMcqs.map((q, idx) => {
                    return (
                      <div
                        key={idx}
                        className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3 shadow-xs hover:border-emerald-300 transition-all"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-snug flex-1">
                            <span className="inline-block w-6 text-blue-600 dark:text-blue-400 font-extrabold">
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

                        {/* Pedagogical Rationale */}
                        <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                          <strong className="text-blue-700 dark:text-blue-300 flex items-center gap-1.5 mb-1">
                            <FaInfoCircle size={11} />
                            <span>Official Pedagogical Rationale:</span>
                          </strong>
                          {q.explanation}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Repository List */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FaListAlt className="text-blue-600" />
                  <span>Uploaded Learning Materials & Presentations</span>
                </h2>
                <span className="text-xs font-bold text-slate-400">
                  {materials.length} Documents
                </span>
              </div>

              {!materials || materials.length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <FaFileAlt size={36} className="mx-auto opacity-40" />
                  <p className="text-xs font-bold">No learning materials uploaded yet.</p>
                  <p className="text-[11px] text-slate-400">
                    Upload PowerPoint presentations, PDF manuals, Word documents, or images on the left.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {materials.map((mat) => {
                    const badge = getFileBadge(mat.fileType, mat.originalName);

                    return (
                      <div
                        key={mat._id}
                        className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-blue-400 transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-3 rounded-2xl border ${badge.color} mt-0.5 shrink-0`}>
                            {badge.icon}
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-full uppercase">
                                {mat.domain}
                              </span>
                              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full uppercase">
                                {badge.ext}
                              </span>
                              {mat.generatedMCQsCount > 0 && (
                                <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                                  ✓ {mat.generatedMCQsCount} MCQs Available
                                </span>
                              )}
                            </div>
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1">
                              {mat.title}
                            </h4>
                            <p className="text-xs text-slate-500">
                              Topic: {mat.topic} • {Math.round((mat.fileSize || 50000) / 1024)} KB
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          {mat.fileData && (
                            <a
                              href={mat.fileData}
                              download={mat.originalName || "study-material"}
                              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold transition"
                              title="Download Material"
                            >
                              <FaDownload size={12} />
                            </a>
                          )}

                          <button
                            onClick={() => handleGenerateMcqs(mat, "all", "Medium")}
                            disabled={genLoading}
                            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            {genLoading && selectedMaterial?._id === mat._id ? (
                              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <FaHandSparkles size={12} className="text-amber-300" />
                            )}
                            <span>Generate All MCQs</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Request Study Material Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Request Study Material / Presentation
                </h3>
                <p className="text-xs text-slate-500">
                  Submit a direct learning material requisition to the NSSTA Secretariat.
                </p>
              </div>
              <button
                onClick={() => setShowRequestModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRequestSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Requested Topic / Framework *
                </label>
                <input
                  type="text"
                  required
                  value={requestForm.topic}
                  onChange={(e) => setRequestForm({ ...requestForm, topic: e.target.value })}
                  placeholder="e.g. Periodic Labour Force Survey (PLFS) Weighting & Sampling Manual"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Competency Domain
                  </label>
                  <select
                    value={requestForm.domain}
                    onChange={(e) => setRequestForm({ ...requestForm, domain: e.target.value })}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-hidden"
                  >
                    {DOMAINS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Urgency
                  </label>
                  <select
                    value={requestForm.urgency}
                    onChange={(e) => setRequestForm({ ...requestForm, urgency: e.target.value })}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-hidden"
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High (Cadre Exam)</option>
                    <option value="Critical">Critical (Survey Launch)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Detailed Learning Requirement *
                </label>
                <textarea
                  rows={3}
                  required
                  value={requestForm.description}
                  onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })}
                  placeholder="Explain why you need this material and any specific formulas, methodologies, or survey rounds you want covered..."
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Attach Reference Image or Presentation (Optional)
                </label>
                <input
                  type="file"
                  accept=".pdf,.ppt,.pptx,.docx,.png,.jpg,.jpeg,.txt"
                  onChange={(e) => setRequestAttachment(e.target.files[0] || null)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:text-xs"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={requestSubmitting}
                  className="flex-1 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <BsFillSendFill size={11} />
                  <span>{requestSubmitting ? "Submitting..." : "Send Request to Admin"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* File Preview Modal */}
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
