import { Router } from "express";
import { saveAll } from "../controllers/save.controller";

const router = Router();

router.post("/all", saveAll);

export default router;