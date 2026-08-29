import express from "express";
import isAuth from "../middleware/isAuth.js";
import { getCurrentUser, getUserData } from "../controller/user.controller.js";
import { logout } from "../controller/auth.controller.js";
import { getPublishedImages } from "../controller/community.controller.js";

const userRouter = express.Router();

userRouter.get("/current-user", isAuth, getCurrentUser);
userRouter.get("/data", isAuth, getUserData);
userRouter.get("/logout", logout);
userRouter.get("/published-images", getPublishedImages);

export default userRouter;