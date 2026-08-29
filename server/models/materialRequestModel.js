import mongoose from "mongoose";

const materialRequestSchema = new mongoose.Schema(
    {
        requesterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        requesterName: {
            type: String,
            required: true,
        },
        requesterEmail: {
            type: String,
            required: true,
        },
        requesterCadre: {
            type: String,
            default: "Statistical Officer",
        },
        requesterDepartment: {
            type: String,
            default: "MoSPI Headquarters",
        },
        topic: {
            type: String,
            required: true,
            trim: true,
        },
        domain: {
            type: String,
            enum: [
                "Statistical Competencies",
                "Technical & Computational Competencies",
                "Digital Governance & Security",
                "Behavioural & Managerial Competencies",
            ],
            default: "Statistical Competencies",
        },
        description: {
            type: String,
            required: true,
        },
        urgency: {
            type: String,
            enum: ["Normal", "High", "Critical"],
            default: "Normal",
        },
        status: {
            type: String,
            enum: ["pending", "fulfilled", "rejected"],
            default: "pending",
        },
        adminResponseNote: {
            type: String,
            default: "",
        },
        dispatchedMaterialTitle: {
            type: String,
            default: "",
        },
        dispatchedMaterialUrl: {
            type: String,
            default: "",
        },
        dispatchedMaterialText: {
            type: String,
            default: "",
        },
        fulfilledMaterialId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Material",
            default: null,
        },
        fulfilledAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

const MaterialRequest = mongoose.model("MaterialRequest", materialRequestSchema);
export default MaterialRequest;
