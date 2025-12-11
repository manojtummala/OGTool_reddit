import React from "react";
import PostCard from "./PostCard";

export default function CalendarTable({ weekData, onEdit }) {
  if (!weekData || weekData.length === 0) {
    return (
      <div className="p-12 text-center animate-fadeIn">
        <div className="inline-block p-4 bg-blue-100 rounded-full mb-4">
          <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <p className="text-slate-500 text-lg">No calendar generated yet.</p>
        <p className="text-slate-400 text-sm mt-2">Save your data and generate a calendar to get started!</p>
      </div>
    );
  }

  return (
    <div className="p-2 space-y-12 animate-fadeIn">
      {weekData.map((week, wIndex) => (
        <div
          key={week.id || week.week_id || wIndex}
          className="border-l-4 border-blue-400 pl-6 relative"
        >
          <div className="absolute -left-[9px] top-2 w-4 h-4 bg-blue-500 rounded-full shadow-md"></div>

          <div className="mb-6 flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Week starting{" "}
                <span className="text-blue-600">
                  {week.startDate ? new Date(week.startDate).toLocaleDateString() : "Unknown date"}
                </span>
              </h2>
            </div>

            <div className="flex gap-3">
              <div className="px-4 py-2 bg-white rounded-lg shadow-sm border border-blue-200">
                <span className="text-xs text-slate-500">Overall score:</span>
                <span className="ml-2 text-lg font-bold text-green-600">
                  {week.overall_score || "—"}
                </span>
              </div>
            </div>
          </div>

          {week.quality_evaluation && (
            <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
              <h3 className="text-sm font-bold text-slate-700 mb-3">Quality Assessment</h3>
              
              {week.quality_evaluation.strengths && week.quality_evaluation.strengths.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-semibold text-green-700 mb-1">✓ Strengths:</p>
                  <ul className="list-disc list-inside text-xs text-green-600 space-y-1">
                    {week.quality_evaluation.strengths.map((strength, idx) => (
                      <li key={idx}>{strength}</li>
                    ))}
                  </ul>
                </div>
              )}

              {week.quality_evaluation.issues && week.quality_evaluation.issues.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-orange-700 mb-1">⚠ Issues:</p>
                  <ul className="list-disc list-inside text-xs text-orange-600 space-y-1">
                    {week.quality_evaluation.issues.map((issue, idx) => (
                      <li key={idx}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}

              {week.quality_evaluation.score !== week.overall_score && (
                <div className="mt-3 pt-3 border-t border-purple-200">
                  <p className="text-xs text-slate-600">
                    <span className="font-semibold">Adjusted Quality Score:</span>{" "}
                    <span className="font-bold text-purple-600">{week.quality_evaluation.score}/100</span>
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="space-y-4">
            {week.posts.map((post, idx) => (
              <div
                key={post.post_id || post.id || idx}
                className="animate-fadeIn"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <PostCard post={post} onEdit={onEdit} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}