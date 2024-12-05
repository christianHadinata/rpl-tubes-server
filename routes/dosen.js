import express from "express";
import { getAllDosen } from "../controllers/dosen.js";

const router = express.Router();

router.get("/all", getAllDosen);

export default router;