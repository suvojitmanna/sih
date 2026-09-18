import { BsShieldCheck } from "react-icons/bs";
import { HiSparkles } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <footer className="relative bg-slate-100/70 dark:bg-slate-950 border-t border-slate-200/80 dark:border-slate-800/80 pt-16 pb-12 overflow-hidden transition-colors duration-300">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/5 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-500/5 blur-3xl rounded-full pointer-events-none" />

      <div className="absolute top-0 left-0 right-0 h-1 w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/80 dark:bg-slate-900/85 backdrop-blur-2xl rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 sm:p-12 shadow-xl">

          <div className="flex flex-col lg:flex-row justify-between gap-10">

            <div className="max-w-md space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-900 text-white flex flex-col items-center justify-center shadow-lg border border-blue-400/30 shrink-0 overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />
                  <span className="font-black text-sm tracking-tight text-white drop-shadow-xs">
                    S
                  </span>
                  <span className="text-[7px] font-black tracking-widest text-amber-300 flex items-center gap-0.5">
                    <HiSparkles size={6} className="text-amber-400 animate-pulse" /> AI
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    SankhyaIQ <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 dark:from-blue-400 dark:via-indigo-300 dark:to-violet-400">AI</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    {t("footer.academy", "National Statistical Systems Training Academy")}
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {t("footer.tagline", "Empowering India's Official Statistical Cadre with AI-driven competency gap analytics, automated survey training workflows, and personalized iGOT Karmayogi learning pathways.")}
              </p>

              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                <BsShieldCheck className="text-emerald-600 dark:text-emerald-400" size={14} />
                <span>Gov of India • MoSPI Official Capacity Building</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-xs">

              <div className="space-y-3">
                <h3 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                  Core Modules
                </h3>
                <div className="space-y-2.5 text-slate-600 dark:text-slate-400 font-medium">
                  <p onClick={() => navigate("/dashboard")} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
                    Performance Dashboard
                  </p>
                  <p onClick={() => navigate("/competencies")} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
                    Competency Matrix
                  </p>
                  <p onClick={() => navigate("/interview")} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
                    Cadre Mock Viva Voice
                  </p>
                  <p onClick={() => navigate("/quizzes")} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
                    AI Question Bank
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                  AI & Integrations
                </h3>
                <div className="space-y-2.5 text-slate-600 dark:text-slate-400 font-medium">
                  <p onClick={() => navigate("/ai-models")} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer flex items-center gap-1">
                    <HiSparkles size={13} className="text-amber-500" />
                    <span>AI Models Hub</span>
                  </p>
                  <p onClick={() => navigate("/learning-path")} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
                    iGOT Karmayogi Sync
                  </p>
                  <p onClick={() => navigate("/materials")} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
                    Survey Manual MCQ Gen
                  </p>
                  <p onClick={() => navigate("/history")} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
                    Interview History
                  </p>
                </div>
              </div>

              <div className="space-y-3 col-span-2 sm:col-span-1">
                <h3 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                  Governance
                </h3>
                <div className="space-y-2.5 text-slate-600 dark:text-slate-400 font-medium">
                  <p onClick={() => navigate("/terms")} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
                    Terms & Guidelines
                  </p>
                  <p onClick={() => navigate("/privacy")} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
                    Data Privacy & Security
                  </p>
                  <p onClick={() => navigate("/portal-comparison")} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400">
                    <BsShieldCheck size={12} />
                    <span>Portal Difference (VS Legacy)</span>
                  </p>
                  <p onClick={() => navigate("/admin")} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
                    NSSTA Admin Portal
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="my-8 h-[1px] bg-slate-200/80 dark:bg-slate-800" />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
            <div className="space-y-1 text-center sm:text-left">
              <p>
                © {new Date().getFullYear()} {t("footer.ministry", "Ministry of Statistics and Programme Implementation (MoSPI), Government of India.")}
              </p>
              <p className="text-[10.5px] text-slate-400 dark:text-slate-500">
                {t("footer.bhashini", "Digital India Bhashini Language Localization Initiative (English | हिन्दी)")}
              </p>
            </div>

            <div className="flex items-center gap-5">
              <span onClick={() => navigate("/terms")} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
                Terms of Use
              </span>
              <span onClick={() => navigate("/privacy")} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
                Privacy Policy
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                NQAF Compliant
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
