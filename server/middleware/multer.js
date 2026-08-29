import multer from "multer";

// Use memoryStorage for reliable buffer handling across all platforms and serverless
const storage = multer.memoryStorage();

export const upload = multer({
    storage,
    limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
});
export default upload;