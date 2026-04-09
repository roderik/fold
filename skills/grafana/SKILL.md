---
name: grafana
description: >-
  Query and investigate Grafana observability data (Loki logs, Prometheus metrics, Tempo traces).
  Use this skill whenever the user mentions Grafana, asks about logs, metrics, traces, pod restarts,
  alerts, error rates, latency, OOM kills, crash loops, monitoring, observability, debugging
  production issues, or investigating any Kubernetes/infrastructure problem. Also triggers on alert
  messages pasted from Grafana or Slack (e.g. "[FIRING:N]"), or when the user wants to check
  dashboards, query Loki/Prometheus/Tempo, or correlate observability signals.
allowed-tools: Bash(bun run *grafana.ts *), Bash(GRAFANA_* bun run *grafana.ts *)
---

# Grafana Observability Skill

Investigate issues using Grafana's Loki (logs), Prometheus (metrics), and Tempo
(traces). Works with both local and remote Grafana instances.

## Configuration

The script at `scripts/grafana.ts` (relative to this skill) reads configuration from environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `GRAFANA_URL` | `http://localhost:3000` | Grafana instance URL |
| `GRAFANA_USER` | — | Basic auth username (skip for unauthenticated local instances) |
| `GRAFANA_PASSWORD` | — | Basic auth password |
| `GRAFANA_OP_VAULT` | — | 1Password vault name (optional, falls back to `op` CLI) |
| `GRAFANA_OP_ITEM` | — | 1Password item name (optional, falls back to `op` CLI) |

For local development with no auth, just set `GRAFANA_URL` and leave credentials empty.

For production/staging with 1Password:
```shell
export GRAFANA_URL="https://grafana.example.com"
export GRAFANA_OP_VAULT="platform"
export GRAFANA_OP_ITEM="Grafana Credentials"
# Fetch once, reuse for the session:
export GRAFANA_CREDS=$(op item get "$GRAFANA_OP_ITEM" --vault "$GRAFANA_OP_VAULT" --fields user,password --format json --reveal)
export GRAFANA_USER=$(echo $GRAFANA_CREDS | jq -r '.[] | select(.label=="user") | .value')
export GRAFANA_PASSWORD=$(echo $GRAFANA_CREDS | jq -r '.[] | select(.label=="password") | .value')
```

## Running Queries

The CLI script path is relative to this skill directory:

```bash
bun run skills/grafana/scripts/grafana.ts <command> [args...]
```

### Available Commands

| Command | Description | Example |
|---------|-------------|---------|
| `datasources` | List all Grafana datasources | `datasources` |
| `alerts` | Show currently firing alerts | `alerts` |
| `loki '<logql>'` | Query Loki logs | `loki '{namespace="staging", container="api"}'` |
| `prom '<promql>'` | Prometheus range query | `prom 'rate(container_cpu_usage_seconds_total{pod=~"api.*"}[5m])'` |
| `prom-instant '<promql>'` | Prometheus instant query | `prom-instant 'kube_pod_container_status_restarts_total'` |
| `tempo-trace <id>` | Fetch a trace by ID | `tempo-trace abc123` |
| `tempo-search '<traceql>'` | Search traces | `tempo-search '{resource.service.name="api"}'` |

### Time Options (apply to loki, prom, tempo-search)

- `--range <duration>` — lookback from now (default: `1h`). Examples: `30m`, `6h`, `24h`, `7d`
- `--start <iso>` / `--end <iso>` — absolute time range (overrides `--range`)
- `--limit <n>` — max results (loki default: 200, tempo default: 20)

## Investigation Workflow

When investigating an alert or production issue, follow this systematic approach.

### Step 1 — Parse the Alert

Extract from the alert message:
- **Namespace** (e.g., `production`, `staging`)
- **Pod name** and **container** name
- **Alert type** (restart, OOM, high latency, error rate)
- **Timestamp** — convert to ISO 8601 for `--start`/`--end` flags

### Step 2 — Verify Namespace and Check Current State

Before deep-diving, confirm the target namespace exists. A namespace returning 0 results means it's not monitored here — flag this immediately.

```shell
# Verify the namespace exists
bun run scripts/grafana.ts prom-instant 'count(kube_pod_info{namespace="NAMESPACE"})'

# What's firing right now?
bun run scripts/grafana.ts alerts

# What datasources do we have?
bun run scripts/grafana.ts datasources
```

