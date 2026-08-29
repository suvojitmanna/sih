import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            unique: true,
            required: true,
            lowercase: true,
            trim: true,
        },
        image: {
            type: String,
            default: "",
        },
        picture: {
            type: String,
            default: "",
        },
        password: {
            type: String,
            minlength: 6,
        },
        googleId: {
            type: String,
        },
        provider: {
            type: String,
            default: "email",
        },
        role: {
            type: String,
            enum: ["learner", "admin", "trainer"],
            default: "learner",
        },
        emailVerified: {
            type: Boolean,
            default: false,
        },

        // Secure Email OTP authentication
        otpHash: {
            type: String,
            default: null,
        },
        otpExpiresAt: {
            type: Date,
            default: null,
        },
        otpAttempts: {
            type: Number,
            default: 0,
        },
        otpLastSentAt: {
            type: Date,
            default: null,
        },

        // Learner Profile (Official Statistical System)
        designation: {
            type: String,
            default: "Statistical Officer",
        },
        department: {
            type: String,
            default: "National Sample Survey Office (NSSO)",
        },
        jobRole: {
            type: String,
            default: "Indian Statistical Service (ISS) Officer",
        },
        currentAssignment: {
            type: String,
            default: "Large-Scale Sample Survey Operations",
        },
        educationalQualification: {
            type: String,
            default: "M.Sc. in Statistics / Applied Economics",
        },
        workExperience: {
            type: Number,
            default: 3,
        },
        previousTraining: {
            type: [String],
            default: ["NSSTA Induction Course on Official Statistics"],
        },

        // Competencies (assessed across 4 official domains)
        competencies: [
            {
                domain: { type: String },
                competencyName: { type: String },
                level: { type: String, enum: ["Beginner", "Intermediate", "Advanced", "Expert"], default: "Intermediate" },
                score: { type: Number, default: 60 },
                source: { type: String, enum: ["self-reported", "assessment-derived", "ai-inferred"], default: "self-reported" },
                rationale: { type: String },
                lastAssessedAt: { type: Date, default: Date.now },
            },
        ],

        // AI-Analyzed Skill Gaps
        skillGaps: [
            {
                competencyName: { type: String },
                domain: { type: String },
                currentLevel: { type: String },
                requiredLevel: { type: String },
                gapScore: { type: Number },
                priority: { type: String, enum: ["High", "Medium", "Low"], default: "Medium" },
                impact: { type: String },
                recommendedAction: { type: String },
            },
        ],

        // Personalized Learning Pathway (iGOT & NSSTA TPAC)
        learningPath: [
            {
                step: { type: Number },
                title: { type: String },
                provider: { type: String, default: "iGOT Karmayogi" },
                skillAddressed: { type: String },
                duration: { type: String },
                currentLevel: { type: String },
                targetLevel: { type: String },
                priority: { type: String, default: "Medium" },
                rationale: { type: String },
                status: { type: String, enum: ["not-started", "in-progress", "completed"], default: "not-started" },
                externalUrl: { type: String },
                completedAt: { type: Date },
            },
        ],

        // Metrics & Stats
        overallCompetencyScore: {
            type: Number,
            default: 65,
        },
        overallLevel: {
            type: String,
            default: "Intermediate",
        },
        learningStreak: {
            type: Number,
            default: 1,
        },
        learningHours: {
            type: Number,
            default: 0,
        },
        quizzesCompleted: {
            type: Number,
            default: 0,
        },
        credits: {
            type: Number,
            default: 100,
        },
    },
    { timestamps: true }
);

// Hash password before saving if present and modified
userSchema.pre("save", async function () {
    if (this.image && !this.picture) {
        this.picture = this.image;
    }
    if (this.picture && !this.image) {
        this.image = this.picture;
    }
    if (!this.isModified("password") || !this.password) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
    if (!this.password) return false;
    return await bcrypt.compare(enteredPassword, this.password);
};

// Method to compare OTP
userSchema.methods.matchOtp = async function (enteredOtp) {
    if (!this.otpHash) return false;
    return await bcrypt.compare(enteredOtp.toString(), this.otpHash);
};

const User = mongoose.model("User", userSchema);
export default User;