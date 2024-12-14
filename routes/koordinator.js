import express from "express";
import {
  createDataSidang,
  getAllMahasiswa,
  getKomponenDanBobot,
  createKomponenDanBobot,
  createNilai,
} from "../controllers/koordinator.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/all-mahasiswa", getAllMahasiswa);
router.get(
  "/komponen-bobot",
  authMiddleware(["Koordinator"]),
  getKomponenDanBobot
);
router.post(
  "/tambah-data-sidang",
  authMiddleware(["Koordinator"]),
  createDataSidang
);
router.post(
  "/komponen-bobot",
  authMiddleware(["Koordinator"]),
  createKomponenDanBobot
);
router.post("/tambah-nilai", authMiddleware(["Koordinator"]), createNilai);

export default router;