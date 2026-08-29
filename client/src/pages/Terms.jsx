import React, { useEffect } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  HiArrowLeft,
  HiOutlineScale,
  HiOutlineBookOpen,
  HiOutlineCpuChip,
  HiOutlineHandRaised,
} from "react-icons/hi2";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const TermsOfService = () => {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    { id: "acceptance", title: "1. Acceptance of Terms", icon: <HiOutlineScale /> },
    { id: "cadre-standards", title: "2. Official Cadre Standards", icon: <HiOutlineBookOpen /> },
    { id: "ai-methodology", title: "3. AI Evaluation Methodology", icon: <HiOutlineCpuChip /> },
    { id: "code-of-conduct", title: "4. User Code of Conduct", icon: <HiOutlineHandRaised /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-blue-100 dark:selection:bg-blue-900 transition-colors duration-300">
      <Navbar />

      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 origin-left z-50"
        style={{ scaleX }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-24 pt-28">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          {/* Left Sidebar - Navigation */}
          <aside className="lg:w-1/4 lg:sticky lg:top-24 h-fit">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all mb-8 group font-bold text-xs cursor-pointer"
            >
              <HiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
              <span>Back to Previous Screen</span>
            </button>

            <nav className="hidden lg:block space-y-2 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3 px-2">
                Agreement Sections
              </p>
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-all text-xs font-semibold"
                >
                  <span className="text-base text-blue-600 dark:text-blue-400">{section.icon}</span>
                  <span>{section.title}</span>
                </a>
              ))}
            </nav>
          </aside>

          {/* Main Legal Content */}
          <motion.main
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:w-3/4 space-y-8"
          >
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 sm:p-14 shadow-xl border border-slate-200/80 dark:border-slate-800 space-y-12">
              <header className="border-b border-slate-100 dark:border-slate-800 pb-8">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-extrabold tracking-wider uppercase mb-4 border border-blue-200/60 dark:border-blue-800/60">
                  TERMS OF SERVICE & TRAINING GOVERNANCE
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                  Official Terms of Use
                </h1>
                <p className="text-xs font-bold text-slate-400">
                  National Statistical Systems Training Academy (NSSTA) • Ministry of Statistics and Programme Implementation (MoSPI)
                </p>
              </header>

              <div className="space-y-12 text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
                {/* 1. Acceptance */}
                <section id="acceptance" className="scroll-mt-24 space-y-4">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs font-bold">1</span>
                    Acceptance of Terms
                  </h2>
                  <p>
                    By registering or accessing the <span className="text-blue-600 dark:text-blue-400 font-bold">MoSPI • NSSTA SkillIQ Platform</span>, you agree to adhere to these official training rules, National Quality Assurance Framework (NQAF) standards, and applicable government cybersecurity policies.
                  </p>
                </section>

                {/* 2. Cadre Standards */}
                <section id="cadre-standards" className="scroll-mt-24 space-y-4">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs font-bold">2</span>
                    Official Cadre Standards
                  </h2>
                  <p>
                    This platform serves officers of the Indian Statistical Service (ISS), Subordinate Statistical Service (SSS / JSO / SSO), Field Operations Division (FOD), and allied statistical divisions. All competencies, learning pathways, and quizzes are designed to benchmark skills against national statistical standards.
                  </p>
                </section>

                {/* 3. AI Methodology */}
                <section id="ai-methodology" className="scroll-mt-24 space-y-4">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs font-bold">3</span>
                    SankhyaIQ™ AI Neural Engine Evaluation
                  </h2>
                  <p>
                    Evaluations generated during AI Cadre Mock Interviews and automated case studies are advisory diagnostic tools intended for self-improvement and professional capacity building.
                  </p>
                </section>

                {/* 4. User Conduct */}
                <section id="code-of-conduct" className="scroll-mt-24 space-y-4">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs font-bold">4</span>
                    User Code of Conduct
                  </h2>
                  <p>
                    Users must maintain the confidentiality of their official login credentials. Attempting to reverse engineer or extract proprietary evaluation models is strictly prohibited.
                  </p>
                </section>
              </div>

              <footer className="pt-8 border-t border-slate-100 dark:border-slate-800 text-center text-slate-400 text-xs">
                Official Capacity Building Secretariat • National Statistical Systems Training Academy (NSSTA)
              </footer>
            </div>
          </motion.main>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TermsOfService;
