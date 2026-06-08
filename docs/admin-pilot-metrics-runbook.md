# Runbook — Admin Pilot Metrics

## Arquitetura do fluxo

```
Browser (EngagementCenter.jsx)
  └── fetch("/api/pilot-metrics")          [sem chave, mesmo domínio]
        ↓
Vercel Serverless Function
  api/pilot-metrics.js                     [server-side, Node.js]
  └── process.env.KARDOVIK_API_URL
  └── process.env.ADMIN_METRICS_KEY        [nunca exposta ao browser]
  └── fetch(`${KARDOVIK_API_URL}/admin/pilot-metrics`, {
        headers: { "x-admin-metrics-key": ADMIN_METRICS_KEY }
      })
        ↓
Railway — Kardovik-kkk (Next.js)
  /admin/pilot-metrics                     [valida x-admin-metrics-key]
  └── consulta Supabase tabela pilot_events
        ↓
Resposta JSON → Vercel → Browser
```

---

## Variáveis de ambiente

### Railway (Kardovik-kkk)

| Variável | Propósito |
|----------|-----------|
| `ADMIN_METRICS_KEY` | Chave secreta validada no header `x-admin-metrics-key` |
| `SUPABASE_URL` | URL do projeto Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Acesso service role ao Supabase |

### Vercel (kardovik-login)

| Variável | Propósito |
|----------|-----------|
| `KARDOVIK_API_URL` | URL base do Railway, ex: `https://kardovik-production.up.railway.app` |
| `ADMIN_METRICS_KEY` | Mesma chave configurada no Railway |
| `VITE_SUPABASE_URL` | URL Supabase exposta ao cliente (auth) |
| `VITE_SUPABASE_ANON_KEY` | Anon key Supabase exposta ao cliente (auth) |

**CRÍTICO:** `ADMIN_METRICS_KEY` nunca deve ter prefixo `VITE_`. Qualquer `VITE_*` é baked no bundle do browser e fica visível em DevTools.

---

## Comandos de teste

### Testar Railway diretamente
```bash
curl -i \
  -H "x-admin-metrics-key: <ADMIN_METRICS_KEY>" \
  https://kardovik-production.up.railway.app/admin/pilot-metrics
```

### Testar proxy Vercel (produção)
```bash
curl -i https://admin.kardovik.com/api/pilot-metrics
```

### Testar proxy Vercel (local com .env)
```bash
# Requer Vercel CLI instalado
vercel dev
curl -i http://localhost:3000/api/pilot-metrics
```

---

## Respostas esperadas

### Sucesso
```
HTTP/2 200
Content-Type: application/json

{
  "ok": true,
  "authMode": "authenticated",
  "totals": { "events": N, "humanInterventions": N, "interventionPct": N, "criticalIncidents": N },
  "health": "excellent",
  "tagFrequency": { ... },
  "latestEvents": [ ... ]
}
```

---

## Diagnóstico por status HTTP

| Status | Body | Causa | Solução |
|--------|------|-------|---------|
| `200` | `ok: true` | Tudo funcionando | — |
| `200` | HTML do React | `api/pilot-metrics.js` não deployado | Verificar commit e redeploy no Vercel |
| `401` / `403` | erro upstream | Chave rejeitada pelo Railway | Verificar `ADMIN_METRICS_KEY` no painel Vercel |
| `502` | `"Não foi possível conectar ao backend."` | Railway offline ou `KARDOVIK_API_URL` errada | Verificar Railway e a variável no Vercel |
| `503` | `"Configuração do servidor ausente."` | `KARDOVIK_API_URL` ou `ADMIN_METRICS_KEY` não configuradas no Vercel | Adicionar as variáveis em Settings → Environment Variables |
| `405` | `"Método não permitido."` | Request não-GET ao proxy | Normal — apenas GET é suportado |

---

## Comportamento da UI

| Estado | Header badge | Card badge | Bloco de telemetria |
|--------|-------------|------------|---------------------|
| Carregando | Carregando... | Carregando... | Oculto |
| Erro (`metricsError`) | Dados indisponíveis (vermelho) | Indisponível | Oculto |
| Conectado, campo disponível | Operacional (verde) | Tempo real (verde) | Visível com valores reais |
| Conectado, campo ausente | Operacional (verde) | Aguardando histórico (neutro) | Visível com valores disponíveis |
| Desconectado (`ok: false`) | Telemetria não conectada | Aguardando dados | Oculto |

---

## Mapa de campos payload → UI

| Campo do payload | Campo normalizado | Card / destino |
|------------------|-------------------|----------------|
| `totals.events` | `metrics.totalEvents` | Bloco de telemetria |
| `totals.humanInterventions` | `metrics.humanInterventions` | Bloco de telemetria |
| `totals.criticalIncidents` | `metrics.criticalIncidents` | Bloco de telemetria |
| `health` | `metrics.health` | Bloco de telemetria |
| `tagFrequency` | `metrics.tagFrequency` | Reservado |
| `latestEvents` | `metrics.latestEvents` | Reservado |
| `clinicas_online` | `metrics.clinicas_online` | Card "Clínicas Online Agora" |
| `usuarios_online` | `metrics.usuarios_online` | Card "Usuários Online" |
| `sessoes_ativas` | `metrics.sessoes_ativas` | Card "Sessões Ativas" |
| `tempo_medio_sessao` | `metrics.tempo_medio_sessao` | Card "Tempo Médio de Sessão" |

Os últimos 4 campos (`clinicas_online`, `usuarios_online`, `sessoes_ativas`, `tempo_medio_sessao`) ainda não são retornados pelo Railway. Quando forem adicionados ao endpoint, os cards preencherão automaticamente sem alteração no frontend.

---

## Segurança

- `ADMIN_METRICS_KEY` existe apenas em: Railway (env) e Vercel (env server-side)
- Nunca aparece em: bundle JS, DevTools, logs do browser, JSON de resposta
- O proxy loga apenas `err.message` em caso de falha de rede — nunca a chave
- `.env` local está em `.gitignore` — nunca commitado

---

## Arquivos envolvidos

| Arquivo | Tipo | Propósito |
|---------|------|-----------|
| `api/pilot-metrics.js` | Vercel Serverless Function | Proxy seguro Railway ← → Browser |
| `src/lib/pilotMetrics.js` | Frontend lib | fetch + normalização do payload |
| `src/pages/admin/EngagementCenter.jsx` | Página admin | Consumidor dos dados normalizados |
