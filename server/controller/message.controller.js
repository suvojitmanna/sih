import imagekit from "../config/imageKit.js";
import { ai } from "../config/gemini.js";
import { askAi } from "../services/openRouter.service.js";
import Chat from "../models/chatModel.js";
import User from "../models/userModel.js";
import axios from "axios";

// TEXT MESSAGE CONTROLLER (Gemini with OpenRouter fallback)
export const textMessageController = async (req, res) => {
    try {
        const userId = req.userId || req.user?._id;
        const { chatId, prompt } = req.body;

        if (!prompt || !prompt.trim()) {
            return res.status(400).json({ success: false, message: "Prompt is required" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (user.credits < 1) {
            return res.status(403).json({ success: false, message: "Not enough credits. Minimum 1 required." });
        }

        const chat = await Chat.findOne({ userId, _id: chatId });
        if (!chat) {
            return res.status(404).json({ success: false, message: "Chat not found" });
        }

        // Save user message
        chat.messages.push({
            role: "user",
            content: prompt,
            timestamp: new Date(),
            isImage: false,
        });

        // Auto name chat from first prompt if default
        if (chat.name === "New Chat" || !chat.name) {
            chat.name = prompt.slice(0, 35);
        }

        const systemPrompt = `You are a helpful AI assistant.
Rules:
- If the user asks who created you, who is your developer, or owner, reply exactly: "I was created by Suvojit Manna."
- Do not mention Google, Gemini, OpenAI, or any competing company branding.
- Answer clearly, helpfully, and with formatted Markdown when presenting code, lists, or structured data.`;

        let replyText = "";

        // Try Gemini first if configured
        if (ai) {
            try {
                const response = await ai.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: `${systemPrompt}\n\nUser: ${prompt}`,
                });
                replyText = response?.text || "";
            } catch (geminiError) {
                console.warn("Gemini call error, attempting OpenRouter fallback:", geminiError.message);
            }
        }

        // Fallback to OpenRouter if Gemini failed or is unconfigured
        if (!replyText) {
            try {
                const messages = [
                    { role: "system", content: systemPrompt },
                    ...chat.messages.slice(-6).map((m) => ({
                        role: m.role === "assistant" ? "assistant" : "user",
                        content: m.content,
                    })),
                ];
                replyText = await askAi(messages);
            } catch (fallbackError) {
                console.error("OpenRouter fallback error:", fallbackError.message);
                throw new Error("AI generation failed. Please try again.");
            }
        }

        const reply = {
            role: "assistant",
            content: replyText,
            timestamp: new Date(),
            isImage: false,
        };

        chat.messages.push(reply);
        await chat.save();

        // Deduct 1 credit
        user.credits = Math.max(0, user.credits - 1);
        await user.save();

        res.status(200).json({
            success: true,
            reply,
            creditsLeft: user.credits,
        });
    } catch (error) {
        console.error("Text Message Error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// IMAGE GENERATION CONTROLLER
export const imageMessageController = async (req, res) => {
    try {
        const userId = req.userId || req.user?._id;
        const { prompt, chatId, isPublished = false } = req.body;

        if (!prompt || !prompt.trim()) {
            return res.status(400).json({ success: false, message: "Prompt is required" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (user.credits < 2) {
            return res.status(403).json({ success: false, message: "Not enough credits. Minimum 2 required." });
        }

        const chat = await Chat.findOne({ userId, _id: chatId });
        if (!chat) {
            return res.status(404).json({ success: false, message: "Chat not found" });
        }

        // Save user prompt message
        chat.messages.push({
            role: "user",
            content: prompt,
            timestamp: new Date(),
            isImage: false,
        });

        let imageUrl = "";

        // Strategy 1: ClipDrop API (if CLIPDROP_API_KEY is available)
        if (process.env.CLIPDROP_API_KEY) {
            try {
                const clipdropResponse = await axios.post(
                    "https://clipdrop-api.co/text-to-image/v1",
                    { prompt },
                    {
                        headers: { "x-api-key": process.env.CLIPDROP_API_KEY },
                        responseType: "arraybuffer",
                    }
                );

                const base64Image = `data:image/png;base64,${Buffer.from(clipdropResponse.data).toString("base64")}`;

                if (imagekit) {
                    const uploadResponse = await imagekit.upload({
                        file: base64Image,
                        fileName: `ai_img_${Date.now()}.png`,
                        folder: "ai_interviews_chat",
                    });
                    imageUrl = uploadResponse.url;
                } else {
                    imageUrl = base64Image;
                }
            } catch (clipErr) {
                console.warn("ClipDrop image gen error:", clipErr.message);
            }
        }

        // Strategy 2: High quality free Pollinations AI fallback
        if (!imageUrl) {
            const seed = Math.floor(Math.random() * 1000000);
            const encodedPrompt = encodeURIComponent(prompt);
            const fallbackUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&seed=${seed}&nologo=true`;

            if (imagekit) {
                try {
                    const uploadResponse = await imagekit.upload({
                        file: fallbackUrl,
                        fileName: `ai_img_${Date.now()}.jpg`,
                        folder: "ai_interviews_chat",
                    });
                    imageUrl = uploadResponse.url;
                } catch {
                    imageUrl = fallbackUrl;
                }
            } else {
                imageUrl = fallbackUrl;
            }
        }

        const reply = {
            role: "assistant",
            content: imageUrl,
            timestamp: new Date(),
            isImage: true,
            isPublished: Boolean(isPublished),
        };

        chat.messages.push(reply);
        await chat.save();

        // Deduct 2 credits
        user.credits = Math.max(0, user.credits - 2);
        await user.save();

        res.status(200).json({
            success: true,
            reply,
            creditsLeft: user.credits,
        });
    } catch (error) {
        console.error("Image Generation Error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to generate image",
        });
    }
};

// PUBLISH IMAGE TOGGLE CONTROLLER
export const publishImageController = async (req, res) => {
    try {
        const userId = req.userId || req.user?._id;
        const { chatId, messageId, isPublished = true } = req.body;

        const chat = await Chat.findOne({ _id: chatId, userId });
        if (!chat) {
            return res.status(404).json({ success: false, message: "Chat not found" });
        }

        const message = chat.messages.id(messageId) || chat.messages.find(m => m._id.toString() === messageId || m.content === messageId);
        if (!message) {
            return res.status(404).json({ success: false, message: "Message not found" });
        }

        message.isPublished = Boolean(isPublished);
        await chat.save();

        res.status(200).json({
            success: true,
            message: isPublished ? "Image published to community gallery" : "Image removed from community gallery",
        });
    } catch (error) {
        console.error("Publish Image Error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};
