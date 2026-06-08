export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  const apiUrl    = process.env.KARDOVIK_API_URL;
  const metricsKey = process.env.ADMIN_METRICS_KEY;

  if (!apiUrl || !metricsKey) {
    return res.status(503).json({ error: "Configuração do servidor ausente." });
  }

  try {
    const upstream = await fetch(`${apiUrl}/admin/pilot-metrics`, {
      headers: { "x-admin-metrics-key": metricsKey },
    });

    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: `Upstream HTTP ${upstream.status}` });
    }

    const data = await upstream.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(502).json({ error: "Não foi possível conectar ao backend." });
  }
}
