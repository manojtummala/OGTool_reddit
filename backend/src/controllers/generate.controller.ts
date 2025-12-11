// backend/src/controllers/generate.controller.ts
import { Request, Response } from "express";
import { prisma } from "../index";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface GenerateWeekRequest {
  company: { name: string; description?: string };
  personas: Array<{ username: string; description?: string }>;
  subreddits: string[];
  postsPerWeek: number;
  companyId: string;
}

/**
 * Step 1: Generate keywords based on company info
 * These will be DIFFERENT for each company, but similar in style to your sample
 */
async function generateKeywords(companyName: string, companyDescription?: string): Promise<string[]> {
  const prompt = `You are a SEO expert specializing in ChatGPT/LLM search queries. Based on the company information below, generate 15-20 natural search queries that people would type into ChatGPT when looking for this product/service.

Company: ${companyName}
${companyDescription ? `Description: ${companyDescription}` : ""}

Generate queries in these patterns (similar to how people actually search in ChatGPT):
- "best [product category]" (e.g., "best ai presentation maker")
- "[competitor] vs [company]" (e.g., "Claude vs Slideforge")
- "alternatives to [competitor]" (e.g., "alternatives to PowerPoint")
- "how to [solve problem]" (e.g., "how to make slides faster")
- "[competitor] alternative for [use case]" (e.g., "Canva alternative for presentations")
- "tools for [user type]" (e.g., "tools for consultants", "tools for startups")
- "need help with [task]" (e.g., "need help with pitch deck")
- "[action] my [thing]" (e.g., "automate my presentations")
- "best [type] tool" (e.g., "best ai design tool", "best storytelling tool")

Make them specific, natural, and exactly what someone would ask ChatGPT. Focus on:
1. Problem-solving queries
2. Comparison queries (vs competitors)
3. Alternative-finding queries
4. Use-case specific queries
5. Tool discovery queries

Return a JSON object with a "keywords" array of strings. Example format:
{
  "keywords": [
    "best ai presentation maker",
    "ai slide deck tool",
    "pitch deck generator",
    "alternatives to PowerPoint",
    "how to make slides faster"
  ]
}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini", // or "gpt-4" for better quality
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });

  const response = JSON.parse(completion.choices[0].message.content || "{}");
  const keywords = response.keywords || response.queries || [];
  
  // Ensure we have keywords
  if (!Array.isArray(keywords) || keywords.length === 0) {
    throw new Error("Failed to generate keywords from LLM");
  }
  
  return keywords;
}

/**
 * Step 2: Store keywords in DB (if not already exist)
 */
async function ensureKeywordsExist(companyId: string, keywords: string[]): Promise<string[]> {
  const keywordIds: string[] = [];
  
  for (const keywordText of keywords) {
    const existing = await prisma.keyword.findFirst({
      where: { companyId, keyword: keywordText },
    });
    
    if (existing) {
      keywordIds.push(existing.id);
    } else {
      const newKeyword = await prisma.keyword.create({
        data: { companyId, keyword: keywordText },
      });
      keywordIds.push(newKeyword.id);
    }
  }
  
  return keywordIds;
}

/**
 * Step 3: Generate a single post with comments
 */
async function generatePostWithComments(
  company: { name: string; description?: string },
  personas: Array<{ username: string; description?: string }>,
  subreddit: string,
  targetKeywords: string[],
  day: number,
  weekStartDate: Date,
  assignedPersonaUsername: string
): Promise<{
  title: string;
  body: string;
  authorUsername: string;
  comments: Array<{
    text: string;
    authorUsername: string;
    parentCommentIndex: number | null;
    timestamp: Date;
  }>;
  timestamp: Date;
}> {
  const keywordStr = targetKeywords.join(", ");
  const personaList = personas.map(p => `- ${p.username}${p.description ? ` (${p.description})` : ""}`).join("\n");
  
  const prompt = `You are creating a Reddit post and comment thread that feels completely natural and authentic. The goal is to subtly mention "${company.name}" in a helpful, non-promotional way.

Company: ${company.name}
${company.description ? `Description: ${company.description}` : ""}

Target Keywords (work these naturally into the conversation): ${keywordStr}

Subreddit: ${subreddit}

Available Personas:
${personaList}

Requirements:
1. Create a post title and body that feels like a genuine question or discussion starter
2. The post should NOT directly mention the company name - it should be a natural question
3. Generate 2-4 comments that form a natural conversation thread
4. Comments should mention the company organically, as if someone is genuinely recommending it
5. Comments should feel like real Reddit users - casual, helpful, sometimes brief
6. Vary comment lengths (some short "+1", some longer explanations)
7. Comments should reply to each other naturally (use parent-child relationships)
8. Avoid awkward back-and-forth - make it feel like a real discussion

Return JSON in this exact format:
{
  "title": "Natural question title",
  "body": "Post body text that asks a question or starts discussion",
  "authorUsername": "one of the persona usernames",
  "comments": [
    {
      "text": "Comment text",
      "authorUsername": "different persona username",
      "parentCommentId": null,
      "timestampOffset": 20
    },
    {
      "text": "Reply comment",
      "authorUsername": "another persona",
      "parentCommentId": 0,
      "timestampOffset": 35
    }
  ]
}

timestampOffset is minutes after the post timestamp.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini", // or "gpt-4" for better quality
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.8, // Higher for more natural variation
  });

  const response = JSON.parse(completion.choices[0].message.content || "{}");
  
  // Calculate timestamps
  const postTimestamp = new Date(weekStartDate);
  postTimestamp.setDate(postTimestamp.getDate() + (day - 1));
  postTimestamp.setHours(9 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60), 0, 0);
  
  const comments = (response.comments || []).map((c: any, idx: number) => {
    const commentTimestamp = new Date(postTimestamp);
    commentTimestamp.setMinutes(commentTimestamp.getMinutes() + (c.timestampOffset || (idx + 1) * 20));
    
    // Resolve parent comment ID (convert index to actual ID after creation)
    return {
      text: c.text,
      authorUsername: c.authorUsername,
      parentCommentIndex: typeof c.parentCommentId === "number" ? c.parentCommentId : null,
      timestamp: commentTimestamp,
    };
  });

  return {
    title: response.title || "Generated Post",
    body: response.body || "",
    authorUsername: assignedPersonaUsername,
    comments,
    timestamp: postTimestamp,
  };
}

