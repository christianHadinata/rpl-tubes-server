import express from "express";
import {
  createDataSidang,
  getMahasiswaNotHaveSidang,
} from "../controllers/koordinator.js";

const router = express.Router();

router.get("/mahasiswa-belum-sidang", getMahasiswaNotHaveSidang);
router.post("/tambah-data-sidang", createDataSidang);

export default router;