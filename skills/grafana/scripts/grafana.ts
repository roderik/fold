#!/usr/bin/env bun
/**
 * Grafana observability CLI — queries Loki, Prometheus, and Tempo through Grafana's datasource proxy API.
 * Credentials are pulled from 1Password via the `op` CLI.
 *
 * Usage:
 *   bun run <this-file> <command> [args...] [--flag value]
 *
 * Commands:
 *   datasources                          List all configured datasources
 *   alerts                               List currently firing alerts
 *   loki '<logql>' [options]             Query Loki logs
 *   prom '<promql>' [options]            Prometheus range query
 *   prom-instant '<promql>'              Prometheus instant query
 *   tempo-trace <traceId>                Get a trace by ID
 *   tempo-search '<traceql>' [options]   Search traces with TraceQL
 *
 * Options (loki/prom/tempo-search):
 *   --range <duration>    Lookback period from now (default: 1h). Examples: 30m, 6h, 24h, 7d
 *   --start <iso>         Absolute start time (overrides --range)
 *   --end <iso>           Absolute end time (defaults to now)
 *   --limit <n>           Max results (loki default: 200, tempo default: 20)
 *
 * Authentication (in order of precedence):
 *   1. GRAFANA_USER / GRAFANA_PASSWORD env vars
 *   2. 1Password CLI fallback
 */

import { execSync } from "child_process";

const GRAFANA_URL = process.env.GRAFANA_URL ?? "http://localhost:3000";
const OP_VAULT = process.env.GRAFANA_OP_VAULT ?? "";
const OP_ITEM = process.env.GRAFANA_OP_ITEM ?? "";

// ── Credentials ──────────────────────────────────────────────────────────────

interface Credentials {
  readonly username: string;
  readonly password: string;
}

function getCredentials(): Credentials {
  const envUser = process.env.GRAFANA_USER;
  const envPass = process.env.GRAFANA_PASSWORD;
  if (envUser && envPass) {
    return { username: envUser, password: envPass };
  }

  // No auth required for local Grafana (default)
  if (!OP_VAULT || !OP_ITEM) {
    return { username: "", password: "" };
  }

  try {
    const json = execSync(
      `op item get "${OP_ITEM}" --vault "${OP_VAULT}" --fields user,password --format json --reveal`,
      { encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] },
    ).trim();
    const fields = JSON.parse(json) as Array<{ label: string; value: string }>;
    const username = fields.find((f) => f.label === "user")?.value;
    const password = fields.find((f) => f.label === "password")?.value;
    if (!username || !password) {
      throw new Error(`Missing fields in 1Password item. Found: ${fields.map((f) => f.label).join(", ")}`);
    }
    return { username, password };
  } catch (err) {
    if (err instanceof SyntaxError) {
      console.error("Failed to parse 1Password response. Ensure the item has 'username' and 'password' fields.");
    } else if (err instanceof Error && err.message.includes("Missing fields")) {
      console.error(err.message);
    } else {
      console.error(
        "Failed to get credentials from 1Password.\n" +
          "Ensure the `op` CLI is installed and you are signed in:\n" +
          "  eval $(op signin)",
      );
    }
    process.exit(1);
  }
}

function basicAuth(creds: Credentials): string {
  return "Basic " + Buffer.from(`${creds.username}:${creds.password}`).toString("base64");
}

// ── HTTP helpers ─────────────────────────────────────────────────────────────

