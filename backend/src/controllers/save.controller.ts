import { Request, Response } from "express";
import { prisma } from "../index";

function normalizeUsername(raw?: string) {
  if (!raw) return "";
  const t = raw.trim();
  return t.startsWith("u/") ? t : `u/${t}`;
}

function normalizeSubreddit(raw?: string) {
  if (!raw) return "";
  const t = raw.trim();
  return t.startsWith("r/") ? t : `r/${t}`;
}

export async function saveAll(req: Request, res: Response) {
  try {
    const { company, personas, subreddits, postsPerWeek } = req.body;

    if (!company?.name) {
      return res.status(400).json({ error: "Company name is required" });
    }

    const companyName = company.name.trim();

    const companyRecord = await prisma.company.upsert({
      where: { name: companyName },
      create: {
        name: companyName,
        description: company.description ?? "",
      },
      update: {
        description: company.description ?? "",
      },
    });

    const companyId = companyRecord.id;

    if (Array.isArray(personas)) {
      for (const p of personas) {
        const username = normalizeUsername(p.username);
        if (!username) continue;

        const existing = await prisma.persona.findFirst({
          where: { companyId, username },
        });

        if (existing) {
          const newDesc = p.description ?? "";
          if ((existing.description ?? "") !== newDesc) {
            await prisma.persona.update({
              where: { id: existing.id },
              data: { description: newDesc },
            });
          }
        } else {
          await prisma.persona.create({
            data: {
              username,
              description: p.description ?? "",
              companyId,
            },
          });
        }
      }
    }

    if (Array.isArray(subreddits)) {
      for (const s of subreddits) {
        const subreddit = normalizeSubreddit(s);
        if (!subreddit) continue;

        const existingTarget = await prisma.target.findFirst({
          where: { companyId, subreddit },
        });

        if (!existingTarget) {
          await prisma.target.create({
            data: { subreddit, companyId },
          });
        }
      }
    }
    const fullCompany = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        personas: true,
        targets: true,
        weeks: {
          include: { posts: true },
          orderBy: { startDate: "desc" },
        },
      },
    });

    return res.json({ success: true, companyId, company: fullCompany });
  } catch (err) {
    console.error("SAVE ERROR:", err);
    return res.status(500).json({ error: "Failed to save data" });
  }
}