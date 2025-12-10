import { Router } from "express";
import { createPersona, getPersonas, updatePersona } from "../controllers/personas";

const router = Router();

router.get("/", getPersonas);
router.post("/", createPersona);
router.put("/:id", updatePersona);

export default router;