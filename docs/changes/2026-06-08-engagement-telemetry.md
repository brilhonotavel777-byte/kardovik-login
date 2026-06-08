# Integração de Telemetria — Central de Engajamento

**Data:** 2026-06-08
**Commits:** `e7c24e1`, `87923d5`
**Branch:** `main`
**Ambiente:** Produção (admin.kardovik.com)

---

## Problema inicial

A Central de Engajamento (`/admin/engagement`) exibia o badge de status como **"Operacional"** e **"Tempo real"** após a conexão com `/api/pilot-metrics`, mas os 4 cards de métricas continuavam mostrando `—`.

O header do painel também oscilava entre "Telemetria não conectada" em contextos onde o endpoint respondia corretamente.

---

## Causa raiz

**Mismatch de campos:** o frontend esperava campos que não existem no payload real do Railway:

| Campo esperado (frontend) | Existe no payload Railway? |
|---------------------------|---------------------------|
| `metrics.clinicas_online` | ❌ não retornado |
| `metrics.usuarios_online` | ❌ não retornado |
| `metrics.sessoes_ativas` | ❌ não retornado |
| `metrics.tempo_medio_sessao` | ❌ não retornado |

O payload real retornado pelo Railway é:
```json
{
  "ok": true,
  "authMode": "authenticated",
  "totals": { "events": 2, "humanInterventions": 0, "interventionPct": 0, "criticalIncidents": 0 },
  "health": "excellent",
  "tagFrequency": { "fear_risk": 1 },
  "latestEvents": [ ... ]
}
```

A função `fetchPilotMetrics` retornava o JSON bruto sem normalização. Os campos `clinicas_online`, `usuarios_online`, etc. eram `undefined`, resultando no fallback `"—"`. Mesmo assim, `live = !!metrics && !metricsError` era `true` (pois o objeto existia), então o badge dizia "Tempo real" mas os valores estavam vazios — comportamento contraditório.

---

## Correções aplicadas

### 1. Camada de normalização em `src/lib/pilotMetrics.js`

Adicionada função `normalizePilotMetrics(raw)` que:
- Retorna `null` se `raw.ok !== true` (desconecta sem setar erro)
- Mapeia todos os campos reais do payload para nomes explícitos
- Mantém campos futuros (`clinicas_online` etc.) como `null` via `raw.X ?? null`

```js
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
    // ...
  };
}
```

### 2. Badge por card em `src/pages/admin/EngagementCenter.jsx`

Substituído badge global por função `cardBadge(val)`:
- Campo com valor → `"Tempo real"` (verde)
- Conectado mas campo `null` → `"Aguardando histórico"` (neutro)
- Erro → `"Indisponível"` (vermelho)

### 3. Bloco de telemetria disponível

Adicionado bloco verde visível quando `live === true`, exibindo dados reais disponíveis: Eventos, Intervenções humanas, Incidentes críticos, Saúde do sistema.

### 4. EmptyBlocks condicionais

5 blocos de estado vazio atualizados: quando `live === true`, mensagem muda de "Sem dados reais conectados ainda..." para "Telemetria conectada. Aguardando histórico suficiente para cálculo."

### 5. SectionLabel atualizado

Quando conectado: "Telemetria conectada, aguardando campos de presença" (em vez de "Tempo real").

---

## Commits envolvidos

| Commit | Descrição |
|--------|-----------|
| `e7c24e1` | `feat(admin): connect EngagementCenter to pilot-metrics proxy` — criação de `api/pilot-metrics.js`, `src/lib/pilotMetrics.js`, integração inicial em `EngagementCenter.jsx` |
| `87923d5` | `fix(admin): normalize engagement metrics payload` — normalização do payload, badge por card, bloco de telemetria, EmptyBlocks condicionais |

### Commits anteriores relacionados (contexto)

| Commit | Descrição |
|--------|-----------|
| `b17fd6a` | `fix(admin): refine engagement center clarity` |
| `226af0d` | `fix(admin): clarify recovery operations empty states` |
| `887ff08` | `fix(admin): clarify infrastructure pending states` |

---

## Validações feitas

| Verificação | Resultado |
|-------------|-----------|
| `npm run build` | ✅ 84 módulos, 496.58 kB, zero erros |
| `git push origin main` | ✅ `e7c24e1..87923d5` |
| `curl -i https://admin.kardovik.com/api/pilot-metrics` | ✅ `HTTP 200`, `ok:true`, `authMode:authenticated` |
| `ADMIN_METRICS_KEY` não exposta no bundle | ✅ confirmado — variável server-side sem prefixo `VITE_` |
| `.env` não commitado | ✅ em `.gitignore` |
| Arquivos protegidos não tocados | ✅ `App.jsx`, `ProtectedShell.jsx`, `auth.js`, `access.js`, `supabase.js`, login, sistema de respostas — intactos |

---

## Estado final

**Endpoint:** `https://admin.kardovik.com/api/pilot-metrics` → `HTTP 200`, `ok: true`

**UI (`/admin/engagement`):**
- Header badge: **Operacional** (verde)
- SectionLabel: "Telemetria conectada, aguardando campos de presença"
- Cards: `—` com badge **Aguardando histórico** (neutro, não indica erro)
- Bloco de telemetria: Eventos: `2` | Intervenções humanas: `0` | Incidentes críticos: `0` | Saúde do sistema: `excellent`
- EmptyBlocks: "Telemetria conectada. Aguardando histórico..."

---

## Próximos passos (opcionais)

Quando o Railway adicionar os campos de presença ao payload `/admin/pilot-metrics`, os cards preencherão automaticamente sem alteração no frontend, pois a normalização já mapeia:
- `raw.clinicas_online → metrics.clinicas_online`
- `raw.usuarios_online → metrics.usuarios_online`
- `raw.sessoes_ativas → metrics.sessoes_ativas`
- `raw.tempo_medio_sessao → metrics.tempo_medio_sessao`

Próximas integrações previstas (Mapa de Evolução):
- **Etapa 2:** `session_logs` → Atividade em Tempo Real, Ranking de Uso
- **Etapa 3:** `activity_events` → Alertas Inteligentes
- **Etapa 4:** `clinic_daily_stats` → Score de Engajamento
