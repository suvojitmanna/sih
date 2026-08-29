import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import Material from "../models/materialModel.js";
import MaterialRequest from "../models/materialRequestModel.js";
import Quiz from "../models/quizModel.js";
import { generateMCQsFromText } from "../services/aiService.js";

// Helper: Extract text from PDF buffer
const extractPdfText = async (buffer) => {
    try {
        const uint8Array = new Uint8Array(buffer);
        const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;
        let fullText = "";

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const content = await page.getTextContent();
            const pageText = content.items.map((item) => item.str).join(" ");
            fullText += pageText + "\n";
        }
        return fullText.replace(/\s+/g, " ").trim();
    } catch (err) {
        console.error("[PDF EXTRACTION ERROR]", err);
        return "";
    }
};

// 1. Upload Learning Material (Supports PDF, Images, Text, Docs)
export const uploadMaterial = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "Please select a file to upload (PDF, Image, DOCX, or TXT)." });
        }

        const { title, domain = "Statistical Competencies", topic = "Survey Methodology" } = req.body;
        const fileExt = req.file.originalname.split(".").pop().toLowerCase();
        const mimeType = req.file.mimetype || "application/octet-stream";
        let extractedText = "";

        // Convert buffer to base64 Data URI for rendering/downloading
        const fileBase64 = `data:${mimeType};base64,${req.file.buffer.toString("base64")}`;

        if (fileExt === "pdf") {
            extractedText = await extractPdfText(req.file.buffer);
        } else if (fileExt === "txt" || mimeType.includes("text")) {
            extractedText = req.file.buffer.toString("utf-8");
        } else if (["jpg", "jpeg", "png", "webp", "gif", "svg"].includes(fileExt) || mimeType.startsWith("image/")) {
            extractedText = `Official Visual Document / Statistical Chart: ${title || req.file.originalname}. Domain: ${domain}, Topic: ${topic}.`;
        } else {
            extractedText = `Official Reference Document: ${title || req.file.originalname}. Domain: ${domain}, Topic: ${topic}.`;
        }

        const material = await Material.create({
            title: title || req.file.originalname,
            originalName: req.file.originalname,
            fileType: fileExt,
            fileSize: req.file.size,
            fileData: fileBase64,
            domain,
            topic,
            extractedText: extractedText.substring(0, 60000), // Store up to 60k chars
            summary: `Learning material covering ${topic} (${domain}).`,
            uploadedBy: req.userId || req.user?._id,
        });

        return res.status(201).json({
            success: true,
            message: "Learning material uploaded and processed successfully! ✨",
            material,
        });
    } catch (error) {
        console.error("[UPLOAD MATERIAL ERROR]", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 2. Generate MCQs from Material
export const generateMcqsFromMaterial = async (req, res) => {
    try {
        const { materialId } = req.params;
        const { numQuestions = 5, difficulty = "Medium" } = req.body;

        const material = await Material.findById(materialId);
        if (!material) {
            return res.status(404).json({ success: false, message: "Material not found" });
        }

        const textToUse = material.extractedText && material.extractedText.length > 50
            ? material.extractedText
            : `Official Training Manual on ${material.topic} under ${material.domain}. Principles of official survey statistics, sampling frames, and national account compilations.`;

        const mcqs = await generateMCQsFromText(textToUse, {
            numQuestions: Math.min(Math.max(numQuestions, 3), 10),
            difficulty,
            domain: material.domain,
            topic: material.topic,
        });

        const quiz = await Quiz.create({
            title: `${material.title} - Diagnostic Assessment`,
            domain: material.domain,
            topic: material.topic,
            difficulty,
            questions: mcqs.map((q) => ({
                question: q.question,
                options: q.options,
                correctAnswer: q.correctAnswer,
                explanation: q.explanation || "Official statistical guideline concept.",
                topic: material.topic,
            })),
            isOfficial: false,
            sourceMaterialId: material._id,
            estimatedTimeMinutes: mcqs.length * 2,
        });

        material.generatedMCQsCount = (material.generatedMCQsCount || 0) + mcqs.length;
        await material.save();

        return res.status(200).json({
            success: true,
            message: `Successfully generated ${mcqs.length} diagnostic MCQs!`,
            mcqs,
            quiz,
        });
    } catch (error) {
        console.error("[GENERATE MCQS FROM MATERIAL ERROR]", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 3. List Materials
export const getMaterials = async (req, res) => {
    try {
        const materials = await Material.find().sort({ createdAt: -1 }).limit(40);
        return res.status(200).json({
            success: true,
            materials,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 4. Get Material by ID
export const getMaterialById = async (req, res) => {
    try {
        const material = await Material.findById(req.params.id);
        if (!material) {
            return res.status(404).json({ success: false, message: "Material not found" });
        }
        return res.status(200).json({
            success: true,
            material,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 5. User submits a Study Material Request (with optional attachment)
export const requestMaterial = async (req, res) => {
    try {
        const { topic, domain, description, urgency = "Normal" } = req.body;
        if (!topic || !description) {
            return res.status(400).json({ success: false, message: "Please specify both the topic and detailed requirements." });
        }

        const user = req.user;
        let attachmentData = "";
        let attachmentName = "";

        if (req.file) {
            const mimeType = req.file.mimetype || "application/octet-stream";
            attachmentData = `data:${mimeType};base64,${req.file.buffer.toString("base64")}`;
            attachmentName = req.file.originalname;
        }

        const newRequest = await MaterialRequest.create({
            requesterId: user._id,
            requesterName: user.name || "Statistical Officer",
            requesterEmail: user.email,
            requesterCadre: user.jobRole || "Statistical Officer",
            requesterDepartment: user.department || "MoSPI Headquarters",
            topic: topic.trim(),
            domain: domain || "Statistical Competencies",
            description: description.trim(),
            urgency,
            attachmentData,
            attachmentName,
            status: "pending",
        });

        return res.status(201).json({
            success: true,
            message: "Study material request successfully submitted to the Academy Secretariat.",
            request: newRequest,
        });
    } catch (error) {
        console.error("[REQUEST MATERIAL ERROR]", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 6. User gets their own Study Material Requests & Dispatched Resources
export const getMyMaterialRequests = async (req, res) => {
    try {
        const requests = await MaterialRequest.find({ requesterId: req.user._id })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            requests,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
