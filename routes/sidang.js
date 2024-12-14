import express from "express";
import {
  getListUserSidangAll,
  getSingleSidang,
  getCatatanSidang,
  getAllKomponenRole,
  updateCatatanSidang,
  updateJadwalDanTempatSidang,
  getBAPSidang,
  createTTDBAP,
  getTTDBAP,
} from "../controllers/sidang.js";

import { fileUpload } from "../middleware/fileUploader.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/listSidang", getListUserSidangAll);
router.get("/singleSidang", getSingleSidang);
router.get(
  "/catatanSidang",
  authMiddleware(["Pembimbing Utama", "Pembimbing Pendamping", "Mahasiswa"]),
  getCatatanSidang
);
router.get("/allKomponenRole", getAllKomponenRole);
router.get("/bapSidang", getBAPSidang);
router.get("/ttdBapSidang", getTTDBAP);
router.post(
  "/ttdBapSidang",
  fileUpload("./public").single("gambarTTD"),
  createTTDBAP
);
router.patch(
  "/catatanSidang",
  authMiddleware(["Pembimbing Utama"]),
  updateCatatanSidang
);
router.patch(
  "/jadwalDanTempatSidang",
  authMiddleware(["Koordinator"]),
  updateJadwalDanTempatSidang
);

export default router;