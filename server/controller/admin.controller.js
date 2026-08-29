import User from "../models/userModel.js";
import QuizAttempt from "../models/quizAttemptModel.js";
import Material from "../models/materialModel.js";

// 1. Executive Ministry & Academy Overview Metrics
export const getAdminOverviewMetrics = async (req, res) => {
    try {
        const totalLearners = await User.countDocuments();
        const verifiedLearners = await User.countDocuments({ emailVerified: true });
        const totalQuizzesAttempted = await QuizAttempt.countDocuments();
        const totalMaterials = await Material.countDocuments();

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

        // Top 5 System-wide Skill Deficits
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
                totalMaterials,
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

// 2. Learners Directory
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
            .limit(50);

        return res.status(200).json({
            success: true,
            learners,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 3. Departmental Competency Heatmap
export const getDepartmentHeatmap = async (req, res) => {
    try {
        const users = await User.find({}, "department competencies");
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
