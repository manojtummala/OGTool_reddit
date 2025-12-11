import { prisma } from "../index";
import { Request, Response } from "express";
import { evaluateWeekQuality } from "./generate.controller";

export const getWeeks = async (req: Request, res: Response): Promise<void> => {
  try {
    const weeks = await prisma.weekPlan.findMany({
      include: { posts: true },
      orderBy: { startDate: "desc" },
    });

    res.json(weeks);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: message });
  }
};

export const getWeeksByCompany = async (req: Request, res: Response): Promise<void> => {
  try {
    const { companyId } = req.params;

    if (!companyId) {
      res.status(400).json({ error: "Missing companyId" });
      return;
    }

    const weeks = await prisma.weekPlan.findMany({
      where: { companyId: companyId },
      include: {
        posts: {
          include: {
            comments: {
              orderBy: { timestamp: "asc" },
            },
            persona: true,
            target: true,
            postKeywords: {
              include: {
                keyword: true,
              },
            },
          },
          orderBy: { day: "asc" },
        },
        company: {
          include: {
            personas: true,
            targets: true,
            keywords: true,
          },
        },
      },
      orderBy: { startDate: "desc" },
    });

    const formattedWeeks = weeks.map((week) => {
      const formattedPosts = week.posts.map((post) => {
        const keywordTexts = post.postKeywords.map(pk => pk.keyword.keyword);
        const selectedKeywords = keywordTexts;
        
        const bodyLength = post.body?.length || 0;
        const commentCount = post.comments.length;
        const keywordCount = selectedKeywords.length;
        
        const baseScore = 40 + Math.floor(Math.random() * 21);
        let bodyScore = 0;
        if (bodyLength < 50) bodyScore = 5;
        else if (bodyLength < 100) bodyScore = 10;
        else if (bodyLength < 200) bodyScore = 15;
        else if (bodyLength < 500) bodyScore = 20;
        else if (bodyLength < 1000) bodyScore = 25;
        else bodyScore = 20;
        
        const engagementScore = Math.min(15, commentCount * 3 + (commentCount > 2 ? 5 : 0));
        const targetingScore = Math.min(10, keywordCount * 3);
        const qualityScore = Math.min(100, baseScore + bodyScore + engagementScore + targetingScore);

        return {
          post_id: post.id,
          id: post.id, 
          subreddit: post.subreddit,
          title: post.title,
          author_username: post.personaName || post.persona?.username || "",
          timestamp: new Date(week.startDate.getTime() + (post.day - 1) * 24 * 60 * 60 * 1000)
            .toISOString().replace("T", " ").substring(0, 19),
          target_keywords: selectedKeywords.map((kw, idx) => {
            const allKeywords = week.company.keywords.map(k => k.keyword);
            const keywordIndex = allKeywords.indexOf(kw);
            return keywordIndex >= 0 ? `K${keywordIndex + 1}` : `K${idx + 1}`;
          }),
          quality_score: Math.round(qualityScore),
          body: post.body,
          comments: post.comments.map(c => ({
            comment_id: c.id,
            id: c.id, 
            parent_comment_id: c.parentCommentId,
            parentCommentId: c.parentCommentId,
            author_username: c.authorUsername,
            timestamp: c.timestamp.toISOString().replace("T", " ").substring(0, 19),
            text: c.text,
            content: c.text, 
            body: c.text,
          })),
        };
      });

      const overallScore = formattedPosts.length > 0
        ? Math.round(formattedPosts.reduce((sum, p) => sum + (p.quality_score || 0), 0) / formattedPosts.length)
        : null;

      const qualityEvaluation = evaluateWeekQuality({
        overall_score: overallScore,
        posts: formattedPosts,
        personas: week.company.personas,
        subreddits: week.company.targets.map(t => t.subreddit),
      });

      return {
        id: week.id,
        week_id: week.id, 
        startDate: week.startDate.toISOString().split("T")[0],
        start_date: week.startDate.toISOString().split("T")[0],
        week_start_date: week.startDate.toISOString().split("T")[0],
        week_start: week.startDate.toISOString().split("T")[0],
        overall_score: overallScore,
        quality_evaluation: qualityEvaluation,
        posts: formattedPosts,
        personas: week.company.personas,
        company: {
          name: week.company.name,
          description: week.company.description,
        },
        subreddits: week.company.targets.map(t => t.subreddit),
        keywords: week.company.keywords.map(k => k.keyword),
      };
    });

    res.json(formattedWeeks);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: message });
  }
};

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