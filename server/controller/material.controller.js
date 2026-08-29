import fs from "fs";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import Material from "../models/materialModel.js";
import Quiz from "../models/quizModel.js";
import { generateMCQsFromText } from "../services/aiService.js";

// Helper: Extract text from PDF buffer
const extractPdfText = async (filePath) => {
    try {
        const fileBuffer = await fs.promises.readFile(filePath);
        const uint8Array = new Uint8Array(fileBuffer);
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

// 1. Upload Learning Material
export const uploadMaterial = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "Please select a file to upload (PDF, DOCX, or TXT)." });
        }

        const { title, domain = "Statistical Competencies", topic = "Survey Methodology" } = req.body;
        const filePath = req.file.path;
        const fileExt = req.file.originalname.split(".").pop().toLowerCase();
        let extractedText = "";

        if (fileExt === "pdf") {
            extractedText = await extractPdfText(filePath);
        } else if (fileExt === "txt") {
            extractedText = await fs.promises.readFile(filePath, "utf-8");
        } else {
            extractedText = `Document: ${req.file.originalname}. Official training manual on ${topic}.`;
        }

        // Clean up temporary upload file if exists
        try {
            await fs.promises.unlink(filePath);
        } catch (unlinkErr) {
            // Ignore unlink errors
        }

        const material = await Material.create({
            title: title || req.file.originalname,
            originalName: req.file.originalname,
            fileType: fileExt === "pdf" ? "pdf" : fileExt === "txt" ? "txt" : "other",
            fileSize: req.file.size,
            domain,
            topic,
            extractedText: extractedText.substring(0, 50000), // Store up to 50k chars
            summary: `Learning material containing ${Math.round(extractedText.length / 5)} words covering ${topic}.`,
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

// 2. Generate MCQs & Quiz from Uploaded Material
export const generateMcqsFromMaterial = async (req, res) => {
    try {
        const { materialId } = req.params;
        const { numQuestions = 5, difficulty = "Medium" } = req.body;
        const userId = req.userId || req.user?._id;

        const material = await Material.findById(materialId);
        if (!material) {
            return res.status(404).json({ success: false, message: "Material not found" });
        }

        const textContent = material.extractedText || material.summary || material.title;

        // Call Gemini AI
        const mcqs = await generateMCQsFromText({
            text: textContent,
            numQuestions: Number(numQuestions),
            difficulty,
            topic: material.topic,
        });

        // Automatically create a Quiz from the generated MCQs
        const quiz = await Quiz.create({
            title: `Assessment: ${material.title} (${difficulty})`,
            domain: material.domain,
            topic: material.topic,
            difficulty,
            timeLimitMinutes: Math.max(5, Math.round(mcqs.length * 1.5)),
            questions: mcqs,
            sourceMaterialId: material._id,
            createdBy: userId,
            isGeneratedByAI: true,
            isPublished: true,
        });

        material.generatedMCQsCount = (material.generatedMCQsCount || 0) + mcqs.length;
        await material.save();

        return res.status(200).json({
            success: true,
            message: `Generated ${mcqs.length} MCQs and created assessment quiz! ✨`,
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
        const materials = await Material.find().sort({ createdAt: -1 }).limit(30);
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
