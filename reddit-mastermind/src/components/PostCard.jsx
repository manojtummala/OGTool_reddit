// src/components/PostCard.jsx
import React from "react";

export default function PostCard({ post, onEdit }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <div className="flex justify-between items-start">
        <div>
          <div className="text-sm text-slate-500">{post.subreddit} • {post.author_username}</div>
          <h3 className="text-lg font-semibold mt-1">{post.title}</h3>
          <div className="text-sm mt-2 whitespace-pre-wrap">{post.body}</div>
        </div>
        <div className="text-right">
          <div className="text-sm">Score: <span className="font-medium">{post.quality_score}</span></div>
          <div className="text-sm mt-2">{post.timestamp}</div>
          <button onClick={()=>onEdit(post)} className="mt-3 px-3 py-1 bg-slate-100 rounded">Edit</button>
        </div>
      </div>

      <div className="mt-4">
        <div className="text-sm font-medium mb-2">Comments</div>
        <div className="space-y-2">
          {post.comments.map((c) => (
            <div key={c.comment_id} className="p-2 border rounded bg-slate-50">
              <div className="text-xs text-slate-500">{c.author_username} • {c.timestamp}</div>
              <div className="text-sm">{c.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}