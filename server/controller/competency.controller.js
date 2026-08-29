import User from "../models/userModel.js";
import { COMPETENCY_DOMAINS, ROLE_BENCHMARK_PROFILES } from "../config/competencyFramework.js";
import { generateCompetencyAssessment, analyzeSkillGaps, generateLearningPath } from "../services/aiService.js";
import { getIgotCourses } from "../services/igotService.js";
import { getTpacProgrammes } from "../services/tpacService.js";

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
            return res.status(404).json({ success: false, message: "User not found" });
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
                overallCompetencyScore: user.overallCompetencyScore || 65,
                overallLevel: user.overallLevel || "Intermediate",
                learningStreak: user.learningStreak || 1,
                learningHours: user.learningHours || 0,
                quizzesCompleted: user.quizzesCompleted || 0,
                credits: user.credits || 100,
            },
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 3. Update Profile Attributes
export const updateLearnerProfile = async (req, res) => {
    try {
        const { designation, department, jobRole, currentAssignment, educationalQualification, workExperience, previousTraining } = req.body;
        const user = await User.findById(req.userId || req.user?._id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        if (designation) user.designation = designation;
        if (department) user.department = department;
        if (jobRole) user.jobRole = jobRole;
        if (currentAssignment) user.currentAssignment = currentAssignment;
        if (educationalQualification) user.educationalQualification = educationalQualification;
        if (workExperience !== undefined) user.workExperience = Number(workExperience);
        if (previousTraining) user.previousTraining = Array.isArray(previousTraining) ? previousTraining : [previousTraining];

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
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

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

        // Update User Competencies
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
            ...igotCourses.map((c) => ({ id: c.id, title: c.title, provider: c.provider, skillAddressed: c.skillAddressed, duration: c.duration })),
            ...tpacProgrammes.map((p) => ({ id: p.id, title: p.title, provider: "NSSTA TPAC", skillAddressed: p.competencyAddressed, duration: `${p.durationWeeks} Weeks` })),
        ];

        const pathResult = await generateLearningPath({
            competencyGaps: user.skillGaps,
            jobRole: user.jobRole,
            department: user.department,
            availableCourses: allAvailable,
        });

        user.learningPath = pathResult.learningPath;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Competency assessment & skill-gap analysis completed successfully! ✨",
            assessment: assessmentResult,
            skillGaps: user.skillGaps,
            learningPath: user.learningPath,
            overallScore: user.overallCompetencyScore,
            overallLevel: user.overallLevel,
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
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

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
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const igotCourses = await getIgotCourses();
        const tpacProgrammes = getTpacProgrammes();
        const allAvailable = [
            ...igotCourses.map((c) => ({ id: c.id, title: c.title, provider: c.provider, skillAddressed: c.skillAddressed, duration: c.duration })),
            ...tpacProgrammes.map((p) => ({ id: p.id, title: p.title, provider: "NSSTA TPAC", skillAddressed: p.competencyAddressed, duration: `${p.durationWeeks} Weeks` })),
        ];

        const pathResult = await generateLearningPath({
            competencyGaps: user.skillGaps || [],
            jobRole: user.jobRole,
            department: user.department,
            availableCourses: allAvailable,
        });

        user.learningPath = pathResult.learningPath;
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
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        if (user.learningPath && user.learningPath[stepIndex]) {
            user.learningPath[stepIndex].status = status;
            if (status === "completed") {
                user.learningPath[stepIndex].completedAt = new Date();
                user.learningHours = (user.learningHours || 0) + 4;
                user.credits = (user.credits || 100) + 10;
            }
            await user.save();
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
