function normalizePerClinic(raw) {
  if (!raw || typeof raw !== "object") return [];
  return Object.entries(raw)
    .map(([clinicId, d]) => ({
      clinicId,
      events: d.events ?? 0,
      humanInterventions: d.humanInterventions ?? 0,
      criticalIncidents: d.criticalIncidents ?? 0,
      topReplyTypes: d.topReplyTypes ?? [],
      topTags: d.topTags ?? [],
      lastSeenAt: d.lastSeenAt ?? null,
    }))
    .sort((a, b) => new Date(b.lastSeenAt ?? 0) - new Date(a.lastSeenAt ?? 0));
}

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
    perClinic: normalizePerClinic(raw.perClinic),
    perDay: raw.perDay ?? [],
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
