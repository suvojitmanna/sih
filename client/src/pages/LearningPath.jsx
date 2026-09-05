import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BackButton from "../components/BackButton";
import { ServerUrl } from "../App";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FaCertificate,
  FaGraduationCap,
  FaExternalLinkAlt,
  FaCalendarAlt,
  FaCheckCircle,
  FaPlayCircle,
  FaSearch,
  FaMapMarkerAlt,
  FaAward,
} from "react-icons/fa";
import { BsShieldCheck, BsJournalBookmarkFill } from "react-icons/bs";
import { CardGridSkeleton } from "../components/SkeletonLoader";

const LearningPath = () => {
  const [activeTab, setActiveTab] = useState("personalized"); // "personalized" | "igot" | "tpac"
  const [profile, setProfile] = useState(null);
  const [igotCourses, setIgotCourses] = useState([]);
  const [tpacProgrammes, setTpacProgrammes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [domainFilter, setDomainFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchProfileAndCourses = async () => {
    try {
      const [profileRes, igotRes, tpacRes] = await Promise.all([
        axios.get(`${ServerUrl}/api/competencies/my-profile`, { withCredentials: true }),
        axios.get(`${ServerUrl}/api/igot/courses`, { withCredentials: true }),
        axios.get(`${ServerUrl}/api/tpac/programmes`, { withCredentials: true }),
      ]);

      if (profileRes.data.success) setProfile(profileRes.data.profile);
      if (igotRes.data.success) setIgotCourses(igotRes.data.courses || []);
      if (tpacRes.data.success) setTpacProgrammes(tpacRes.data.programmes || []);
    } catch (error) {
      console.error("Learning path fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndCourses();
  }, []);

  const handleUpdateStatus = async (stepIndex, status) => {
    try {
      const { data } = await axios.put(
        `${ServerUrl}/api/competencies/pathway-progress`,
        { stepIndex, status },
        { withCredentials: true }
      );
      if (data.success) {
        toast.success(data.message);
        fetchProfileAndCourses();
      }
    } catch (error) {
      toast.error("Failed to update status.");
    }
  };

  const handleRefreshPathway = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${ServerUrl}/api/competencies/generate-pathway`,
        {},
        { withCredentials: true }
      );
      if (data.success) {
        toast.success("Learning pathway refreshed using latest skill-gap analysis! ✨");
        fetchProfileAndCourses();
      }
    } catch (error) {
      toast.error("Failed to refresh pathway.");
    } finally {
      setLoading(false);
    }
  };

  const filteredIgot = igotCourses.filter((c) => {
    const matchesQuery =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.skillAddressed.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDomain = domainFilter ? c.domain.toLowerCase().includes(domainFilter.toLowerCase()) : true;
    return matchesQuery && matchesDomain;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-19 pb-16 space-y-3">
        {/* Back Navigation Bar */}
        <div className="flex items-center justify-between">
          <BackButton fallbackUrl="/ai-models" label="Back to AI Models" />
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Capacity Building Roadmaps
          </span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-2">
              <BsShieldCheck size={13} />
              <span>National Capacity Building</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Official Statistics Learning Pathways
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Curated training pathways combining iGOT Karmayogi digital courses & NSSTA in-service residential programmes.
            </p>
          </div>

          <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
            <button
              onClick={() => setActiveTab("personalized")}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === "personalized"
                  ? "bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              My Pathway
            </button>
            <button
              onClick={() => setActiveTab("igot")}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === "igot"
                  ? "bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              iGOT Karmayogi
            </button>
            <button
              onClick={() => setActiveTab("tpac")}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === "tpac"
                  ? "bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              NSSTA TPAC Calendar
            </button>
          </div>
        </div>

        {/* TAB 1: PERSONALIZED ROADMAP */}
        {activeTab === "personalized" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FaCertificate className="text-blue-600" />
                  <span>Your Sequential Capacity Roadmap</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Targeted sequence generated to bridge high & medium priority competency gaps for <strong>{profile?.jobRole || "ISS Officer"}</strong>.
                </p>
              </div>

              <button
                onClick={handleRefreshPathway}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold hover:bg-blue-100 transition-colors cursor-pointer"
              >
                Refresh Pathway
              </button>
            </div>

            {loading ? (
              <CardGridSkeleton count={4} />
            ) : (
              <div className="space-y-4">
                {(profile?.learningPath || []).map((step, idx) => (
                  <div
                    key={idx}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs hover:border-blue-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-700 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-md">
                        0{idx + 1}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 dark:bg-blue-950 px-2.5 py-0.5 rounded-full uppercase">
                            {step.provider || "iGOT Karmayogi"}
                          </span>
                          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded-full">
                            {step.priority} Priority
                          </span>
                          <span className="text-[11px] text-slate-400 font-semibold">
                            ⏱️ {step.duration || "14 Hours"}
                          </span>
                        </div>

                        <h4 className="text-base font-bold text-slate-900 dark:text-white">
                          {step.title}
                        </h4>

                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {step.rationale || `Designed to bridge competency in ${step.skillAddressed}.`}
                        </p>

                        <div className="pt-1 text-xs text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1.5">
                          <FaAward size={12} />
                          <span>Competency Target: {step.skillAddressed} (Level: {step.targetLevel || "Advanced"})</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                      {step.status === "completed" ? (
                        <span className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 font-bold text-xs">
                          <FaCheckCircle size={14} />
                          <span>Completed (+10 Credits)</span>
                        </span>
                      ) : step.status === "in-progress" ? (
                        <button
                          onClick={() => handleUpdateStatus(idx, "completed")}
                          className="px-4 py-2.5 rounded-2xl bg-blue-600 text-white font-bold text-xs hover:bg-emerald-600 transition-all flex items-center gap-2 cursor-pointer shadow-md"
                        >
                          <FaPlayCircle size={14} />
                          <span>In Progress (Mark Complete)</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateStatus(idx, "in-progress")}
                          className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs hover:bg-blue-600 hover:text-white transition-all cursor-pointer"
                        >
                          Start Learning
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: iGOT KARMAYOGI CATALOGUE */}
        {activeTab === "igot" && (
          <div className="space-y-6">
            {/* Search & Domain Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="relative flex-1">
                <FaSearch className="absolute left-3.5 top-3.5 text-slate-400" size={13} />
                <input
                  type="text"
                  placeholder="Search iGOT statistical courses, PLFS, CPI, National Accounts, Sampling..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-10 pr-4 py-2.5 text-xs focus:border-blue-500"
                />
              </div>

              <select
                value={domainFilter}
                onChange={(e) => setDomainFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs font-medium focus:border-blue-500"
              >
                <option value="">All Competency Domains</option>
                <option value="Statistical">Statistical Competencies</option>
                <option value="Technical">Technical & Computational</option>
                <option value="Digital Governance">Digital Governance & Security</option>
                <option value="Managerial">Behavioural & Managerial</option>
              </select>
            </div>

            {/* Course Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredIgot.map((course) => (
                <div
                  key={course.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs hover:shadow-md hover:border-blue-400 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2.5 py-0.5 rounded-full uppercase">
                        {course.provider}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        ⭐ {course.rating || 4.8}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                      {course.title}
                    </h4>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {course.description}
                    </p>

                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs space-y-1">
                      <div className="flex justify-between text-slate-600 dark:text-slate-300">
                        <span>Skill:</span>
                        <strong className="text-slate-800 dark:text-slate-100">{course.skillAddressed}</strong>
                      </div>
                      <div className="flex justify-between text-slate-600 dark:text-slate-300">
                        <span>Duration:</span>
                        <strong>{course.duration}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400">
                      Level: {course.level || "Intermediate"}
                    </span>
                    <a
                      href={course.url || "https://igotkarmayogi.gov.in"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <span>Open on iGOT</span>
                      <FaExternalLinkAlt size={10} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: NSSTA TPAC IN-SERVICE PROGRAMMES */}
        {activeTab === "tpac" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
                <BsJournalBookmarkFill className="text-blue-600" />
                <span>NSSTA TPAC Annual Training Calendar</span>
              </h3>
              <p className="text-xs text-slate-500">
                Official In-Service and Specialized Training Programmes recommended by the Training Programme Advisory Committee (TPAC).
              </p>
            </div>

            <div className="space-y-4">
              {tpacProgrammes.map((prog) => (
                <div
                  key={prog.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs hover:border-blue-400 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                >
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 uppercase">
                        {prog.mode}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-slate-500 font-semibold">
                        <FaMapMarkerAlt size={11} className="text-red-500" />
                        <span>{prog.academy}</span>
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-blue-600 font-semibold">
                        <FaCalendarAlt size={11} />
                        <span>{prog.dates}</span>
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      {prog.title}
                    </h4>

                    <div className="text-xs text-slate-500 space-y-1">
                      <div>
                        <strong>Target Cadre:</strong> {prog.targetCadre.join(", ")}
                      </div>
                      <div>
                        <strong>Competency Addressed:</strong> {prog.competencyAddressed}
                      </div>
                    </div>

                    <div className="pt-2 flex flex-wrap gap-1.5">
                      {prog.curriculum.map((item, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] font-medium"
                        >
                          • {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-xs font-bold text-slate-500">
                      Duration: <strong>{prog.durationWeeks} Weeks</strong> ({prog.credits} TPAC Credits)
                    </span>
                    <button
                      onClick={() => toast.success("Nomination request logged for NSSTA Nodal Officer review! ✨")}
                      className="px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                    >
                      Nominate for Programme
                    </button>
                    <span className="text-[10px] text-slate-400">
                      Coordinated by {prog.coordinator}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default LearningPath;
