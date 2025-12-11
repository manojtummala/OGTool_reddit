// src/components/CalendarTable.jsx
import React from "react";
import PostCard from "./PostCard";

export default function CalendarTable({ weekData, onEdit }) {
  if (!weekData) {
    return (
      <div className="p-12 text-center animate-fadeIn">
        <div className="inline-block p-4 bg-blue-100 rounded-full mb-4">
          <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-slate-500 text-lg">No calendar generated yet.</p>
        <p className="text-slate-400 text-sm mt-2">Save your data and generate a calendar to get started!</p>
      </div>
    );
  }

  return (
    <div className="p-2 animate-fadeIn">
      <div className="mb-6 flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            Week starting <span className="text-blue-600">{weekData.week_start_date}</span>
          </h2>
        </div>
        <div className="px-4 py-2 bg-white rounded-lg shadow-sm border border-blue-200">
          <span className="text-xs text-slate-500">Overall score:</span>
          <span className="ml-2 text-lg font-bold text-green-600">{weekData.overall_score || "—"}</span>
        </div>
      </div>

      <div className="space-y-4">
        {weekData.posts.map((post, idx) => (
          <div 
            key={post.post_id}
            className="animate-fadeIn"
            style={{ animationDelay: `${idx * 0.1}s` }}
          >
            <PostCard post={post} onEdit={onEdit} />
          </div>
        ))}
      </div>
    </div>
  );
}