async function grafanaGet(path: string, creds: Credentials, params?: Record<string, string>): Promise<unknown> {
  const url = new URL(path, GRAFANA_URL);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v);
    }
  }

  const headers: Record<string, string> = { Accept: "application/json" };
  if (creds.username && creds.password) {
    headers.Authorization = basicAuth(creds);
  }

  const res = await fetch(url.toString(), { headers });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Grafana ${res.status} ${res.statusText}: ${body.slice(0, 500)}`);
  }
  return res.json();
}

// ── Time helpers ─────────────────────────────────────────────────────────────

const DURATION_MULTIPLIERS: Record<string, number> = {
  s: 1_000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
};

function parseDuration(dur: string): number {
  const match = dur.match(/^(\d+)([smhd])$/);
  if (!match) throw new Error(`Invalid duration "${dur}". Use format: 30m, 1h, 6h, 24h, 7d`);
  return parseInt(match[1]) * DURATION_MULTIPLIERS[match[2]];
}

function resolveTimeRange(flags: Record<string, string>): { startMs: number; endMs: number } {
  const endMs = flags.end ? new Date(flags.end).getTime() : Date.now();
  const startMs = flags.start ? new Date(flags.start).getTime() : endMs - parseDuration(flags.range ?? "1h");
  return { startMs, endMs };
}

function toNanos(ms: number): string {
  return (BigInt(ms) * 1_000_000n).toString();
}

function toUnixSec(ms: number): string {
  return Math.floor(ms / 1000).toString();
}

function autoStep(startMs: number, endMs: number): string {
  const rangeSeconds = (endMs - startMs) / 1000;
  const step = Math.max(15, Math.floor(rangeSeconds / 120));
  return step.toString();
}

// ── Datasource discovery ─────────────────────────────────────────────────────

interface Datasource {
  readonly id: number;
  readonly uid: string;
  readonly name: string;
  readonly type: string;
}

async function listDatasources(creds: Credentials): Promise<readonly Datasource[]> {
  return (await grafanaGet("/api/datasources", creds)) as Datasource[];
}

async function findDatasource(creds: Credentials, type: string): Promise<Datasource> {
  const all = await listDatasources(creds);
  const ds = all.find((d) => d.type === type);
  if (!ds) {
    const available = all.map((d) => `${d.name} (${d.type})`).join(", ");
    throw new Error(`No datasource of type "${type}" found. Available: ${available}`);
  }
  return ds;
}

// ── Commands ─────────────────────────────────────────────────────────────────

async function cmdDatasources(creds: Credentials): Promise<void> {
  const datasources = await listDatasources(creds);
  console.log("=== Grafana Datasources ===\n");
  for (const ds of datasources) {
    console.log(`  [${ds.type}] ${ds.name}  (id=${ds.id}, uid=${ds.uid})`);
  }
  console.log(`\n(${datasources.length} datasources)`);
}

async function cmdAlerts(creds: Credentials): Promise<void> {
  const alerts = (await grafanaGet("/api/alertmanager/grafana/api/v2/alerts", creds)) as Array<{
    status: { state: string };
    labels: Record<string, string>;
    annotations: Record<string, string>;
    startsAt: string;
  }>;

  console.log("=== Active Alerts ===\n");
  if (alerts.length === 0) {
    console.log("  No active alerts.");
    return;
  }

  for (const alert of alerts) {
    const labels = Object.entries(alert.labels)
      .map(([k, v]) => `${k}=${v}`)
      .join(", ");
    console.log(`  [${alert.status.state.toUpperCase()}] ${alert.labels.alertname ?? "unnamed"}`);
    console.log(`    Labels: ${labels}`);
    if (alert.annotations.summary) console.log(`    Summary: ${alert.annotations.summary}`);
    if (alert.annotations.description) console.log(`    Description: ${alert.annotations.description}`);
    console.log(`    Since: ${alert.startsAt}`);
    console.log();
  }
  console.log(`(${alerts.length} alerts)`);
}

async function cmdLoki(creds: Credentials, query: string, flags: Record<string, string>): Promise<void> {
  const ds = await findDatasource(creds, "loki");
  const { startMs, endMs } = resolveTimeRange(flags);
  const limit = flags.limit ?? "200";

  const result = (await grafanaGet(`/api/datasources/proxy/${ds.id}/loki/api/v1/query_range`, creds, {
    query,
    start: toNanos(startMs),
    end: toNanos(endMs),
    limit,
    direction: "backward",
  })) as { data?: { result?: Array<{ stream: Record<string, string>; values: Array<[string, string]> }> } };

  console.log(`=== Loki Logs ===`);
  console.log(`Query: ${query}`);
  console.log(`Range: ${new Date(startMs).toISOString()} → ${new Date(endMs).toISOString()}\n`);

  const streams = result.data?.result ?? [];
  let totalLines = 0;

  for (const stream of streams) {
    const labels = Object.entries(stream.stream)
      .map(([k, v]) => `${k}="${v}"`)
      .join(", ");
    console.log(`--- {${labels}} ---`);

    for (const [ts, line] of stream.values) {
      const date = new Date(Number(BigInt(ts) / 1_000_000n));
      console.log(`[${date.toISOString()}] ${line}`);
      totalLines++;
    }
    console.log();
  }

  console.log(`(${totalLines} lines from ${streams.length} streams)`);
}

async function cmdProm(creds: Credentials, query: string, flags: Record<string, string>): Promise<void> {
  const ds = await findDatasource(creds, "prometheus");
  const { startMs, endMs } = resolveTimeRange(flags);
  const step = flags.step ?? autoStep(startMs, endMs);

  const result = (await grafanaGet(`/api/datasources/proxy/${ds.id}/api/v1/query_range`, creds, {
    query,
    start: toUnixSec(startMs),
    end: toUnixSec(endMs),
    step,
  })) as {
    data?: {
      resultType: string;
      result: Array<{ metric: Record<string, string>; values: Array<[number, string]> }>;
    };
  };

  console.log(`=== Prometheus Range Query ===`);
  console.log(`Query: ${query}`);
  console.log(`Range: ${new Date(startMs).toISOString()} → ${new Date(endMs).toISOString()}, step=${step}s\n`);

  const series = result.data?.result ?? [];
  for (const s of series) {
    const labels = Object.entries(s.metric)
      .map(([k, v]) => `${k}="${v}"`)
      .join(", ");
    console.log(`--- {${labels}} ---`);

    for (const [ts, val] of s.values) {
      console.log(`  ${new Date(ts * 1000).toISOString()}  ${val}`);
    }
    console.log();
  }

  console.log(`(${series.length} series)`);
}

async function cmdPromInstant(creds: Credentials, query: string): Promise<void> {
  const ds = await findDatasource(creds, "prometheus");

  const result = (await grafanaGet(`/api/datasources/proxy/${ds.id}/api/v1/query`, creds, {
    query,
    time: toUnixSec(Date.now()),
  })) as {
    data?: {
      resultType: string;
      result: Array<{ metric: Record<string, string>; value: [number, string] }>;
    };
  };

  console.log(`=== Prometheus Instant Query ===`);
  console.log(`Query: ${query}\n`);

  const results = result.data?.result ?? [];
  for (const r of results) {
    const labels = Object.entries(r.metric)
      .map(([k, v]) => `${k}="${v}"`)
      .join(", ");
    console.log(`  {${labels}}  →  ${r.value[1]}`);
  }

  console.log(`\n(${results.length} results)`);
}

async function cmdTempoTrace(creds: Credentials, traceId: string): Promise<void> {
  const ds = await findDatasource(creds, "tempo");

  const result = (await grafanaGet(`/api/datasources/proxy/${ds.id}/api/traces/${traceId}`, creds)) as {
    batches?: Array<{
      resource?: { attributes?: Array<{ key: string; value: { stringValue?: string } }> };
      scopeSpans?: Array<{
        spans?: Array<{
          traceId: string;
          spanId: string;
          operationName?: string;
          name?: string;
          startTimeUnixNano: string;
          endTimeUnixNano: string;
          status?: { code?: number; message?: string };
          attributes?: Array<{ key: string; value: { stringValue?: string; intValue?: string } }>;
        }>;
      }>;
    }>;
  };

  console.log(`=== Tempo Trace ===`);
  console.log(`TraceID: ${traceId}\n`);

  const batches = result.batches ?? [];
  let spanCount = 0;

  for (const batch of batches) {
    const serviceName =
      batch.resource?.attributes?.find((a) => a.key === "service.name")?.value?.stringValue ?? "unknown";
    console.log(`Service: ${serviceName}`);

    for (const scope of batch.scopeSpans ?? []) {
      for (const span of scope.spans ?? []) {
        const name = span.name ?? span.operationName ?? "unnamed";
        const startNs = BigInt(span.startTimeUnixNano);
        const endNs = BigInt(span.endTimeUnixNano);
        const durationMs = Number((endNs - startNs) / 1_000_000n);
        const startTime = new Date(Number(startNs / 1_000_000n)).toISOString();
        const statusCode = span.status?.code ?? 0;
        const statusStr = statusCode === 2 ? " ERROR" : statusCode === 1 ? " OK" : "";

        console.log(`  [${startTime}] ${name} (${durationMs}ms)${statusStr} spanId=${span.spanId}`);
        spanCount++;
      }
    }
    console.log();
  }

  console.log(`(${spanCount} spans across ${batches.length} services)`);
}

async function cmdTempoSearch(creds: Credentials, query: string, flags: Record<string, string>): Promise<void> {
  const ds = await findDatasource(creds, "tempo");
  const { startMs, endMs } = resolveTimeRange(flags);
  const limit = flags.limit ?? "20";

  const result = (await grafanaGet(`/api/datasources/proxy/${ds.id}/api/search`, creds, {
    q: query,
    start: toUnixSec(startMs),
    end: toUnixSec(endMs),
    limit,
  })) as {
    traces?: Array<{
      traceID: string;
      rootServiceName: string;
      rootTraceName: string;
      startTimeUnixNano: string;
      durationMs: number;
    }>;
  };

  console.log(`=== Tempo Search ===`);
  console.log(`Query: ${query}`);
  console.log(`Range: ${new Date(startMs).toISOString()} → ${new Date(endMs).toISOString()}\n`);

  const traces = result.traces ?? [];
  for (const t of traces) {
    const startTime = new Date(Number(BigInt(t.startTimeUnixNano) / 1_000_000n)).toISOString();
    console.log(`  ${t.traceID}  ${t.rootServiceName}/${t.rootTraceName}  ${t.durationMs}ms  ${startTime}`);
  }

  console.log(`\n(${traces.length} traces)`);
}

// ── CLI ──────────────────────────────────────────────────────────────────────

interface ParsedArgs {
  readonly command: string;
  readonly positional: readonly string[];
  readonly flags: Record<string, string>;
}

function parseArgs(argv: readonly string[]): ParsedArgs {
  const command = argv[0] ?? "";
  const positional: string[] = [];
  const flags: Record<string, string> = {};

  let i = 1;
  while (i < argv.length) {
    if (argv[i].startsWith("--")) {
      const key = argv[i].slice(2);
      flags[key] = argv[i + 1] ?? "";
      i += 2;
    } else {
      positional.push(argv[i]);
      i++;
    }
  }

  return { command, positional, flags };
}

function printUsage(): void {
  console.log(`Usage: bun run grafana.ts <command> [args...] [--flag value]

