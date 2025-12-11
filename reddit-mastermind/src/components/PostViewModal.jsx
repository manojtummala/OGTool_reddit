import React, { useState } from "react";
import { XMarkIcon, ArrowUpIcon, ArrowDownIcon, PencilIcon } from "@heroicons/react/24/outline";

export default function PostViewModal({ post, onClose, onEdit, personaUsernames = [] }) {
  if (!post) return null;

  const isPersonaPost = personaUsernames.some(p => p === post.author_username);
  
  const isPersonaComment = (comment) => {
    return personaUsernames.some(p => p === comment.author_username);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 overflow-y-auto p-4 animate-fadeIn backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl max-h-[90vh] overflow-auto animate-slideIn border border-slate-200">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
          <h3 className="text-xl font-semibold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
            Post Thread
          </h3>
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
              <button className="p-1 hover:bg-orange-100 rounded cursor-pointer transition-colors">
                <ArrowUpIcon className="w-5 h-5 text-slate-400 hover:text-orange-500" />
              </button>
              <span className="text-xs font-semibold text-slate-600">{post.quality_score || 0}</span>
              <button className="p-1 hover:bg-blue-100 rounded cursor-pointer transition-colors">
                <ArrowDownIcon className="w-5 h-5 text-slate-400 hover:text-blue-500" />
              </button>
            </div>

            <div className="flex-1">
              <div className="mb-2">
                <span className="text-xs text-slate-500">
                  <span className="font-semibold text-orange-600">{post.subreddit}</span>
                  {" • "}
                  Posted by <span className="text-blue-600 font-medium">{post.author_username}</span>
                  {" • "}
                  <span className="text-slate-400">{post.timestamp}</span>
                </span>
              </div>

              <h2 className="text-2xl font-bold mb-3 text-slate-800">{post.title}</h2>

              <div className="text-base text-slate-700 whitespace-pre-wrap leading-relaxed mb-4">
                {post.body}
              </div>

\              {isPersonaPost && (
                <button
                  onClick={() => {
                    onClose();
                    onEdit(post);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 cursor-pointer transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 text-sm font-medium"
                >
                  <PencilIcon className="w-4 h-4" />
                  Edit Post
                </button>
              )}
            </div>
          </div>

          {post.comments && post.comments.length > 0 && (
            <div className="border-t pt-6">
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                Comments ({post.comments.length})
              </h4>

              <div className="space-y-4">
                {post.comments.map((comment, idx) => {
                  const isPersona = isPersonaComment(comment);
                  return (
                    <div key={comment.comment_id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                          <ArrowUpIcon className="w-4 h-4 text-slate-400" />
                        </div>
                        <div className="w-0.5 h-full bg-slate-200 mt-1"></div>
                      </div>

                      <div className="flex-1 bg-slate-50 rounded-lg p-4 border border-slate-200 hover:bg-slate-100 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div className="text-xs text-slate-500">
                            <span className="font-semibold text-blue-600">{comment.author_username}</span>
                            {" • "}
                            <span>{comment.timestamp}</span>
                          </div>
                          {isPersona && (
                            <button
                              onClick={() => {
                                onClose();
                                onEdit({ ...post, editingComment: comment });
                              }}
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 cursor-pointer transition-colors"
                            >
                              <PencilIcon className="w-3 h-3" />
                              Edit
                            </button>
                          )}
                        </div>
                        <div className="text-sm text-slate-700 leading-relaxed">{comment.text}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}