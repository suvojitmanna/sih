import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";
import { ServerUrl } from "../App";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FaUserGraduate,
  FaShieldAlt,
  FaKey,
  FaEnvelope,
  FaArrowLeft,
  FaUniversity,
  FaCalendarAlt,
  FaBriefcase,
  FaChalkboardTeacher,
  FaUserTie,
  FaPlus,
  FaTrashAlt,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { BsCheckCircleFill, BsShieldLockFill, BsArrowRepeat } from "react-icons/bs";
import { HiSparkles } from "react-icons/hi";
import { signInWithGooglePopup } from "../utils/googleAuth";

export const CADRE_OPTIONS = [
  "Indian Statistical Service (ISS) Officer",
  "Senior Statistical Officer (SSO)",
  "Junior Statistical Officer (JSO)",
  "Field Operations / Investigator (FOD)",
  "Data Scientist / Statistical Analyst",
  "Director / Division Head (CSO / NSSO)",
];

export const EDUCATION_OPTIONS = [
  "M.Sc. in Statistics / Applied Statistics",
  "B.Sc. in Statistics / Mathematics",
  "M.A. / M.Sc. in Applied Economics / Econometrics",
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

const Auth = ({ isModel = false }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authenticatedUser, setAuthenticatedUser] = useState(null);

  // Account Role (Learner vs Trainer)
  const [accountRole, setAccountRole] = useState("learner"); // "learner" or "trainer" (or "admin")

  // OTP State (Step 2)
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  // Forgot Password Flow States
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: OTP + New Password
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtpDigits, setForgotOtpDigits] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [forgotCountdown, setForgotCountdown] = useState(60);
  const [canResendForgot, setCanResendForgot] = useState(false);
  const forgotInputRefs = useRef([]);

  // Profile Setup State (Step 3) - Multi-Education List
  const [educationList, setEducationList] = useState([
    {
      id: 1,
      degree: EDUCATION_OPTIONS[0],
      customDegree: "",
      collegeName: "",
      passOutYearRange: YEAR_RANGE_OPTIONS[1],
      customYearRange: "",
    },
  ]);
  const [targetCadre, setTargetCadre] = useState(CADRE_OPTIONS[0]);
  const [experienceYears, setExperienceYears] = useState("");

  // Countdown for Login/Signup OTP
  useEffect(() => {
    let timer;
    if (step === 2 && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  // Countdown for Forgot Password OTP
  useEffect(() => {
    let timer;
    if (isForgotPassword && forgotStep === 2 && forgotCountdown > 0) {
      timer = setInterval(() => {
        setForgotCountdown((prev) => prev - 1);
      }, 1000);
    } else if (forgotCountdown === 0) {
      setCanResendForgot(true);
    }
    return () => clearInterval(timer);
  }, [isForgotPassword, forgotStep, forgotCountdown]);

  // OTP Handlers (Signup/Login)
  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      const pasted = value.replace(/\D/g, "").slice(0, 6).split("");
      const newDigits = [...otpDigits];
      pasted.forEach((char, i) => {
        if (i < 6) newDigits[i] = char;
      });
      setOtpDigits(newDigits);
      const nextIndex = Math.min(pasted.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const val = value.replace(/\D/g, "");
    const newDigits = [...otpDigits];
    newDigits[index] = val;
    setOtpDigits(newDigits);

    if (val && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // OTP Handlers (Forgot Password)
  const handleForgotOtpChange = (index, value) => {
    if (value.length > 1) {
      const pasted = value.replace(/\D/g, "").slice(0, 6).split("");
      const newDigits = [...forgotOtpDigits];
      pasted.forEach((char, i) => {
        if (i < 6) newDigits[i] = char;
      });
      setForgotOtpDigits(newDigits);
      const nextIndex = Math.min(pasted.length, 5);
      forgotInputRefs.current[nextIndex]?.focus();
      return;
    }

    const val = value.replace(/\D/g, "");
    const newDigits = [...forgotOtpDigits];
    newDigits[index] = val;
    setForgotOtpDigits(newDigits);

    if (val && index < 5) {
      forgotInputRefs.current[index + 1]?.focus();
    }
  };

  const handleForgotKeyDown = (index, e) => {
    if (e.key === "Backspace" && !forgotOtpDigits[index] && index > 0) {
      forgotInputRefs.current[index - 1]?.focus();
    }
  };

  // Multi-Education List Handlers
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
  };

  const handleRemoveEducation = (id) => {
    if (educationList.length <= 1) {
      toast.error("At least one educational qualification is required.");
      return;
    }
    setEducationList((prev) => prev.filter((item) => item.id !== id));
  };

  const handleEducationChange = (id, field, value) => {
    setEducationList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  // Google Authentication
  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      const googleUser = await signInWithGooglePopup();

      const { data } = await axios.post(
        `${ServerUrl}/api/auth/google`,
        {
          name: googleUser.name,
          email: googleUser.email,
          image: googleUser.image,
          accessToken: googleUser.accessToken,
        },
        { withCredentials: true }
      );

      const loggedUser = data.user || data;
      dispatch(setUserData(loggedUser));
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      setAuthenticatedUser(loggedUser);
      if (loggedUser.name) setName(loggedUser.name);
      if (loggedUser.email) setEmail(loggedUser.email);
      if (loggedUser.role) setAccountRole(loggedUser.role);

      // Check if profile details need completion
      if (!loggedUser.isProfileCompleted) {
        setStep(3);
        toast.success(`Google authentication verified! Please configure your official profile.`);
      } else {
        toast.success(`Welcome back, ${loggedUser.name || "Officer"}! Signed in with Google. 🚀`);
        if (!isModel) {
          navigate("/dashboard");
        }
      }
    } catch (error) {
      console.error("[GOOGLE SIGN IN ERROR]", error);
      if (error.message?.includes("closed") || error.message?.includes("popup_closed")) {
        toast.error("Google sign-in popup was closed.");
      } else {
        toast.error(error.response?.data?.message || error.message || "Google authentication failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  // STEP 1: Submit Credentials & Request OTP
  const handleInitiateAuth = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all required credentials.");
      return;
    }
    if (!isLogin && !name) {
      toast.error("Please provide your full name.");
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        // Login Initiate
        const { data } = await axios.post(
          `${ServerUrl}/api/auth/login-initiate`,
          { email, password },
          { withCredentials: true }
        );
        if (data.success) {
          toast.success(data.message || "Security code sent to your email!");
          setStep(2);
          setCountdown(60);
          setCanResend(false);
          setOtpDigits(["", "", "", "", "", ""]);
        }
      } else {
        // Signup Initiate with Role (Learner or Trainer)
        const { data } = await axios.post(
          `${ServerUrl}/api/auth/signup-initiate`,
          { name, email, password, role: accountRole },
          { withCredentials: true }
        );
        if (data.success) {
          toast.success(data.message || "Verification code sent to your email!");
          setStep(2);
          setCountdown(60);
          setCanResend(false);
          setOtpDigits(["", "", "", "", "", ""]);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Authentication initiation failed.");
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Submit 6-Digit OTP & Verify
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const fullOtp = otpDigits.join("");
    if (fullOtp.length !== 6) {
      toast.error("Please enter the complete 6-digit verification code.");
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        // Login Verify
        const { data } = await axios.post(
          `${ServerUrl}/api/auth/login-verify`,
          { email, otp: fullOtp },
          { withCredentials: true }
        );
        if (data.success) {
          dispatch(setUserData(data.user));
          if (data.token) localStorage.setItem("token", data.token);
          setAuthenticatedUser(data.user);
          if (data.user?.role) setAccountRole(data.user.role);

          if (!data.user.isProfileCompleted) {
            toast.success("Signed in! Please finish your official profile.");
            setStep(3);
          } else {
            toast.success("Welcome back! Signed in securely. ✨");
            navigate("/dashboard");
          }
        }
      } else {
        // Signup Verify
        const { data } = await axios.post(
          `${ServerUrl}/api/auth/signup-verify`,
          { email, otp: fullOtp },
          { withCredentials: true }
        );
        if (data.success) {
          dispatch(setUserData(data.user));
          if (data.token) localStorage.setItem("token", data.token);
          setAuthenticatedUser(data.user);
          if (data.user?.role) setAccountRole(data.user.role);
          toast.success("Account activated! Now set up your statistical profile. 🎓");
          setStep(3);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid or expired verification code.");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP for Login / Signup
  const handleResendOtp = async () => {
    if (!canResend) return;
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${ServerUrl}/api/auth/resend-otp`,
        { email, type: isLogin ? "login" : "signup" },
        { withCredentials: true }
      );
      if (data.success) {
        toast.success("Fresh verification code sent to your email!");
        setCountdown(60);
        setCanResend(false);
        setOtpDigits(["", "", "", "", "", ""]);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend code.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FORGOT PASSWORD HANDLERS
  // ==========================================
  const handleInitiateForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast.error("Please enter your registered email address.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(
        `${ServerUrl}/api/auth/forgot-password-initiate`,
        { email: forgotEmail },
        { withCredentials: true }
      );
      if (data.success) {
        toast.success(data.message || "Reset security code sent to your email!");
        setForgotStep(2);
        setForgotCountdown(60);
        setCanResendForgot(false);
        setForgotOtpDigits(["", "", "", "", "", ""]);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to initiate password reset.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendForgotOtp = async () => {
    if (!canResendForgot || loading) return;
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${ServerUrl}/api/auth/forgot-password-initiate`,
        { email: forgotEmail },
        { withCredentials: true }
      );
      if (data.success) {
        toast.success("Fresh reset code sent to your email!");
        setForgotCountdown(60);
        setCanResendForgot(false);
        setForgotOtpDigits(["", "", "", "", "", ""]);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend reset code.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyForgotPassword = async (e) => {
    e.preventDefault();
    const fullOtp = forgotOtpDigits.join("");
    if (fullOtp.length !== 6) {
      toast.error("Please enter the complete 6-digit verification code.");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match. Please verify.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(
        `${ServerUrl}/api/auth/forgot-password-verify`,
        {
          email: forgotEmail,
          otp: fullOtp,
          newPassword,
        },
        { withCredentials: true }
      );
      if (data.success) {
        toast.success(data.message || "Password reset successfully!");
        setEmail(forgotEmail);
        setPassword("");
        setIsForgotPassword(false);
        setForgotStep(1);
        setIsLogin(true);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  // STEP 3: Complete User Profile Onboarding with Multiple Qualifications
  const handleCompleteProfile = async (e) => {
    e.preventDefault();

    // Validate all qualifications in list
    for (let i = 0; i < educationList.length; i++) {
      const item = educationList[i];
      if (!item.collegeName.trim()) {
        toast.error(`Please enter the College / University name for Qualification #${i + 1}.`);
        return;
      }
      if (item.degree === "Other Higher Education Qualification" && !item.customDegree.trim()) {
        toast.error(`Please specify your degree name for Qualification #${i + 1}.`);
        return;
      }
    }

    if (accountRole === "trainer" && (!experienceYears || Number(experienceYears) < 0)) {
      toast.error("Please specify your years of training / domain experience.");
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

    setLoading(true);
    try {
      const payload = {
        userId: authenticatedUser?._id,
        education: formattedEducation,
        educationalQualification: formattedEducation.map((e) => e.degree).join(", "),
        collegeName: formattedEducation[0]?.institution || "",
        passOutYearRange: formattedEducation[0]?.yearRange || "",
        targetCadre: targetCadre,
        jobRole: targetCadre,
        role: accountRole,
        experienceYears: accountRole === "trainer" ? Number(experienceYears) || 0 : 0,
      };

      const { data } = await axios.post(
        `${ServerUrl}/api/auth/complete-profile`,
        payload,
        { withCredentials: true }
      );

      if (data.success) {
        dispatch(setUserData(data.user));
        toast.success(
          `Welcome to SankhyaIQ AI, ${data.user.name || "Officer"}! Profile configured successfully. 🚀`
        );
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("[PROFILE COMPLETE ERROR]", error);
      toast.error(error.response?.data?.message || "Failed to save profile details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white flex flex-col justify-between py-8 px-4 sm:px-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="max-w-md w-full mx-auto text-center z-10">
        <div
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-3 cursor-pointer group mb-2 select-none"
        >
          <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-900 text-white flex flex-col items-center justify-center shadow-xl border border-blue-400/30 overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />
            <span className="font-black text-sm tracking-tight text-white drop-shadow-xs">
              S
            </span>
            <span className="text-[7px] font-black tracking-widest text-amber-300 flex items-center gap-0.5">
              <HiSparkles size={6} className="text-amber-400 animate-pulse" /> AI
            </span>
          </div>
          <div className="text-left">
            <h1 className="text-xl font-black tracking-tight text-white">
              SankhyaIQ{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-violet-400">
                AI
              </span>
            </h1>
            <p className="text-[11px] text-slate-300 font-medium">
              National Statistical Systems Training Academy
            </p>
          </div>
        </div>
      </div>

      {/* Main Authentication Card */}
      <div
        className={`w-full mx-auto z-10 my-auto transition-all duration-300 ${step === 3 ? "max-w-2xl" : "max-w-md"
          }`}
      >
        <div className="bg-slate-900/80 backdrop-blur-2xl border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl">
          {/* Tricolor Accent Line */}
          <div className="h-1 w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808] rounded-full mb-6" />

          {/* Stepper Progress Bar (hidden during Forgot Password) */}
          {!isForgotPassword && (
            <div className="flex items-center justify-between mb-6 px-2">
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step > 1
                      ? "bg-emerald-500 text-white"
                      : step === 1
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 ring-2 ring-blue-400/40"
                        : "bg-slate-800 text-slate-400"
                    }`}
                >
                  {step > 1 ? "✓" : "1"}
                </div>
                <span
                  className={`text-[11px] font-semibold ${step === 1 ? "text-white" : "text-slate-400"
                    }`}
                >
                  Account
                </span>
              </div>

              <div
                className={`flex-1 h-0.5 mx-2 transition-colors ${step > 1 ? "bg-emerald-500" : "bg-slate-700"
                  }`}
              />

              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step > 2
                      ? "bg-emerald-500 text-white"
                      : step === 2
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 ring-2 ring-blue-400/40"
                        : "bg-slate-800 text-slate-400"
                    }`}
                >
                  {step > 2 ? "✓" : "2"}
                </div>
                <span
                  className={`text-[11px] font-semibold ${step === 2 ? "text-white" : "text-slate-400"
                    }`}
                >
                  Security OTP
                </span>
              </div>

              <div
                className={`flex-1 h-0.5 mx-2 transition-colors ${step > 2 ? "bg-emerald-500" : "bg-slate-700"
                  }`}
              />

              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step === 3
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 ring-2 ring-blue-400/40"
                      : "bg-slate-800 text-slate-400"
                    }`}
                >
                  3
                </div>
                <span
                  className={`text-[11px] font-semibold ${step === 3 ? "text-white font-bold" : "text-slate-400"
                    }`}
                >
                  Profile Setup
                </span>
              </div>
            </div>
          )}

          {/* Mode Selector for Step 1 (Hidden during Forgot Password) */}
          {step === 1 && !isForgotPassword && (
            <div className="grid grid-cols-2 p-1 bg-slate-800/80 rounded-2xl border border-slate-700 mb-6 text-xs font-bold">
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className={`py-2.5 rounded-xl transition-all cursor-pointer ${isLogin
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                  }`}
              >
                Officer Sign In
              </button>
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className={`py-2.5 rounded-xl transition-all cursor-pointer ${!isLogin
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                  }`}
              >
                New Registration
              </button>
            </div>
          )}

          {/* ========================================================= */}
          {/* FORGOT PASSWORD VIEW                                      */}
          {/* ========================================================= */}
          {isForgotPassword && (
            <div className="space-y-5">
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(false);
                  setForgotStep(1);
                }}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer mb-2"
              >
                <FaArrowLeft size={10} />
                <span>Back to Sign In</span>
              </button>

              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center mx-auto mb-3">
                  <FaKey size={20} />
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {forgotStep === 1 ? "Reset Your Password" : "Set New Password"}
                </h2>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  {forgotStep === 1
                    ? "Enter your registered email address to receive a secure 6-digit OTP verification code."
                    : `Enter the 6-digit security code sent to ${forgotEmail} and choose a new password.`}
                </p>
              </div>

              {/* Forgot Password Sub-step 1: Request OTP */}
              {forgotStep === 1 && (
                <form onSubmit={handleInitiateForgotPassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Registered Official / Personal Email
                    </label>
                    <div className="relative">
                      <FaEnvelope
                        className="absolute left-3.5 top-3.5 text-slate-500"
                        size={14}
                      />
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="name@mospi.gov.in / officer@gmail.com"
                        className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 rounded-xl font-bold text-xs shadow-lg hover:shadow-blue-600/30 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <BsShieldLockFill size={14} />
                        <span>Send Password Reset Code</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Forgot Password Sub-step 2: Verify OTP & Set New Password */}
              {forgotStep === 2 && (
                <form onSubmit={handleVerifyForgotPassword} className="space-y-4">
                  {/* 6-Digit OTP Box */}
                  <div>
                    <label className="block text-center text-xs font-semibold text-slate-300 mb-2">
                      Enter 6-Digit Security Code
                    </label>
                    <div className="flex justify-center gap-2">
                      {forgotOtpDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={(el) => (forgotInputRefs.current[idx] = el)}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleForgotOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handleForgotKeyDown(idx, e)}
                          className="w-10 h-12 sm:w-11 sm:h-13 text-center text-lg font-black bg-slate-800/90 border-2 border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all"
                        />
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-xs mt-2 px-1">
                      <span className="text-slate-400 text-[11px]">
                        {forgotCountdown > 0 ? (
                          <span>
                            Resend in <strong className="text-slate-200">{forgotCountdown}s</strong>
                          </span>
                        ) : (
                          <span className="text-amber-400 font-semibold">Code expired?</span>
                        )}
                      </span>

                      <button
                        type="button"
                        disabled={!canResendForgot || loading}
                        onClick={handleResendForgotOtp}
                        className="text-[11px] font-bold text-blue-400 hover:text-blue-300 disabled:text-slate-600 transition-colors cursor-pointer disabled:cursor-not-allowed inline-flex items-center gap-1"
                      >
                        <BsArrowRepeat size={11} />
                        <span>Resend Code</span>
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      New Password (min. 6 characters)
                    </label>
                    <div className="relative">
                      <FaKey
                        className="absolute left-3.5 top-3.5 text-slate-500"
                        size={13}
                      />
                      <input
                        type={showNewPassword ? "text" : "password"}
                        required
                        minLength={6}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword((prev) => !prev)}
                        className="absolute right-3.5 top-3 text-slate-400 hover:text-white cursor-pointer"
                      >
                        {showNewPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <FaKey
                        className="absolute left-3.5 top-3.5 text-slate-500"
                        size={13}
                      />
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                      />
                    </div>
                    {confirmPassword && newPassword !== confirmPassword && (
                      <span className="text-[10px] text-rose-400 font-medium block mt-1">
                        Passwords do not match.
                      </span>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || forgotOtpDigits.join("").length !== 6 || newPassword.length < 6}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-3 rounded-xl font-bold text-xs shadow-lg hover:shadow-emerald-600/30 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <BsCheckCircleFill size={14} />
                        <span>Update Password & Return to Sign In</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 1: CREDENTIALS (NAME, EMAIL, PASSWORD, ROLE)          */}
          {/* ========================================================= */}
          {step === 1 && !isForgotPassword && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {isLogin ? "Welcome Back, Officer" : "Create Official Account"}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  {isLogin
                    ? "Sign in with Google or your credentials to access your dashboard."
                    : "Choose your role as a Statistical Learner or Trainer to begin capacity building."}
                </p>
              </div>

              {/* Google Sign In Button */}
              <button
                type="button"
                disabled={loading}
                onClick={handleGoogleAuth}
                className="w-full bg-white hover:bg-slate-100 text-slate-800 py-3 px-4 rounded-xl font-bold text-xs shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 border border-slate-300 select-none"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="relative my-4 flex items-center justify-center">
                <div className="border-t border-slate-700/80 w-full" />
                <span className="bg-slate-900/90 px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 shrink-0">
                  Or Email 2FA Security
                </span>
                <div className="border-t border-slate-700/80 w-full" />
              </div>

              <form onSubmit={handleInitiateAuth} className="space-y-4">
                {/* ROLE SELECTION CARDS (LEARNER vs TRAINER) FOR SIGNUP */}
                {!isLogin && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2">
                      Select Your Role <span className="text-rose-400">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      {/* Learner Option Card */}
                      <button
                        type="button"
                        onClick={() => setAccountRole("learner")}
                        className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer relative flex flex-col justify-between ${accountRole === "learner"
                            ? "border-blue-500 bg-blue-600/20 ring-2 ring-blue-500/20 shadow-md"
                            : "border-slate-700 bg-slate-800/60 hover:border-slate-600"
                          }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div
                            className={`p-2 rounded-xl ${accountRole === "learner"
                                ? "bg-blue-600 text-white"
                                : "bg-slate-700 text-slate-300"
                              }`}
                          >
                            <FaUserGraduate size={14} />
                          </div>
                          {accountRole === "learner" && (
                            <BsCheckCircleFill className="text-blue-400" size={14} />
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">Statistical Learner</div>
                          <div className="text-[10px] text-slate-400 leading-tight mt-0.5">
                            Officer, Trainee & Scholar
                          </div>
                        </div>
                      </button>

                      {/* Trainer Option Card */}
                      <button
                        type="button"
                        onClick={() => setAccountRole("trainer")}
                        className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer relative flex flex-col justify-between ${accountRole === "trainer"
                            ? "border-emerald-500 bg-emerald-600/20 ring-2 ring-emerald-500/20 shadow-md"
                            : "border-slate-700 bg-slate-800/60 hover:border-slate-600"
                          }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div
                            className={`p-2 rounded-xl ${accountRole === "trainer"
                                ? "bg-emerald-600 text-white"
                                : "bg-slate-700 text-slate-300"
                              }`}
                          >
                            <FaChalkboardTeacher size={14} />
                          </div>
                          {accountRole === "trainer" && (
                            <BsCheckCircleFill className="text-emerald-400" size={14} />
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">Statistical Trainer</div>
                          <div className="text-[10px] text-slate-400 leading-tight mt-0.5">
                            Faculty & Domain Expert
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {!isLogin && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <FaUserGraduate
                        className="absolute left-3.5 top-3.5 text-slate-500"
                        size={14}
                      />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Ramesh Kumar"
                        className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Official / Gov Email
                  </label>
                  <div className="relative">
                    <FaEnvelope
                      className="absolute left-3.5 top-3.5 text-slate-500"
                      size={14}
                    />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@mospi.gov.in / name@gmail.com"
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      Password
                    </label>
                    {isLogin && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsForgotPassword(true);
                          setForgotEmail(email);
                          setForgotStep(1);
                        }}
                        className="text-[11px] font-bold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <FaKey
                      className="absolute left-3.5 top-3.5 text-slate-500"
                      size={14}
                    />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 rounded-xl font-bold text-xs shadow-lg hover:shadow-blue-600/30 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <BsShieldLockFill size={14} />
                      <span>
                        {isLogin
                          ? "Continue & Send Security Code"
                          : `Register as ${accountRole === "trainer" ? "Trainer" : "Learner"} & Verify`}
                      </span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 2: 6-DIGIT EMAIL OTP VERIFICATION                    */}
          {/* ========================================================= */}
          {step === 2 && !isForgotPassword && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-3 transition-colors cursor-pointer"
                >
                  <FaArrowLeft size={10} />
                  <span>Change Email / Credentials</span>
                </button>

                <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center mx-auto mb-3">
                  <FaShieldAlt size={22} />
                </div>

                <h2 className="text-xl font-black text-white tracking-tight">
                  Verify Security Code
                </h2>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  We sent a 6-digit verification code to: <br />
                  <span className="font-bold text-blue-400">{email}</span>
                </p>
              </div>

              <div className="flex justify-center gap-2 sm:gap-3">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (inputRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-extrabold bg-slate-800/90 border-2 border-slate-700 rounded-2xl text-white focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all"
                  />
                ))}
              </div>

              <div className="flex items-center justify-between text-xs px-1">
                <span className="text-slate-400">
                  {countdown > 0 ? (
                    <span>
                      Resend in <strong className="text-slate-200">{countdown}s</strong>
                    </span>
                  ) : (
                    <span className="text-amber-400 font-semibold">Code expired?</span>
                  )}
                </span>

                <button
                  type="button"
                  disabled={!canResend || loading}
                  onClick={handleResendOtp}
                  className="font-bold text-blue-400 hover:text-blue-300 disabled:text-slate-600 transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                  Resend OTP
                </button>
              </div>

              <button
                type="submit"
                disabled={loading || otpDigits.join("").length !== 6}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-3.5 rounded-xl font-bold text-xs shadow-lg hover:shadow-emerald-600/30 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <BsCheckCircleFill size={14} />
                    <span>
                      {isLogin ? "Verify & Sign In" : "Verify & Setup Profile"}
                    </span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* ========================================================= */}
          {/* STEP 3: USER PROFILE SETUP (MULTIPLE QUALIFICATIONS & ROLE) */}
          {/* ========================================================= */}
          {step === 3 && (
            <form onSubmit={handleCompleteProfile} className="space-y-5">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-bold uppercase tracking-wider mb-2">
                  <FaUserGraduate size={11} />
                  <span>Cadre Onboarding Profile</span>
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Configure Your Professional Profile
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Add one or more educational qualifications and confirm your role for MoSPI NSSTA competency benchmarks.
                </p>
              </div>

              {/* DYNAMIC MULTI-EDUCATION QUALIFICATIONS MANAGER */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
                    <span>Educational Qualifications</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-medium">
                      {educationList.length} Added
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAddEducation}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-bold transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <FaPlus size={10} />
                    <span>Add Qualification</span>
                  </button>
                </div>

                <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                  {educationList.map((item, index) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700/80 space-y-3 relative group"
                    >
                      <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
                        <span className="text-[11px] font-bold text-blue-400 flex items-center gap-1.5">
                          <FaUniversity size={11} />
                          <span>
                            Qualification #{index + 1}{" "}
                            {index === 0 && (
                              <span className="text-[9px] text-slate-400 font-normal">
                                (Primary Degree)
                              </span>
                            )}
                          </span>
                        </span>

                        {educationList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveEducation(item.id)}
                            className="text-slate-400 hover:text-rose-400 transition-colors p-1 cursor-pointer"
                            title="Remove this qualification"
                          >
                            <FaTrashAlt size={12} />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Degree Dropdown */}
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                            Degree / Qualification <span className="text-rose-400">*</span>
                          </label>
                          <div className="relative">
                            <FaUserGraduate
                              className="absolute left-3 top-3 text-slate-500"
                              size={13}
                            />
                            <select
                              value={item.degree}
                              onChange={(e) =>
                                handleEducationChange(item.id, "degree", e.target.value)
                              }
                              className="w-full bg-slate-900/80 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer"
                            >
                              {EDUCATION_OPTIONS.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          </div>

                          {item.degree === "Other Higher Education Qualification" && (
                            <input
                              type="text"
                              required
                              value={item.customDegree}
                              onChange={(e) =>
                                handleEducationChange(item.id, "customDegree", e.target.value)
                              }
                              placeholder="Specify your degree / qualification name..."
                              className="w-full mt-2 bg-slate-900/80 border border-slate-700 rounded-xl px-3.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
                            />
                          )}
                        </div>

                        {/* College / Institution Name */}
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                            College / University Name <span className="text-rose-400">*</span>
                          </label>
                          <div className="relative">
                            <FaUniversity
                              className="absolute left-3 top-3 text-slate-500"
                              size={13}
                            />
                            <input
                              type="text"
                              required
                              value={item.collegeName}
                              onChange={(e) =>
                                handleEducationChange(item.id, "collegeName", e.target.value)
                              }
                              placeholder="e.g. ISI Kolkata / Delhi University / IIT"
                              className="w-full bg-slate-900/80 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                            />
                          </div>
                        </div>

                        {/* Pass Out Year Range */}
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                            Pass Out Year Range <span className="text-rose-400">*</span>
                          </label>
                          <div className="relative">
                            <FaCalendarAlt
                              className="absolute left-3 top-3 text-slate-500"
                              size={12}
                            />
                            <select
                              value={item.passOutYearRange}
                              onChange={(e) =>
                                handleEducationChange(item.id, "passOutYearRange", e.target.value)
                              }
                              className="w-full bg-slate-900/80 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer"
                            >
                              {YEAR_RANGE_OPTIONS.map((yr) => (
                                <option key={yr} value={yr}>
                                  {yr}
                                </option>
                              ))}
                            </select>
                          </div>

                          {item.passOutYearRange === "Custom Year Range" && (
                            <input
                              type="text"
                              required
                              value={item.customYearRange}
                              onChange={(e) =>
                                handleEducationChange(item.id, "customYearRange", e.target.value)
                              }
                              placeholder="e.g. 2017 - 2021"
                              className="w-full mt-2 bg-slate-900/80 border border-slate-700 rounded-xl px-3.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* TARGET CADRE & ACCOUNT ROLE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-700/60">
                {/* Target Cadre / Job Role */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Target Cadre / Job Role <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <FaBriefcase
                      className="absolute left-3.5 top-3.5 text-slate-500"
                      size={13}
                    />
                    <select
                      value={targetCadre}
                      onChange={(e) => setTargetCadre(e.target.value)}
                      className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer"
                    >
                      {CADRE_OPTIONS.map((cadre) => (
                        <option key={cadre} value={cadre}>
                          {cadre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Account Role Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Account Role <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    {accountRole === "trainer" ? (
                      <FaChalkboardTeacher
                        className="absolute left-3.5 top-3.5 text-emerald-400"
                        size={14}
                      />
                    ) : (
                      <FaUserTie
                        className="absolute left-3.5 top-3.5 text-blue-400"
                        size={14}
                      />
                    )}
                    <select
                      value={accountRole}
                      onChange={(e) => setAccountRole(e.target.value)}
                      className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer"
                    >
                      <option value="learner">Statistical Learner / Officer</option>
                      <option value="trainer">Statistical Trainer / Domain Faculty</option>
                    </select>
                  </div>
                </div>

                {/* Conditional Trainer Experience Field */}
                {accountRole === "trainer" && (
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-emerald-400 mb-1.5 flex items-center justify-between">
                      <span>Years of Training / Domain Experience *</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                        Faculty Credential
                      </span>
                    </label>
                    <div className="relative">
                      <FaChalkboardTeacher
                        className="absolute left-3.5 top-3.5 text-emerald-400"
                        size={14}
                      />
                      <input
                        type="number"
                        min="0"
                        max="50"
                        required
                        value={experienceYears}
                        onChange={(e) => setExperienceYears(e.target.value)}
                        placeholder="e.g. 5"
                        className="w-full bg-slate-800/90 border-2 border-emerald-500/50 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Account Role Summary Callout */}
              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 text-[11px] text-slate-400 leading-relaxed">
                {accountRole === "learner" && (
                  <span>
                    💡 <strong>Learner Mode:</strong> Personalized capacity building pathways, practice quizzes, and viva assessments tailored to {targetCadre}.
                  </span>
                )}
                {accountRole === "trainer" && (
                  <span>
                    🎓 <strong>Trainer Mode:</strong> Verified faculty access to curriculum modules, evaluation rubrics, and trainee analytics based on your {experienceYears || 0} years experience.
                  </span>
                )}
                {accountRole === "admin" && (
                  <span>
                    🏛️ <strong>Administrator Mode:</strong> Academy-level oversight across MoSPI divisions, batch tracking, and TPAC analytics.
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3.5 rounded-xl font-bold text-xs shadow-xl hover:shadow-blue-500/30 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <BsCheckCircleFill size={14} />
                    <span>Complete Profile & Launch Platform 🚀</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Modern Footer */}
      <div className="max-w-md w-full mx-auto text-center z-10 text-[11px] text-slate-500">
        © {new Date().getFullYear()} Ministry of Statistics & Programme Implementation (MoSPI).<br />
        Aligned with iGOT Karmayogi & NSSTA TPAC Framework.
      </div>
    </div>
  );
};

export default Auth;
