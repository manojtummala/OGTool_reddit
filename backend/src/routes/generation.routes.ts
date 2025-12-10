import { Router } from "express";
import { generateWeek } from "../controllers/generation.controller";

const router = Router();

router.post("/week", generateWeek);

export default router;