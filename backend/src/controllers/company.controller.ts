import { prisma } from "../index";
import { Request, Response } from "express";

export const createCompany = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body;

    const company = await prisma.company.create({
      data: { name, description },
    });

    res.json(company);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: message });
  }
};

export const getCompanies = async (_req: Request, res: Response): Promise<void> => {
  const companies = await prisma.company.findMany({
    include: { personas: true, targets: true, weeks: true },
  });
  res.json(companies);
};

export const getCompany = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id;
    if (!id) {
        res.status(400).json({ error: "Invalid company id" });
        return;
    }
    const company = await prisma.company.findUnique({
        where: { id },
        include: { personas: true, targets: true, weeks: true }
    });
    if (!company) {
        res.status(404).json({ error: "Company not found" });
        return;
    }

    res.json(company);
};