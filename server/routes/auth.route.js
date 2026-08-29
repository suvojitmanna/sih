import express from "express";
import {
    initiateSignup,
    verifySignupOtp,
    initiateLogin,
    verifyLoginOtp,
    resendOtp,
    googleAuth,
    logout,
} from "../controller/auth.controller.js";

const authRouter = express.Router();

// Email OTP Authentication
authRouter.post("/signup-initiate", initiateSignup);
authRouter.post("/signup-verify", verifySignupOtp);
authRouter.post("/login-initiate", initiateLogin);
authRouter.post("/login-verify", verifyLoginOtp);
authRouter.post("/resend-otp", resendOtp);

// Preserved Endpoints
authRouter.post("/google", googleAuth);
authRouter.post("/logout", logout);

export default authRouter;