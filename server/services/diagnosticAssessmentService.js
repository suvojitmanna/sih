import Quiz from "../models/quizModel.js";
import Interview from "../models/interviewModel.js";
import { generateQuiz } from "./aiService.js";
import { askAi } from "./openRouter.service.js";

/**
 * Standard Curated Baseline Diagnostic Question Sets for official statistical cadres
 * Used for instant zero-latency provisioning or as a fallback when AI engines are throttled.
 */
const CADRE_DIAGNOSTIC_PRESETS = {
  "Indian Statistical Service (ISS) Officer": {
    quiz: {
      topic: "National Statistical Architecture & Methodologies",
      questions: [
        {
          question: "Under the System of National Accounts (SNA 2008), which approach is used to compile Gross Value Added (GVA) at basic prices?",
          options: [
            "A) Output at basic prices minus Intermediate Consumption at purchasers' prices",
            "B) GDP at market prices minus Indirect Taxes plus Subsidies",
            "C) Sum of Employee Compensation plus Gross Operating Surplus only",
            "D) Total Final Consumption Expenditure plus Net Exports",
          ],
          correctAnswer: "A",
          explanation: "GVA at basic prices is defined as Output valued at basic prices minus Intermediate Consumption valued at purchasers' prices.",
          topic: "National Accounts & GDP Compilation",
          difficulty: "Medium",
        },
        {
          question: "In stratified multi-stage sampling adopted by NSSO (PLFS/HIES), what constitutes the First Stage Unit (FSU) in rural and urban sectors?",
          options: [
            "A) Census Villages in rural sectors and Urban Frame Survey (UFS) blocks in urban sectors",
            "B) Gram Panchayats in rural sectors and Municipal Wards in urban sectors",
            "C) Agricultural Households in rural and Enumeration Blocks in urban",
            "D) Revenue Districts in rural and Census Enumeration Districts in urban",
          ],
          correctAnswer: "A",
          explanation: "In NSSO household surveys, FSUs are Census Villages in the rural sector and UFS (Urban Frame Survey) blocks in the urban sector.",
          topic: "Sampling Techniques & Estimation",
          difficulty: "Medium",
        },
        {
          question: "Which index formula is currently utilized by the Central Statistics Office (CSO/NSO) for compiling the Consumer Price Index (CPI)?",
          options: [
            "A) Modified Laspeyres Index Formula with fixed base weights",
            "B) Paasche Index Formula with current period basket",
            "C) Fisher's Ideal Index Formula using geometric mean",
            "D) Tornqvist Superlative Index Formula",
          ],
          correctAnswer: "A",
          explanation: "The All India Consumer Price Index (CPI) compiles series using the Laspeyres base-weighted price index formula.",
          topic: "Price Statistics (CPI, WPI, Inflation)",
          difficulty: "Medium",
        },
        {
          question: "Under the National Quality Assurance Framework (NQAF), which prerequisite guarantees the credibility and public trust of official statistics?",
          options: [
            "A) Professional independence and statistical confidentiality",
            "B) Sole reliance on administrative registry data without audits",
            "C) Mandatory prior clearance by departmental executive boards",
            "D) Continuous daily real-time metric adjustments",
          ],
          correctAnswer: "A",
          explanation: "Professional independence and strict statistical confidentiality of respondents are cornerstone pillars of UN-NQAF and MoSPI standards.",
          topic: "Data Quality Assurance & NQAF",
          difficulty: "Medium",
        },
        {
          question: "Under the Digital Personal Data Protection (DPDP) Act 2023, how must microdata containing individual identifiers be treated before public research dissemination?",
          options: [
            "A) Strict statistical anonymization, pseudonymization, and de-identification",
            "B) Disseminated in raw form provided researchers sign an informal MoU",
            "C) Restricted only to hardcopy physical archives",
            "D) Subject to mandatory commercial licensing fees",
          ],
          correctAnswer: "A",
          explanation: "The DPDP Act and MoSPI dissemination policy mandate rigorous mathematical anonymization and removal of direct identifiers prior to public release.",
          topic: "Data Privacy, Ethics & Anonymization",
          difficulty: "Medium",
        },
      ],
    },
    viva: [
      {
        question: "As an ISS Officer leading a large-scale socioeconomic survey, how would you design the sampling frame to minimize both sampling and non-sampling errors?",
        difficulty: "medium",
        timeLimit: 90,
      },
      {
        question: "Explain the transition and methodological differences between GDP compilation under SNA 1993 versus SNA 2008 in the Indian context.",
        difficulty: "hard",
        timeLimit: 120,
      },
      {
        question: "In the Periodic Labour Force Survey (PLFS), how do you conceptually distinguish between Usual Status (ps+ss) and Current Weekly Status (CWS)?",
        difficulty: "medium",
        timeLimit: 90,
      },
      {
        question: "How do you ensure strict compliance with the National Quality Assurance Framework (NQAF) during field scrutiny and computer-assisted personal interviewing (CAPI)?",
        difficulty: "medium",
        timeLimit: 90,
      },
      {
        question: "Describe your approach to communicating complex statistical indicators and uncertainty margins to non-technical policy executives.",
        difficulty: "easy",
        timeLimit: 60,
      },
    ],
  },
  default: {
    quiz: {
      topic: "Official Statistical Operations & Data Principles",
      questions: [
        {
          question: "What is the primary objective of stratifying a population before conducting random sampling?",
          options: [
            "A) To reduce sampling variance and ensure adequate representation of heterogeneous subgroups",
            "B) To eliminate the need for survey weighting and multipliers",
            "C) To increase the total interview sample size artificially",
            "D) To simplify physical travel for field enumerators",
          ],
          correctAnswer: "A",
          explanation: "Stratification groups homogeneous elements together, reducing the variance of estimators and ensuring representation across diverse domains.",
          topic: "Sampling Techniques & Estimation",
          difficulty: "Medium",
        },
        {
          question: "Which of the following describes the Current Weekly Status (CWS) measure of employment in NSSO surveys?",
          options: [
            "A) Activity status of a person determined on the basis of reference period of 7 days preceding the date of survey",
            "B) Activity status of a person over a 365-day major time disposition",
            "C) Monthly average formal payroll employment records",
            "D) Five-year census aggregate employment status",
          ],
          correctAnswer: "A",
          explanation: "Current Weekly Status evaluates employment based on a 7-day reference window prior to the interview.",
          topic: "Labour & Employment Statistics (PLFS)",
          difficulty: "Medium",
        },
        {
          question: "In statistical data processing, what is the purpose of imputation?",
          options: [
            "A) Estimating and replacing missing or inconsistent survey responses with plausible values",
            "B) Deleting any questionnaire that contains missing data",
            "C) Double-counting records with high variance",
            "D) Modifying inflation statistics to meet fiscal targets",
          ],
          correctAnswer: "A",
          explanation: "Imputation uses statistical models or donor matches to replace missing item responses without discarding valuable observation records.",
          topic: "Statistical Computing & Automated Survey Data Processing",
          difficulty: "Medium",
        },
        {
          question: "Which Indian classification standard is utilized to categorize economic industrial activities in surveys like the Annual Survey of Industries (ASI)?",
          options: [
            "A) National Industrial Classification (NIC)",
            "B) National Product Classification (NPC)",
            "C) Indian Trade Classification (ITC-HS)",
            "D) Standard Occupational Classification (SOC)",
          ],
          correctAnswer: "A",
          explanation: "The National Industrial Classification (NIC) is the official framework used for classifying economic activities in India.",
          topic: "Statistical Metadata & Classifications (NIC, NPC)",
          difficulty: "Medium",
        },
        {
          question: "What is the fundamental requirement for ethical handling of official administrative and statistical data under government privacy standards?",
          options: [
            "A) Data minimization, purpose limitation, and robust cryptographic protection",
            "B) Open unauthenticated public access to personal identifying credentials",
            "C) Permanent public retention of sensitive raw microdata",
            "D) Third-party commercial monetization without citizen consent",
          ],
          correctAnswer: "A",
          explanation: "Modern data governance frameworks mandate that statistical authorities minimize data collection to stated statutory purposes and encrypt identifiers.",
          topic: "Data Privacy, Ethics & Anonymization",
          difficulty: "Medium",
        },
      ],
    },
    viva: [
      {
        question: "Explain the core difference between probability sampling and non-probability sampling, and why official statistics mandate probability sampling.",
        difficulty: "easy",
        timeLimit: 60,
      },
      {
        question: "How do you detect and handle non-sampling errors such as response bias and measurement errors during survey field inspections?",
        difficulty: "medium",
        timeLimit: 90,
      },
      {
        question: "What steps would you take to validate the accuracy and internal consistency of secondary statistical data before publishing an official report?",
        difficulty: "medium",
        timeLimit: 90,
      },
      {
        question: "How does the Digital Personal Data Protection Act affect the storage, curation, and dissemination of government survey records?",
        difficulty: "medium",
        timeLimit: 90,
      },
      {
        question: "Explain how you manage team timelines and maintain morale during intensive, time-sensitive census or survey field operations.",
        difficulty: "easy",
        timeLimit: 60,
      },
    ],
  },
};

