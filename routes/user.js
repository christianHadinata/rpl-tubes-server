import express from "express";
import { register, login } from "../controllers/user.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", authMiddleware(["Admin"]), register);
router.post("/login", login);

export default router;
