// src/App.jsx
import React, { useState } from "react";
import MainForm from "./components/MainForm";
import CalendarTable from "./components/CalendarTable";
import EditorModal from "./components/EditorModal";
import PostViewModal from "./components/PostViewModal";
import { saveAllData, generateWeek } from "./lib/apiClient";

export default function App() {
  const [week, setWeek] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [companyId, setCompanyId] = useState(null);
  const [viewingPost, setViewingPost] = useState(null);

  async function handleFormAction(payload, mode) {
    try {
      if (mode === "save") {
        setLoading(true);
        const saved = await saveAllData(payload); 
        setCompanyId(saved.companyId);
        setLoading(false);
        return saved;
      }

      if (mode === "generate") {
        setLoading(true);

        const result = await generateWeek({
          company: payload.company,
          personas: payload.personas,
          subreddits: payload.subreddits,
          keywords: [], 
          postsPerWeek: payload.postsPerWeek,
          companyId,
        });

        setWeek(result);
        setLoading(false);
        return result;
      }
    } catch (err) {
      console.error(err);
      alert("Operation failed (check console)");
      setLoading(false);
      throw err;
    }
  }

  function handleSaveEditedPost(updated) {
    const updatedWeek = {
      ...week,
      posts: week.posts.map((p) =>
        p.post_id === updated.post_id ? updated : p
      ),
    };
    setWeek(updatedWeek);
    setEditingPost(null);
    setViewingPost(null);
  }
  const personaUsernames = week?.personas?.map(p => p.username) || [];

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
        <div className="md:col-span-1">
          <MainForm onSubmit={handleFormAction} />
        </div>

        <div className="md:col-span-2 bg-white rounded-xl shadow-lg p-6 border border-slate-200/50 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 bg-clip-text text-transparent">
              Reddit Mastermind
            </h1>

            <button
              disabled={!week || loading}
              onClick={() => {
                if (!week) return;
                handleFormAction(
                  {
                    company: week.company,
                    personas: week.personas,
                    subreddits: week.posts.map((p) => p.subreddit),
                    postsPerWeek: week.posts.length,
                  },
                  "generate"
                );
              }}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
            >
              Generate next week
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center p-12">
              <div className="relative w-16 h-16 mb-4">
                <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <p className="text-slate-600 font-medium animate-pulse-slow">Processing…</p>
            </div>
          ) : (
            <CalendarTable weekData={week} onEdit={(p) => setViewingPost(p)} />
          )}
        </div>
      </div>

      {/* View modal (Reddit-like) */}
      {viewingPost && !editingPost && (
        <PostViewModal
          post={viewingPost}
          onClose={() => setViewingPost(null)}
          onEdit={(post) => {
            setViewingPost(null);
            setEditingPost(post);
          }}
          personaUsernames={personaUsernames}
        />
      )}

      {/* Edit modal (form-based) */}
      {editingPost && (
        <EditorModal
          post={editingPost}
          onClose={() => {
            setEditingPost(null);
            setViewingPost(null);
          }}
          onSave={handleSaveEditedPost}
        />
      )}
    </div>
  );
}