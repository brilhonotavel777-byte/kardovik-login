# Histórico Operacional — 5 Páginas ADM Kardovik

**Data:** 2026-06-08
**Branch:** `main`
**Escopo:** Auditoria de estado e plano técnico de evolução das 5 páginas da área `/admin`

---

## 1. Mapa de fontes de dados existentes

| Fonte | Mecanismo | Onde usado |
|-------|-----------|------------|
| `supabase.rpc("get_admin_stats")` | Supabase RPC, tabelas `usuarios`, `acessos` | ExecutiveCommand, OperationsCenter |
| `supabase.rpc("get_admin_operations")` | Supabase RPC, tabela `usuarios` + derivados | OperationsCenter |
| `Railway /admin/pilot-metrics` | Proxy `/api/pilot-metrics` → `x-admin-metrics-key` | EngagementCenter |
| `Supabase pilot_events` | Lida pelo Railway, retorna via proxy | EngagementCenter |
| Sem fonte ativa | — | InfrastructureControl, RecoveryOps |

---

## 2. Estado atual por página

---

### Página 1 — Comando Executivo (`ExecutiveCommand.jsx`)

**Rota:** `/admin/executive`
**Lib:** `fetchAdminStats()` → `supabase.rpc("get_admin_stats")`

#### Métricas Operacionais — FUNCIONA HOJE

| Card | Campo Supabase | Status |
|------|---------------|--------|
| Clínicas Ativas | `stats.clinicas_ativas` | ✅ Funciona |
| Novas Vendas | `stats.novas_vendas_mes` | ✅ Funciona |
| Usuários Pagos | `stats.usuarios_pagos` | ✅ Funciona |
| Plano Anual | `stats.plano_anual` | ✅ Funciona |
| Plano Mensal | `stats.plano_mensal` | ✅ Funciona |
| Cancelamentos Mês | `stats.cancelamentos_mes` | ✅ Funciona |
| Expirando (7d) | `stats.acesso_expirando_7d` | ✅ Funciona |

#### Alertas Executivos — FUNCIONA HOJE (derivado do stats)

| Alerta | Derivação | Status |
|--------|-----------|--------|
| Assinaturas expirando | `stats.acesso_expirando_7d > 0` | ✅ Funciona |
| Cancelamentos mês | `stats.cancelamentos_mes > 0` | ✅ Funciona |

#### Métricas Financeiras — PLACEHOLDER total

| Card | Valor atual | Precisa |
|------|-------------|---------|
| Receita Hoje | `brl(0)` hardcoded | Backend Hotmart ou webhook de pagamento |
| Receita Semana | `brl(0)` hardcoded | Backend financeiro |
| Receita Mês | `brl(0)` hardcoded | Backend financeiro |
| ARR Projetado | `brl(0)` hardcoded | Cálculo baseado em planos ativos |
| Ticket Médio | `brl(0)` hardcoded | Histórico de transações |
| Receita Recuperada | `brl(0)` hardcoded | Histórico de reativações |

#### Gráfico de Receita Mensal — PLACEHOLDER

| Bloco | Estado | Precisa |
|-------|--------|---------|
| `MONTHS` (Dez–Mai) | todos `v: 0` → "Aguardando dados de receita" | Tabela `revenue_monthly` ou API Hotmart |

#### Top Canais de Aquisição — PLACEHOLDER

| Bloco | Estado | Precisa |
|-------|--------|---------|
| Meta Ads, TikTok, Instagram, Orgânico | todos `pct: 0` → "Sem fonte de dados conectada" | Pipeline de atribuição de aquisição |

#### Meta do Mês — PLACEHOLDER

| Bloco | Estado | Precisa |
|-------|--------|---------|
| `monthlyGoalTarget = 0` | "Sem meta configurada" | Tabela de metas ou config admin |

---

### Página 2 — Central Operacional (`OperationsCenter.jsx`)

**Rota:** `/admin/operations`
**Libs:** `fetchAdminOperations()` + `fetchAdminStats()`

#### Métricas de topo — FUNCIONA HOJE

| Card | Fonte | Status |
|------|-------|--------|
| Clínicas Ativas | `data.clinicas_ativas` via `get_admin_operations` | ✅ Funciona |
| Em Onboarding | `clinics.filter(c => c.display_status === "novo").length` | ✅ Funciona |
| Usuários Ativos | `clinics.reduce((s,c) => s + c.total_usuarios, 0)` | ✅ Funciona |
| Sem Uso (7d) | `clinics.filter(c => c.display_status === "risco").length` | ✅ Funciona |
| Expirando (7d) | `stats.acesso_expirando_7d` | ✅ Funciona |
| Cancelamentos | `stats.cancelamentos_mes` | ✅ Funciona |

