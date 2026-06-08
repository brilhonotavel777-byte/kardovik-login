function normalizePilotMetrics(raw) {
  if (!raw?.ok) return null;
  return {
    connected: true,
    health: raw.health ?? null,
    totalEvents: raw.totals?.events ?? null,
    humanInterventions: raw.totals?.humanInterventions ?? null,
    interventionPct: raw.totals?.interventionPct ?? null,
    criticalIncidents: raw.totals?.criticalIncidents ?? null,
    tagFrequency: raw.tagFrequency ?? {},
    latestEvents: raw.latestEvents ?? [],
    clinicas_online: raw.clinicas_online ?? null,
    usuarios_online: raw.usuarios_online ?? null,
    sessoes_ativas: raw.sessoes_ativas ?? null,
    tempo_medio_sessao: raw.tempo_medio_sessao ?? null,
  };
}

export async function fetchPilotMetrics() {
  try {
    const res = await fetch("/api/pilot-metrics");
    if (!res.ok) return { data: null, error: `HTTP ${res.status}` };
    return { data: normalizePilotMetrics(await res.json()), error: null };
  } catch (err) {
    console.error("[Kardovik Admin] fetchPilotMetrics:", err.message);
    return { data: null, error: err.message };
  }
}