If the namespace query returns 0 results, check what namespaces ARE available:
```shell
bun run scripts/grafana.ts prom-instant 'count by (namespace) (kube_pod_info)'
```

### Step 3 — Determine Termination Reason (for pod restarts)

```shell
bun run scripts/grafana.ts prom-instant \
  'kube_pod_container_status_last_terminated_reason{namespace="NAMESPACE", pod=~"POD_PREFIX.*"}'

bun run scripts/grafana.ts prom \
  'kube_pod_container_status_restarts_total{namespace="NAMESPACE", pod=~"POD_PREFIX.*"}' \
  --range 6h
```

Common termination reasons:
- **OOMKilled** → container exceeded memory limit → check memory usage trend
- **Error** → process crashed → check application logs for panics/exceptions
- **Completed** → container exited normally → might be a misconfigured restart policy

### Step 4 — Pull Logs

```shell
bun run scripts/grafana.ts loki \
  '{namespace="NAMESPACE", pod="POD_NAME", container="CONTAINER"}' \
  --range 2h --limit 500

# Filter for errors
bun run scripts/grafana.ts loki \
  '{namespace="NAMESPACE", container="CONTAINER"} |~ "(?i)(error|panic|fatal|exception|oom|killed)"' \
  --range 6h
```

### Step 5 — Check Resource Usage

```shell
# Memory usage vs limit
bun run scripts/grafana.ts prom \
  'container_memory_working_set_bytes{namespace="NAMESPACE", pod=~"POD_PREFIX.*", container="CONTAINER"}' \
  --range 6h

# Memory limit
bun run scripts/grafana.ts prom-instant \
  'kube_pod_container_resource_limits{namespace="NAMESPACE", pod=~"POD_PREFIX.*", resource="memory"}'

# CPU usage
bun run scripts/grafana.ts prom \
  'rate(container_cpu_usage_seconds_total{namespace="NAMESPACE", pod=~"POD_PREFIX.*", container="CONTAINER"}[5m])' \
  --range 6h
```

### Step 6 — Correlate with Traces (if available)

If logs contain trace IDs (look for `traceId=`, `trace_id=`, or hex strings):

```shell
bun run scripts/grafana.ts tempo-trace <traceId>

# Or search for error traces from a service
bun run scripts/grafana.ts tempo-search \
  '{resource.service.name="SERVICE_NAME" && status=error}' --range 2h
```

### Step 7 — Synthesize Root Cause

After collecting data, synthesize findings:

1. **What happened**: immediate symptom
2. **Why it happened**: underlying cause
3. **Evidence**: specific log lines, metric values, timestamps
4. **Impact**: what was affected and for how long
5. **Recommendation**: how to prevent recurrence

## Common Kubernetes Queries

### Pod Health

```promql
kube_pod_container_status_restarts_total{namespace="NS"}
kube_pod_status_phase{namespace="NS"}
kube_pod_container_status_waiting_reason{namespace="NS"}
```

### Resource Pressure

```promql
# Memory usage / limit ratio (>0.9 = danger zone)
container_memory_working_set_bytes{namespace="NS", container!=""} /
kube_pod_container_resource_limits{namespace="NS", resource="memory", container!=""}

# CPU throttling
rate(container_cpu_cfs_throttled_seconds_total{namespace="NS"}[5m])

# Network errors
rate(container_network_receive_errors_total{namespace="NS"}[5m])
```

### LogQL Patterns

```logql
# All errors in a namespace
{namespace="NS"} |~ "(?i)(error|fatal|panic)"

# JSON-structured logs — extract and filter fields
{namespace="NS"} | json | level="error"

# Count errors per container over time
sum by (container) (count_over_time({namespace="NS"} |~ "error" [5m]))
```

## OpenTelemetry Note

Many modern services use **OpenTelemetry** instrumentation, not standard Prometheus metric names. If standard `http_requests_total` / `http_request_duration_seconds_bucket` metrics return 0 series, **pivot to Tempo traces** for latency analysis — they provide per-request timing with middleware breakdown.

```shell
bun run scripts/grafana.ts tempo-search \
  '{resource.service.name="SERVICE" && duration>1s}' --range 1h
```