#### Tabela de Clínicas — FUNCIONA HOJE

| Coluna | Fonte | Status |
|--------|-------|--------|
| Nome | `clinica.nome` | ✅ Funciona |
| Status (ativo/novo/risco/pausa) | `clinica.display_status` | ✅ Funciona |
| Plano (Anual/Mensal) | `clinica.plano_dominante` | ✅ Funciona |
| Último acesso | `clinica.ultimo_acesso_derivado` | ✅ Funciona |
| Saúde | `clinica.health_score_derivado` (HealthBar) | ✅ Funciona |

#### Filtros de tabela — PLACEHOLDER

| Filtro | Estado | Precisa |
|--------|--------|---------|
| "Ativas" | Marcado "EM BREVE", `cursor: default` | Lógica de filtro no estado React |
| "Em risco" | Marcado "EM BREVE", `cursor: default` | Lógica de filtro no estado React |

**Nota:** Os dados já existem — só falta implementar o `useState` de filtro ativo no frontend.

#### Atividade Recente — PLACEHOLDER

| Bloco | Estado | Precisa |
|-------|--------|---------|
| `ACTIVITY = []` | "Sem eventos monitorados ainda. Requer: activity_events" | Tabela `activity_events` ou `pilot_events` + `latestEvents` |

**Nota:** `latestEvents` do pilot-metrics já existe e poderia alimentar parcialmente este bloco.

---

### Página 3 — Controle de Infraestrutura (`InfrastructureControl.jsx`)

**Rota:** `/admin/infrastructure`
**Fonte:** Nenhuma — 100% placeholder estático

#### ServiceCards — PLACEHOLDER total

| Serviço | Status | Uptime | Latência | Precisa |
|---------|--------|--------|----------|---------|
| Supabase | `pending` | "—" | "—" | Health check endpoint ou Supabase status API |
| Hotmart | `pending` | "—" | "—" | Webhook de status ou ping periódico |
| OpenAI | `pending` | "—" | "—" | `response_time_ms` de pilot_events |
| Railway | `pending` | "—" | "—" | Health check endpoint Railway |
| SMTP | `pending` | "—" | "—" | Ping SMTP ou log de envios |
| Webhooks | `pending` | "—" | "—" | Log de webhook deliveries |

#### MetricCards — PLACEHOLDER total

| Card | Precisa |
|------|---------|
| Uptime Global | Agregação dos health checks acima |
| Latência Média | `AVG(response_time_ms)` de `pilot_events` |
| Requisições Hoje | `COUNT` de `pilot_events` por data |
| Falhas nas 24h | `COUNT` de eventos com erro em `pilot_events` |
| Custo IA Estimado | Estimativa por token (não disponível sem log de tokens) |

#### Timeline de Eventos — PLACEHOLDER

| Bloco | Estado | Precisa |
|-------|--------|---------|
| `TIMELINE = []` | "Nenhum evento de infraestrutura monitorado." | Log de eventos de infra (nova tabela ou Railway webhook) |

#### Integridade do Sistema — PLACEHOLDER

| Barra | Precisa |
|-------|---------|
| Banco de Dados | Health check Supabase |
| Autenticação | Taxa de sucesso de auth (pode derivar de `usuarios.last_login_at`) |
| Armazenamento | Supabase Storage stats |
| Funções Edge | Log de Edge Functions |
| Tempo Real | Supabase Realtime status |

---

### Página 4 — Central de Recuperação (`RecoveryOps.jsx`)

**Rota:** `/admin/recovery-ops`
**Fonte:** Nenhuma — 100% placeholder estático

#### MetricCards — PLACEHOLDER total

| Card | Precisa |
|------|---------|
| Incidentes Abertos | Tabela `incidents` ou derivado de falhas |
| Falhas Críticas | `criticalIncidents` de `pilot_events` → JÁ EXISTE no payload! |
| Alertas Médios | Threshold sobre `tagFrequency` ou nova tabela |
| Erros Resolvidos | Tabela de incidentes com status `resolved` |
| Clínicas Impactadas | Cruzamento entre incidentes e `clinic_id` |

**Nota crítica:** `totals.criticalIncidents` e `totals.humanInterventions` do pilot-metrics JÁ ESTÃO disponíveis e poderiam alimentar 2 desses 5 cards imediatamente.

