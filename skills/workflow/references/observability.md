# Observability Reference

Use the **grafana** skill when investigating production issues, alerts, logs, metrics, or traces.

## Commands

| Command | Description |
|---------|-------------|
| `datasources` | List all Grafana datasources |
| `alerts` | Show currently firing alerts |
| `loki '<logql>'` | Query Loki logs |
| `prom '<promql>'` | Prometheus range query |
| `prom-instant '<promql>'` | Prometheus instant query |
| `tempo-trace <id>` | Fetch a trace by ID |
| `tempo-search '<traceql>'` | Search traces |

## Investigation Workflow

Parse alert → verify namespace → determine termination reason → pull logs → check resources → correlate traces → synthesize root cause.

See the grafana skill for full query reference and common Kubernetes/PromQL/LogQL patterns.
