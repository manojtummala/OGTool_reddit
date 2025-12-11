// src/lib/apiClient.js

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:3000";

/**
 * Save all user-entered data:
 * - company (name, description)
 * - personas
 * - subreddits (targets)
 * - postsPerWeek
 *
 * Backend returns: { companyId }
 */
export async function saveAllData(payload) {
  const res = await fetch(`${API_BASE}/save/all`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Save failed: ${res.status} — ${text}`);
  }

  return res.json();
}

/**
 * Generate a weekly content plan.
 * Payload includes:
 * - company
 * - personas
 * - subreddits
 * - postsPerWeek
 * - optional companyId (links week to saved data)
 * - keywords (always empty array from frontend)
 */
export async function generateWeek(payload) {
  const res = await fetch(`${API_BASE}/generate/week`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Generate failed: ${res.status} — ${text}`);
  }

  return res.json();
}

export async function fetchCompanyData(name) {
  // Option 1: Get all companies and filter client-side
  const res = await fetch(`${API_BASE}/company`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Fetch failed: ${res.status} — ${text}`);
  }
  
  const companies = await res.json();
  const company = companies.find(c => c.name === name);
  return company || null;
}