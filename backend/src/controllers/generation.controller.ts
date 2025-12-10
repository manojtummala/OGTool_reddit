import { Request, Response } from "express";

export async function generateWeek(req: Request, res: Response) {
  console.log("Received payload:", req.body);

  return res.json({
    week: "test",
    posts: []
  });
}