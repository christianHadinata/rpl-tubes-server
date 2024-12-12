import express from "express";
import { getNPM, getAllNilai } from "../controllers/mahasiswa.js";

const router = express.Router();

router.get("/npm", getNPM);
router.get("/allNilai", getAllNilai);

export default router;