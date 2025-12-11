import { prisma } from "../index";
import { Request, Response } from "express";

export const createPersona = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, description, companyId } = req.body;
    console.log("Received data:", { username, description, companyId });

    const persona = await prisma.persona.create({
      data: {
        username,
        description,
        companyId,
      },
    });

    console.log("Created persona:", persona);

    res.json(persona);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: message });
  }
};

export const updatePersona = async (req: Request, res: Response): Promise<void> => {
  try{
    const id = req.params.id;
    if (!id) {
      res.status(400).json({ error: "Invalid persona id" });
      return;
    }
    const { username, description, companyId } = req.body;
    const persona = await prisma.persona.update({
      where: { id },
      data: { username: username?.startsWith("u/") ? username : `u/${username}`,
        description,
        companyId,
      },
  });
  res.json(persona);
} catch (err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  res.status(500).json({ error: message });
}
};

export const deletePersona = async (req: Request, res: Response): Promise<void> => {
  try{
    const id = req.params.id;
    if (!id) {
      res.status(400).json({ error: "Invalid persona id" });
      return;
    }
    await prisma.persona.delete({ where: { id } });
    res.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: message });
  }
};