const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:3000";

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

  const data = await res.json();
  return data;
}

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
  const res = await fetch(`${API_BASE}/company`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Fetch failed: ${res.status} — ${text}`);
  }
  
  const companies = await res.json();
  const company = companies.find(c => c.name === name);
  return company || null;
}

export async function getLatestWeek(companyID) {
  const res = await fetch(`${API_BASE}/generate/week/latest?companyId=${companyID}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Get Latest week failed : ${res.status} - ${text}`);
  }
  return res.json();
}

export async function updatePostWithComments(postData) {
  const res = await fetch(`${API_BASE}/post/update-with-comments`, {
    method: "PUT",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(postData),
  });

  if (!res.ok){
    const text = await res.text();
    throw new Error(`Update failed: ${res.status} - ${text}`);
  }
  return res.json();
}

export async function getWeeksByCompany(companyId) {
  const res = await fetch(`${API_BASE}/week/company/${companyId}`);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch weeks: ${res.status} — ${text}`);
  }

  return res.json();
}



