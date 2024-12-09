import express from "express";
import { getAllDosen, createNilai } from "../controllers/dosen.js";

const router = express.Router();

router.get("/all", getAllDosen);
router.post("/tambah-nilai", createNilai);

export default router;
