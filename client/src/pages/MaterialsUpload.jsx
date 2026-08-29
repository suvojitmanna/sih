import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ServerUrl } from "../App";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  FaFileUpload,
  FaFilePdf,
  FaFileAlt,
  FaTasks,
  FaCheckCircle,
  FaClock,
  FaPlay,
  FaListAlt,
  FaHandSparkles,
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";
import { BsShieldCheck } from "react-icons/bs";

const DOMAINS = [
  "Statistical Competencies",
  "Technical & Computational Competencies",
  "Digital Governance & Security",
  "Behavioural & Managerial Competencies",
];

const MaterialsUpload = () => {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState([]);
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

  const fetchMaterials = async () => {
    try {
      const { data } = await axios.get(`${ServerUrl}/api/materials/list`, {
        withCredentials: true,
      });
      if (data.success) {
        setMaterials(data.materials || []);
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
        "Please select a training manual, document, or PDF to upload.",
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
        setSelectedFile(null);
        setTitle("");
        fetchMaterials();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to upload material.",
      );
    } finally {
      setUploading(false);
    }
  };

  const handleGenerateMcqs = async (mat) => {
    const targetMat = mat || selectedMaterial;
    if (!targetMat) return;

    setGenLoading(true);
    try {
      const { data } = await axios.post(
        `${ServerUrl}/api/materials/${targetMat._id}/generate-mcqs`,
        { numQuestions, difficulty },
        { withCredentials: true },
      );

      if (data.success) {
        toast.success(
          `Generated ${data.mcqs.length} MCQs! Assessment ready. 🚀`,
        );
        setGeneratedMcqs(data.mcqs);
        fetchMaterials();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to generate MCQs from document.",
      );
    } finally {
      setGenLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-8">
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-2">
            <BsShieldCheck size={13} />
            <span>NSSTA AI Question Authoring Studio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Upload Learning Materials & Generate AI MCQs
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Upload official survey manuals, circulars, or methodology documents
            (PDF/TXT) to automatically generate structured 4-option MCQs with
            official explanations using SankhyaIQ™ AI Neural Engine.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Upload Form */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FaFileUpload className="text-blue-600" />
                <span>Upload Training Document</span>
              </h2>

              <form onSubmit={handleUpload} className="space-y-4">
                {/* File Dropzone */}
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 rounded-2xl p-6 text-center transition-all bg-slate-50/50 dark:bg-slate-800/40 cursor-pointer relative">
                  <input
                    type="file"
                    accept=".pdf,.txt,.docx"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
                      <FaFilePdf size={22} />
                    </div>
                    {selectedFile ? (
                      <div>
                        <span className="font-bold text-xs text-blue-600 dark:text-blue-400 block truncate max-w-[200px]">
                          {selectedFile.name}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </span>
                      </div>
                    ) : (
                      <div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          Click to select or drop document
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Supports PDF, DOCX, TXT (Max 15MB)
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Document Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. NSS 78th Round Survey Manual"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Competency Domain
                  </label>
                  <select
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:border-blue-500"
                  >
                    {DOMAINS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Statistical Topic
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sampling & Listing Methodology"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={uploading || !selectedFile}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {uploading ? (
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <FaFileUpload size={13} />
                      <span>Upload & Extract Text</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Uploaded Repository & Generated MCQs View */}
          <div className="lg:col-span-7 space-y-6">
            {/* Generated MCQs Display if active */}
            {generatedMcqs.length > 0 && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-blue-950 border-2 border-blue-200 dark:border-blue-800 rounded-3xl p-6 shadow-md space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-bold text-sm">
                    <FaHandSparkles className="text-amber-400" />
                    <span>
                      Generated MCQs Preview ({generatedMcqs.length} Questions)
                    </span>
                  </div>
                  <button
                    onClick={() => navigate("/quizzes")}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <span>Go to Quiz Hub</span>
                  </button>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {generatedMcqs.map((q, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-xs"
                    >
                      <h4 className="font-bold text-slate-900 dark:text-white leading-snug">
                        {idx + 1}. {q.question}
                      </h4>

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
                          <FaFilePdf size={18} />
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
      <Footer />
    </div>
  );
};

export default MaterialsUpload;
