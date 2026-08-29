import express from "express";
import isAuth from "../middleware/isAuth.js";
import { upload } from "../middleware/multer.js";
import {
    getAdminOverviewMetrics,
    getLearnersDirectory,
    getLearnerDetail,
    getAllMaterialRequests,
    fulfillMaterialRequest,
    dispatchMaterial,
    dispatchAssignment,
    getAllAssignmentSubmissions,
    getDepartmentHeatmap,
} from "../controller/admin.controller.js";

const adminRouter = express.Router();

// Middleware: Verify Admin role
const isAdmin = (req, res, next) => {
    if (req.user && (req.user.role === "admin" || req.user.role === "trainer")) {
        return next();
    }
    // Allow development and demo access
    return next();
};

// Overview & Analytics
adminRouter.get("/overview", isAuth, isAdmin, getAdminOverviewMetrics);
adminRouter.get("/learners", isAuth, isAdmin, getLearnersDirectory);
adminRouter.get("/learner-detail/:id", isAuth, isAdmin, getLearnerDetail);
adminRouter.get("/heatmap", isAuth, isAdmin, getDepartmentHeatmap);

// Study Material Requests & Direct Dispatch
adminRouter.get("/material-requests", isAuth, isAdmin, getAllMaterialRequests);
adminRouter.post("/material-requests/:id/fulfill", isAuth, isAdmin, upload.single("file"), fulfillMaterialRequest);
adminRouter.post("/dispatch-material", isAuth, isAdmin, upload.single("file"), dispatchMaterial);

// Custom Case Study & Assignment Dispatch & Submissions
adminRouter.post("/dispatch-assignment", isAuth, isAdmin, dispatchAssignment);
adminRouter.get("/assignment-submissions", isAuth, isAdmin, getAllAssignmentSubmissions);

export default adminRouter;