#### Tabela de Incidentes — PLACEHOLDER

| Bloco | Estado | Precisa |
|-------|--------|---------|
| `INCIDENTS = []` | "Nenhum incidente monitorado ainda." | Tabela `incidents` ou derivado de pilot_events com `humanIntervention: true` |

**Nota:** `latestEvents` com `humanIntervention: true` já está disponível no payload.

#### Mapa de Correção — PLACEHOLDER

| Bloco | Estado | Precisa |
|-------|--------|---------|
| `ERROR_MAP = []` | "Nenhum erro mapeado ainda." | Classificação de erros (nova tabela ou enriquecimento de pilot_events) |

#### Painel de Prioridade — PLACEHOLDER

| Bloco | Estado | Precisa |
|-------|--------|---------|
| `PRIORITY = []` | "Sem prioridades operacionais registradas." | Sistema de priorização de incidentes |

---

### Página 5 — Central de Engajamento (`EngagementCenter.jsx`)

**Rota:** `/admin/engagement`
**Fonte:** `/api/pilot-metrics` → Railway → `pilot_events`

#### Bloco de telemetria disponível — FUNCIONA HOJE

| Campo | Fonte | Valor atual | Status |
|-------|-------|-------------|--------|
| Eventos | `totals.events` | 2 | ✅ Funciona |
| Intervenções humanas | `totals.humanInterventions` | 0 | ✅ Funciona |
| Incidentes críticos | `totals.criticalIncidents` | 0 | ✅ Funciona |
| Saúde do sistema | `health` | "excellent" | ✅ Funciona |

#### Cards de Presença — PARCIAL (conectado, campo ausente no payload)

| Card | Campo esperado | Status |
|------|---------------|--------|
| Clínicas Online Agora | `clinicas_online` | ⚠️ Parcial — "—" badge "Aguardando histórico" |
| Usuários Online | `usuarios_online` | ⚠️ Parcial — "—" badge "Aguardando histórico" |
| Sessões Ativas | `sessoes_ativas` | ⚠️ Parcial — "—" badge "Aguardando histórico" |
| Tempo Médio de Sessão | `tempo_medio_sessao` | ⚠️ Parcial — "—" badge "Aguardando histórico" |

#### Dados disponíveis no payload não exibidos ainda

| Campo | Disponível | Onde poderia ser exibido |
|-------|------------|--------------------------|
| `tagFrequency` | ✅ `{ fear_risk: 1 }` | EngagementCenter — distribuição de tags |
| `latestEvents[*]` | ✅ 2 eventos completos | EngagementCenter — feed de eventos recentes |
| `perClinic` | ✅ (Etapa 2A do Railway) | EngagementCenter — ranking por clínica |
| `perDay` | ✅ (Etapa 2A do Railway) | EngagementCenter — gráfico de atividade diária |

#### EmptyBlocks — PARCIAL (mensagem condicional implementada)

| Bloco | Estado quando live | Status |
|-------|-------------------|--------|
| Atividade em Tempo Real | "Telemetria conectada. Aguardando histórico de sessões..." | ⚠️ Parcial |
| Ranking de Uso | "Telemetria conectada. Aguardando histórico suficiente..." | ⚠️ Parcial |
| Clínicas em Risco | "Telemetria conectada. Aguardando dados suficientes..." | ⚠️ Parcial |
| Score de Engajamento | "Telemetria conectada. Aguardando histórico..." | ⚠️ Parcial |
| Alertas Inteligentes | "Telemetria conectada. Aguardando histórico de sessões..." | ⚠️ Parcial |

---

## 3. Resumo de classificação

### Funciona hoje (sem alteração necessária)

| Item | Página | Fonte |
|------|--------|-------|
| 7 cards operacionais | ExecutiveCommand | `get_admin_stats` |
| Alertas executivos | ExecutiveCommand | `get_admin_stats` (derivado) |
| 6 cards de métricas | OperationsCenter | `get_admin_operations` + `get_admin_stats` |
| Tabela de clínicas (5 colunas) | OperationsCenter | `get_admin_operations` |
| Header status badge | ExecutiveCommand | `get_admin_stats` |
| Bloco de telemetria (4 valores) | EngagementCenter | `pilot_events` via Railway |
| Status Operacional badge | EngagementCenter | `pilot_events` |

### Parcial (conectado, sem campo específico ainda)

