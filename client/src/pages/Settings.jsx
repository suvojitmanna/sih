import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import { useSelector, useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";
import { useNavigation } from "../context/NavigationContext";
import { useTheme } from "../context/ThemeContext";
import { ServerUrl } from "../App";
import axios from "axios";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUserTie,
  FaIdCard,
  FaCheckCircle,
  FaSave,
  FaBuilding,
  FaGraduationCap,
  FaBriefcase,
  FaEnvelope,
  FaUser,
  FaCamera,
  FaShieldAlt,
  FaPlus,
  FaTrashAlt,
  FaUpload,
  FaCheck,
  FaChalkboardTeacher,
  FaUniversity,
  FaCalendarAlt,
  FaUndo,
  FaLock,
} from "react-icons/fa";
import {
  BsLayoutSidebar,
  BsLayoutSidebarInsetReverse,
  BsSun,
  BsMoonStars,
  BsDisplay,
  BsCheckCircleFill,
  BsSliders,
  BsGearFill,
  BsShieldCheck,
  BsArrowRepeat,
  BsExclamationTriangleFill,
} from "react-icons/bs";
import { HiSparkles } from "react-icons/hi";

export const CADRE_OPTIONS = [
  "Indian Statistical Service (ISS) Officer",
  "Subordinate Statistical Service (SSS) Officer",
  "Senior Statistical Officer (SSO)",
  "Junior Statistical Officer (JSO)",
  "Field Operations / Investigator (FOD)",
  "Data Scientist & Statistical Analyst",
  "Director / Division Head (CSO / NSSO)",
  "Survey Design & Research Division (SDRD)",
  "National Statistical Systems Training Academy (NSSTA)",
];

export const EDUCATION_OPTIONS = [
  "M.Sc. in Statistics / Applied Statistics",
  "B.Sc. in Statistics / Mathematics",
  "M.A. / M.Sc. in Applied Economics / Econometrics",
  "Master of Statistics (M.Stat)",
  "B.Tech / B.E. in Data Science / Computer Science",
  "M.Tech / M.S. in Data Science / AI",
  "Ph.D. in Statistics / Operations Research",
  "Other Higher Education Qualification",
];

export const YEAR_RANGE_OPTIONS = [
  "2021 - 2025",
  "2020 - 2024",
  "2019 - 2023",
  "2018 - 2022",
  "2014 - 2018",
  "2010 - 2014",
  "Prior to 2010",
  "Custom Year Range",
];

