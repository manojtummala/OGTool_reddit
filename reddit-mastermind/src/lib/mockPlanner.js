// src/lib/mockPlanner.js
// Returns a single week calendar with 3 posts (based on your sample)
export function generateMockWeek({ company, personas, subreddits, keywords, postsPerWeek }) {
  // For simplicity we return the sample data you provided, slightly adapted
  const weekStart = "2025-12-08";

  const posts = [
    {
      post_id: "P-20251208-01",
      subreddit: "r/PowerPoint",
      title: "Best AI Presentation Maker that keeps editable slides?",
      author_username: "riley_ops",
      timestamp: "2025-12-08 14:12:00",
      target_keywords: ["K1", "K14", "K4"],
      quality_score: 88,
      body:
        "Hey folks — I've been stuck spending evenings cleaning up decks. Looking for an AI tool that actually outputs editable, professional slides (not just an image). Prefer something that preserves layout and lets me tweak colors/fonts afterward. Anyone using something that reliably saves time without making the slides look 'auto-generated'?",
      comments: [
        {
          comment_id: "C-20251208-01-1",
          parent_comment_id: null,
          author_username: "jordan_consults",
          timestamp: "2025-12-08 14:33:00",
          text:
            "I’ve tried a few — many generate images or awkward layouts. Slideforge has been the only one I used that gives a structured layout you can edit. I still tweak, but it saves the messy baseline.",
        },
        {
          comment_id: "C-20251208-01-2",
          parent_comment_id: "C-20251208-01-1",
          author_username: "emily_econ",
          timestamp: "2025-12-08 14:49:00",
          text: "+1 Slideforge here. Pasted our outline and it produced slides I could actually present with minimal fixes.",
        },
      ],
    },
    {
      post_id: "P-20251210-02",
      subreddit: "r/Canva",
      title: "Canva vs AI slide tools — any hybrid workflows?",
      author_username: "alex_sells",
      timestamp: "2025-12-10 09:03:00",
      target_keywords: ["K7", "K10", "K14"],
      quality_score: 84,
      body:
        "We use Canva for polishing decks, but I'm curious if people combine Canva with AI slide makers. Do you generate a structured deck with something AI-first and then import/beautify in Canva? Any hiccups with layouts or fonts when moving between tools?",
      comments: [
        {
          comment_id: "C-20251210-02-1",
          parent_comment_id: null,
          author_username: "jordan_consults",
          timestamp: "2025-12-10 09:25:00",
          text:
            "Yep — my workflow: generate a clean structure in an AI slide tool (gives the content and layout), export as PPTX, then open in Canva or PowerPoint to apply brand assets. Works well; just watch fonts.",
        },
        {
          comment_id: "C-20251210-02-2",
          parent_comment_id: "C-20251210-02-1",
          author_username: "priya_pm",
          timestamp: "2025-12-10 10:02:00",
          text: "Same — exporting helps. A tip: lock the layout or use images rather than live components if you need exact Canva visuals.",
        },
      ],
    },
    {
      post_id: "P-20251211-03",
      subreddit: "r/entrepreneur",
      title: "How do you turn a messy doc into a pitch deck quickly?",
      author_username: "jordan_consults",
      timestamp: "2025-12-11 18:44:00",
      target_keywords: ["K3", "K5", "K12"],
      quality_score: 91,
      body:
        "Founders — what’s your fastest process for converting a chaotic doc into a presentable investor deck? I usually map headings to slides, but that still takes hours. Curious if anyone uses tools to speed the structure+design step and what prompts/outlines they use.",
      comments: [
        {
          comment_id: "C-20251211-03-1",
          parent_comment_id: null,
          author_username: "emily_econ",
          timestamp: "2025-12-11 19:01:00",
          text:
            "I paste my doc into an AI slide generator and ask for a 10-slide investor outline. Then I reorder and cut. Saves me a lot of time vs starting from blank.",
        },
        {
          comment_id: "C-20251211-03-2",
          parent_comment_id: "C-20251211-03-1",
          author_username: "alex_sells",
          timestamp: "2025-12-11 19:14:00",
          text: "Add: make sure the AI keeps bullets short. I have to edit to remove verbose sentences — aim for one sentence per bullet.",
        },
      ],
    },
  ];

  return {
    week_start_date: weekStart,
    posts: posts.slice(0, postsPerWeek || 3),
    overall_score: Math.round(posts.reduce((s, p) => s + p.quality_score, 0) / posts.length),
  };
}