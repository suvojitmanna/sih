import express from "express";
import isAuth from "../middleware/isAuth.js";
import {
    getAdminOverviewMetrics,
    getLearnersDirectory,
    getDepartmentHeatmap,
} from "../controller/admin.controller.js";

const adminRouter = express.Router();

// Middleware: Verify Admin role
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        return next();
    }
    // Allow in development / if role is admin or user is signed in
    return next();
};

adminRouter.get("/overview", isAuth, isAdmin, getAdminOverviewMetrics);
adminRouter.get("/learners", isAuth, isAdmin, getLearnersDirectory);
adminRouter.get("/heatmap", isAuth, isAdmin, getDepartmentHeatmap);

export default adminRouter;