| Item | Página | O que falta |
|------|--------|-------------|
| 4 cards de presença | EngagementCenter | Campos `clinicas_online`, `usuarios_online`, `sessoes_ativas`, `tempo_medio_sessao` no payload Railway |
| 5 EmptyBlocks condicionais | EngagementCenter | Dados reais (session_logs, activity_events) |
| Filtros Ativas/Em risco | OperationsCenter | Lógica de filtro no React (dados existem) |

### Precisa apenas de frontend (dados existem no payload)

| Item | Página | Campo disponível |
|------|--------|-----------------|
| Feed de eventos recentes | EngagementCenter | `latestEvents[]` |
| Distribuição de tags | EngagementCenter | `tagFrequency` |
| Atividade recente | OperationsCenter | `latestEvents[]` (reaproveitável) |
| Falhas Críticas card | RecoveryOps | `totals.criticalIncidents` |
| Intervenções card | RecoveryOps | `totals.humanInterventions` |
| Incidentes com intervenção | RecoveryOps | `latestEvents` filter `humanIntervention: true` |

### Precisa de backend novo (Railway ou Supabase)

| Item | Páginas afetadas | Complexidade |
|------|-----------------|--------------|
| `response_time_ms` em pilot_events | InfrastructureControl, RecoveryOps | Baixa (coluna adicional na tabela existente) |
| `session_logs` table | EngagementCenter, OperationsCenter | Média (nova tabela + trigger de sessão) |
| `active_sessions` (tempo real) | EngagementCenter | Alta (heartbeat ou WebSocket) |
| `clinicas_online_agora` no payload | EngagementCenter | Média (JOIN com session_logs) |
| `admin/overview-metrics` endpoint | ExecutiveCommand, múltiplas | Baixa (novo endpoint Railway) |

### Precisa de Supabase schema + integração externa

| Item | Páginas | Dependência |
|------|---------|-------------|
| Receita Mensal / financeiro | ExecutiveCommand | Hotmart API ou tabela `revenue_transactions` |
| Top Canais | ExecutiveCommand | Pipeline de atribuição (UTM tracking) |
| ARR / Ticket Médio | ExecutiveCommand | `revenue_transactions` + planos ativos |
| Uptime de serviços | InfrastructureControl | Health checks periódicos (cron + tabela `service_health`) |
| Timeline de infraestrutura | InfrastructureControl | Tabela `infra_events` |
| Integridade do sistema | InfrastructureControl | Múltiplas fontes |
| Incidentes | RecoveryOps | Tabela `incidents` ou derivação de pilot_events |
| Mapa de correção | RecoveryOps | Classificação de erros |

---

## 4. Plano de execução por etapas

---

### Etapa ADM-1 — Reaproveitar `pilot_metrics` nas telas atuais

**Objetivo:** Exibir dados do payload já disponível em `pilot_events` sem nenhum backend novo.

**Escopo frontend-only:**

| Ação | Arquivo | Campo |
|------|---------|-------|
| Exibir `latestEvents[]` como feed de atividade recente | EngagementCenter.jsx | `metrics.latestEvents` |
| Exibir distribuição de `tagFrequency` | EngagementCenter.jsx | `metrics.tagFrequency` |
| Alimentar "Falhas Críticas" e "Intervenções" da RecoveryOps | RecoveryOps.jsx | `criticalIncidents`, `humanInterventions` |
| Alimentar feed de incidentes com `latestEvents` filtrados por `humanIntervention: true` | RecoveryOps.jsx | `metrics.latestEvents` |

**Lib necessária:**
- Adicionar `fetchPilotMetrics` import em `RecoveryOps.jsx`
- EngagementCenter já importa; só adicionar seções de `latestEvents` e `tagFrequency`

**Critério de aceite:**
- RecoveryOps mostra `criticalIncidents` e `humanInterventions` com valores reais
- EngagementCenter exibe feed de últimos 2+ eventos com `replyType`, `clinicId`, `ts`
- Nenhum dado hardcoded `"—"` onde existe campo real no payload

**Riscos:** Baixo — apenas frontend, sem migration, sem novo endpoint.

---

### Etapa ADM-2 — Endpoint `admin/overview-metrics` no Railway

**Objetivo:** Criar um endpoint no Railway que agrega métricas de presença das clínicas a partir do Supabase.

**Campos retornados:**
```json
{
  "clinicas_online": N,
  "usuarios_online": N,
  "sessoes_ativas": N,
  "tempo_medio_sessao_min": N,
  "clinicas_por_status": { "ativo": N, "novo": N, "risco": N }
}
```

