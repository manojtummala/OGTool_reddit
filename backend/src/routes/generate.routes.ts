import { Router } from "express";
import { generateWeek, getLatestWeek } from "../controllers/generate.controller";

const router = Router();

router.post("/week", generateWeek);
router.get("/week/latest", getLatestWeek);

export default router;