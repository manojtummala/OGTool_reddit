import { Router } from "express";
import { createTarget, deleteTarget } from "../controllers/target.controller";

const router = Router();

router.post("/", createTarget);
router.delete("/:id", deleteTarget);

export default router;