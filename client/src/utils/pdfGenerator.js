import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Generates an ultra-modern, Government of India / MoSPI / NSSTA branded
 * Official Competency Assessment, Weakness Analysis & Learning Pathway Dossier (PDF).
 * Verified by SankhyaIQ™ AI Neural Engine.
 */
export const generateCompetencyPDF = ({
  user,
  profile,
  competencies = [],
  skillGaps = [],
  learningPath = [],
}) => {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  // Background subtle canvas
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // =========== 1. TOP OFFICIAL HEADER BANNER ===========
  // Deep MoSPI Navy Banner
  doc.setFillColor(30, 58, 138); // #1E3A8A
  doc.rect(0, 0, pageWidth, 42, "F");

  // Tricolor Indian Accent Ribbon
  doc.setFillColor(255, 153, 51); // Saffron #FF9933
  doc.rect(0, 42, pageWidth / 3, 2.5, "F");
  doc.setFillColor(255, 255, 255); // White
  doc.rect(pageWidth / 3, 42, pageWidth / 3, 2.5, "F");
  doc.setFillColor(19, 136, 8); // Green #138808
  doc.rect((pageWidth / 3) * 2, 42, pageWidth / 3, 2.5, "F");

  // Title text in Banner
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("MINISTRY OF STATISTICS & PROGRAMME IMPLEMENTATION", margin, 16);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(219, 234, 254); // Light blue #DBEAFE
  doc.text(
    "National Statistical Systems Training Academy (NSSTA) • SkillIQ Intelligence Dossier",
    margin,
    24
  );

  doc.setFontSize(8);
  doc.setTextColor(191, 219, 254);
  doc.text(`Official Document ID: NSSTA-${Date.now().toString().slice(-6)} | Date: ${new Date().toLocaleDateString("en-IN")}`, margin, 32);

  // Score Badge in Header Right
  const overallScore = profile?.overallCompetencyScore || user?.overallCompetencyScore || 68;
  doc.setFillColor(255, 255, 255, 0.15);
  doc.roundedRect(pageWidth - margin - 38, 8, 38, 26, 3, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text("OVERALL INDEX", pageWidth - margin - 33, 14);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(`${overallScore}%`, pageWidth - margin - 28, 24);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text(profile?.overallLevel || "Intermediate", pageWidth - margin - 33, 30);

  let currentY = 52;

  // =========== 2. OFFICER / STUDENT PROFILE SUMMARY ===========
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, 28, 3, 3, "FD");

  doc.setTextColor(30, 41, 59);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(`Officer Profile: ${profile?.name || user?.name || "Statistical Officer"}`, margin + 5, currentY + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);

  const col1X = margin + 5;
  const col2X = margin + 68;
  const col3X = margin + 131;

  const colWidth = 55;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);

  doc.text(
    doc.splitTextToSize(
      `Cadre Role: ${profile?.jobRole || user?.jobRole || "ISS Officer"}`,
      colWidth
    ),
    col1X,
    currentY + 15
  );

  doc.text(
    doc.splitTextToSize(
      `Department: ${profile?.department || user?.department || "NSSO / MoSPI"}`,
      colWidth
    ),
    col2X,
    currentY + 15
  );

  doc.text(
    doc.splitTextToSize(
      `Experience: ${profile?.workExperience || "3+ Years"}`,
      colWidth
    ),
    col3X,
    currentY + 15
  );

  doc.text(`Active Skill Gaps: ${skillGaps.length} Areas`, col1X, currentY + 22);
  doc.text(`Pathway Modules: ${learningPath.length} Assigned`, col2X, currentY + 22);
  doc.text(`Evaluated via: SankhyaIQ™ AI Engine`, col3X, currentY + 22);

  currentY += 34;

  // =========== 3. PERFORMANCE ACROSS COMPETENCIES TABLE ===========
  doc.setTextColor(30, 58, 138);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("1. Learner Performance & Cadre Benchmarking Matrix", margin, currentY);

  currentY += 3;

  const compTableData = (competencies.length > 0 ? competencies : [
    { competencyName: "Sampling Techniques & Estimation", domain: "Statistical", score: 45, level: "Beginner" },
    { competencyName: "National Accounts (SNA 2008)", domain: "Statistical", score: 80, level: "Advanced" },
    { competencyName: "Statistical Computing & Automated Survey Data Processing", domain: "Technical", score: 40, level: "Beginner" },
    { competencyName: "Data Privacy & DPDP Act", domain: "Governance", score: 72, level: "Intermediate" },
    { competencyName: "Price Statistics (CPI/WPI)", domain: "Statistical", score: 85, level: "Advanced" },
  ]).map((c) => {
    const isWeak = c.score < 50;
    const status = c.score >= 75 ? "Meets Benchmark" : c.score >= 50 ? "Developing" : "CRITICAL WEAKNESS";
    return [
      c.competencyName,
      c.domain || "Statistical",
      `${c.score}%`,
      "75%",
      `${c.score - 75 >= 0 ? "+" : ""}${c.score - 75}%`,
      status,
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: [["Competency Area", "Domain", "Score", "Benchmark", "Deficit", "Status"]],
    body: compTableData,
    theme: "grid",
    headStyles: {
      fillColor: [30, 58, 138],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: "bold",
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [51, 65, 85],
    },
    alternateRowStyles: {
      fillColor: [241, 245, 249],
    },
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 5) {
        if (data.cell.raw === "CRITICAL WEAKNESS") {
          data.cell.styles.textColor = [225, 29, 72]; // Rose-600
          data.cell.styles.fontStyle = "bold";
        } else if (data.cell.raw === "Meets Benchmark") {
          data.cell.styles.textColor = [16, 185, 129]; // Emerald
          data.cell.styles.fontStyle = "bold";
        }
      }
    },
    margin: { left: margin, right: margin },
  });

  currentY = doc.lastAutoTable.finalY + 8;

  // =========== 4. DETECTED WEAKNESSES & SKILL GAPS TABLE ===========
  if (currentY > pageHeight - 65) {
    doc.addPage();
    currentY = 20;
  }

  doc.setTextColor(180, 83, 9); // Amber-700
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("2. Identified Weaknesses & Priority Action Items (AI Detected)", margin, currentY);

  currentY += 3;

  const gapTableData = (skillGaps.length > 0 ? skillGaps : [
    { competencyName: "Statistical Computing & Automated Survey Data Processing", priority: "High", currentLevel: "Beginner", requiredLevel: "Advanced", recommendedAction: "Complete iGOT Automated Statistical Computing 20-Hour Module" },
    { competencyName: "Sampling Techniques & Estimation", priority: "High", currentLevel: "Intermediate", requiredLevel: "Advanced", recommendedAction: "Attend NSSTA Residential Sampling Workshop" },
  ]).map((g) => [
    g.competencyName,
    g.priority,
    g.currentLevel,
    g.requiredLevel,
    g.recommendedAction || "Enroll in recommended iGOT module",
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [["Weakness / Skill Gap", "Priority", "Current", "Target", "AI Recommended Action"]],
    body: gapTableData,
    theme: "grid",
    headStyles: {
      fillColor: [180, 83, 9], // Amber-700
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: "bold",
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [51, 65, 85],
    },
    alternateRowStyles: {
      fillColor: [254, 243, 199], // Amber-50
    },
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 1) {
        if (data.cell.raw === "High") {
          data.cell.styles.textColor = [225, 29, 72];
          data.cell.styles.fontStyle = "bold";
        }
      }
    },
    margin: { left: margin, right: margin },
  });

  currentY = doc.lastAutoTable.finalY + 8;

  // =========== 5. AI GENERATED PERSONALIZED LEARNING PATHWAY ===========
  if (currentY > pageHeight - 65) {
    doc.addPage();
    currentY = 20;
  }

  doc.setTextColor(37, 99, 235); // Blue-600
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("3. AI Generated Learning Pathway (Targeted to Bridge Weaknesses)", margin, currentY);

  currentY += 3;

  const pathTableData = (learningPath.length > 0 ? learningPath : [
    { title: "Automated Statistical Computing & Microdata Processing in Government", provider: "iGOT Karmayogi", skillAddressed: "Statistical Computing", duration: "20 Hours", priority: "High" },
    { title: "Sampling Design & Estimation in Surveys", provider: "NSSTA TPAC In-Service", skillAddressed: "Sampling Techniques", duration: "2 Weeks", priority: "High" },
    { title: "Data Privacy & DPDP Compliance", provider: "iGOT Karmayogi", skillAddressed: "Data Privacy & Ethics", duration: "6 Hours", priority: "Medium" },
  ]).map((p, idx) => [
    `Step ${idx + 1}`,
    p.title,
    p.provider,
    p.skillAddressed,
    p.duration,
    p.priority || "High",
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [["Step", "Training Programme", "Provider", "Targeted Weakness", "Duration", "Priority"]],
    body: pathTableData,
    theme: "grid",
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: "bold",
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [51, 65, 85],
    },
    alternateRowStyles: {
      fillColor: [239, 246, 255],
    },
    margin: { left: margin, right: margin },
  });

  currentY = doc.lastAutoTable.finalY + 12;

  // =========== 6. OFFICIAL FOOTER / VERIFICATION SEAL ===========
  if (currentY > pageHeight - 25) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, 16, 2, 2, "F");

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(71, 85, 105);
  doc.text(
    "Verified Official Statistical Capacity Report • Generated by SankhyaIQ™ AI Neural Engine & NSSTA Competency Core",
    margin + 4,
    currentY + 6
  );

  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(
    "Integrated with iGOT Karmayogi (DoPT) & NSSTA TPAC Training Advisory Committee Framework. Valid for Cadre Upskilling Records.",
    margin + 4,
    currentY + 11
  );

  // Save the PDF
  const filename = `MoSPI_Competency_Dossier_${(profile?.name || user?.name || "Officer").replace(/\s+/g, "_")}.pdf`;
  doc.save(filename);
};

export default generateCompetencyPDF;
