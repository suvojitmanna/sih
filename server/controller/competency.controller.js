import User from "../models/userModel.js";
import Quiz from "../models/quizModel.js";
import QuizAttempt from "../models/quizAttemptModel.js";
import Interview from "../models/interviewModel.js";
import {
  COMPETENCY_DOMAINS,
  ROLE_BENCHMARK_PROFILES,
} from "../config/competencyFramework.js";
import {
  generateCompetencyAssessment,
  analyzeSkillGaps,
  generateLearningPath,
} from "../services/aiService.js";
import { getIgotCourses } from "../services/igotService.js";
import { getTpacProgrammes } from "../services/tpacService.js";
import { recalculateUserCompetencyAndGaps } from "../services/competencyCalculationService.js";
import { generateDiagnosticAssessmentsForUser } from "../services/diagnosticAssessmentService.js";

// 1. Get Taxonomy Framework
export const getCompetencyFramework = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      domains: COMPETENCY_DOMAINS,
      benchmarks: ROLE_BENCHMARK_PROFILES,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Get Learner Competency Profile
export const getLearnerProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId || req.user?._id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      profile: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        designation: user.designation,
        department: user.department,
        jobRole: user.jobRole,
        currentAssignment: user.currentAssignment,
        educationalQualification: user.educationalQualification,
        workExperience: user.workExperience,
        previousTraining: user.previousTraining,
        competencies: user.competencies || [],
        skillGaps: user.skillGaps || [],
        learningPath: user.learningPath || [],
        overallCompetencyScore: user.overallCompetencyScore !== undefined && user.overallCompetencyScore !== null ? user.overallCompetencyScore : 0,
        overallLevel: user.overallLevel || "Novice",
        learningStreak: user.learningStreak !== undefined && user.learningStreak !== null ? user.learningStreak : 0,
        learningHours: user.learningHours || 0,
        quizzesCompleted: user.quizzesCompleted || 0,
        credits: user.credits !== undefined ? user.credits : 100,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Update Profile Attributes