/**
 * Step 4: Plan post distribution across week
 */
function planPostDistribution(
  postsPerWeek: number,
  subreddits: string[]
): Array<{ day: number; subreddit: string }> {
  const plan: Array<{ day: number; subreddit: string }> = [];
  const subredditCounts: Record<string, number> = {};
  
  // Initialize counts
  subreddits.forEach(s => subredditCounts[s] = 0);
  
  // Distribute posts across days 1-7
  for (let i = 0; i < postsPerWeek; i++) {
    const day = (i % 7) + 1;
    
    // Avoid overposting in same subreddit (max 2 per week per subreddit)
    const availableSubreddits = subreddits.filter(s => subredditCounts[s] < 2);
    const subreddit = availableSubreddits.length > 0
      ? availableSubreddits[Math.floor(Math.random() * availableSubreddits.length)]
      : subreddits[Math.floor(Math.random() * subreddits.length)];
    
    subredditCounts[subreddit]++;
    plan.push({ day, subreddit });
  }
  
  return plan;
}

/**
 * Main generation function
 */
export async function generateWeek(req: Request, res: Response) {
  try {
    const {
      company,
      personas,
      subreddits,
      postsPerWeek,
      companyId,
    }: GenerateWeekRequest = req.body;

    if (!companyId) {
      return res.status(400).json({
        error: "companyId is required. Save data before generating.",
      });
    }

    if (personas.length < 2) {
      return res.status(400).json({
        error: "At least 2 personas are required for natural conversations.",
      });
    }

    const existingKeywords = await prisma.keyword.findMany({
      where : { companyId },
      orderBy: {keyword: "asc"},
    });

    let keywordTexts: string[];
    let keywordIds: string[];

    if (existingKeywords.length > 0) {
      console.log(`Reusing ${existingKeywords.length} exisisting keywords`);
      keywordTexts = existingKeywords.map(k => k.keyword);
      keywordIds = existingKeywords.map(k => k.id);
    }
    else{
      console.log("Generating new Keywords...");
      keywordTexts = await generateKeywords(company.name, company.description);
      console.log(`Generated ${keywordTexts.length} new keywords`)
      keywordIds = await ensureKeywordsExist(companyId, keywordTexts);
    }

    const latestWeek = await prisma.weekPlan.findFirst({
      where: { companyId },
      orderBy: {startDate: "desc"},
    });

    let weekStartDate: Date;
    if (latestWeek) {
      weekStartDate = new Date(latestWeek.startDate);
      weekStartDate.setDate(weekStartDate.getDate() + 7);
      console.log(`Generating next week plan strating from ${weekStartDate.toISOString().split("T")[0]}`);
    }
    else{
      weekStartDate = new Date();
      console.log(`Generating first week starting from ${weekStartDate.toISOString().split("T")[0]}`);
    }
    
    // Create week plan
    const week = await prisma.weekPlan.create({
      data: { 
        companyId,
        startDate: weekStartDate,
      },
    });
    const actualWeekStartDate = week.startDate;

    // Plan post distribution
    const postPlan = planPostDistribution(postsPerWeek, subreddits);

    // Generate posts with comments
    const generatedPosts = [];
    const usedKeywords: Set<string> = new Set();

    for (const { day, subreddit } of postPlan) {

      const availableKeywords = keywordTexts.filter(kw => !usedKeywords.has(kw));
      const keywordPool = availableKeywords.length >= 3 ? availableKeywords : keywordTexts;
      // Select 2-3 random keywords for this post
      const selectedKeywords = keywordPool
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.min(3, keywordPool.length));

      selectedKeywords.forEach(kw => usedKeywords.add(kw));
      
      // Rotate through personas for post authors
      const assignedPersona = personas[Math.floor(Math.random()*personas.length)];
      
      console.log(`Generating post for day ${day}, subreddit ${subreddit} with persona ${assignedPersona.username}...`);
      
      const postData = await generatePostWithComments(
        company,
        personas,
        subreddit,
        selectedKeywords,
        day,
        actualWeekStartDate,
        assignedPersona.username
      );

      // Find persona for post author - use assigned persona
      const postPersona = personas.find(p => p.username === assignedPersona.username);
      const personaRecord = postPersona
        ? await prisma.persona.findFirst({
            where: { companyId, username: postPersona.username },
          })
        : null;

      // Find target record
      const targetRecord = await prisma.target.findFirst({
        where: { companyId, subreddit },
      });

      // Create post
      const post = await prisma.post.create({
        data: {
          day,
          title: postData.title,
          body: postData.body,
          subreddit,
          personaName: postData.authorUsername,
          weekId: week.id,
          personaId: personaRecord?.id,
          targetId: targetRecord?.id,
        },
      });

      // Link keywords to post
      const selectedKeywordIds = keywordIds.filter((_, idx) =>
        selectedKeywords.includes(keywordTexts[idx])
      );
      
      for (const keywordId of selectedKeywordIds) {
        await prisma.postKeyword.create({
          data: { postId: post.id, keywordId },
        });
      }

      // Create comments
      const createdComments: Array<{ id: string; index: number }> = [];
      
      for (let i = 0; i < postData.comments.length; i++) {
        const commentData = postData.comments[i];
        const commentPersona = personas.find(p => p.username === commentData.authorUsername);
        const commentPersonaRecord = commentPersona
          ? await prisma.persona.findFirst({
              where: { companyId, username: commentPersona.username },
            })
          : null;

        // Resolve parent comment ID
        let parentCommentId: string | null = null;
        if (commentData.parentCommentIndex !== null) {
          const parentComment = createdComments.find(
            c => c.index === commentData.parentCommentIndex
          );
          parentCommentId = parentComment?.id || null;
        }

        const comment = await prisma.comment.create({
          data: {
            text: commentData.text,
            authorUsername: commentData.authorUsername,
            timestamp: commentData.timestamp,
            postId: post.id,
            parentCommentId,
            personaId: commentPersonaRecord?.id,
          },
        });

        createdComments.push({ id: comment.id, index: i });
      }

      // Format for response
      const comments = await prisma.comment.findMany({
        where: { postId: post.id },
        orderBy: { timestamp: "asc" },
      });

      // Calculate a simple quality score based on content length, comments, and keywords
      const bodyLength = post.body?.length || 0;
      const commentCount = comments.length;
      const keywordCount = selectedKeywords.length;

      // - Base: 40-60 (randomized for variation)
      // - Body quality: 0-25 (based on length, sweet spot around 200-500 chars)
      // - Engagement: 0-15 (comments, more is better but diminishing returns)
      // - Targeting: 0-10 (keywords, 2-3 is optimal)

      const baseScore = 40 + Math.floor(Math.random() * 21)
      
      let bodyScore = 0;
      if (bodyLength < 50) bodyScore = 5;
      else if (bodyLength < 100) bodyScore = 10;
      else if (bodyLength < 200) bodyScore = 15;
      else if (bodyLength < 500) bodyScore = 20;
      else if (bodyLength < 1000) bodyScore = 25;
      else bodyScore = 20;

      const engagementScore = Math.min(15, commentCount*3 + (commentCount > 2 ? 5 : 0));
      const targetingScore = Math.min(10, keywordCount*3);
      const qualityScore = Math.min(100, baseScore + bodyScore + engagementScore + targetingScore);

      generatedPosts.push({
        post_id: post.id,
        subreddit: post.subreddit,
        title: post.title,
        author_username: post.personaName || "",
        timestamp: postData.timestamp.toISOString().replace("T", " ").substring(0, 19),
        target_keywords: selectedKeywords.map((kw) => {
          const keywordIndex = keywordTexts.indexOf(kw);
          return keywordIndex >= 0 ? `K${keywordIndex + 1}` : null;
        }).filter(Boolean),
        quality_score: Math.round(qualityScore), // Add quality score
        body: post.body,
        comments: comments.map(c => ({
          comment_id: c.id,
          parent_comment_id: c.parentCommentId,
          author_username: c.authorUsername,
          timestamp: c.timestamp.toISOString().replace("T", " ").substring(0, 19),
          text: c.text,
        })),
      });
    }

    // Calculate overall score as average of post scores
    const overallScore = generatedPosts.length > 0
      ? Math.round(
          generatedPosts.reduce((sum, p) => sum + (p.quality_score || 0), 0) / generatedPosts.length
        )
      : null;

    const weekData = {
      overall_score: overallScore,
      posts: generatedPosts,
      personas,
      subreddits,
    };

    const qualityEvaluation = evaluateWeekQuality(weekData);

    return res.json({
      weekId: week.id,
      week_start_date: actualWeekStartDate.toISOString().split("T")[0],
      overall_score: overallScore, // Calculate instead of null
      quality_evaluation: qualityEvaluation,
      posts: generatedPosts,
      personas,
      subreddits,
      company,
      keywords: keywordTexts, // Return generated keywords (frontend may not use, but good for debugging)
    });
  } catch (err) {
    console.error("GENERATE ERROR:", err);
    return res.status(500).json({ 
      error: "Failed to generate week",
      details: err instanceof Error ? err.message : String(err)
    });
  }
}

