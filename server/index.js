import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.route.js";
import interviewRoute from "./routes/interview.route.js";
import paymentRouter from "./routes/payment.route.js";
import chatRouter from "./routes/chat.route.js";
import messageRouter from "./routes/message.route.js";
import communityRouter from "./routes/community.route.js";
import competencyRouter from "./routes/competency.route.js";
import quizRouter from "./routes/quiz.route.js";
import materialRouter from "./routes/material.route.js";
import igotRouter from "./routes/igot.route.js";
import tpacRouter from "./routes/tpac.route.js";
import adminRouter from "./routes/admin.route.js";
import assignmentRouter from "./routes/assignment.route.js";

dotenv.config();
const app = express();

app.use(
    cors({
        origin: process.env.CLIENT_URL || true,
        credentials: true,
    })
);

app.use(express.json());
app.use(cookieParser());
const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
    res.json({
        platform: "MoSPI-NSSTA AI-Enabled Skill Intelligence & Learning Platform",
        status: "Operational",
        version: "2.0.0",
    });
});

// Authentication & Users
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

// Competencies, Quizzes, Assignments & Learning Materials
app.use("/api/competencies", competencyRouter);
app.use("/api/quizzes", quizRouter);
app.use("/api/assignments", assignmentRouter);
app.use("/api/materials", materialRouter);

// iGOT Karmayogi & NSSTA TPAC Training
app.use("/api/igot", igotRouter);
app.use("/api/tpac", tpacRouter);

// Admin Analytics
app.use("/api/admin", adminRouter);

// Conversational AI Assistant & Community
app.use("/api/chat", chatRouter);
app.use("/api/message", messageRouter);
app.use("/api/community", communityRouter);

// AI Interview System
app.use("/api/interview", interviewRoute);
app.use("/api/payment", paymentRouter);

// Connect DB first, then start server
connectDb()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`[MoSPI-NSSTA SERVER] Running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("DB connection failed:", err.message);
    });