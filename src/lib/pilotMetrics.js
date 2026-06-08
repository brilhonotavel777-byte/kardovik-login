export async function fetchPilotMetrics() {
  try {
    const res = await fetch("/api/pilot-metrics");
    if (!res.ok) return { data: null, error: `HTTP ${res.status}` };
    return { data: await res.json(), error: null };
  } catch (err) {
    console.error("[Kardovik Admin] fetchPilotMetrics:", err.message);
    return { data: null, error: err.message };
  }
}
