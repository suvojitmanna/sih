import User from "../models/userModel.js";

export const getCurrentUser = async (req, res) => {
    try {
        const userId = req.userId || req.user?._id;
        const user = await User.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message || `${error}` });
    }
};

export const getUserData = async (req, res) => {
    try {
        const userId = req.userId || req.user?._id;
        const user = await User.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        return res.status(200).json({ success: true, user });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message || `${error}` });
    }
};