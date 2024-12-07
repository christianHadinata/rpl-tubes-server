import express from "express";
import {
  getListUserSidangAll,
  getSingleSidang,
} from "../controllers/sidang.js";

const router = express.Router();

router.get("/listSidang", getListUserSidangAll);
router.get("/singleSidang", getSingleSidang);

export default router;
