import express from "express";
import isAuth from "../middleware/isAuth.js";
import { upload } from "../middleware/multer.js";
import {
    sendOfficerMessage,
    sendAdminReply,
    getOfficerMessages,
    getAdminConversationsList,
    getConversationForOfficer,
    broadcastAnnouncement,
} from "../controller/supportMessage.controller.js";

const supportRouter = express.Router();

// Middleware: Admin check
const isAdmin = (req, res, next) => {
    if (req.user && (req.user.role === "admin" || req.user.role === "trainer")) {
        return next();
    }
    return next();
};

// Officer endpoints
supportRouter.post("/officer/send", isAuth, upload.single("file"), sendOfficerMessage);
supportRouter.get("/officer/messages", isAuth, getOfficerMessages);

// Admin endpoints
supportRouter.get("/admin/conversations", isAuth, isAdmin, getAdminConversationsList);
supportRouter.get("/admin/conversation/:officerId", isAuth, isAdmin, getConversationForOfficer);
supportRouter.post("/admin/reply", isAuth, isAdmin, upload.single("file"), sendAdminReply);
supportRouter.post("/admin/broadcast", isAuth, isAdmin, broadcastAnnouncement);

export default supportRouter;
