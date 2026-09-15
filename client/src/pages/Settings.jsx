import React, { useState, useEffect } from "react";
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
} from "react-icons/bs";

const CADRE_OPTIONS = [
  "Indian Statistical Service (ISS) Officer",
  "Subordinate Statistical Service (SSS) Officer",
  "Field Operations Division (FOD) Officer",
  "Survey Design & Research Division (SDRD)",
  "National Statistical Systems Training Academy (NSSTA)",
  "Director / Joint Director / Deputy Director",
  "Senior Statistical Officer (SSO)",
  "Junior Statistical Officer (JSO)",
];

const Settings = () => {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);
  const { navMode, setNavMode } = useNavigation();
  const { theme, setTheme, resolvedTheme } = useTheme();

  // 2 Options: "profile" | "layout"
  const [searchParams, setSearchParams] = useSearchParams();
  const tabQuery = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabQuery === "layout" ? "layout" : "profile");

  useEffect(() => {
    if (tabQuery === "layout" || tabQuery === "profile") {
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
    jobRole: "Indian Statistical Service (ISS) Officer",
    designation: "Statistical Officer",
    department: "National Sample Survey Office (NSSO)",
    workExperience: 0,
    educationalQualification: "Master of Statistics (M.Stat)",
    collegeName: "Indian Statistical Institute (ISI)",
  });

  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (userData) {
      setProfileForm({
        name: userData.name || "",
        email: userData.email || "",
        image: userData.image || userData.picture || "",
        jobRole: userData.jobRole || userData.targetCadre || "Indian Statistical Service (ISS) Officer",
        designation: userData.designation || "Statistical Officer",
        department: userData.department || "National Sample Survey Office (NSSO)",
        workExperience: userData.workExperience || userData.experienceYears || 0,
        educationalQualification: userData.educationalQualification || "Master of Statistics (M.Stat)",
        collegeName: userData.collegeName || "Indian Statistical Institute (ISI)",
      });
    }
  }, [userData]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Avatar image size must be under 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileForm((prev) => ({ ...prev, image: reader.result }));
        toast.success("Profile photo chosen! Click 'Save Profile Changes' to update.");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const payload = {
        name: profileForm.name,
        image: profileForm.image,
        jobRole: profileForm.jobRole,
        targetCadre: profileForm.jobRole,
        designation: profileForm.designation,
        department: profileForm.department,
        workExperience: Number(profileForm.workExperience) || 0,
        experienceYears: Number(profileForm.workExperience) || 0,
        educationalQualification: profileForm.educationalQualification,
        collegeName: profileForm.collegeName,
      };

      const res = await axios.post(`${ServerUrl}/api/user/complete-profile`, payload, {
        withCredentials: true,
      });

      if (res.data?.success && res.data?.user) {
        dispatch(setUserData(res.data.user));
        toast.success("Profile preferences saved successfully! 🎉");
      } else {
        toast.success("Profile settings updated.");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error(err.response?.data?.message || "Failed to update profile settings.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSelectNavMode = (mode) => {
    if (navMode === mode) return;
    setNavMode(mode);
    toast.success(`Navigation layout changed to ${mode === "sidebar" ? "Sidebar Rail" : "Horizontal Navbar"}`);
  };

  const handleSelectTheme = (mode) => {
    if (theme === mode) return;
    setTheme(mode);
    const label = mode === "system" ? "System Default" : mode === "dark" ? "Dark Mode" : "Light Mode";
    toast.success(`Theme updated to ${label}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {navMode === "sidebar" ? <Sidebar /> : <Navbar />}

      <main className={`flex-1 transition-all duration-300 ${navMode === "sidebar" ? "lg:pl-64" : ""} p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full`}>
        {/* Top Header Card */}
        <div className="mb-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black shadow-xs">
                <BsGearFill size={24} className="animate-spin-slow" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  System Settings
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  Manage your officer profile credentials and workspace layout preferences.
                </p>
              </div>
            </div>

            {/* 2 Options Switcher Tabs */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
              <button
                type="button"
                onClick={() => handleTabChange("profile")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-xs transition-all cursor-pointer ${
                  activeTab === "profile"
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <FaUserTie size={13} />
                <span>Profile Option</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange("layout")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-xs transition-all cursor-pointer ${
                  activeTab === "layout"
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <BsSliders size={13} />
                <span>Layout Setting</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab 1: Profile Option */}
        {activeTab === "profile" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <form onSubmit={handleSaveProfile} className="space-y-6">
              {/* Profile Card Header */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs">
                <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                  <div className="relative group shrink-0">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-blue-700 via-indigo-700 to-emerald-600 text-white flex items-center justify-center font-black text-3xl shadow-lg overflow-hidden border-4 border-white dark:border-slate-800">
                      {profileForm.image ? (
                        <img
                          src={profileForm.image}
                          alt={profileForm.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      ) : (
                        <span>{profileForm.name ? profileForm.name.charAt(0).toUpperCase() : "O"}</span>
                      )}
                    </div>
                    <label
                      htmlFor="settings-avatar-input"
                      className="absolute -bottom-1 -right-1 p-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg cursor-pointer transition-transform hover:scale-110 border-2 border-white dark:border-slate-900"
                      title="Upload Avatar Image from Device"
                    >
                      <FaCamera size={12} />
                      <input
                        id="settings-avatar-input"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageFileUpload}
                      />
                    </label>
                  </div>

                  <div className="text-center sm:text-left space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <h2 className="text-xl font-black text-slate-900 dark:text-white">
                        {profileForm.name || "MoSPI Officer"}
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300/40">
                        Verified Officer
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {profileForm.jobRole} • {profileForm.department}
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-bold">
                      {profileForm.email}
                    </p>
                  </div>
                </div>

                {/* Profile Form Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-6">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <FaUser size={11} className="text-blue-600" />
                      <span>Full Name</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={profileForm.name}
                      onChange={handleProfileChange}
                      required
                      placeholder="e.g. Officer Vikram Sharma"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Email (Readonly) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <FaEnvelope size={11} className="text-blue-600" />
                      <span>Email ID (Registered)</span>
                    </label>
                    <input
                      type="email"
                      value={profileForm.email}
                      disabled
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs font-semibold cursor-not-allowed"
                    />
                  </div>

                  {/* Profile Picture URL */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <FaCamera size={11} className="text-blue-600" />
                      <span>Avatar / Image URL (Optional)</span>
                    </label>
                    <input
                      type="url"
                      name="image"
                      value={profileForm.image}
                      onChange={handleProfileChange}
                      placeholder="https://example.com/officer-photo.jpg"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Target Cadre / Job Role */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <FaIdCard size={11} className="text-blue-600" />
                      <span>Cadre / Job Role</span>
                    </label>
                    <select
                      name="jobRole"
                      value={profileForm.jobRole}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      {CADRE_OPTIONS.map((c, i) => (
                        <option key={i} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Designation */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <FaBriefcase size={11} className="text-blue-600" />
                      <span>Designation</span>
                    </label>
                    <input
                      type="text"
                      name="designation"
                      value={profileForm.designation}
                      onChange={handleProfileChange}
                      placeholder="e.g. Statistical Officer"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Educational Qualification */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <FaGraduationCap size={11} className="text-blue-600" />
                      <span>Educational Qualification</span>
                    </label>
                    <input
                      type="text"
                      name="educationalQualification"
                      value={profileForm.educationalQualification}
                      onChange={handleProfileChange}
                      placeholder="e.g. M.Sc. Statistics"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Institution / College */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <FaBuilding size={11} className="text-blue-600" />
                      <span>University / Institute</span>
                    </label>
                    <input
                      type="text"
                      name="collegeName"
                      value={profileForm.collegeName}
                      onChange={handleProfileChange}
                      placeholder="e.g. Indian Statistical Institute (ISI)"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Save Button */}
                <div className="mt-8 pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
                  >
                    <FaSave size={13} />
                    <span>{savingProfile ? "Saving Changes..." : "Save Profile Changes"}</span>
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        )}

        {/* Tab 2: Layout Setting */}
        {activeTab === "layout" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* Navigation Layout Choice */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <BsLayoutSidebar className="text-blue-600" />
                    <span>Navigation Layout</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Select how the main navigation is presented across academy modules.
                  </p>
                </div>
                <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/50">
                  Current: {navMode === "sidebar" ? "Sidebar Dock" : "Top Navbar"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Option 1: Sidebar Dock */}
                <div
                  onClick={() => handleSelectNavMode("sidebar")}
                  className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between group ${
                    navMode === "sidebar"
                      ? "border-blue-600 dark:border-blue-500 bg-blue-50/40 dark:bg-blue-950/20 shadow-md ring-2 ring-blue-500/20"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/40"
                  }`}
                >
                  {navMode === "sidebar" && (
                    <div className="absolute top-3.5 right-3.5 text-blue-600 dark:text-blue-400">
                      <BsCheckCircleFill size={18} />
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
                        <BsLayoutSidebar size={18} />
                      </div>
                      <div>
                        <div className="font-black text-sm text-slate-900 dark:text-white">Sidebar Dock</div>
                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                          Collapsible Vertical Rail
                        </span>
                      </div>
                    </div>

                    <div className="h-20 w-full rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 flex gap-2 overflow-hidden">
                      <div className="w-1/4 h-full rounded-lg bg-blue-600 flex flex-col gap-1.5 p-1.5">
                        <div className="w-full h-2 rounded bg-white/40" />
                        <div className="w-3/4 h-1.5 rounded bg-white/30" />
                        <div className="w-2/3 h-1.5 rounded bg-white/30" />
                      </div>
                      <div className="flex-1 h-full rounded-lg bg-white dark:bg-slate-800 p-2 flex flex-col gap-1.5">
                        <div className="w-full h-2.5 rounded bg-slate-200 dark:bg-slate-700" />
                        <div className="w-3/4 h-4 rounded bg-slate-200 dark:bg-slate-700" />
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      Vertical dock fixed to the left with collapsed icon mode for fast multi-tool switching.
                    </p>
                  </div>
                </div>

                {/* Option 2: Top Navbar */}
                <div
                  onClick={() => handleSelectNavMode("topbar")}
                  className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between group ${
                    navMode === "topbar"
                      ? "border-blue-600 dark:border-blue-500 bg-blue-50/40 dark:bg-blue-950/20 shadow-md ring-2 ring-blue-500/20"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/40"
                  }`}
                >
                  {navMode === "topbar" && (
                    <div className="absolute top-3.5 right-3.5 text-blue-600 dark:text-blue-400">
                      <BsCheckCircleFill size={18} />
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        <BsLayoutSidebarInsetReverse size={18} />
                      </div>
                      <div>
                        <div className="font-black text-sm text-slate-900 dark:text-white">Top Navbar</div>
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                          Full Width Header
                        </span>
                      </div>
                    </div>

                    <div className="h-20 w-full rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 flex flex-col gap-2 overflow-hidden">
                      <div className="w-full h-4 rounded-lg bg-blue-600 flex items-center justify-between px-2">
                        <div className="w-8 h-1.5 rounded bg-white/60" />
                        <div className="flex gap-1">
                          <div className="w-3 h-1.5 rounded bg-white/40" />
                          <div className="w-3 h-1.5 rounded bg-white/40" />
                        </div>
                      </div>
                      <div className="flex-1 rounded-lg bg-white dark:bg-slate-800 p-2 flex flex-col gap-1.5">
                        <div className="w-full h-2.5 rounded bg-slate-200 dark:bg-slate-700" />
                        <div className="w-2/3 h-3 rounded bg-slate-200 dark:bg-slate-700" />
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      Horizontal top navbar that maximizes full horizontal screen width for statistical charts & tables.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Theme Mode Selection */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    {theme === "dark" ? (
                      <BsMoonStars className="text-indigo-400" />
                    ) : theme === "light" ? (
                      <BsSun className="text-amber-500" />
                    ) : (
                      <BsDisplay className="text-blue-500" />
                    )}
                    <span>Theme & Color Appearance</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Choose daylight, obsidian dark mode, or sync with your operating system.
                  </p>
                </div>
                <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 capitalize border border-slate-200/60 dark:border-slate-700/60">
                  {theme} mode ({resolvedTheme})
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
                {/* Light */}
                <button
                  type="button"
                  onClick={() => handleSelectTheme("light")}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center gap-2.5 text-center ${
                    theme === "light"
                      ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 shadow-sm ring-2 ring-amber-500/20"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/40"
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-500 flex items-center justify-center shadow-xs">
                    <BsSun size={20} />
                  </div>
                  <div>
                    <div className="font-extrabold text-xs text-slate-900 dark:text-white">Light Mode</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Daylight High Contrast</div>
                  </div>
                </button>

                {/* Dark */}
                <button
                  type="button"
                  onClick={() => handleSelectTheme("dark")}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center gap-2.5 text-center ${
                    theme === "dark"
                      ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-sm ring-2 ring-indigo-500/20"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/40"
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-400 flex items-center justify-center shadow-xs">
                    <BsMoonStars size={20} />
                  </div>
                  <div>
                    <div className="font-extrabold text-xs text-slate-900 dark:text-white">Dark Mode</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Obsidian Low Eye-Strain</div>
                  </div>
                </button>

                {/* System */}
                <button
                  type="button"
                  onClick={() => handleSelectTheme("system")}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center gap-2.5 text-center ${
                    theme === "system"
                      ? "border-blue-600 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 shadow-sm ring-2 ring-blue-500/20"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/40"
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs">
                    <BsDisplay size={20} />
                  </div>
                  <div>
                    <div className="font-extrabold text-xs text-slate-900 dark:text-white">System Sync</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Follows OS Setting</div>
                  </div>
                </button>
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
