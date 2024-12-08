import express from "express";
import {
  getListUserSidangAll,
  getSingleSidang,
  getCatatanSidang,
  updateCatatanSidang,
} from "../controllers/sidang.js";

const router = express.Router();

router.get("/listSidang", getListUserSidangAll);
router.get("/singleSidang", getSingleSidang);
router.get("/catatanSidang", getCatatanSidang);
router.patch("/catatanSidang", updateCatatanSidang);

export default router;
