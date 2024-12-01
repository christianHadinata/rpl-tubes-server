import express from "express";
import { getListUserSidangAll } from "../controllers/sidang.js";

const router = express.Router();

router.get("/listSidang", getListUserSidangAll);

export default router;
