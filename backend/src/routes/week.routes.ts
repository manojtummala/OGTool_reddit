import { Router } from "express";
import { getWeeks, getWeek, createWeek, getWeeksByCompany } from "../controllers/week.controller";

const router = Router();

router.get("/", getWeeks);
router.get("/company/:companyId", getWeeksByCompany);
router.get("/:id", getWeek);
router.post("/", createWeek);

export default router;