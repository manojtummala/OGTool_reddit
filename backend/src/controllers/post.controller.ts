import { prisma } from "../index";
import { Request, Response } from "express";

export const updatePost = async (req: Request, res: Response): Promise<void> => {
  try{
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      res.status(400).json({ error: "Invalid post id" });
      return;
    }
    const { title, body, subreddit, personaId, targetId } = req.body;
    const post = await prisma.post.update({
      where: { id: id.toString() },
      data: { title, body, subreddit, personaId, targetId },
    });
    res.json(post);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: message });
  }
};

export const deletePost = async (req: Request, res: Response): Promise<void> => {
  try{
    const id = req.params.id;
    if (!id) {
      res.status(400).json({ error: "Invalid post id" });
      return;
    }
    await prisma.post.delete({ where: { id } });
    res.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: message });
  }
};