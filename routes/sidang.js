import express from "express";
import {
  getListUserSidangAll,
  getSingleSidang,
  getCatatanSidang,
  getAllKomponenRole,
  updateCatatanSidang,
  updateJadwalDanTempatSidang,
} from "../controllers/sidang.js";

const router = express.Router();

router.get("/listSidang", getListUserSidangAll);
router.get("/singleSidang", getSingleSidang);
router.get("/catatanSidang", getCatatanSidang);
router.get("/allKomponenRole", getAllKomponenRole);
router.patch("/catatanSidang", updateCatatanSidang);
router.patch("/jadwalDanTempatSidang", updateJadwalDanTempatSidang);

export default router;
