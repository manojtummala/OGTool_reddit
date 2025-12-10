import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getPersonas = async (_: Request, res: Response) => {
  const personas = await prisma.persona.findMany();
  res.json(personas);
};

export const createPersona = async (req: Request, res: Response) => {
  const { username, description } = req.body;

  const persona = await prisma.persona.create({
    data: {
      username: username.startsWith("u/") ? username : `u/${username}`,
      description
    }
  });

  res.json(persona);
};

export const updatePersona = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { username, description } = req.body;

  const persona = await prisma.persona.update({
    where: { id: Number(id) },
    data: {
      username: username.startsWith("u/") ? username : `u/${username}`,
      description
    }
  });

  res.json(persona);
};