export const updateLearnerProfile = async (req, res) => {
  try {
    const {
      designation,
      department,
      jobRole,
      currentAssignment,
      educationalQualification,
      workExperience,
      previousTraining,
    } = req.body;
    const user = await User.findById(req.userId || req.user?._id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    if (designation) user.designation = designation;
    if (department) user.department = department;
    if (jobRole) user.jobRole = jobRole;
    if (currentAssignment) user.currentAssignment = currentAssignment;
    if (educationalQualification)
      user.educationalQualification = educationalQualification;
    if (workExperience !== undefined)
      user.workExperience = Number(workExperience);
    if (previousTraining)
      user.previousTraining = Array.isArray(previousTraining)
        ? previousTraining
        : [previousTraining];

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Run AI Competency Assessment & Auto-Analyze Skill Gaps
export const runAiAssessment = async (req, res) => {
  try {
    const { selfRatings = {} } = req.body;
    const user = await User.findById(req.userId || req.user?._id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    // 1. Run Assessment via Gemini AI
    const assessmentResult = await generateCompetencyAssessment({
      profile: {
        designation: user.designation,
        department: user.department,
        jobRole: user.jobRole,
        workExperience: user.workExperience,
        educationalQualification: user.educationalQualification,
        previousTraining: user.previousTraining,
      },
      selfRatings,
      quizHistory: [],
    });

    user.competencies = assessmentResult.competencies;
    user.overallCompetencyScore = assessmentResult.overallScore;
    user.overallLevel = assessmentResult.overallLevel;

    // 2. Automatically Run Skill Gap Analysis against Target Cadre
    const gapAnalysis = await analyzeSkillGaps({
      currentCompetencies: user.competencies,
      targetRole: user.jobRole,
      department: user.department,
    });

    user.skillGaps = gapAnalysis.skillGaps;

    // 3. Construct Initial Learning Path
    const igotCourses = await getIgotCourses();
    const tpacProgrammes = getTpacProgrammes();
    const allAvailable = [
      ...igotCourses.map((c) => ({
        id: c.id,
        title: c.title,
        provider: c.provider,
        skillAddressed: c.skillAddressed,
        duration: c.duration,
      })),
      ...tpacProgrammes.map((p) => ({
        id: p.id,
        title: p.title,
        provider: "NSSTA TPAC",
        skillAddressed: p.competencyAddressed,
        duration: `${p.durationWeeks} Weeks`,
      })),
    ];

    const pathResult = await generateLearningPath({
      competencyGaps: user.skillGaps,
      jobRole: user.jobRole,
      department: user.department,
      availableCourses: allAvailable,
    });

    const sanitizedPath = (pathResult.learningPath || []).map((step, idx) => ({
      step: Number(step.step) || idx + 1,
      title: step.title || `Module ${idx + 1}`,
      provider: step.provider || "iGOT Karmayogi",
      skillAddressed: step.skillAddressed || "Statistical Competencies",
      duration: step.duration || "12 Hours",
      currentLevel: step.currentLevel || "Beginner",
      targetLevel: step.targetLevel || "Intermediate",
      priority: ["High", "Medium", "Low"].includes(step.priority)
        ? step.priority
        : "Medium",
      rationale:
        step.rationale || "Official competency capacity building module.",
      status: ["in-progress", "completed", "not-started", "pending"].includes(
        step.status,
      )
        ? step.status
        : idx === 0
          ? "in-progress"
          : "not-started",
      externalUrl: step.externalUrl || "",
    }));

    user.learningPath = sanitizedPath;
    await user.save();

    return res.status(200).json({
      success: true,
      message:
        "Competency assessment & skill-gap analysis completed successfully! ✨",
      assessment: assessmentResult,
      skillGaps: user.skillGaps,
      learningPath: user.learningPath,
      overallScore: user.overallCompetencyScore,
      overallLevel: user.overallLevel,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        designation: user.designation,
        department: user.department,
        jobRole: user.jobRole,
        competencies: user.competencies,
        skillGaps: user.skillGaps,
        learningPath: user.learningPath,
        overallCompetencyScore: user.overallCompetencyScore,
        overallLevel: user.overallLevel,
        learningStreak: user.learningStreak,
        learningHours: user.learningHours,
        quizzesCompleted: user.quizzesCompleted,
      },
    });
  } catch (error) {
    console.error("[RUN AI ASSESSMENT ERROR]", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Get Skill Gaps
export const getSkillGaps = async (req, res) => {
  try {
    const user = await User.findById(req.userId || req.user?._id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    return res.status(200).json({
      success: true,
      skillGaps: user.skillGaps || [],
      jobRole: user.jobRole,
      department: user.department,
      overallLevel: user.overallLevel,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 6. Generate or Refresh Learning Pathway
export const generatePathway = async (req, res) => {
  try {
    const user = await User.findById(req.userId || req.user?._id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const igotCourses = await getIgotCourses();
    const tpacProgrammes = getTpacProgrammes();
    const allAvailable = [
      ...igotCourses.map((c) => ({
        id: c.id,
        title: c.title,
        provider: c.provider,
        skillAddressed: c.skillAddressed,
        duration: c.duration,
      })),
      ...tpacProgrammes.map((p) => ({
        id: p.id,
        title: p.title,
        provider: "NSSTA TPAC",
        skillAddressed: p.competencyAddressed,
        duration: `${p.durationWeeks} Weeks`,
      })),
    ];

    const pathResult = await generateLearningPath({
      competencyGaps: user.skillGaps || [],
      jobRole: user.jobRole,
      department: user.department,
      availableCourses: allAvailable,
    });

    const sanitizedPath = (pathResult.learningPath || []).map((step, idx) => ({
      step: Number(step.step) || idx + 1,
      title: step.title || `Module ${idx + 1}`,
      provider: step.provider || "iGOT Karmayogi",
      skillAddressed: step.skillAddressed || "Statistical Competencies",
      duration: step.duration || "12 Hours",
      currentLevel: step.currentLevel || "Beginner",
      targetLevel: step.targetLevel || "Intermediate",
      priority: ["High", "Medium", "Low"].includes(step.priority)
        ? step.priority
        : "Medium",
      rationale:
        step.rationale || "Official competency capacity building module.",
      status: ["in-progress", "completed", "not-started", "pending"].includes(
        step.status,
      )
        ? step.status
        : idx === 0
          ? "in-progress"
          : "not-started",
      externalUrl: step.externalUrl || "",
    }));

    user.learningPath = sanitizedPath;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Personalized learning pathway generated successfully.",
      learningPath: user.learningPath,
      pathwayTitle: pathResult.pathwayTitle,
      estimatedTotalHours: pathResult.estimatedTotalHours,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 7. Update Pathway Step Progress
export const updatePathwayProgress = async (req, res) => {
  try {
    const { stepIndex, status } = req.body;
    const user = await User.findById(req.userId || req.user?._id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const targetStatus = [
      "completed",
      "in-progress",
      "not-started",
      "pending",
    ].includes(status)
      ? status
      : "in-progress";

    if (user.learningPath && user.learningPath[stepIndex]) {
      user.learningPath[stepIndex].status = targetStatus;
      if (targetStatus === "completed") {
        user.learningPath[stepIndex].completedAt = new Date();
        user.learningHours = (user.learningHours || 0) + 4;
        user.credits = (user.credits || 100) + 10;
        await user.save();

        try {
          await recalculateUserCompetencyAndGaps(user._id);
        } catch (rErr) {
          console.error("[PATH STEP RECALCULATION ERROR]", rErr);
        }
      } else {
        await user.save();
      }
    }

    return res.status(200).json({
      success: true,
      message: `Course status updated to ${status}.`,
      learningPath: user.learningPath,
      learningHours: user.learningHours,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 8. Get Diagnostic Assessment Status for User
export const getDiagnosticStatus = async (req, res) => {
  try {
    const userId = req.userId || req.user?._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let diagnosticQuiz = await Quiz.findOne({
      assignedTo: userId,
      isDiagnostic: true,
    }).select("_id title topic domain difficulty passingScore questions");

    let diagnosticInterview = await Interview.findOne({
      userId,
      isDiagnostic: true,
    }).select("_id role mode finalScore status createdAt question questions");

    // Auto-provision if missing for completed profile
    if ((!diagnosticQuiz || !diagnosticInterview) && user.isProfileCompleted) {
      try {
        await generateDiagnosticAssessmentsForUser(user);
        if (!diagnosticQuiz) {
          diagnosticQuiz = await Quiz.findOne({
            assignedTo: userId,
            isDiagnostic: true,
          }).select("_id title topic domain difficulty passingScore questions");
        }
        if (!diagnosticInterview) {
          diagnosticInterview = await Interview.findOne({
            userId,
            isDiagnostic: true,
          }).select("_id role mode finalScore status createdAt question questions");
        }
      } catch (provErr) {
        console.warn("[DIAGNOSTIC STATUS AUTO-PROVISION WARN]", provErr.message);
      }
    }

    let isQuizCompleted = false;
    let quizScore = null;
    if (diagnosticQuiz) {
      const attempt = await QuizAttempt.findOne({
        quizId: diagnosticQuiz._id,
        userId,
      });
      if (attempt) {
        isQuizCompleted = true;
        quizScore = attempt.score;
      }
    }
    if (!isQuizCompleted) {
      const anyAttempt = await QuizAttempt.findOne({ userId });
      if (anyAttempt || (user.quizzesCompleted && user.quizzesCompleted > 0)) {
        isQuizCompleted = true;
        quizScore = anyAttempt?.score || 80;
      }
    }

    let isInterviewCompleted = diagnosticInterview?.status === "completed";
    if (!isInterviewCompleted) {
      const anyInterview = await Interview.findOne({
        userId,
        status: "completed",
      });
      if (anyInterview) {
        isInterviewCompleted = true;
      }
    }

    return res.status(200).json({
      success: true,
      diagnosticQuiz,
      isQuizCompleted,
      quizScore,
      diagnosticInterview,
      isInterviewCompleted,
      isDiagnosticFullyCompleted: isQuizCompleted && isInterviewCompleted,
      isAnyDiagnosticCompleted: isQuizCompleted || isInterviewCompleted,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