/**
 * Ensures a user has a designated Target-Role Diagnostic Quiz and Diagnostic Mock Interview.
 * If not already present, generates them immediately.
 *
 * @param {Object} user User document
 * @returns {Promise<{ diagnosticQuiz: Object, diagnosticInterview: Object }>}
 */
export const generateDiagnosticAssessmentsForUser = async (user) => {
  try {
    const userId = user._id;
    const cadre = user.jobRole || user.targetCadre || "Indian Statistical Service (ISS) Officer";

    // 1. Check if user already has an active diagnostic quiz
    let diagnosticQuiz = await Quiz.findOne({
      assignedTo: userId,
      isDiagnostic: true,
    });

    if (!diagnosticQuiz) {
      // Check if a cadre-level diagnostic quiz already exists, or generate a tailored one
      const preset = CADRE_DIAGNOSTIC_PRESETS[cadre] || CADRE_DIAGNOSTIC_PRESETS.default;

      try {
        // Try generating dynamic AI questions for this specific cadre first
        const aiGen = await generateQuiz({
          topic: `${cadre} Core Competencies & Methodology`,
          domain: "Statistical Competencies",
          difficulty: "Medium",
          numQuestions: 5,
        });

        if (aiGen && Array.isArray(aiGen.questions) && aiGen.questions.length >= 4) {
          diagnosticQuiz = await Quiz.create({
            title: `Cadre Diagnostic Assessment • ${cadre}`,
            domain: "Statistical Competencies",
            topic: `${cadre} Baseline Evaluation`,
            difficulty: "Medium",
            timeLimitMinutes: 15,
            passingScore: 60,
            questions: aiGen.questions.map((q, idx) => ({
              question: q.question,
              options: Array.isArray(q.options) && q.options.length >= 4 ? q.options : [
                "A) Standard methodological convention",
                "B) Alternative operational guideline",
                "C) Secondary quality parameter",
                "D) Inapplicable specification",
              ],
              correctAnswer: q.correctAnswer || "A",
              explanation: q.explanation || "Official MoSPI / NSSTA framework guideline.",
              topic: q.topic || "Statistical Competencies",
              difficulty: q.difficulty || "Medium",
            })),
            isDiagnostic: true,
            assignedTo: userId,
            targetCadre: cadre,
            createdBy: userId,
            isGeneratedByAI: true,
            isPublished: true,
          });
        }
      } catch (aiErr) {
        console.warn("[DIAGNOSTIC AI QUIZ GEN WARN] Using high-fidelity preset:", aiErr.message);
      }

      // Fallback to high-fidelity MoSPI official preset if AI generation was throttled
      if (!diagnosticQuiz) {
        diagnosticQuiz = await Quiz.create({
          title: `Cadre Diagnostic Assessment • ${cadre}`,
          domain: "Statistical Competencies",
          topic: `${cadre} Baseline Evaluation`,
          difficulty: "Medium",
          timeLimitMinutes: 15,
          passingScore: 60,
          questions: preset.quiz.questions,
          isDiagnostic: true,
          assignedTo: userId,
          targetCadre: cadre,
          createdBy: userId,
          isGeneratedByAI: true,
          isPublished: true,
        });
      }
    }

    // 2. Check if user already has an active diagnostic mock interview
    let diagnosticInterview = await Interview.findOne({
      userId,
      isDiagnostic: true,
    });

    if (!diagnosticInterview) {
      const preset = CADRE_DIAGNOSTIC_PRESETS[cadre] || CADRE_DIAGNOSTIC_PRESETS.default;

      // Create diagnostic oral viva
      diagnosticInterview = await Interview.create({
        userId,
        role: cadre,
        experience: String(user.workExperience || user.experienceYears || 1),
        mode: "Technical",
        isDiagnostic: true,
        targetCadre: cadre,
        status: "Incompleted",
        question: preset.viva.map((item) => ({
          question: item.question,
          difficulty: item.difficulty,
          timeLimit: item.timeLimit,
          score: 0,
          confidence: 0,
          communication: 0,
          correctness: 0,
          answer: "",
          feedback: "",
        })),
      });
    }

    return {
      diagnosticQuiz,
      diagnosticInterview,
    };
  } catch (error) {
    console.error("[GENERATE DIAGNOSTIC ASSESSMENTS ERROR]", error);
    return { diagnosticQuiz: null, diagnosticInterview: null };
  }
};
