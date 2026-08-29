import SupportMessage from "../models/supportMessageModel.js";
import User from "../models/userModel.js";

// 1. Officer sends message to Admin / Secretariat
export const sendOfficerMessage = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message || !message.trim()) {
            return res.status(400).json({ success: false, message: "Message content cannot be empty." });
        }

        const user = req.user;
        let attachmentData = "";
        let attachmentName = "";

        if (req.file) {
            const mimeType = req.file.mimetype || "application/octet-stream";
            attachmentData = `data:${mimeType};base64,${req.file.buffer.toString("base64")}`;
            attachmentName = req.file.originalname;
        }

        const newMessage = await SupportMessage.create({
            senderId: user._id,
            senderName: user.name || "Statistical Officer",
            senderRole: user.role === "admin" ? "admin" : "learner",
            senderCadre: user.jobRole || "Statistical Officer",
            recipientId: null, // Admin desk
            recipientName: "NSSTA Secretariat & Faculty",
            message: message.trim(),
            attachmentData,
            attachmentName,
            isBroadcast: false,
            isRead: false,
        });

        return res.status(201).json({
            success: true,
            message: "Message delivered to NSSTA Faculty.",
            chatMessage: newMessage,
        });
    } catch (error) {
        console.error("[OFFICER MESSAGE ERROR]", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 2. Admin replies to a specific Officer
export const sendAdminReply = async (req, res) => {
    try {
        const { officerId, message } = req.body;
        if (!officerId || !message || !message.trim()) {
            return res.status(400).json({ success: false, message: "Recipient and message are required." });
        }

        const targetOfficer = await User.findById(officerId);
        if (!targetOfficer) {
            return res.status(404).json({ success: false, message: "Officer not found." });
        }

        let attachmentData = "";
        let attachmentName = "";

        if (req.file) {
            const mimeType = req.file.mimetype || "application/octet-stream";
            attachmentData = `data:${mimeType};base64,${req.file.buffer.toString("base64")}`;
            attachmentName = req.file.originalname;
        }

        const newMessage = await SupportMessage.create({
            senderId: req.user._id,
            senderName: req.user.name || "NSSTA Secretariat",
            senderRole: "admin",
            senderCadre: "Academy Faculty",
            recipientId: targetOfficer._id,
            recipientName: targetOfficer.name,
            message: message.trim(),
            attachmentData,
            attachmentName,
            isBroadcast: false,
            isRead: false,
        });

        return res.status(201).json({
            success: true,
            message: "Reply delivered to officer in real-time.",
            chatMessage: newMessage,
        });
    } catch (error) {
        console.error("[ADMIN REPLY ERROR]", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 3. Officer fetches their conversation history with Admin
export const getOfficerMessages = async (req, res) => {
    try {
        const userId = req.user._id;

        const messages = await SupportMessage.find({
            $or: [
                { senderId: userId },
                { recipientId: userId },
                { isBroadcast: true },
            ],
        }).sort({ createdAt: 1 });

        return res.status(200).json({
            success: true,
            messages,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 4. Admin fetches the list of all active Officer conversations
export const getAdminConversationsList = async (req, res) => {
    try {
        // Group messages by officer (sender if learner, or recipient if admin)
        const messages = await SupportMessage.find({ isBroadcast: false })
            .sort({ createdAt: -1 })
            .limit(200);

        const officerMap = {};

        for (const msg of messages) {
            const officerId = msg.senderRole === "learner"
                ? msg.senderId?.toString()
                : msg.recipientId?.toString();

            if (!officerId) continue;

            if (!officerMap[officerId]) {
                const officerUser = await User.findById(officerId, "name email jobRole department");
                officerMap[officerId] = {
                    officerId,
                    officerName: officerUser?.name || msg.senderName || "Statistical Officer",
                    officerEmail: officerUser?.email || "",
                    officerCadre: officerUser?.jobRole || msg.senderCadre || "Statistical Cadre",
                    officerDepartment: officerUser?.department || "MoSPI Headquarters",
                    lastMessage: msg.message,
                    lastMessageAt: msg.createdAt,
                    lastSenderRole: msg.senderRole,
                    unreadCount: 0,
                };
            }

            if (msg.senderRole === "learner" && !msg.isRead) {
                officerMap[officerId].unreadCount += 1;
            }
        }

        const conversations = Object.values(officerMap).sort(
            (a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt)
        );

        return res.status(200).json({
            success: true,
            conversations,
        });
    } catch (error) {
        console.error("[ADMIN CONVERSATIONS ERROR]", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 5. Admin fetches complete thread for a specific Officer
export const getConversationForOfficer = async (req, res) => {
    try {
        const { officerId } = req.params;

        const messages = await SupportMessage.find({
            $or: [
                { senderId: officerId },
                { recipientId: officerId },
            ],
            isBroadcast: false,
        }).sort({ createdAt: 1 });

        // Mark incoming messages as read
        await SupportMessage.updateMany(
            { senderId: officerId, senderRole: "learner", isRead: false },
            { $set: { isRead: true } }
        );

        return res.status(200).json({
            success: true,
            messages,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 6. Admin broadcasts Academy Announcement
export const broadcastAnnouncement = async (req, res) => {
    try {
        const { message, title = "Official NSSTA Announcement" } = req.body;
        if (!message || !message.trim()) {
            return res.status(400).json({ success: false, message: "Announcement content required." });
        }

        const announcement = await SupportMessage.create({
            senderId: req.user._id,
            senderName: `NSSTA Secretariat - ${title}`,
            senderRole: "admin",
            senderCadre: "Official Broadcast",
            recipientId: null,
            recipientName: "All Cadre Officers",
            message: message.trim(),
            isBroadcast: true,
            isRead: false,
        });

        return res.status(201).json({
            success: true,
            message: "Announcement broadcasted to all cadre officers in real-time.",
            announcement,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
