import React from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import BackButton from "./BackButton";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useSelector } from "react-redux";

const Step3 = ({ report }) => {
  const navigate = useNavigate();
  const { userData } = useSelector((state) => state.user);

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="flex flex-col items-center gap-5 rounded-2xl bg-white/70 backdrop-blur-md px-8 py-10 shadow-xl border border-slate-200">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-500"></div>

          <div className="text-center">
            <p className="text-lg font-semibold text-slate-700 animate-pulse">
              Loading Report...
            </p>
            <p className="text-sm text-slate-500 mt-1">
              Please wait while we prepare your data
            </p>
          </div>
        </div>
      </div>
    );
  }
  const {
    finalScore = 0,
    confidence = 0,
    communication = 0,
    correctness = 0,
    questionWiseScore = [],
  } = report;

  const questionWiseScoreData = questionWiseScore.map((q, index) => ({
    name: `Q${index + 1}`,
    score: q.score || 0,
  }));
  const skills = [
    { label: "Confidence", value: confidence },
    { label: "Communication", value: communication },
    { label: "Correctness", value: correctness },
  ];

  let performanceText = "";
  let shortTagline = "";

  if (finalScore >= 8) {
    performanceText = "Ready for job opportunities.";
    shortTagline = "Excellent clarity and structured response.";
  } else if (finalScore >= 5) {
    performanceText = "Needs minor improvement before interviews.";
    shortTagline = "Good foundation, refine articulation.";
  } else {
    performanceText = "Significant improvement required.";
    shortTagline = "Work on clarity and confidence.";
  }

  const score = finalScore;
  const percentage = (score / 10) * 100;

  const downloadPDF = () => {
    const doc = new jsPDF("p", "mm", "a4");

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const margin = 18;
    const contentWidth = pageWidth - margin * 2;

    let currentY = 25;

    // =========== LIGHT PREMIUM BACKGROUND ===========
    doc.setFillColor(248, 250, 252);
    doc.rect(0, 0, pageWidth, pageHeight, "F");

    // =========== PREMIUM TOP HEADER ===========
    doc.setFillColor(30, 58, 138); // Deep MoSPI Navy #1E3A8A
    doc.rect(0, 0, pageWidth, 55, "F");

    // Tricolor Ribbon
    doc.setFillColor(255, 153, 51);
    doc.rect(0, 55, pageWidth / 3, 2, "F");
    doc.setFillColor(255, 255, 255);
    doc.rect(pageWidth / 3, 55, pageWidth / 3, 2, "F");
    doc.setFillColor(19, 136, 8);
    doc.rect((pageWidth / 3) * 2, 55, pageWidth / 3, 2, "F");

    // =========== TITLE ===========
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.text("MoSPI • NSSTA — AI Interview Scorecard", margin, 20);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(219, 234, 254);
    doc.text("Official Cadre Mock Viva Voce & Technical Performance Analytics", margin, 28);

    // ========== USER DETAILS ===========
    const today = new Date().toLocaleDateString("en-IN");
    doc.setFontSize(9);
    doc.setTextColor(191, 219, 254);
    doc.text(`Candidate / Officer: ${userData?.name || "Statistical Officer"} (${userData?.jobRole || "Cadre Officer"})`, margin, 38);
    doc.text(`Evaluation Date: ${today} | Verified by SankhyaIQ™ AI Neural Engine`, margin, 46);
    currentY = 68;

    // ========== OVERALL SCORE CARD ===========

    doc.setFillColor(255, 255, 255);
    doc.roundedRect(margin, currentY, contentWidth, 44, 8, 8, "F");
    doc.setDrawColor(230);
    doc.roundedRect(margin, currentY, contentWidth, 44, 8, 8);

    // Left Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(55);
    doc.text("Overall Interview Score", margin + 12, currentY + 15);

    // Score
    doc.setFontSize(34);
    if (finalScore >= 8) {
      doc.setTextColor(16, 185, 129);
    } else if (finalScore >= 5) {
      doc.setTextColor(245, 158, 11);
    } else {
      doc.setTextColor(239, 68, 68);
    }
    doc.text(`${finalScore}/10`, pageWidth - margin - 12, currentY + 26, {
      align: "right",
    });

    // Tag
    let performanceTag = "";
    if (finalScore >= 8) {
      performanceTag = "Excellent Performance";
    } else if (finalScore >= 5) {
      performanceTag = "Good Potential";
    } else {
      performanceTag = "Needs Improvement";
    }
    doc.setFontSize(11);
    doc.setTextColor(120);
    doc.text(performanceTag, pageWidth - margin - 12, currentY + 36, {
      align: "right",
    });
    currentY += 58;

    // ============ SKILL CARDS ===========
    const cardWidth = 52;
    const gap = 8;
    const skillData = [
      {
        label: "Confidence",
        value: confidence,
        color: [59, 130, 246],
      },
      {
        label: "Communication",
        value: communication,
        color: [16, 185, 129],
      },
      {
        label: "Correctness",
        value: correctness,
        color: [245, 158, 11],
      },
    ];
    skillData.forEach((skill, index) => {
      const x = margin + index * (cardWidth + gap);

      // Card
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(x, currentY, cardWidth, 44, 8, 8, "F");
      doc.setDrawColor(235);
      doc.roundedRect(x, currentY, cardWidth, 44, 8, 8);

      // Top Bar
      doc.setFillColor(...skill.color);
      doc.roundedRect(x, currentY, cardWidth, 5, 8, 8, "F");

      // Label
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(70);
      doc.text(skill.label, x + 6, currentY + 18);

      // Value
      doc.setFontSize(24);
      doc.setTextColor(...skill.color);
      doc.text(`${skill.value}`, x + 6, currentY + 34);
    });

    currentY += 65;

    // ============ PROFESSIONAL FEEDBACK ===========

    let advice = "";
    if (finalScore >= 8) {
      advice =
        "Excellent performance. Strong communication, structured thinking, and technical clarity were demonstrated consistently throughout the interview.";
    } else if (finalScore >= 5) {
      advice =
        "Good foundation shown. Improve confidence, answer structure, and communication clarity to reach the next level.";
    } else {
      advice =
        "More practice is required. Focus on mock interviews, concise communication, and improving technical confidence.";
    }

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(19);
    doc.setTextColor(15, 23, 42);
    doc.text("Professional Feedback", margin, currentY);
    currentY += 12;

    // Advice Box
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(margin, currentY, contentWidth, 50, 8, 8, "F");
    doc.setDrawColor(235);
    doc.roundedRect(margin, currentY, contentWidth, 50, 8, 8);

    // Advice Text
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(80);
    const splitAdvice = doc.splitTextToSize(advice, contentWidth - 20);
    doc.text(splitAdvice, margin + 10, currentY + 15);

    // ============= NEXT PAGE ===========

    doc.addPage();

    // Light Background
    doc.setFillColor(248, 250, 252);
    doc.rect(0, 0, pageWidth, pageHeight, "F");

    // Top Banner
    doc.setFillColor(16, 185, 129);
    doc.rect(0, 0, pageWidth, 42, "F");

    // Decorative Circle
    doc.setFillColor(52, 211, 153);
    doc.circle(pageWidth - 18, 10, 16, "F");

    // Heading
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.text("Question Breakdown", margin, 24);

    // Subtitle
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Detailed AI evaluation for every interview answer", margin, 32);

    currentY = 55;

    // White Table Container
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(margin, currentY - 10, contentWidth, 210, 8, 8, "F");
    doc.setDrawColor(235);
    doc.roundedRect(margin, currentY - 10, contentWidth, 210, 8, 8);

    // ================== PREMIUM TABLE ===========

    autoTable(doc, {
      startY: currentY,
      margin: {
        left: margin + 4,
        right: margin + 4,
      },
      head: [["#", "Question", "Score", "AI Feedback"]],
      body: questionWiseScore.map((q, i) => [
        `${i + 1}`,
        q.question || "No Question",
        `${q.score || 0}/10`,
        q.feedback || "No feedback available",
      ]),
      theme: "grid",
      styles: {
        fontSize: 9,
        cellPadding: 5,
        valign: "middle",
        lineColor: [235, 235, 235],
        lineWidth: 0.5,
      },
      headStyles: {
        fillColor: [16, 185, 129],
        textColor: 255,
        fontStyle: "bold",
        halign: "center",
        fontSize: 10,
      },
      bodyStyles: {
        textColor: 60,
        fillColor: [255, 255, 255],
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: {
          cellWidth: 12,
          halign: "center",
        },
        1: {
          cellWidth: 60,
        },
        2: {
          cellWidth: 22,
          halign: "center",
        },
        3: {
          cellWidth: "auto",
        },
      },
    });
    // =============== FOOTER ===========

    const finalY = doc.lastAutoTable.finalY;
    doc.setDrawColor(220);
    doc.line(margin, finalY + 15, pageWidth - margin, finalY + 15);
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text(
      "Generated by Premium AI Interview Analytics Platform",
      pageWidth / 2,
      finalY + 24,
      {
        align: "center",
      },
    );

    // ============SAVE ===========

    doc.save(`${userData?.name || "Candidate"}_Interview_Report.pdf`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 relative overflow-hidden px-4 sm:px-8 lg:px-14 py-10 transition-colors duration-300">
      {/* Gradient Blur Background */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-emerald-300/20 dark:bg-emerald-500/10 blur-[120px] rounded-full opacity-40"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-300/20 dark:bg-blue-500/10 blur-[140px] rounded-full opacity-50"></div>

      {/* Header */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-10">
        <div className="flex items-center gap-4 sm:gap-5">
          <BackButton fallbackUrl="/history" label="Back" />

          <div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
              Interview{" "}
              <span className="bg-gradient-to-r from-emerald-500 to-green-400 bg-clip-text text-transparent">
                Analytics
              </span>
            </h1>

            <p className="text-slate-500 dark:text-slate-400 mt-2 text-xs sm:text-sm font-medium">
              SankhyaIQ™ AI official competency scorecard & diagnostic evaluation
            </p>
          </div>
        </div>

        <button
          onClick={downloadPDF}
          className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg px-6 py-3.5 rounded-2xl font-bold text-xs text-white cursor-pointer"
        >
          Download Report (PDF)
        </button>
      </div>

      {/* Grid */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT */}
        <div className="space-y-8">
          {/* Performance Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-8 shadow-xs"
          >
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-6">
              Overall Performance
            </p>

            <div className="w-36 h-36 mx-auto">
              <CircularProgressbar
                value={percentage}
                text={`${score}/10`}
                styles={buildStyles({
                  textSize: "16px",
                  pathColor: "#10b981",
                  textColor: "#10b981",
                  trailColor: "#334155",
                })}
              />
            </div>

            <div className="mt-6 text-center">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {performanceText}
              </h3>

              <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-xs">{shortTagline}</p>
            </div>
          </motion.div>

          {/* Skills */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-8 shadow-xs"
          >
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
              Skill Evaluation
            </h3>

            <div className="space-y-6">
              {skills.map((s, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-2 text-xs font-bold">
                    <span className="text-slate-700 dark:text-slate-300">{s.label}</span>

                    <span className="text-emerald-600 dark:text-emerald-400">
                      {s.value}/10
                    </span>
                  </div>

                  <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${s.value * 10}%` }}
                      transition={{ duration: 1 }}
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-400"
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* RIGHT */}
        <div className="lg:col-span-2 space-y-8">
          {/* Chart */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Question Performance Trend
              </h3>

              <div className="bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-xl text-xs font-bold">
                Live Analytics
              </div>
            </div>

            <div className="h-64 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={questionWiseScoreData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />

                  <XAxis dataKey="name" stroke="#64748b" textAnchor="middle" />
                  <YAxis domain={[0, 10]} stroke="#64748b" />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      color: "#fff",
                      borderRadius: "12px",
                      border: "1px solid #334155",
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#10b981"
                    fillOpacity={1}
                    fill="url(#colorScore)"
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Question Breakdown
              </h3>

              <div className="bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-xl text-xs font-bold">
                AI Evaluation
              </div>
            </div>

            <div className="space-y-5">
              {questionWiseScore.map((q, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                  className="bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 rounded-2xl p-5 hover:shadow-md transition-all"
                >
                  {/* Top */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">
                        Question {i + 1}
                      </p>

                      <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-relaxed">
                        {q.question || "Question not available"}
                      </h4>
                    </div>

                    {/* Score Badge */}
                    <div className="bg-gradient-to-r from-emerald-600 to-green-600 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-sm min-w-[75px] text-center shrink-0">
                      {q.score ?? 0}/10
                    </div>
                  </div>

                  {/* Feedback */}
                  <div className="bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>

                      <p className="text-emerald-700 dark:text-emerald-400 font-bold text-xs">
                        AI Cadre Feedback
                      </p>
                    </div>

                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs">
                      {q.feedback?.trim()
                        ? q.feedback
                        : "No feedback available for this question."}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Step3;