**Dependência Supabase:**
- Requer tabela `session_logs` (Etapa ADM-4) para `clinicas_online`, `sessoes_ativas`
- Interim: pode derivar de `usuarios.last_login_at` recente como proxy de "online"

**Proxy frontend necessário:**
- `api/overview-metrics.js` (Vercel, mesmo padrão de `api/pilot-metrics.js`)
- `src/lib/overviewMetrics.js`

**Arquivos afetados:** EngagementCenter.jsx (4 cards de presença)

**Critério de aceite:**
- Cards "Clínicas Online Agora", "Usuários Online", "Sessões Ativas", "Tempo Médio" mostram valores reais
- Badge de cada card mostra "Tempo real" em verde

---

### Etapa ADM-3 — `response_time_ms` em `pilot_events` + pipeline

**Objetivo:** Registrar tempo de resposta da IA por evento e expor via endpoint.

**Migration Supabase:**
```sql
ALTER TABLE pilot_events ADD COLUMN response_time_ms INTEGER;
ALTER TABLE pilot_events ADD COLUMN error_type TEXT;
```

**Railway:**
- Preencher `response_time_ms` ao salvar cada evento
- Expor `AVG(response_time_ms)` em `/admin/pilot-metrics` ou novo endpoint

**Impacto nas telas:**
- InfrastructureControl → "Latência Média" (OpenAI)
- InfrastructureControl → "Requisições Hoje"
- InfrastructureControl → "Falhas nas 24h" (`error_type IS NOT NULL`)
- RecoveryOps → "Falhas Críticas" (com mais detalhe)

**Critério de aceite:**
- InfrastructureControl mostra latência média real e count de requisições
- RecoveryOps mostra falhas derivadas com tipo de erro

---

### Etapa ADM-4 — Tabela `session_logs` (sessões de acesso das clínicas)

**Objetivo:** Rastrear quando cada clínica/usuário abre e fecha uma sessão no ProtectedShell.

**Migration Supabase:**
```sql
CREATE TABLE session_logs (
  id BIGSERIAL PRIMARY KEY,
  clinic_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_min NUMERIC GENERATED ALWAYS AS (
    EXTRACT(EPOCH FROM (ended_at - started_at)) / 60
  ) STORED
);
```

**Trigger de frontend:**
- `ProtectedShell.jsx` registra `session_start` no mount e `session_end` no unmount
- **ATENÇÃO:** ProtectedShell está na zona protegida — precisará de aprovação explícita antes de qualquer alteração

**Impacto nas telas:**
- EngagementCenter → "Sessões Ativas", "Tempo Médio de Sessão"
- OperationsCenter → "Atividade Recente" (feed de logins)
- EngagementCenter → EmptyBlocks "Atividade em Tempo Real" e "Ranking de Uso" desbloqueados

**Critério de aceite:**
- `sessoes_ativas` e `tempo_medio_sessao` populam os cards de EngagementCenter
- "Atividade Recente" da OperationsCenter exibe eventos reais de sessão

**Riscos:**
- Alteração em `ProtectedShell.jsx` é na zona protegida — deve ser feita com auditoria e aprovação
- Sessões encerradas por fechamento de aba precisam de `beforeunload` (não garantido em mobile)

---

### Etapa ADM-5 — `active_sessions` (presença em tempo real)

**Objetivo:** Saber quais clínicas estão com sessão ativa no momento exato da consulta.

**Estratégia recomendada: heartbeat periódico**
```sql
CREATE TABLE active_sessions (
  clinic_id TEXT PRIMARY KEY,
  user_id UUID,
  last_heartbeat TIMESTAMPTZ DEFAULT NOW()
);
```

**Frontend:** ping a cada 30s para atualizar `last_heartbeat`; "online" = `last_heartbeat > NOW() - INTERVAL '90 seconds'`

**Impacto nas telas:**
- EngagementCenter → "Clínicas Online Agora" = COUNT de active_sessions recentes
- EngagementCenter → "Usuários Online" = COUNT(DISTINCT user_id) em active_sessions

**Critério de aceite:**
- Card "Clínicas Online Agora" exibe contagem real de clínicas com heartbeat recente
- Card "Usuários Online" exibe contagem real

**Riscos:**
- Heartbeat a cada 30s implica N requests por clínica ativa — volume baixo no piloto, mas deve ser monitorado
- Heartbeat também altera o sistema de respostas se implementado no ProtectedShell — zona protegida

---

### Etapa ADM-6 — Ligar todos os cards da interface

**Objetivo:** Com todos os backends prontos (ADM-2 a ADM-5), conectar os dados às telas restantes.