Commands:
  datasources                          List configured datasources
  alerts                               List firing alerts
  loki '<logql>' [--range 1h] [--limit 200]
  prom '<promql>' [--range 1h] [--step 15]
  prom-instant '<promql>'
  tempo-trace <traceId>
  tempo-search '<traceql>' [--range 1h] [--limit 20]

Time options:
  --range <duration>    Lookback from now (default: 1h). E.g. 30m, 6h, 24h, 7d
  --start <iso>         Absolute start time (overrides --range)
  --end <iso>           Absolute end time (default: now)
  --limit <n>           Max results`);
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  if (!args.command || args.command === "help" || args.command === "--help") {
    printUsage();
    return;
  }

  const creds = getCredentials();

  switch (args.command) {
    case "datasources":
      return cmdDatasources(creds);
    case "alerts":
      return cmdAlerts(creds);
    case "loki": {
      const query = args.positional[0];
      if (!query) throw new Error("loki requires a LogQL query argument");
      return cmdLoki(creds, query, args.flags);
    }
    case "prom": {
      const query = args.positional[0];
      if (!query) throw new Error("prom requires a PromQL query argument");
      return cmdProm(creds, query, args.flags);
    }
    case "prom-instant": {
      const query = args.positional[0];
      if (!query) throw new Error("prom-instant requires a PromQL query argument");
      return cmdPromInstant(creds, query);
    }
    case "tempo-trace": {
      const traceId = args.positional[0];
      if (!traceId) throw new Error("tempo-trace requires a trace ID argument");
      return cmdTempoTrace(creds, traceId);
    }
    case "tempo-search": {
      const query = args.positional[0];
      if (!query) throw new Error("tempo-search requires a TraceQL query argument");
      return cmdTempoSearch(creds, query, args.flags);
    }
    default:
      console.error(`Unknown command: "${args.command}"`);
      printUsage();
      process.exit(1);
  }
}

main().catch((err) => {
  console.error(`Error: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
