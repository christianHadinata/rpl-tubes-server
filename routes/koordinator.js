import express from "express";
import {
  createDataSidang,
  getAllMahasiswa,
} from "../controllers/koordinator.js";

const router = express.Router();

router.get("/all-mahasiswa", getAllMahasiswa);
router.post("/tambah-data-sidang", createDataSidang);

export default router;
