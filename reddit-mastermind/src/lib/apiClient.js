export async function generateWeek(payload) {
  const res = await fetch("http://localhost:4000/api/generate/week", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return res.json();
}