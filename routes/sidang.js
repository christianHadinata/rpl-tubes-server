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

const router = express.Router();

router.get("/listSidang", getListUserSidangAll);
router.get("/singleSidang", getSingleSidang);
router.get("/catatanSidang", getCatatanSidang);
router.get("/allKomponenRole", getAllKomponenRole);
router.get("/bapSidang", getBAPSidang);
router.get("/ttdBapSidang", getTTDBAP);
router.post(
  "/ttdBapSidang",
  fileUpload("./public").single("gambarTTD"),
  createTTDBAP
);
router.patch("/catatanSidang", updateCatatanSidang);
router.patch("/jadwalDanTempatSidang", updateJadwalDanTempatSidang);

export default router;
