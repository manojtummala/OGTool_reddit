// src/components/CalendarTable.jsx
import React from "react";
import PostCard from "./PostCard";

export default function CalendarTable({ weekData, onEdit }) {
  if (!weekData) return <div className="p-6">No calendar generated yet.</div>;

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Week starting {weekData.week_start_date}</h2>
        <div className="text-sm text-slate-600">Overall score: {weekData.overall_score}</div>
      </div>

      <div>
        {weekData.posts.map((post) => (
          <PostCard key={post.post_id} post={post} onEdit={onEdit} />
        ))}
      </div>
    </div>
  );
}