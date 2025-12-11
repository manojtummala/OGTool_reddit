import { Router } from "express";
import { createCompany, getCompanies, getCompany } from "../controllers/company.controller";

const router = Router();

router.post("/", createCompany);
router.get("/", getCompanies);
router.get("/:id", getCompany);

export default router;