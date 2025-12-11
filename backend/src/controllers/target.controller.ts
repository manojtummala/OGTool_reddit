import { prisma } from "../index";
import { Request, Response } from "express";

export const createTarget = async (req: Request, res: Response): Promise<void> => {
  try{
    const { subreddit, companyId } = req.body;
    const formatted = subreddit.startsWith("r/") ? subreddit : `r/${subreddit}`;
    const target = await prisma.target.create({ data: { subreddit: formatted, companyId } });
    res.json(target);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: message });
  }
};

export const deleteTarget = async (req: Request, res: Response): Promise<void> => {
  try{
    const id = req.params.id;
    if (!id) {
      res.status(400).json({ error: "Invalid target id" });
      return;
    }
    await prisma.target.delete({ where: { id } });
    res.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: message });
  }
};