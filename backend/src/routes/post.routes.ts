import { Router } from "express";
import { updatePost, deletePost, updatePostWithComments } from "../controllers/post.controller";

const router = Router();

router.put("/update-with-comments", updatePostWithComments);
router.put("/:id", updatePost);
router.delete("/:id", deletePost);



export default router;