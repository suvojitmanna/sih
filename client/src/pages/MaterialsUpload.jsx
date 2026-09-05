import React, { useEffect, useState } from "react";
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
  FaTasks,
  FaCheckCircle,
  FaClock,
  FaPlay,
  FaListAlt,
  FaHandSparkles,
  FaPaperPlane,
  FaBookOpen,
  FaHourglassHalf,
  FaDownload,
  FaExternalLinkAlt,
  FaEye,
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";
import { BsShieldCheck, BsFillSendFill } from "react-icons/bs";

const DOMAINS = [
  "Statistical Competencies",
  "Technical & Computational Competencies",
  "Digital Governance & Security",
  "Behavioural & Managerial Competencies",
];

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

  // MCQ Gen config
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState("Medium");

  // Study Material Request Modal
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestForm, setRequestForm] = useState({
    topic: "",
    domain: DOMAINS[0],
    description: "",
    urgency: "Normal",
  });
  const [requestAttachment, setRequestAttachment] = useState(null);
  const [requestSubmitting, setRequestSubmitting] = useState(false);

  // Preview Modal state
  const [previewFile, setPreviewFile] = useState(null);

  const fetchMaterials = async () => {
    try {
      const [matRes, reqRes] = await Promise.all([
        axios.get(`${ServerUrl}/api/materials/list`, { withCredentials: true }),
        axios.get(`${ServerUrl}/api/materials/my-requests`, { withCredentials: true }),
      ]);

      if (matRes.data.success) {
        setMaterials(matRes.data.materials || []);
      }
      if (reqRes.data.success) {
        setMyRequests(reqRes.data.requests || []);
      }
    } catch (error) {
      console.error("Fetch materials error:", error);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error(
        "Please select a training manual, image, document, or PDF to upload.",
      );
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("title", title);
    formData.append("domain", domain);
    formData.append("topic", topic);

    try {
      const { data } = await axios.post(
        `${ServerUrl}/api/materials/upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        },
      );

      if (data.success) {
        toast.success("Learning material uploaded & extracted! ✨");
        setSelectedMaterial(data.material);
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

  const handleGenerateMcqs = async (material) => {
    setSelectedMaterial(material);
    setGenLoading(true);
    try {
      const { data } = await axios.post(
        `${ServerUrl}/api/materials/${material._id}/generate-mcqs`,
        {
          numQuestions,
          difficulty,
        },
        { withCredentials: true },
      );

      if (data.success) {
        setGeneratedMcqs(data.mcqs || []);
        toast.success(`Generated ${data.mcqs.length} Official MCQs with Rationale! 🎉`);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to generate questions",
      );
    } finally {
      setGenLoading(false);
    }
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

      const { data } = await axios.post(
        `${ServerUrl}/api/materials/request`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );
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

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-6">
        {/* Back Navigation Bar */}
        <div className="flex items-center justify-between">
          <BackButton fallbackUrl="/ai-models" label="Back to AI Models" />
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Document & MCQ Studio
          </span>
        </div>

        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold uppercase tracking-wider mb-2">
              <BsShieldCheck size={13} />
              <span>SankhyaIQ™ AI Neural Document & Media Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Learning Materials, Guidelines & Diagnostic Engine
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Upload official MoSPI manuals, statistical charts, and reports. Request custom study guidelines from the NSSTA Academy Secretariat.
            </p>
          </div>

          <button
            onClick={() => setShowRequestModal(true)}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer w-fit"
          >
            <FaBookOpen size={13} />
            <span>Request Study Material from NSSTA</span>
          </button>
        </div>

        {/* ========================================================== */}
        {/* SECTION: OFFICER MATERIAL REQUESTS & ACADEMY DISPATCHES */}
        {/* ========================================================== */}
        {myRequests.length > 0 && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <FaBookOpen className="text-amber-500" />
              <span>My Study Material Requests & Academy Dispatches</span>
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              {myRequests.map((req) => (
                <div
                  key={req._id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {req.topic}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                        req.status === "fulfilled"
                          ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 border border-emerald-200 dark:border-emerald-800"
                          : "bg-amber-50 dark:bg-amber-950 text-amber-600 border border-amber-200 dark:border-amber-800"
                      }`}
                    >
                      {req.status === "fulfilled" ? "Dispatched by NSSTA" : "Pending Secretariat"}
                    </span>
                  </div>

                  <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                    {req.description}
                  </p>

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
                    <div className="p-3.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2 text-xs">
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

                      {/* Render Dispatched File/Image if present */}
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

                          {req.dispatchedFileData.startsWith("data:image/") && (
                            <button
                              onClick={() => setPreviewFile({ url: req.dispatchedFileData, title: req.dispatchedFileName || req.dispatchedMaterialTitle })}
                              className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-[11px] inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <FaEye size={10} />
                              <span>View Image</span>
                            </button>
                          )}
                        </div>
                      )}

                      {req.dispatchedMaterialText && (
                        <p className="text-slate-700 dark:text-slate-300 text-[11px] whitespace-pre-wrap leading-relaxed">
                          {req.dispatchedMaterialText}
                        </p>
                      )}
                      {req.adminResponseNote && (
                        <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
                          <strong>Secretariat Note:</strong> {req.adminResponseNote}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Left Form */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FaFileUpload className="text-blue-600" />
              <span>Upload Training Manual / Document</span>
            </h2>

            <form onSubmit={handleUpload} className="space-y-4 text-xs">
              {/* File Drop Area */}
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-center hover:border-blue-500 transition-colors bg-slate-50/50 dark:bg-slate-800/50">
                <input
                  type="file"
                  id="material-file"
                  accept=".pdf,.txt,.docx,.doc,.jpg,.jpeg,.png,.webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="material-file"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
                    {selectedFile && selectedFile.type?.startsWith("image/") ? (
                      <FaFileImage size={24} />
                    ) : (
                      <FaFilePdf size={24} />
                    )}
                  </div>
                  <span className="font-bold text-slate-700 dark:text-slate-300 text-xs">
                    {selectedFile
                      ? selectedFile.name
                      : "Click to browse official files or images"}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Supports PDF, DOCX, TXT, PNG, JPG (Max 25MB)
                  </span>
                </label>
              </div>

              {/* Title */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. National Sample Survey 79th Round Manual"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Domain & Topic */}
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
                    placeholder="e.g. Price Indices"
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-hidden"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {uploading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <FaFileUpload size={13} />
                    <span>Upload & Process Document</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Section: MCQ Generator & Library */}
          <div className="lg:col-span-7 space-y-6">
            {/* Generated MCQs Display */}
            {generatedMcqs.length > 0 && (
              <div className="bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/60 rounded-3xl p-6 shadow-md space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      AI Generated Diagnostic MCQs ({generatedMcqs.length})
                    </h3>
                  </div>
                  <button
                    onClick={() => navigate("/quizzes")}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-xs hover:bg-emerald-700 transition cursor-pointer"
                  >
                    Take in Quiz Mode
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  {generatedMcqs.map((q, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-2"
                    >
                      <p className="font-bold text-slate-900 dark:text-white">
                        {idx + 1}. {q.question}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-slate-600 dark:text-slate-300 pl-2">
                        {q.options.map((opt, oIdx) => (
                          <div
                            key={oIdx}
                            className={`p-2 rounded-lg ${
                              opt.startsWith(q.correctAnswer)
                                ? "bg-emerald-50 text-emerald-800 font-bold border border-emerald-200"
                                : "bg-slate-50 dark:bg-slate-800"
                            }`}
                          >
                            {opt}
                          </div>
                        ))}
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-[11px] text-slate-500 dark:text-slate-400">
                        <strong>Rationale:</strong> {q.explanation}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Uploaded Materials List */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FaListAlt className="text-blue-600" />
                <span>Uploaded Learning Materials Repository</span>
              </h2>

              {materials.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <FaFileAlt size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-xs">No learning materials uploaded yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {materials.map((mat) => (
                    <div
                      key={mat._id}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-blue-400 transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 mt-0.5">
                          {mat.fileType?.includes("image") || ["png", "jpg", "jpeg", "webp"].includes(mat.fileType) ? (
                            <FaFileImage size={18} />
                          ) : (
                            <FaFilePdf size={18} />
                          )}
                        </div>
                        <div>
                          <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-full uppercase">
                            {mat.domain}
                          </span>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1">
                            {mat.title}
                          </h4>
                          <p className="text-xs text-slate-500">
                            Topic: {mat.topic} •{" "}
                            {Math.round((mat.fileSize || 50000) / 1024)} KB
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        {mat.fileData && (
                          <a
                            href={mat.fileData}
                            download={mat.originalName || "study-material"}
                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold transition"
                            title="Download Material"
                          >
                            <FaDownload size={12} />
                          </a>
                        )}

                        <button
                          onClick={() => handleGenerateMcqs(mat)}
                          disabled={genLoading}
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <FaHandSparkles
                            size={11}
                            className="text-amber-300"
                          />
                          <span>Generate MCQs</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ========================================================== */}
      {/* MODAL: REQUEST STUDY MATERIAL FROM NSSTA */}
      {/* ========================================================== */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Request Study Material / Guideline
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
                  Attach Reference Image or File (Optional)
                </label>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.docx,.txt"
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

      {/* ========================================================== */}
      {/* MODAL: IMAGE / FILE PREVIEW */}
      {/* ========================================================== */}
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
                  <p className="text-xs text-slate-400">PDF / Document File</p>
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
