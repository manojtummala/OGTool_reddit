import { Router } from "express";
import generationRoutes from "./generation.routes";

const router = Router();

router.use("/generate", generationRoutes);

export default router;