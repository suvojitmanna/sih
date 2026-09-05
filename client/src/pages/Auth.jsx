import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";
import { ServerUrl } from "../App";
import axios from "axios";
import toast from "react-hot-toast";
import { FaUserGraduate, FaShieldAlt, FaKey, FaEnvelope, FaArrowLeft } from "react-icons/fa";
import { BsCheckCircleFill, BsShieldLockFill } from "react-icons/bs";
import { signInWithGooglePopup } from "../utils/googleAuth";

const CADRE_OPTIONS = [
  "Indian Statistical Service (ISS) Officer",
  "Senior Statistical Officer (SSO)",
  "Junior Statistical Officer (JSO)",
  "Field Operations / Investigator (FOD)",
  "Data Scientist / Statistical Analyst",
  "Director / Division Head (CSO / NSSO)",
];

const DEPARTMENT_OPTIONS = [
  "National Sample Survey Office (NSSO)",
  "Central Statistics Office (CSO)",
  "National Accounts Division (NAD)",
  "Economic Statistics Division (ESD)",
  "Field Operations Division (FOD)",
  "Survey Design & Research Division (SDRD)",
  "Data Quality & Dissemination Division",
  "State Directorate of Economics & Statistics (DES)",
  "Ministry of Statistics & Programme Implementation (HQ)",
];

const Auth = ({ isModel = false }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

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
      toast.success(`Welcome, ${loggedUser.name || googleUser.name || "Officer"}! Signed in with Google. 🚀`);
      if (!isModel) {
        navigate("/");
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

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("learner");
  const [jobRole, setJobRole] = useState(CADRE_OPTIONS[0]);
  const [department, setDepartment] = useState(DEPARTMENT_OPTIONS[0]);
  const [designation, setDesignation] = useState("Statistical Officer");

  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

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
        // Signup Initiate
        const { data } = await axios.post(
          `${ServerUrl}/api/auth/signup-initiate`,
          { name, email, password, role, jobRole, department, designation },
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
          toast.success("Welcome back! Signed in securely. ✨");
          dispatch(setUserData(data.user));
          if (data.token) localStorage.setItem("token", data.token);
          navigate("/");
        }
      } else {
        // Signup Verify
        const { data } = await axios.post(
          `${ServerUrl}/api/auth/signup-verify`,
          { email, otp: fullOtp },
          { withCredentials: true }
        );
        if (data.success) {
          toast.success("Account activated successfully! Welcome to MoSPI SkillIQ. 🚀");
          dispatch(setUserData(data.user));
          if (data.token) localStorage.setItem("token", data.token);
          navigate("/");
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid or expired verification code.");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white flex flex-col justify-between py-8 px-4 sm:px-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full mx-auto text-center z-10">
        <div
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-3 cursor-pointer group mb-2"
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-black text-sm tracking-wider border border-white/20 shadow-lg">
            NSSTA
          </div>
          <div className="text-left">
            <h1 className="text-xl font-extrabold tracking-tight">
              MoSPI <span className="text-blue-400">SkillIQ</span>
            </h1>
            <p className="text-[11px] text-slate-300 font-medium">
              National Statistical Systems Training Academy
            </p>
          </div>
        </div>
      </div>

      {/* Main Authentication Card */}
      <div className="max-w-md w-full mx-auto z-10 my-auto">
        <div className="bg-slate-900/80 backdrop-blur-2xl border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="h-1 w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808] rounded-full mb-6" />

          {step === 1 && (
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

          {/* STEP 1: CREDENTIALS FORM */}
          {step === 1 ? (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {isLogin ? "Welcome Back, Officer" : "Register Official Profile"}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  {isLogin
                    ? "Sign in with Google or your credentials to access your dashboard."
                    : "Join the official capacity building platform for India's Statistical System."}
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

                {!isLogin && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
                    <div className="relative">
                      <FaUserGraduate className="absolute left-3.5 top-3.5 text-slate-500" size={14} />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Dr. Ramesh Kumar, ISS"
                        className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Official / Gov Email</label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-3.5 top-3.5 text-slate-500" size={14} />
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
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
                  <div className="relative">
                    <FaKey className="absolute left-3.5 top-3.5 text-slate-500" size={14} />
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

                {!isLogin && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">Cadre / Job Role</label>
                        <select
                          value={jobRole}
                          onChange={(e) => setJobRole(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-blue-500"
                        >
                          {CADRE_OPTIONS.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">Account Role</label>
                        <select
                          value={role}
                          onChange={(e) => setRole(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-blue-500"
                        >
                          <option value="learner">Statistical Learner / Officer</option>
                          <option value="admin">Training Administrator / NSSTA</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Department / Division</label>
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-blue-500"
                      >
                        {DEPARTMENT_OPTIONS.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

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
                      <span>{isLogin ? "Continue & Send Security Code" : "Register & Send Verification Code"}</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            /* STEP 2: 6-DIGIT EMAIL OTP VERIFICATION */
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
                    <span>Resend available in <strong className="text-slate-200">{countdown}s</strong></span>
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
                    <span>{isLogin ? "Verify & Sign In" : "Verify & Activate Account"}</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="max-w-md w-full mx-auto text-center z-10 text-[11px] text-slate-500">
        © {new Date().getFullYear()} Ministry of Statistics & Programme Implementation (MoSPI).<br />
        Aligned with iGOT Karmayogi & NSSTA TPAC Framework.
      </div>
    </div>
  );
};

export default Auth;
