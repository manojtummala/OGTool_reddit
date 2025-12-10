// src/components/PersonaModal.jsx
import React, { useState, useEffect } from "react";

export default function PersonaModal({ persona = null, onCancel, onSave }) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState(""); 
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (persona) {
      setName(persona.name || "");
      setUsername(persona.username ? persona.username.replace(/^u\//, "") : "");
      setDescription(persona.description || "");
    }
  }, [persona]);

  function handleSubmit() {
    if (!name.trim()) return alert("Persona name is required");
    if (!username.trim()) return alert("Username is required");

    const formattedUsername = `u/${username.replace(/^u\//, "")}`;

    onSave({
      id: persona?.id ?? crypto.randomUUID(),
      name,
      username: formattedUsername,
      description,
    });
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold">
          {persona?.id ? "Edit Persona" : "Add Persona"}
        </h2>

        <div className="flex flex-col gap-3">
          <input
            className="border rounded p-2"
            placeholder="Persona Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="border rounded p-2"
            placeholder="Reddit Username (ex: johndoe)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <textarea
            className="border rounded p-2 h-20"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button className="text-slate-600" onClick={onCancel}>Cancel</button>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
            onClick={handleSubmit}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}