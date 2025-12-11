import { Request, Response } from "express";
import { prisma } from "../index";

export async function generateWeek(req: Request, res: Response) {
  try {
    const {
      company,
      personas,
      subreddits,
      keywords,
      postsPerWeek,
      companyId,
    }: {
      company: any;
      personas: Array<{ username: string }>;
      subreddits: string[];
      keywords: string[];
      postsPerWeek: number;
      companyId: string;
    } = req.body;

    // Make sure a company ID is available
    if (!companyId) {
      return res.status(400).json({
        error: "companyId is required. Save data before generating.",
      });
    }

    // 1️⃣ Create a new week plan
    const week = await prisma.weekPlan.create({
      data: {
        companyId,
      },
    });

    // 2️⃣ Fake generated posts (to be replaced with AI)
    const generatedPosts = subreddits.map(
      (sub: string, i: number): {
        day: number;
        subreddit: string;
        title: string;
        body: string;
        personaName: string;
      } => ({
        day: (i % 7) + 1,
        subreddit: sub,
        title: `Sample title for ${sub}`,
        body: `Sample generated content for ${sub}`,
        personaName: personas[0]?.username ?? "",
      })
    );

    // 3️⃣ Insert posts into DB
    const posts = await Promise.all(
      generatedPosts.map((p: any) =>
        prisma.post.create({
          data: {
            day: p.day,
            title: p.title,
            body: p.body,
            subreddit: p.subreddit,
            personaName: p.personaName,
            weekId: week.id,
          },
        })
      )
    );

    const transformedPosts = posts.map((post) => ({
      post_id: post.id,
      title: post.title,
      body: post.body,
      subreddit: post.subreddit,
      author_username: post.personaName || "",
      quality_score: null, // or calculate if you have scoring logic
      timestamp: `Day ${post.day}`, // or format the actual date
      comments: [], // empty for now, or fetch if you have comments
    }));

    return res.json({
      weekId: week.id,
      week_start_date: week.startDate.toISOString().split('T')[0], // Format date
      overall_score: null, // or calculate if you have scoring
      posts: transformedPosts,
      personas,
      subreddits,
      company,
    });
  } catch (err) {
    console.error("GENERATE ERROR:", err);
    return res.status(500).json({ error: "Failed to generate week" });
  }
}