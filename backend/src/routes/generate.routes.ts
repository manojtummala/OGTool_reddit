import { Router } from "express";
import { generateWeek } from "../controllers/generate.controller";

const router = Router();

router.post("/week", generateWeek);

export default router;