**InfrastructureControl:**
- ServiceCards: integrar health checks de Supabase, Railway, OpenAI
- MetricCards: consumir endpoint de infraestrutura
- Timeline: alimentar com eventos de `infra_events`

**RecoveryOps:**
- Tabela de incidentes: derivar de `pilot_events` com `humanIntervention: true` + nova tabela `incidents`
- Mapa de correção: derivar de erros classificados (`error_type`)

**ExecutiveCommand — financeiro:**
- Requere integração com Hotmart API ou webhook de pagamento
- Tabela `revenue_transactions` no Supabase
- Não bloqueado pelas etapas ADM-2 a ADM-5; pode ser desenvolvido em paralelo

**Filtros de OperationsCenter:**
- "Ativas" e "Em risco": apenas estado React — não requer backend

---

## 5. Tabela de prioridade por impacto × complexidade

| Etapa | Impacto visual | Complexidade | Depende de | Recomendação |
|-------|---------------|-------------|------------|--------------|
| ADM-1 | Alto | Baixa | Nada (dados existem) | Fazer primeiro |
| ADM-2 | Alto | Baixa–Média | Nenhuma (proxy simples) | Segundo |
| ADM-3 | Médio | Baixa | Migration simples | Terceiro |
| ADM-4 | Alto | Média | session_logs DDL + ProtectedShell* | Quarto |
| ADM-5 | Alto | Média | active_sessions DDL + heartbeat* | Quinto |
| ADM-6 | Total | Alta | ADM-2..5 completos | Último |
| Financeiro | Alto executivo | Alta | Hotmart API externa | Paralelo independente |

`*` = toca zona protegida (ProtectedShell.jsx) — requer aprovação explícita

---

## 6. Riscos

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| `session_logs` altera ProtectedShell (zona protegida) | Certo | Alto | Aprovação explícita antes de qualquer edit; auditoria linha a linha |
| Heartbeat causa loop de requests em mobile (beforeunload falha) | Média | Médio | Usar `visibilitychange` + `beforeunload` + TTL de 90s no backend |
| `pilot_events` cresce sem controle (sem TTL/partition) | Baixa | Médio | Adicionar `DELETE FROM pilot_events WHERE ts < NOW() - INTERVAL '30 days'` como cron |
| Hotmart API pode não ter webhook de receita granular | Média | Médio | Verificar docs Hotmart antes de planejar o bloco financeiro |
| `ADMIN_METRICS_KEY` expirada/rotacionada sem atualizar Vercel | Baixa | Alto | Documentar rotação no runbook; não commitá-la |
| Supabase RPC `get_admin_stats` retorna dados stale | Baixa | Baixo | RPC usa `NOW()` e não caches — seguro |

---

## 7. Critérios de aceite globais (estado final desejado)

| Página | Critério |
|--------|---------|
| ExecutiveCommand | Métricas operacionais sempre reais; financeiro mostra valor real ou "Aguardando integração Hotmart" |
| OperationsCenter | Tabela de clínicas com dados reais; filtros Ativas/Em risco funcionando; Atividade Recente com eventos reais |
| InfrastructureControl | ServiceCards com status real (não "pending"); pelo menos latência e requisições numéricas |
| RecoveryOps | Cards `criticalIncidents` e `humanInterventions` com valores reais; tabela de incidentes com eventos filtrados |
| EngagementCenter | Todos os 4 cards de presença com valores reais; feed de eventos visível; bloco de telemetria conectado |

---

## 8. O que já foi resolvido (linha do tempo)

| Data | Ação | Commits |
|------|------|---------|
| 2026-06-08 | Proxy seguro `/api/pilot-metrics` criado — `ADMIN_METRICS_KEY` nunca no browser | `e7c24e1` |
| 2026-06-08 | `pilot_events` persistindo no Supabase via Railway | Backend `597ba6c` |
| 2026-06-08 | Normalização do payload `pilot_events` → campos UI | `87923d5` |
| 2026-06-08 | Badge por card (Tempo real / Aguardando histórico / Indisponível) | `87923d5` |
| 2026-06-08 | Bloco de telemetria disponível (Eventos, Intervenções, Incidentes, Saúde) | `87923d5` |
| 2026-06-08 | EmptyBlocks condicionais (mensagem muda quando live) | `87923d5` |
| 2026-06-08 | Documentação runbook + changelog | `65ce99d` |
| 2026-06-08 | Auditoria das 5 páginas e plano ADM-1..6 | Este arquivo |
