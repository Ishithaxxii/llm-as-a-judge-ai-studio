const BASE = import.meta.env.VITE_API_BASE_URL || "/api";

function formatErrorDetail(detail, status) {
  if (typeof detail === "string" && detail.trim()) return detail;
  if (Array.isArray(detail) && detail.length > 0) {
    return detail.map((item) => {
      const loc = Array.isArray(item?.loc) ? item.loc.filter((part) => part !== "body").join(".") : "";
      const msg = item?.msg || "Invalid value";
      return loc ? `${loc}: ${msg}` : msg;
    }).join(" · ");
  }
  if (status === 404 || status === 502 || status === 503) {
    return `Backend endpoint unavailable (HTTP ${status}). Verify the FastAPI server is running.`;
  }
  return `Request failed (HTTP ${status})`;
}

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch {
    throw new Error("Unable to reach the JudgeAI backend. Ensure FastAPI is running on port 8000 (or configure VITE_API_BASE_URL and CORS).");
  }
  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  if (!res.ok) {
    const body = isJson ? await res.json().catch(() => ({})) : {};
    throw new Error(formatErrorDetail(body.detail, res.status));
  }
  if (!isJson) throw new Error("Unexpected non-JSON response from backend. Verify the FastAPI server and API proxy configuration.");
  return res.json();
}

export const api = {
  createSubmission: (data) => request("/submissions", { method: "POST", body: JSON.stringify(data) }),
  listSubmissions: (limit = 30) => request(`/submissions?limit=${limit}`),
  getSavedEvaluation: (id) => request(`/submissions/${encodeURIComponent(id)}/evaluation`),
  judge: (data) => request("/judge", { method: "POST", body: JSON.stringify(data) }),
};
