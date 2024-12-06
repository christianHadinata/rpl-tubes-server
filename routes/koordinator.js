import express from "express";
import {
  createDataSidang,
  getAllMahasiswa,
  getKomponenDanBobot,
  createKomponenDanBobot,
} from "../controllers/koordinator.js";

const router = express.Router();

router.get("/all-mahasiswa", getAllMahasiswa);
router.get("/komponen-bobot", getKomponenDanBobot);
router.post("/tambah-data-sidang", createDataSidang);
router.post("/komponen-bobot", createKomponenDanBobot);

export default router;
