import { Router } from "express";
import { getWeeks, getWeek, createWeek } from "../controllers/week.controller";

const router = Router();

router.get("/", getWeeks);
router.get("/:id", getWeek);
router.post("/", createWeek);

export default router;