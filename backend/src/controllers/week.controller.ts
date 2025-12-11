import { prisma } from "../index";
import { Request, Response } from "express";

// list weeks
export const getWeeks = async (req: Request, res: Response): Promise<void> => {
  try{
    const weeks = await prisma.weekPlan.findMany({
      include: { posts: true }
    });
    res.json(weeks);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: message });
  }
};

// get single week
export const getWeek = async (req: Request, res: Response): Promise<void> => {
  try{
    const id = req.params.id;
    if (!id) {
      res.status(400).json({ error: "Invalid week id" });
      return;
    }
    const week = await prisma.weekPlan.findUnique({
      where: { id },
      include: { posts: true }
    });
    res.json(week);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: message });
  }
};

// create week (normally done by generation)
export const createWeek = async (req: Request, res: Response): Promise<void> => {
  try{
    const { companyId, startDate } = req.body;
    const week = await prisma.weekPlan.create({
      data: { companyId, startDate: new Date(startDate) }
    });
    res.json(week);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: message });
  }
};