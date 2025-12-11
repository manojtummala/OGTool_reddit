import { Router } from "express";
import { updatePost, deletePost } from "../controllers/post.controller";

const router = Router();

router.put("/:id", updatePost);
router.delete("/:id", deletePost);

export default router;