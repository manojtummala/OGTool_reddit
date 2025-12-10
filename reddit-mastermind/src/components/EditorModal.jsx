// src/components/EditorModal.jsx
import React, { useState, useEffect } from "react";

export default function EditorModal({ post, onClose, onSave }) {
  const [draft, setDraft] = useState(post);

  useEffect(() => setDraft(post), [post]);

  if (!post) return null;

  function updateField(field, val) {
    setDraft((d) => ({ ...d, [field]: val }));
  }

  function updateComment(idx, key, val) {
    const comments = draft.comments.map((c, i) => (i === idx ? { ...c, [key]: val } : c));
    setDraft((d) => ({ ...d, comments }));
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-40">
      <div className="bg-white w-11/12 md:w-3/4 p-6 rounded-lg shadow-lg max-h-[90vh] overflow-auto">
        <h3 className="text-lg font-semibold mb-4">Edit Post</h3>

        <label className="block text-sm">Title</label>
        <input value={draft.title} onChange={(e)=>updateField("title", e.target.value)} className="w-full p-2 border rounded mb-3" />

        <label className="block text-sm">Body</label>
        <textarea value={draft.body} onChange={(e)=>updateField("body", e.target.value)} className="w-full p-2 border rounded h-28 mb-3" />

        <label className="block text-sm">Subreddit</label>
        <input value={draft.subreddit} onChange={(e)=>updateField("subreddit", e.target.value)} className="w-64 p-2 border rounded mb-3" />

        <div className="mb-4">
          <div className="text-sm font-medium mb-2">Comments</div>
          <div className="space-y-2">
            {draft.comments.map((c, idx) => (
              <div key={c.comment_id} className="p-2 border rounded">
                <div className="text-xs text-slate-500 mb-1">{c.author_username}</div>
                <textarea value={c.text} onChange={(e)=>updateComment(idx, "text", e.target.value)} className="w-full p-2 border rounded h-20" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
          <button onClick={()=>onSave(draft)} className="px-4 py-2 bg-indigo-600 text-white rounded">Save</button>
        </div>
      </div>
    </div>
  );
}