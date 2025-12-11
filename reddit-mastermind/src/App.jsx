import React, { useState } from "react";
import MainForm from "./components/MainForm";
import CalendarTable from "./components/CalendarTable";
import EditorModal from "./components/EditorModal";
import PostViewModal from "./components/PostViewModal";
import { saveAllData, generateWeek, getLatestWeek, updatePostWithComments, getWeeksByCompany } from "./lib/apiClient";

function normalizeWeek(raw) {
  if (!raw) return null;

  let start = raw.startDate ?? raw.week_start_date ?? null;

  let startDate = null;

  if (start) {
    if (start instanceof Date) {
      startDate = start;
    } else if (typeof start === "string") {
      startDate = new Date(start);

      if (isNaN(startDate.getTime())) {
        console.log("invalid date: ", start);
        startDate = null;
      }
    }
  }

  return {
    id: raw.id ?? raw.week_id ?? raw.weekId ?? crypto.randomUUID(),
    startDate: startDate,
    posts: Array.isArray(raw.posts) ? raw.posts : [],
    personas: Array.isArray(raw.personas) ? raw.personas : [],
    overall_score: raw.overall_score ?? null,
    quality_evaluation: raw.quality_evaluation ?? null,
  };
}

function normalizeWeeks(list) {
  if (!Array.isArray(list)) return [];
  return (
    list
      .map((w) => normalizeWeek(w))
      .filter((w) => w !== null)
      .sort((a, b) => {
        if (!a.startDate && !b.startDate) return 0;
        if (!a.startDate) return 1;
        if (!b.startDate) return -1;
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      })
  );
}

export default function App() {
  const [weeks, setWeeks] = useState([]);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [companyId, setCompanyId] = useState(null);
  const [viewingPost, setViewingPost] = useState(null);

  const personaUsernames =
    weeks?.flatMap(w => w.personas?.map(p => p.username) || []) || [];

  const latestWeek = weeks.length > 0 ? weeks[0] : null;

  async function handleFormAction(payload, mode) {
    try {
      if (mode === "save") {
        setLoading(true);
        const saved = await saveAllData(payload); 
        setCompanyId(saved.companyId);

        if (saved.company) {
          setCompany(saved.company);
        }
        try{
          const weekHistory = await getWeeksByCompany(saved.companyId);
          if (Array.isArray(weekHistory)) {
            const normalized = normalizeWeeks(weekHistory);
            setWeeks(normalized);
            console.log("Loaded existing weeks:", weekHistory);
          } else {
            console.log("No existing weeks found for this company");
          }
        }
        catch(err){
          console.log("Error loading latest weeks:", err);
          if (err.message && !err.message.includes("404")) {
            console.error("Failed to load latest weeks:", err.message);
          }
        }
        setLoading(false);
        return saved;
      }

      if (mode === "generate") {
        setLoading(true);

        if (!companyId) {
          setLoading(false);
          throw new Error("No saved companyId — please save your data before generating.");
        }

        const genCompany = company ?? payload.company;
        const genPersonas = payload.personas ?? 
                           genCompany?.personas ?? 
                           latestWeek?.personas ?? 
                           [];
        const genSubreddits = payload.subreddits ??
                           genCompany?.targets?.map((t) => t.subreddit) ?? 
                           latestWeek?.subreddits ??
                           [];

        // validate
        if (genPersonas.length < 2) {
          setLoading(false);
          throw new Error("At least 2 personas required.");
        }
        if (genSubreddits.length === 0) {
          setLoading(false);
          throw new Error("At least one subreddit target required.");
        }

        const result = await generateWeek({
          company: genCompany,
          personas: genPersonas,
          subreddits: genSubreddits,
          keywords: [],
          postsPerWeek: payload.postsPerWeek ?? 3,
          companyId,
        });

        try {
          const weekHistory = await getWeeksByCompany(companyId);
          if (Array.isArray(weekHistory)){
            const normalized = normalizeWeeks(weekHistory);
            setWeeks(normalized);
            console.log("Loaded weeks after latest generation: ", normalized);
          }
        } catch (err) {
          console.error("Failed to reload weeks after latest generation: ", err);
          const normalized = normalizeWeek(result);
          setWeeks((prev) => normalizeWeeks([normalized, ...prev]));
        }
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

  async function handleSaveEditedPost(updated) {
    try {
      await updatePostWithComments({
        post_id: updated.post_id ?? updated.id,
        title: updated.title,
        body: updated.body,
        subreddit: updated.subreddit,
        comments: updated.comments,
      });

      const updatedWeeks = weeks.map((week) => ({
        ...week,
        posts: week.posts.map((p) =>
          (p.post_id ?? p.id) === (updated.post_id ?? updated.id)
            ? updated
            : p
        ),
      }));

      setWeeks(updatedWeeks);
      setEditingPost(null);
      setViewingPost(null);
    } catch (err) {
      console.error("Failed to save post:", err);
      alert("Failed to save post");
    }
  }

  function handleReset() {
    if (window.confirm("Are you sure you want to reste ? This will onnly clear the data on the screen")) {
      setWeeks([]);
      setCompany(null);
      setCompanyId(null);
      setEditingPost(null);
      setViewingPost(null);
      window.location.reload();
    }
  }

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
        <div className="md:col-span-1">
          <MainForm onSubmit={handleFormAction} onReset={handleReset}/>
        </div>

        <div className="md:col-span-2 bg-white rounded-xl shadow-lg p-6 border border-slate-200/50 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 bg-clip-text text-transparent">
              Reddit Mastermind
            </h1>

            <div className="flex gap-2">
              <button 
              onClick={handleReset} 
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-gray-400 to-gray-500 text-white hover:from-gray-500 hover:to-gray-600 cursor-pointer transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 text-sm"
              title="Reset Local State"
              >
                Reset
              </button>
              <button
                disabled={!latestWeek || loading}
                onClick={() => {
                  if (!latestWeek) return;
                  handleFormAction(
                    {
                      company: latestWeek.company,
                      personas: latestWeek.personas,
                      subreddits: latestWeek.subreddits ?? latestWeek.posts?.map((p) => p.subreddit) ?? [],
                      postsPerWeek: latestWeek.posts?.length ?? 3,
                    },
                    "generate"
                  );
                }}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
              >
                Generate next week
              </button>
            </div>
            
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
            <>
              <CalendarTable weekData={weeks} onEdit={(p) => setViewingPost(p)} />
            </>
          )}
        </div>
      </div>

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