import { Router } from "express";
import { createPersona, updatePersona, deletePersona } from "../controllers/persona.controller";

const router = Router();

router.post("/", createPersona);
router.put("/:id", updatePersona);
router.delete("/:id", deletePersona);

export default router;