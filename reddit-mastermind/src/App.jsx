// src/App.jsx
import React, { useState } from "react";
// import InputForm from "./components/InputForm";
import MainForm from "./components/MainForm";
import CalendarTable from "./components/CalendarTable";
import EditorModal from "./components/EditorModal";
import { generateWeek } from "./lib/apiClient";

export default function App() {
  const [week, setWeek] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editingPost, setEditingPost] = useState(null);

  async function handleGenerate(payload) {
    setLoading(true);
    try {
      const res = await generateWeek({
        company: payload.company,
        personas: payload.personas,
        subreddits: payload.subreddits,
        keywords: [], // expand if needed
        postsPerWeek: payload.postsPerWeek,
      });
      setWeek(res);
    } catch (err) {
      console.error(err);
      alert("Generation failed (check console)");
    } finally {
      setLoading(false);
    }
  }

  function handleSaveEditedPost(updated) {
    const updatedWeek = {
      ...week,
      posts: week.posts.map((p) => (p.post_id === updated.post_id ? updated : p)),
    };
    setWeek(updatedWeek);
    setEditingPost(null);
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <MainForm onSubmit={handleGenerate} />
        </div>

        <div className="md:col-span-2 bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Reddit Mastermind — Planner</h1>
            <div>
              <button
                disabled={!week}
                onClick={() => {
                  // regenerate next week: for now reuse generateWeek with same inputs
                  if (!week) return;
                  handleGenerate({
                    company: { name: "Slideforge" },
                    personas: [],
                    subreddits: week.posts.map((p) => p.subreddit),
                    postsPerWeek: week.posts.length,
                  });
                }}
                className="px-3 py-1 rounded bg-slate-100"
              >
                Generate next week
              </button>
            </div>
          </div>

          {loading ? (
            <div className="p-6">Generating…</div>
          ) : (
            <CalendarTable weekData={week} onEdit={(p) => setEditingPost(p)} />
          )}
        </div>
      </div>

      {editingPost && (
        <EditorModal
          post={editingPost}
          onClose={() => setEditingPost(null)}
          onSave={handleSaveEditedPost}
        />
      )}
    </div>
  );
}