import express from "express";
import isAuth  from "../middleware/isAuth.js";
import {
    generateAiQuiz,
    getQuizzes,
    getQuizById,
    submitQuizAttempt,
    getMyQuizAttempts,
} from "../controller/quiz.controller.js";

const quizRouter = express.Router();

quizRouter.get("/list", isAuth, getQuizzes);
quizRouter.post("/generate", isAuth, generateAiQuiz);
quizRouter.get("/history/my-attempts", isAuth, getMyQuizAttempts);
quizRouter.get("/:id", isAuth, getQuizById);
quizRouter.post("/:id/submit", isAuth, submitQuizAttempt);

export default quizRouter;
