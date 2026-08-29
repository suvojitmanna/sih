import express from "express";
import isAuth from "../middleware/isAuth.js";
import {
    getCompetencyFramework,
    getLearnerProfile,
    updateLearnerProfile,
    runAiAssessment,
    getSkillGaps,
    generatePathway,
    updatePathwayProgress,
} from "../controller/competency.controller.js";

const competencyRouter = express.Router();

// Public taxonomy framework
competencyRouter.get("/framework", getCompetencyFramework);

// Protected learner routes
competencyRouter.get("/my-profile", isAuth, getLearnerProfile);
competencyRouter.put("/update-profile", isAuth, updateLearnerProfile);
competencyRouter.post("/assess", isAuth, runAiAssessment);
competencyRouter.get("/skill-gaps", isAuth, getSkillGaps);
competencyRouter.post("/generate-pathway", isAuth, generatePathway);
competencyRouter.put("/pathway-progress", isAuth, updatePathwayProgress);

export default competencyRouter;
