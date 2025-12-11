import React, { useState } from "react";
import SectionCard from "./SectionCard";
import { UserGroupIcon, BuildingOffice2Icon, GlobeAltIcon, XMarkIcon } from "@heroicons/react/24/outline";
import PersonaModal from "./PersonaModal";
import { fetchCompanyData } from "../lib/apiClient";

export default function MainForm({ onSubmit, onReset }) {
  const [companyName, setCompanyName] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [companyId, setCompanyId] = useState(null);

  const [personas, setPersonas] = useState([]);
  const [editingPersona, setEditingPersona] = useState(null);

  const [newSubreddit, setNewSubreddit] = useState("");
  const [subreddits, setSubreddits] = useState([]);
  const [postsPerWeek, setPostsPerWeek] = useState(3);

  const [isSaved, setIsSaved] = useState(false);

  async function getCompanyInfo(name) {
    try {
      const data = await fetchCompanyData(name);
      if (!data) return;
      setCompanyId(data.id);
      setCompanyName(data.name);
      setCompanyDescription(data.description ?? "");
      setPersonas(data.personas ?? []);
      
      const subredditList = (data.targets ?? []).map(t => t.subreddit);
      setSubreddits(subredditList);
    } catch (err) {
      console.error("Failed to fetch company data:", err);
    }
  }
  function handleAddSubreddit() {
    if (!newSubreddit.trim()) return;
    const formatted = newSubreddit.startsWith("r/") ? newSubreddit : `r/${newSubreddit}`;
    if (!subreddits.includes(formatted)) {
      setSubreddits([...subreddits, formatted]);
      setIsSaved(false);
    }
    setNewSubreddit("");
  }

  function handleSavePersona(persona) {
    const existingIndex = personas.findIndex((p) => p.id === persona.id);
    if (existingIndex >= 0) {
      // Update existing persona
      setPersonas(personas.map((p) => (p.id === persona.id ? persona : p)));
    } else {
      // Add new persona
      setPersonas([...personas, persona]);
    }
    setEditingPersona(null);
    setIsSaved(false);
  }

  async function handleSubmit() {
    if(!companyName) return alert("Company Name is required");
    if(!companyDescription) return alert("Company Description is required");
    
    const payload = {
      company: {
        name: companyName,
        description: companyDescription,
      },
      personas,
      subreddits,
      postsPerWeek,
      companyId,
    };

    if (!isSaved) {
      // SAVE MODE
      const resp = await onSubmit(payload, "save");

      if (resp?.companyId) {
        setCompanyId(resp.companyId);
      }

      // Fetch stored record to populate UI with merged data
      if (companyName.trim()) {
        await getCompanyInfo(companyName.trim());
      }

      setIsSaved(true);
    } else {
      // GENERATE MODE
      await onSubmit(payload, "generate");
    }
  }

  function handleReset() {
    setCompanyName("");
    setCompanyDescription("");
    setCompanyId(null);
    setPersonas([]);
    setSubreddits([]);
    setPostsPerWeek(3);
    setIsSaved(false);
    if (onReset) onReset();
  }

  return (
    <div className="bg-white border border-slate-200 shadow rounded-2xl p-6 flex flex-col gap-6">

      {/* COMPANY SECTION */}
      <SectionCard icon={BuildingOffice2Icon} title="Company Profile" iconColor="text-blue-600">
        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Company Name"
            value={companyName}
            onChange={async (e) => {
              setCompanyName(e.target.value);
              setIsSaved(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && companyName.trim()) {
                getCompanyInfo(companyName.trim());
              }
            }}
            className="border rounded-lg p-2 w-full"
          />

          <textarea
            placeholder="Company Description"
            value={companyDescription}
            onChange={(e) => {
              setCompanyDescription(e.target.value);
              setIsSaved(false);
            }}
            className="border rounded-lg p-2 w-full h-24"
          />
        </div>
      </SectionCard>

      {/* PERSONAS SECTION */}
      <SectionCard icon={UserGroupIcon} title="Persona Net" iconColor="text-purple-600">
        <div className="flex flex-col gap-4">

          {personas.length === 0 && (
            <p className="text-sm text-slate-500">No personas added yet.</p>
          )}

          {/* persona cards */}
          <div className="flex flex-col gap-3">
            {personas.map((p) => (
              <div
                key={p.id}
                onClick={() => setEditingPersona(p)}
                className="p-4 border rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer shadow-sm flex justify-between items-start"
              >
                <div>
                  <p className="text-sm text-blue-600 font-medium">{p.username}</p>
                  {p.description && (
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                      {p.description}
                    </p>
                  )}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingPersona(p);
                  }}
                  className="text-blue-600 text-sm underline cursor-pointer"
                >
                </button>
              </div>
            ))}
          </div>

          <button
            className="px-3 py-2 rounded-lg bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 text-sm cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95 font-medium"
            onClick={() => setEditingPersona({})}
          >
            + Add Persona
          </button>
        </div>
      </SectionCard>

      {/* TARGETS SECTION */}
      <SectionCard icon={GlobeAltIcon} title="Targets" iconColor="text-orange-600">
        <p className="text-sm text-slate-600 mb-2">Subreddits</p>

        <div className="flex gap-2 mb-3">
          <input
            type="text"
            placeholder="Enter subreddit (ex: startups)"
            value={newSubreddit}
            onChange={(e) => setNewSubreddit(e.target.value)}
            className="border rounded-lg p-2 w-full"
          />
          <button
            onClick={() => {
              handleAddSubreddit();
            }}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 cursor-pointer transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 font-medium"
          >
            Add
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {subreddits.map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full"
            >
              {s}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSubreddits(subreddits.filter((sub) => sub !== s));
                  setIsSaved(false);
                }}
                className="ml-0.5 hover:bg-white/20 rounded-full p-0.5 cursor-pointer transition-colors"
                aria-label="Remove subreddit"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </span>
          ))}
        </div>
      </SectionCard>

      {/* POSTS PER WEEK */}
      <SectionCard icon={BuildingOffice2Icon} title="Posts Per Week" iconColor="text-green-600">
        <div>
          <input
            type="range"
            min="1"
            max="13"
            value={postsPerWeek}
            onChange={(e) => {
              setPostsPerWeek(Number(e.target.value)); 
              setIsSaved(false);
            }}
            className="w-full"
          />
          <p className="text-center mt-1 text-sm">{postsPerWeek} posts/week</p>
        </div>
      </SectionCard>

      {/* SAVE / GENERATE BUTTON */}
      <div className="flex gap-2">
        <button
          onClick={handleReset}
          className="flex-1 p-3 rounded-lg bg-gradient-to-r from-gray-400 to-gray-500 text-white font-semibold cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
        >
          Reset
        </button>
        <button
          onClick={handleSubmit}
          className={`p-3 rounded-lg text-white font-semibold cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 ${
            isSaved 
              ? "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600" 
              : "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
          }`}
        >
          {isSaved ? "Generate Calendar" : "Save Data"}
        </button>
      </div>

      {editingPersona && (
        <PersonaModal
          persona={editingPersona}
          onCancel={() => setEditingPersona(null)}
          onSave={handleSavePersona}
        />
      )}
    </div>
  );
}