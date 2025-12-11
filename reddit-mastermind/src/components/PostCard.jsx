import React from "react";

export default function PostCard({ post, onEdit }) {
  return (
    <div 
      onClick={() => onEdit(post)}
      className="bg-white rounded-xl shadow-md hover:shadow-xl p-5 mb-4 border border-slate-200/50 transition-all duration-300 hover:border-orange-300 animate-fadeIn group cursor-pointer"
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 text-xs font-semibold bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full">
              {post.subreddit}
            </span>
            <span className="text-sm text-slate-500">•</span>
            <span className="text-sm text-blue-600 font-medium">{post.author_username}</span>
          </div>
          <h3 className="text-lg font-bold mt-1 text-slate-800">
            {post.title}
          </h3>
          <div className="text-sm mt-3 text-slate-600 whitespace-pre-wrap leading-relaxed line-clamp-3">
            {post.body}
          </div>
        </div>
        <div className="text-right ml-4">
          <div className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg mb-2">
            <span className="text-xs text-slate-500">Score:</span>
            <span className="font-bold text-green-600">{post.quality_score || 0}</span>
          </div>
          <div className="text-xs text-slate-400">{post.timestamp}</div>
        </div>
      </div>

      {post.comments && post.comments.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
            {post.comments.length} {post.comments.length === 1 ? 'comment' : 'comments'}
          </div>
        </div>
      )}
    </div>
  );
}