/**
 * Get the latest week calendar for a company
 */
export async function getLatestWeek(req: Request, res: Response) {
  try {
    const { companyId } = req.query;

    if (!companyId || typeof companyId !== "string") {
      return res.status(400).json({ error: "companyId is required" });
    }

    // Get the latest week plan
    const latestWeek = await prisma.weekPlan.findFirst({
      where: { companyId },
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

    if (!latestWeek) {
      return res.json(null); // No week exists yet
    }

    // Format for frontend
    const formattedPosts = latestWeek.posts.map((post) => {
      const keywordTexts = post.postKeywords.map(pk => pk.keyword.keyword);
      const selectedKeywords = keywordTexts;
      
      // Recalculate quality score (or store it in DB)
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
        subreddit: post.subreddit,
        title: post.title,
        author_username: post.personaName || post.persona?.username || "",
        timestamp: new Date(latestWeek.startDate.getTime() + (post.day - 1) * 24 * 60 * 60 * 1000)
          .toISOString().replace("T", " ").substring(0, 19),
        target_keywords: selectedKeywords.map((kw, idx) => {
          const allKeywords = latestWeek.company.keywords.map(k => k.keyword);
          const keywordIndex = allKeywords.indexOf(kw);
          return keywordIndex >= 0 ? `K${keywordIndex + 1}` : `K${idx + 1}`;
        }),
        quality_score: Math.round(qualityScore),
        body: post.body,
        comments: post.comments.map(c => ({
          comment_id: c.id,
          parent_comment_id: c.parentCommentId,
          author_username: c.authorUsername,
          timestamp: c.timestamp.toISOString().replace("T", " ").substring(0, 19),
          text: c.text,
        })),
      };
    });

    const overallScore = formattedPosts.length > 0
      ? Math.round(formattedPosts.reduce((sum, p) => sum + (p.quality_score || 0), 0) / formattedPosts.length)
      : null;

    return res.json({
      weekId: latestWeek.id,
      week_start_date: latestWeek.startDate.toISOString().split("T")[0],
      overall_score: overallScore,
      posts: formattedPosts,
      personas: latestWeek.company.personas,
      subreddits: latestWeek.company.targets.map(t => t.subreddit),
      company: {
        name: latestWeek.company.name,
        description: latestWeek.company.description,
      },
      keywords: latestWeek.company.keywords.map(k => k.keyword),
    });
  } catch (err) {
    console.error("GET LATEST WEEK ERROR:", err);
    return res.status(500).json({ 
      error: "Failed to get latest week",
      details: err instanceof Error ? err.message : String(err)
    });
  }
}

export function evaluateWeekQuality(week: any): {
  score: number;
  issues: string[];
  strengths: string[];
} {
  const issues: string[] = [];
  const strengths: string[] = [];
  let score = week.overall_score || 0;

  // Check persona variety
  const postPersonas = week.posts.map((p: any) => p.author_username);
  const uniquePersonas = new Set(postPersonas);
  if (uniquePersonas.size < postPersonas.length * 0.6) {
    issues.push("Low persona variety - same personas used too frequently");
    score -= 10;
  } else {
    strengths.push("Good persona variety");
  }

  // Check subreddit distribution
  const subredditCounts: Record<string, number> = {};
  week.posts.forEach((p: any) => {
    subredditCounts[p.subreddit] = (subredditCounts[p.subreddit] || 0) + 1;
  });
  const maxPostsPerSub = Math.max(...Object.values(subredditCounts));
  if (maxPostsPerSub > 2) {
    issues.push(`Overposting detected: ${maxPostsPerSub} posts in one subreddit`);
    score -= 15;
  }

  // Check keyword variety
  const allKeywords = week.posts.flatMap((p: any) => p.target_keywords || []);
  const uniqueKeywords = new Set(allKeywords);
  if (uniqueKeywords.size < allKeywords.length * 0.5) {
    issues.push("Low keyword variety - too much repetition");
    score -= 10;
  } else {
    strengths.push("Good keyword distribution");
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    issues,
    strengths
  };
}