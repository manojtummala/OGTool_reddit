import React, { useState, useEffect } from "react";
import { XMarkIcon, ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/outline";

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

  function addComment() {
    const newComment = {
      comment_id: `temp-${Date.now()}`,
      author_username: draft.author_username || "u/user",
      timestamp: "Just now",
      text: "",
    };
    setDraft((d) => ({ ...d, comments: [...d.comments, newComment] }));
  }

  function deleteComment(idx) {
    setDraft((d) => ({ ...d, comments: d.comments.filter((_, i) => i !== idx) }));
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 overflow-y-auto p-4 animate-fadeIn backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl max-h-[90vh] overflow-auto animate-slideIn border border-slate-200">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
          <h3 className="text-xl font-semibold">Edit Post</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full cursor-pointer transition-colors"
            aria-label="Close"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex gap-4 mb-6">
            <div className="flex flex-col items-center gap-1 pt-2">
              <button className="p-1 hover:bg-slate-100 rounded cursor-pointer">
                <ArrowUpIcon className="w-5 h-5 text-slate-400 hover:text-orange-500" />
              </button>
              <span className="text-xs font-semibold text-slate-600">{draft.quality_score || 0}</span>
              <button className="p-1 hover:bg-slate-100 rounded cursor-pointer">
                <ArrowDownIcon className="w-5 h-5 text-slate-400 hover:text-blue-500" />
              </button>
            </div>

            <div className="flex-1">
              <div className="mb-2">
                <span className="text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">{draft.subreddit}</span>
                  {" • "}
                  Posted by <span className="text-blue-600">{draft.author_username}</span>
                  {" • "}
                  <span className="text-slate-400">{draft.timestamp}</span>
                </span>
              </div>

              <input
                value={draft.title}
                onChange={(e) => updateField("title", e.target.value)}
                className="w-full text-xl font-semibold mb-3 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Post title..."
              />

              <textarea
                value={draft.body}
                onChange={(e) => updateField("body", e.target.value)}
                className="w-full p-3 border rounded-lg mb-4 min-h-[150px] focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                placeholder="Post content..."
              />

              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => updateField("subreddit", prompt("Enter subreddit:", draft.subreddit) || draft.subreddit)}
                  className="px-3 py-1 text-sm bg-slate-100 hover:bg-slate-200 rounded cursor-pointer"
                >
                  Change Subreddit
                </button>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold">
                Comments ({draft.comments?.length || 0})
              </h4>
              <button
                onClick={addComment}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer text-sm"
              >
                + Add Comment
              </button>
            </div>

            <div className="space-y-4">
              {draft.comments?.map((comment, idx) => (
                <div key={comment.comment_id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                      <span className="text-xs text-slate-500">+</span>
                    </div>
                    <div className="w-0.5 h-full bg-slate-200 mt-1"></div>
                  </div>

                  <div className="flex-1 bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-xs text-slate-500">
                        <span className="font-semibold text-blue-600">{comment.author_username}</span>
                        {" • "}
                        <span>{comment.timestamp}</span>
                      </div>
                      <button
                        onClick={() => deleteComment(idx)}
                        className="text-red-500 hover:text-red-700 text-xs cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                    <textarea
                      value={comment.text}
                      onChange={(e) => updateComment(idx, "text", e.target.value)}
                      className="w-full p-2 border rounded-lg min-h-[80px] focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y bg-white"
                      placeholder="Comment text..."
                    />
                  </div>
                </div>
              ))}

              {(!draft.comments || draft.comments.length === 0) && (
                <div className="text-center py-8 text-slate-400">
                  <p>No comments yet. Click "Add Comment" to add one.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-slate-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(draft)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}