const Settings = () => {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);
  const { navMode, setNavMode } = useNavigation();
  const { theme, setTheme } = useTheme();

  // URL Tab Query Sync ("profile" | "layout" | "security")
  const [searchParams, setSearchParams] = useSearchParams();
  const tabQuery = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(
    tabQuery === "layout" || tabQuery === "security" ? tabQuery : "profile"
  );

  useEffect(() => {
    if (tabQuery === "layout" || tabQuery === "profile" || tabQuery === "security") {
      setActiveTab(tabQuery);
    }
  }, [tabQuery]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    image: "",
    jobRole: CADRE_OPTIONS[0],
    designation: "Statistical Officer",
    department: "National Sample Survey Office (NSSO)",
    accountRole: "learner", // "learner" | "trainer" | "admin"
    experienceYears: 0,
    workExperience: 3,
  });

  // Dynamic Multiple Education Qualifications Manager
  const [educationList, setEducationList] = useState([
    {
      id: 1,
      degree: EDUCATION_OPTIONS[0],
      customDegree: "",
      collegeName: "Indian Statistical Institute (ISI)",
      passOutYearRange: YEAR_RANGE_OPTIONS[1],
      customYearRange: "",
    },
  ]);

  const [savingProfile, setSavingProfile] = useState(false);
  const fileInputRef = useRef(null);

  // Sync state with Redux userData
  useEffect(() => {
    if (userData) {
      setProfileForm({
        name: userData.name || "",
        email: userData.email || "",
        image: userData.image || userData.picture || "",
        jobRole:
          userData.jobRole ||
          userData.targetCadre ||
          CADRE_OPTIONS[0],
        designation: userData.designation || "Statistical Officer",
        department: userData.department || "National Sample Survey Office (NSSO)",
        accountRole: userData.role || "learner",
        experienceYears: userData.experienceYears || userData.workExperience || 0,
        workExperience: userData.workExperience || userData.experienceYears || 3,
      });

      // Initialize educationList from userData.education array or fallback fields
      if (Array.isArray(userData.education) && userData.education.length > 0) {
        setEducationList(
          userData.education.map((item, idx) => {
            const isStandardDeg = EDUCATION_OPTIONS.includes(item.degree);
            const isStandardYr = YEAR_RANGE_OPTIONS.includes(item.yearRange);
            return {
              id: idx + 1,
              degree: isStandardDeg
                ? item.degree
                : item.degree
                ? "Other Higher Education Qualification"
                : EDUCATION_OPTIONS[0],
              customDegree: isStandardDeg ? "" : item.degree || "",
              collegeName: item.institution || item.collegeName || "",
              passOutYearRange: isStandardYr
                ? item.yearRange
                : item.yearRange
                ? "Custom Year Range"
                : YEAR_RANGE_OPTIONS[1],
              customYearRange: isStandardYr ? "" : item.yearRange || "",
            };
          })
        );
      } else if (userData.educationalQualification || userData.collegeName) {
        const isStandardDeg = EDUCATION_OPTIONS.includes(userData.educationalQualification);
        const isStandardYr = YEAR_RANGE_OPTIONS.includes(userData.passOutYearRange);
        setEducationList([
          {
            id: 1,
            degree: isStandardDeg
              ? userData.educationalQualification
              : userData.educationalQualification
              ? "Other Higher Education Qualification"
              : EDUCATION_OPTIONS[0],
            customDegree: isStandardDeg ? "" : userData.educationalQualification || "",
            collegeName: userData.collegeName || "Indian Statistical Institute (ISI)",
            passOutYearRange: isStandardYr
              ? userData.passOutYearRange
              : userData.passOutYearRange
              ? "Custom Year Range"
              : YEAR_RANGE_OPTIONS[1],
            customYearRange: isStandardYr ? "" : userData.passOutYearRange || "",
          },
        ]);
      }
    }
  }, [userData]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  // Canvas Image Upload with auto-downscaling & compression (max 360x360)
  const handleImageFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, JPEG, WEBP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size must be under 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX = 360;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > MAX) {
            height = Math.round((height * MAX) / width);
            width = MAX;
          }
        } else {
          if (height > MAX) {
            width = Math.round((width * MAX) / height);
            height = MAX;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        setProfileForm((prev) => ({ ...prev, image: dataUrl }));
        toast.success("Officer photo chosen! Click 'Save Profile Changes' to apply.");
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setProfileForm((prev) => ({ ...prev, image: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast.success("Photo removed. Initial letter avatar will be used.");
  };

  // Qualifications Manager Functions
  const handleAddEducation = () => {
    setEducationList((prev) => [
      ...prev,
      {
        id: Date.now(),
        degree: EDUCATION_OPTIONS[0],
        customDegree: "",
        collegeName: "",
        passOutYearRange: YEAR_RANGE_OPTIONS[1],
        customYearRange: "",
      },
    ]);
    toast.success("New qualification slot added! 🎓");
  };

  const handleRemoveEducation = (id) => {
    if (educationList.length <= 1) {
      toast.error("At least one qualification is required.");
      return;
    }
    setEducationList((prev) => prev.filter((item) => item.id !== id));
    toast.success("Qualification removed.");
  };

  const handleEducationChange = (id, field, value) => {
    setEducationList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  // Reset to original userData
  const handleResetProfile = () => {
    if (!userData) return;
    setProfileForm({
      name: userData.name || "",
      email: userData.email || "",
      image: userData.image || userData.picture || "",
      jobRole: userData.jobRole || userData.targetCadre || CADRE_OPTIONS[0],
      designation: userData.designation || "Statistical Officer",
      department: userData.department || "National Sample Survey Office (NSSO)",
      accountRole: userData.role || "learner",
      experienceYears: userData.experienceYears || userData.workExperience || 0,
      workExperience: userData.workExperience || userData.experienceYears || 3,
    });
    toast.success("Form reset to saved profile credentials.");
  };

  // Save Profile with all attributes
  const handleSaveProfile = async (e) => {
    e?.preventDefault();
    if (!profileForm.name || profileForm.name.trim().length < 2) {
      toast.error("Officer Name must be at least 2 characters long.");
      return;
    }

    // Validate qualifications
    for (let i = 0; i < educationList.length; i++) {
      const item = educationList[i];
      if (!item.collegeName.trim()) {
        toast.error(`Please enter College / University for Qualification #${i + 1}.`);
        return;
      }
      if (
        item.degree === "Other Higher Education Qualification" &&
        !item.customDegree.trim()
      ) {
        toast.error(`Please specify degree title for Qualification #${i + 1}.`);
        return;
      }
      if (
        item.passOutYearRange === "Custom Year Range" &&
        !item.customYearRange.trim()
      ) {
        toast.error(`Please specify pass-out year for Qualification #${i + 1}.`);
        return;
      }
    }

    if (
      profileForm.accountRole === "trainer" &&
      (profileForm.experienceYears === "" || Number(profileForm.experienceYears) < 0)
    ) {
      toast.error("Please specify years of training / field experience.");
      return;
    }

    const formattedEducation = educationList.map((item) => {
      const finalDeg =
        item.degree === "Other Higher Education Qualification"
          ? item.customDegree.trim() || "Higher Education Degree"
          : item.degree;
      const finalYr =
        item.passOutYearRange === "Custom Year Range"
          ? item.customYearRange.trim() || "2020 - 2024"
          : item.passOutYearRange;
      return {
        degree: finalDeg,
        institution: item.collegeName.trim(),
        yearRange: finalYr,
      };
    });

    setSavingProfile(true);
    try {
      const payload = {
        name: profileForm.name.trim(),
        image: profileForm.image || "",
        jobRole: profileForm.jobRole,
        targetCadre: profileForm.jobRole,
        designation: profileForm.designation,
        department: profileForm.department,
        role: profileForm.accountRole,
        experienceYears:
          profileForm.accountRole === "trainer"
            ? Number(profileForm.experienceYears) || 0
            : Number(profileForm.workExperience) || 0,
        workExperience:
          Number(profileForm.workExperience) ||
          Number(profileForm.experienceYears) ||
          0,
        educationalQualification: formattedEducation
          .map((e) => e.degree)
          .filter(Boolean)
          .join(", "),
        collegeName: formattedEducation[0]?.institution || "",
        passOutYearRange: formattedEducation[0]?.yearRange || "",
        education: formattedEducation,
      };

      const res = await axios.post(`${ServerUrl}/api/user/complete-profile`, payload, {
        withCredentials: true,
      });

      if (res.data?.success && res.data?.user) {
        dispatch(setUserData(res.data.user));
        toast.success("Officer profile saved and synchronized across MoSPI platform! 🎉");
      } else {
        toast.success("Profile updated successfully!");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error(err.response?.data?.message || "Failed to update profile settings.");
    } finally {
      setSavingProfile(false);
    }
  };

  // Layout selection handlers
  const handleSelectNavMode = (mode) => {
    if (navMode === mode) return;
    setNavMode(mode);
    toast.success(
      `Navigation layout updated to ${
        mode === "sidebar" ? "Sidebar Dock Rail" : "Horizontal Top Navbar"
      }`
    );
  };

  const handleSelectTheme = (mode) => {
    if (theme === mode) return;
    setTheme(mode);
    const label =
      mode === "system"
        ? "System Default"
        : mode === "dark"
        ? "Dark Theme"
        : "Light Theme";
    toast.success(`Interface theme updated to ${label}`);
  };

  // Completeness Metrics
  const getCompletionStats = () => {
    const checks = [
      {
        id: "name",
        label: "Officer Full Name",
        valid: Boolean(profileForm.name && profileForm.name.trim().length >= 2),
      },
      {
        id: "cadre",
        label: "Target Cadre & Track",
        valid: Boolean(profileForm.jobRole),
      },
      {
        id: "dept",
        label: "Designation & Dept",
        valid: Boolean(profileForm.department && profileForm.designation),
      },
      {
        id: "role",
        label: "Academy Operating Role",
        valid: Boolean(
          profileForm.accountRole &&
            (profileForm.accountRole !== "trainer" ||
              (profileForm.experienceYears !== "" &&
                Number(profileForm.experienceYears) >= 0))
        ),
      },
      {
        id: "edu",
        label: "Educational Credentials",
        valid: Boolean(
          educationList.length > 0 &&
            educationList.every(
              (e) =>
                e.collegeName?.trim() &&
                (e.degree !== "Other Higher Education Qualification" ||
                  e.customDegree?.trim()) &&
                (e.passOutYearRange !== "Custom Year Range" ||
                  e.customYearRange?.trim())
            )
        ),
      },
    ];

    const passedCount = checks.filter((c) => c.valid).length;
    const percentage = Math.round((passedCount / checks.length) * 100);
    return { checks, percentage };
  };

  const { checks: completionChecks, percentage: completionPercentage } =
    getCompletionStats();

  const getUserInitial = () => {
    if (profileForm.name && profileForm.name.trim()) {
      return profileForm.name.trim().charAt(0).toUpperCase();
    }
    if (profileForm.email && profileForm.email.trim()) {
      return profileForm.email.trim().charAt(0).toUpperCase();
    }
    return "O";
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {navMode === "sidebar" ? <Sidebar /> : <Navbar />}

      <main
        className={`flex-1 transition-all duration-300 ${
          navMode === "sidebar" ? "lg:pl-64" : ""
        } p-3 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-6`}
      >
        {/* ========================================================= */}
        {/* 1. EXECUTIVE HEADER BANNER WITH TRICOLOR RIBBON          */}
        {/* ========================================================= */}
        <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xs overflow-hidden">
          {/* Top National Tricolor Ribbon */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black shadow-md shadow-blue-500/20 shrink-0">
                <BsGearFill size={24} className="animate-spin-slow" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-[10px] font-black uppercase tracking-wider text-blue-700 dark:text-blue-300">
                    <BsShieldCheck size={11} className="text-blue-600 dark:text-blue-400" />
                    <span>MoSPI • NSSTA System Control</span>
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300/40">
                    <BsCheckCircleFill size={9} />
                    <span>Profile {completionPercentage}% Verified</span>
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  System Settings & Cadre Intelligence
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  Configure your official credentials, multi-degree educational profile, operating role, and UI preferences.
                </p>
              </div>
            </div>

            {/* Segmented Navigation Tabs Switcher */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800/90 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-inner shrink-0 self-start md:self-auto">
              <button
                type="button"
                onClick={() => handleTabChange("profile")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  activeTab === "profile"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <FaUserTie size={12} />
                <span>Profile Option</span>
                {completionPercentage < 100 && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                )}
              </button>

              <button
                type="button"
                onClick={() => handleTabChange("layout")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  activeTab === "layout"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <BsSliders size={12} />
                <span>Workspace Layout</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange("security")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  activeTab === "security"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <FaShieldAlt size={12} />
                <span>Security & Trust</span>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: PROFILE OPTION (FULL PROFILE SETUP CAPABILITY)    */}
        {/* ========================================================= */}
        {activeTab === "profile" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* Real-time Completeness Status Ribbon */}
            <div className="bg-gradient-to-r from-blue-900/10 via-indigo-900/10 to-emerald-900/10 border border-blue-200 dark:border-blue-900/50 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-md">
                  {completionPercentage}%
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>Statistical Officer Profile Readiness</span>
                    {completionPercentage === 100 ? (
                      <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-extrabold">
                        100% Complete
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.2 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 font-extrabold">
                        In Progress
                      </span>
                    )}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Complete all sections to unlock tailored AI competency diagnostic benchmarks & official dossier exports.
                  </p>
                </div>
              </div>

              {/* Progress Checklist Badges */}
              <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
                {completionChecks.map((chk) => (
                  <span
                    key={chk.id}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      chk.valid
                        ? "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-300/40"
                        : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {chk.valid ? <FaCheck size={8} /> : <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                    <span>{chk.label}</span>
                  </span>
                ))}
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-6">
              {/* SECTION 1: HERO AVATAR & IDENTITY */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xs space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                      <FaUserTie size={14} />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                        1. Officer Identity & Profile Avatar
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Official portrait and identification displayed across all board certifications and transcripts.
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    Primary Identification
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* Photo Circle with Dynamic Border Glow */}
                  <div className="relative group shrink-0">
                    <div className="w-24 h-24 sm:w-26 sm:h-26 rounded-3xl p-1 bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-400 shadow-xl shadow-blue-500/20 flex items-center justify-center">
                      <div className="w-full h-full rounded-[20px] overflow-hidden bg-slate-900 flex items-center justify-center relative">
                        {profileForm.image ? (
                          <img
                            src={profileForm.image}
                            alt={profileForm.name || "Officer"}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            onError={() => setProfileForm((p) => ({ ...p, image: "" }))}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-tr from-blue-700 via-indigo-700 to-purple-700 text-white flex items-center justify-center font-black text-3xl select-none uppercase tracking-wider">
                            {getUserInitial()}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Camera Button Badge */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-900 cursor-pointer transition-all hover:scale-110"
                      title="Upload Officer Photo"
                    >
                      <FaCamera size={12} />
                    </button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      onChange={handleImageFileUpload}
                      className="hidden"
                    />
                  </div>

                  {/* Photo Actions & Overview */}
                  <div className="flex-1 text-center sm:text-left space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center justify-center sm:justify-start gap-2">
                          <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                            {profileForm.name || "MoSPI Officer"}
                          </h4>
                          {profileForm.image ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                              <FaCheck size={8} /> Custom Portrait
                            </span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold">
                              Default Initial Avatar
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {profileForm.jobRole} • {profileForm.department}
                        </p>
                      </div>

                      {/* Photo Upload / Remove Buttons */}
                      <div className="flex items-center justify-center sm:justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-xs hover:scale-102"
                        >
                          <FaUpload size={11} />
                          <span>{profileForm.image ? "Change Photo" : "Upload Photo"}</span>
                        </button>
                        {profileForm.image && (
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="px-2.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1"
                            title="Remove custom photo"
                          >
                            <FaTrashAlt size={10} />
                            <span>Remove</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-400">
                      Supported: JPG, PNG, WEBP (Max 5MB • Automatically scaled & optimized by canvas downscaling)
                    </div>
                  </div>
                </div>

                {/* Name & Email Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <FaUser size={11} className="text-blue-600" />
                        <span>Officer Full Name</span>
                        <span className="text-rose-500">*</span>
                      </span>
                      {profileForm.name && profileForm.name.trim().length >= 2 ? (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-1">
                          <FaCheck size={9} /> Valid Name
                        </span>
                      ) : (
                        <span className="text-[10px] text-amber-500 font-medium">Min 2 chars</span>
                      )}
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={profileForm.name}
                      onChange={handleProfileChange}
                      placeholder="e.g. Dr. Rajesh Kumar / Ananya Sharma"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <FaEnvelope size={11} className="text-blue-600" />
                        <span>Registered Email ID</span>
                      </span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-1">
                        <FaLock size={9} /> Verified & Locked
                      </span>
                    </label>
                    <input
                      type="email"
                      value={profileForm.email}
                      disabled
                      readOnly
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs font-semibold cursor-not-allowed select-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: ACADEMY OPERATING ROLE & TRAINER CREDENTIALS */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                      <FaBriefcase size={14} />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                        2. Academy Operating Role & Capacity Track
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Choose whether your primary interface is tailored for competency learning or faculty instruction.
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    Role Permissions
                  </span>
                </div>

                {/* Operating Role Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Statistical Learner Card */}
                  <div
                    onClick={() => setProfileForm((p) => ({ ...p, accountRole: "learner" }))}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3.5 select-none ${
                      profileForm.accountRole === "learner"
                        ? "bg-blue-50/60 dark:bg-blue-950/30 border-blue-600 shadow-md ring-2 ring-blue-500/20"
                        : "bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        profileForm.accountRole === "learner"
                          ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                          : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                      }`}
                    >
                      <FaUserTie size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                          Statistical Learner
                        </span>
                        {profileForm.accountRole === "learner" && (
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                        Officer undergoing capacity building, AI oral vivas, diagnostic tests, and iGOT learning pathways.
                      </p>
                    </div>
                  </div>

                  {/* Statistical Trainer Card */}
                  <div
                    onClick={() => setProfileForm((p) => ({ ...p, accountRole: "trainer" }))}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3.5 select-none ${
                      profileForm.accountRole === "trainer"
                        ? "bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-600 shadow-md ring-2 ring-emerald-500/20"
                        : "bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        profileForm.accountRole === "trainer"
                          ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/30"
                          : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                      }`}
                    >
                      <FaChalkboardTeacher size={17} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                          Statistical Trainer / Faculty
                        </span>
                        {profileForm.accountRole === "trainer" && (
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                        Academy faculty authoring question banks, supervising cohort analytics, and curating training rubrics.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Conditional Trainer Field */}
                {profileForm.accountRole === "trainer" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                        <FaCalendarAlt size={12} className="text-emerald-600" />
                        <span>Years of Teaching / Domain Specialization Experience</span>
                        <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                        Faculty Credential
                      </span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      required
                      name="experienceYears"
                      value={profileForm.experienceYears}
                      onChange={handleProfileChange}
                      placeholder="e.g. 5"
                      className="w-full px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-emerald-400 dark:border-emerald-700 text-slate-900 dark:text-white text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </motion.div>
                )}
              </div>

              {/* SECTION 3: TARGET CADRE & ADMINISTRATIVE PLACEMENT */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
                      <FaIdCard size={14} />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                        3. Target Cadre & Administrative Placement
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Official statistical cadre placement utilized for adaptive question synthesis and competency taxonomy.
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    Cadre Taxonomy
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Cadre Select */}
                  <div className="space-y-1.5 sm:col-span-1">
                    <label className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <FaIdCard size={11} className="text-blue-600" />
                      <span>Target Cadre Track</span>
                      <span className="text-rose-500">*</span>
                    </label>
                    <select
                      name="jobRole"
                      value={profileForm.jobRole}
                      onChange={handleProfileChange}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      {CADRE_OPTIONS.map((c, i) => (
                        <option key={i} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Designation */}
                  <div className="space-y-1.5 sm:col-span-1">
                    <label className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <FaBriefcase size={11} className="text-blue-600" />
                      <span>Administrative Designation</span>
                    </label>
                    <input
                      type="text"
                      name="designation"
                      value={profileForm.designation}
                      onChange={handleProfileChange}
                      placeholder="e.g. Statistical Officer"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Department */}
                  <div className="space-y-1.5 sm:col-span-1">
                    <label className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <FaBuilding size={11} className="text-blue-600" />
                      <span>Department / Division</span>
                    </label>
                    <input
                      type="text"
                      name="department"
                      value={profileForm.department}
                      onChange={handleProfileChange}
                      placeholder="e.g. National Sample Survey Office (NSSO)"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: MULTI-EDUCATION QUALIFICATIONS MANAGER */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                      <FaGraduationCap size={15} />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <span>4. Educational Qualifications & Credentials</span>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                          {educationList.length} Registered
                        </span>
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Add one or multiple higher education credentials, universities, and pass-out years.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddEducation}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs self-start sm:self-auto hover:scale-102"
                  >
                    <FaPlus size={10} />
                    <span>Add Qualification</span>
                  </button>
                </div>

                {/* Dynamic Education Cards List */}
                <div className="space-y-4">
                  {educationList.map((item, index) => (
                    <div
                      key={item.id}
                      className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-3.5 relative"
                    >
                      <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-700/60 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-black text-[10px] flex items-center justify-center">
                            {index + 1}
                          </span>
                          <span className="text-xs font-black text-slate-900 dark:text-white">
                            Qualification #{index + 1}
                          </span>
                          {index === 0 && (
                            <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-300/40">
                              Primary Degree
                            </span>
                          )}
                        </div>

                        {educationList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveEducation(item.id)}
                            className="text-slate-400 hover:text-rose-500 transition-colors p-1 cursor-pointer flex items-center gap-1 text-xs font-bold"
                            title="Remove Qualification"
                          >
                            <FaTrashAlt size={11} />
                            <span className="hidden sm:inline text-[10px]">Delete</span>
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                        {/* Degree Dropdown */}
                        <div className="space-y-1 sm:col-span-1">
                          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            Degree Title <span className="text-rose-500">*</span>
                          </label>
                          <select
                            value={item.degree}
                            onChange={(e) =>
                              handleEducationChange(item.id, "degree", e.target.value)
                            }
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
                          >
                            {EDUCATION_OPTIONS.map((deg, i) => (
                              <option key={i} value={deg}>
                                {deg}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Custom Degree Input (Conditional) */}
                        {item.degree === "Other Higher Education Qualification" && (
                          <div className="space-y-1 sm:col-span-1">
                            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                              Custom Degree Name <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={item.customDegree}
                              onChange={(e) =>
                                handleEducationChange(item.id, "customDegree", e.target.value)
                              }
                              placeholder="e.g. Master in Public Policy"
                              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        )}

                        {/* College Name */}
                        <div
                          className={`space-y-1 ${
                            item.degree === "Other Higher Education Qualification"
                              ? "sm:col-span-1"
                              : "sm:col-span-1"
                          }`}
                        >
                          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            University / Institute <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={item.collegeName}
                            onChange={(e) =>
                              handleEducationChange(item.id, "collegeName", e.target.value)
                            }
                            placeholder="e.g. Indian Statistical Institute (ISI)"
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        {/* Pass-out Year */}
                        <div className="space-y-1 sm:col-span-1">
                          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            Graduation / Pass-out Year
                          </label>
                          <select
                            value={item.passOutYearRange}
                            onChange={(e) =>
                              handleEducationChange(item.id, "passOutYearRange", e.target.value)
                            }
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
                          >
                            {YEAR_RANGE_OPTIONS.map((yr, i) => (
                              <option key={i} value={yr}>
                                {yr}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Custom Year Range (Conditional) */}
                        {item.passOutYearRange === "Custom Year Range" && (
                          <div className="space-y-1 sm:col-span-1">
                            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                              Custom Year Range <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={item.customYearRange}
                              onChange={(e) =>
                                handleEducationChange(item.id, "customYearRange", e.target.value)
                              }
                              placeholder="e.g. 2015 - 2017"
                              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SAVE / RESET ACTIONS BAR */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <HiSparkles className="text-blue-500" size={16} />
                  <span>Changes synchronize instantly with your diagnostic scorecard dossier.</span>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={handleResetProfile}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer"
                  >
                    <FaUndo size={11} />
                    <span>Reset</span>
                  </button>

                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black text-xs shadow-md shadow-blue-500/20 hover:scale-102 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {savingProfile ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Saving Changes...</span>
                      </>
                    ) : (
                      <>
                        <FaSave size={12} />
                        <span>Save Profile Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: WORKSPACE & LAYOUT SETTING                        */}
        {/* ========================================================= */}
        {activeTab === "layout" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* Navigation Layout Section */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <BsLayoutSidebar className="text-blue-600" />
                    <span>Navigation Layout Dock</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Select how the main navigation is presented across the MoSPI learning platform.
                  </p>
                </div>
                <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/50">
                  Current: {navMode === "sidebar" ? "Sidebar Dock Rail" : "Horizontal Top Navbar"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Option A: Sidebar Dock */}
                <div
                  onClick={() => handleSelectNavMode("sidebar")}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer space-y-3 relative group select-none ${
                    navMode === "sidebar"
                      ? "border-blue-600 bg-blue-50/40 dark:bg-blue-950/20 shadow-md ring-2 ring-blue-500/20"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
                        <BsLayoutSidebar size={17} />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-900 dark:text-white">
                          Sidebar Rail Layout
                        </h4>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                          Persistent Left-Hand Command Dock
                        </span>
                      </div>
                    </div>
                    {navMode === "sidebar" && (
                      <BsCheckCircleFill className="text-blue-600 dark:text-blue-400" size={18} />
                    )}
                  </div>

                  <div className="h-20 rounded-xl bg-slate-200 dark:bg-slate-950/80 p-2 flex gap-1.5 border border-slate-300/40 dark:border-slate-800">
                    <div className="w-1/4 h-full bg-blue-600/30 rounded-lg border border-blue-500/40 flex flex-col gap-1 p-1">
                      <div className="w-full h-1.5 bg-blue-500 rounded" />
                      <div className="w-3/4 h-1 bg-blue-400/50 rounded" />
                      <div className="w-1/2 h-1 bg-blue-400/50 rounded" />
                    </div>
                    <div className="flex-1 h-full bg-white dark:bg-slate-900 rounded-lg p-1.5 flex flex-col gap-1 border border-slate-200 dark:border-slate-800">
                      <div className="w-1/3 h-1.5 bg-slate-300 dark:bg-slate-700 rounded" />
                      <div className="w-full h-full bg-slate-100 dark:bg-slate-800/50 rounded" />
                    </div>
                  </div>
                </div>

                {/* Option B: Horizontal Top Navbar */}
                <div
                  onClick={() => handleSelectNavMode("navbar")}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer space-y-3 relative group select-none ${
                    navMode === "navbar"
                      ? "border-blue-600 bg-blue-50/40 dark:bg-blue-950/20 shadow-md ring-2 ring-blue-500/20"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
                        <BsLayoutSidebarInsetReverse size={17} />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-900 dark:text-white">
                          Horizontal Navbar Layout
                        </h4>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                          Classic Header Navigation
                        </span>
                      </div>
                    </div>
                    {navMode === "navbar" && (
                      <BsCheckCircleFill className="text-blue-600 dark:text-blue-400" size={18} />
                    )}
                  </div>

                  <div className="h-20 rounded-xl bg-slate-200 dark:bg-slate-950/80 p-2 flex flex-col gap-1.5 border border-slate-300/40 dark:border-slate-800">
                    <div className="w-full h-4 bg-indigo-600/30 rounded-md border border-indigo-500/40 flex items-center justify-between px-2">
                      <div className="w-8 h-1.5 bg-indigo-500 rounded" />
                      <div className="flex gap-1">
                        <div className="w-4 h-1 bg-indigo-400/60 rounded" />
                        <div className="w-4 h-1 bg-indigo-400/60 rounded" />
                      </div>
                    </div>
                    <div className="flex-1 bg-white dark:bg-slate-900 rounded-lg p-1.5 border border-slate-200 dark:border-slate-800 flex flex-col gap-1">
                      <div className="w-1/3 h-1.5 bg-slate-300 dark:bg-slate-700 rounded" />
                      <div className="w-full h-full bg-slate-100 dark:bg-slate-800/50 rounded" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Interface Theme Section */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <BsSun className="text-amber-500" />
                    <span>Display Mode & Visual Theme</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Customize your visual contrast preferences for intensive data analysis.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
                {/* Light */}
                <button
                  type="button"
                  onClick={() => handleSelectTheme("light")}
                  className={`p-4 rounded-2xl border-2 flex items-center gap-3 transition-all cursor-pointer text-left ${
                    theme === "light"
                      ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 shadow-sm ring-2 ring-blue-500/20"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30"
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-xs shrink-0">
                    <BsSun size={18} />
                  </div>
                  <div>
                    <div className="font-extrabold text-xs text-slate-900 dark:text-white">
                      Light Theme
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      Standard High Daylight Contrast
                    </div>
                  </div>
                </button>

                {/* Dark */}
                <button
                  type="button"
                  onClick={() => handleSelectTheme("dark")}
                  className={`p-4 rounded-2xl border-2 flex items-center gap-3 transition-all cursor-pointer text-left ${
                    theme === "dark"
                      ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 shadow-sm ring-2 ring-blue-500/20"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30"
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-900 text-indigo-300 flex items-center justify-center shadow-xs shrink-0">
                    <BsMoonStars size={16} />
                  </div>
                  <div>
                    <div className="font-extrabold text-xs text-slate-900 dark:text-white">
                      Dark Theme
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      Low-Glare Slate Matrix
                    </div>
                  </div>
                </button>

                {/* System */}
                <button
                  type="button"
                  onClick={() => handleSelectTheme("system")}
                  className={`p-4 rounded-2xl border-2 flex items-center gap-3 transition-all cursor-pointer text-left ${
                    theme === "system"
                      ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 shadow-sm ring-2 ring-blue-500/20"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30"
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs shrink-0">
                    <BsDisplay size={18} />
                  </div>
                  <div>
                    <div className="font-extrabold text-xs text-slate-900 dark:text-white">
                      System Sync
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      Follows Operating System
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: SECURITY, DATA ETHICS & TRUST                      */}
        {/* ========================================================= */}
        {activeTab === "security" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                    <FaShieldAlt size={15} />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                      Account Security & Institutional Governance
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Compliance standards under MoSPI and Digital Personal Data Protection (DPDP) Act 2023.
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300/40">
                  DPDP Compliant
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-slate-400">
                    Authentication Protocol
                  </span>
                  <div className="flex items-center gap-2">
                    <BsShieldCheck size={16} className="text-emerald-500" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      HMAC SHA-256 One-Time Passcode (OTP)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Session protected by cryptographic httpOnly secure cookies and JWT token verification.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-slate-400">
                    Confidentiality Status
                  </span>
                  <div className="flex items-center gap-2">
                    <FaLock size={13} className="text-blue-500" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      UN-NQAF Strict Statistical Privacy
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Assessments and microdata are strictly protected under Section 11 of DPDP Act 2023.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Settings;
