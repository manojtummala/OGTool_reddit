import { Router } from "express";
import { saveAll } from "../controllers/save.controller";

const router = Router();

// Save all main form data
router.post("/all", saveAll);

export default router;