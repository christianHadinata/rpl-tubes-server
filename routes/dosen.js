import express from "express";
import { getAllDosen, createNilai } from "../controllers/dosen.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/all", getAllDosen);
router.post(
  "/tambah-nilai",
  authMiddleware([
    "Koordinator",
    "Pembimbing Utama",
    "Ketua Tim Penguji",
    "Anggota Tim Penguji",
  ]),
  createNilai
);

export default router;