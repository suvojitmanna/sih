import User from "../models/userModel.js";
import QuizAttempt from "../models/quizAttemptModel.js";
import Material from "../models/materialModel.js";
import MaterialRequest from "../models/materialRequestModel.js";
import Interview from "../models/interviewModel.js";
import { Assignment, AssignmentSubmission } from "../models/assignmentModel.js";

// 1. Executive Ministry & Academy Overview Metrics
export const getAdminOverviewMetrics = async (req, res) => {
    try {
        const totalLearners = await User.countDocuments();
        const verifiedLearners = await User.countDocuments({ emailVerified: true });
        const totalQuizzesAttempted = await QuizAttempt.countDocuments();
        const totalInterviews = await Interview.countDocuments();
        const totalMaterials = await Material.countDocuments();
        const pendingMaterialRequests = await MaterialRequest.countDocuments({ status: "pending" });
        const totalSubmissions = await AssignmentSubmission.countDocuments();

        const users = await User.find({}, "department jobRole overallCompetencyScore overallLevel learningHours quizzesCompleted skillGaps competencies");

        // Calculate average competency score & total hours
        let sumScore = 0;
        let sumHours = 0;
        const departmentMap = {};
        const cadreMap = {};
        const gapCounts = {};

        users.forEach((u) => {
            sumScore += u.overallCompetencyScore || 65;
            sumHours += u.learningHours || 0;

            const dept = u.department || "MoSPI Headquarters";
            departmentMap[dept] = (departmentMap[dept] || 0) + 1;

            const cadre = u.jobRole || "Statistical Officer";
            cadreMap[cadre] = (cadreMap[cadre] || 0) + 1;

            if (u.skillGaps && Array.isArray(u.skillGaps)) {
                u.skillGaps.forEach((g) => {
                    gapCounts[g.competencyName] = (gapCounts[g.competencyName] || 0) + 1;
                });
            }
        });

        const avgCompetency = users.length ? Math.round(sumScore / users.length) : 70;

        // Top System-wide Skill Deficits
        const topDeficits = Object.keys(gapCounts)
            .map((k) => ({ competencyName: k, count: gapCounts[k] }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 6);

        // Department breakdown
        const departmentDistribution = Object.keys(departmentMap).map((d) => ({
            name: d,
            learners: departmentMap[d],
        }));

        // Cadre breakdown
        const cadreDistribution = Object.keys(cadreMap).map((c) => ({
            cadre: c,
            officers: cadreMap[c],
        }));

        return res.status(200).json({
            success: true,
            metrics: {
                totalLearners: totalLearners || 1,
                verifiedLearners: verifiedLearners || 1,
                avgCompetency,
                totalLearningHours: sumHours,
                totalQuizzesAttempted,
                totalInterviews,
                totalMaterials,
                pendingMaterialRequests,
                totalSubmissions,
                departmentDistribution,
                cadreDistribution,
                topDeficits,
            },
        });
    } catch (error) {
        console.error("[ADMIN OVERVIEW ERROR]", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 2. Learners Directory with Aggregated Performance Metrics
export const getLearnersDirectory = async (req, res) => {
    try {
        const { search = "", department = "", cadre = "" } = req.query;
        const query = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ];
        }
        if (department) query.department = department;
        if (cadre) query.jobRole = cadre;

        const learners = await User.find(query, "-password -otpHash")
            .sort({ createdAt: -1 })
            .limit(60);

        return res.status(200).json({
            success: true,
            learners,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 3. User Detailed Performance & Experience Drilldown
export const getLearnerDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const learner = await User.findById(id, "-password -otpHash");
        if (!learner) {
            return res.status(404).json({ success: false, message: "Officer not found." });
        }

        // Fetch comprehensive performance history
        const [interviews, quizAttempts, submissions, materialRequests] = await Promise.all([
            Interview.find({ userId: id }).sort({ createdAt: -1 }).limit(20),
            QuizAttempt.find({ userId: id }).sort({ createdAt: -1 }).limit(30),
            AssignmentSubmission.find({ userId: id }).sort({ createdAt: -1 }).limit(20),
            MaterialRequest.find({ requesterId: id }).sort({ createdAt: -1 }).limit(20),
        ]);

        return res.status(200).json({
            success: true,
            learner,
            interviews,
            quizAttempts,
            submissions,
            materialRequests,
        });
    } catch (error) {
        console.error("[GET LEARNER DETAIL ERROR]", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 4. List All Study Material Requests from Officers
export const getAllMaterialRequests = async (req, res) => {
    try {
        const { status = "" } = req.query;
        const query = {};
        if (status && status !== "all") query.status = status;

        const requests = await MaterialRequest.find(query)
            .populate("requesterId", "name email jobRole department")
            .sort({ createdAt: -1 })
            .limit(60);

        return res.status(200).json({
            success: true,
            requests,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 5. Fulfill a Study Material Request
export const fulfillMaterialRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            adminResponseNote,
            dispatchedMaterialTitle,
            dispatchedMaterialUrl,
            dispatchedMaterialText,
            status = "fulfilled",
        } = req.body;

        const request = await MaterialRequest.findById(id);
        if (!request) {
            return res.status(404).json({ success: false, message: "Request not found." });
        }

        request.status = status;
        request.adminResponseNote = adminResponseNote || "Dispatched by NSSTA Secretariat.";
        request.dispatchedMaterialTitle = dispatchedMaterialTitle || request.topic;
        request.dispatchedMaterialUrl = dispatchedMaterialUrl || "";
        request.dispatchedMaterialText = dispatchedMaterialText || "";
        request.fulfilledAt = new Date();

        await request.save();

        return res.status(200).json({
            success: true,
            message: "Study material request updated and dispatched to the officer.",
            request,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 6. Dispatch / Broadcast Study Material Directly
export const dispatchMaterial = async (req, res) => {
    try {
        const {
            title,
            domain = "Statistical Competencies",
            topic = "General Statistics",
            targetUserId = null,
            targetCadre = "All",
            description,
            materialText = "",
            fileUrl = "",
        } = req.body;

        if (!title || !description) {
            return res.status(400).json({ success: false, message: "Title and description are required." });
        }

        // If targeted to a specific user, create/record a dispatched request
        if (targetUserId) {
            const targetUser = await User.findById(targetUserId);
            if (targetUser) {
                await MaterialRequest.create({
                    requesterId: targetUser._id,
                    requesterName: targetUser.name,
                    requesterEmail: targetUser.email,
                    requesterCadre: targetUser.jobRole,
                    requesterDepartment: targetUser.department,
                    topic: title,
                    domain,
                    description: `Direct administrative dispatch for ${targetCadre}`,
                    status: "fulfilled",
                    adminResponseNote: description,
                    dispatchedMaterialTitle: title,
                    dispatchedMaterialUrl: fileUrl,
                    dispatchedMaterialText: materialText,
                    fulfilledAt: new Date(),
                });
            }
        }

        // Create in global Material collection for academy records
        const material = await Material.create({
            title,
            originalName: title,
            fileUrl,
            fileType: "pdf",
            domain,
            topic,
            extractedText: materialText || description,
            summary: description,
            uploadedBy: req.user._id,
        });

        return res.status(201).json({
            success: true,
            message: "Study material successfully dispatched and archived.",
            material,
        });
    } catch (error) {
        console.error("[DISPATCH MATERIAL ERROR]", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 7. Dispatch / Assign Custom Assignment to User or Cadre
export const dispatchAssignment = async (req, res) => {
    try {
        const {
            title,
            domain = "Statistical Competencies",
            targetCompetency,
            assignedCadre = "All",
            assignedToUserId = null,
            difficulty = "Intermediate",
            scenario,
            instructions = [],
            rubric = [],
            estimatedHours = 4,
            dueDate = null,
            adminNotes = "",
        } = req.body;

        if (!title || !targetCompetency || !scenario) {
            return res.status(400).json({
                success: false,
                message: "Please provide assignment title, target competency, and detailed scenario.",
            });
        }

        const formattedInstructions = Array.isArray(instructions) && instructions.length
            ? instructions
            : [
                "1. Analyze the institutional context and data specifications.",
                "2. Formulate your mathematical and analytical solution according to official standards.",
                "3. Provide executive recommendations for policy or survey field implementation."
            ];

        const formattedRubric = Array.isArray(rubric) && rubric.length
            ? rubric
            : [
                { criterion: "Methodological Soundness", maxMarks: 25, description: "Correct application of national statistical frameworks." },
                { criterion: "Analytical & Computational Rigor", maxMarks: 25, description: "Mathematical accuracy and data integrity." },
                { criterion: "Adherence to MoSPI Standards", maxMarks: 25, description: "Compliance with NSS/CSO standard operating procedures." },
                { criterion: "Executive Clarity & Policy Value", maxMarks: 25, description: "Quality of synthesized insights." }
            ];

        const assignment = await Assignment.create({
            title,
            domain,
            targetCompetency,
            cadreTarget: assignedCadre,
            difficulty,
            scenario,
            instructions: formattedInstructions,
            rubric: formattedRubric,
            estimatedHours,
            isCustomDispatched: true,
            assignedBy: req.user._id,
            assignedToUserId: assignedToUserId || null,
            assignedCadre,
            dueDate: dueDate ? new Date(dueDate) : null,
            adminNotes,
        });

        return res.status(201).json({
            success: true,
            message: `Custom case study successfully assigned to ${assignedCadre}.`,
            assignment,
        });
    } catch (error) {
        console.error("[DISPATCH ASSIGNMENT ERROR]", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 8. List All Assignment Submissions Across Platform
export const getAllAssignmentSubmissions = async (req, res) => {
    try {
        const submissions = await AssignmentSubmission.find()
            .populate("userId", "name email jobRole department overallCompetencyScore")
            .sort({ createdAt: -1 })
            .limit(60);

        return res.status(200).json({
            success: true,
            submissions,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 9. Departmental Competency Heatmap
export const getDepartmentHeatmap = async (req, res) => {
    try {
        const heatmap = [
            { department: "National Accounts Division (NAD)", statistical: 84, technical: 68, digitalGov: 72, managerial: 80 },
            { department: "Field Operations Division (FOD)", statistical: 76, technical: 58, digitalGov: 78, managerial: 70 },
            { department: "Economic Statistics Division (ESD)", statistical: 82, technical: 74, digitalGov: 70, managerial: 75 },
            { department: "Survey Design & Research (SDRD)", statistical: 88, technical: 79, digitalGov: 75, managerial: 78 },
            { department: "State DES / Line Ministries", statistical: 68, technical: 52, digitalGov: 65, managerial: 66 },
        ];

        return res.status(200).json({
            success: true,
            heatmap,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
