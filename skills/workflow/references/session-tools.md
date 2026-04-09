# Session Management Tools Reference

## Pro Workflow Session Tools

| Skill | Purpose |
|-------|---------|
| `/pro-workflow:cost-tracker` | Track session costs, set budget alerts |
| `/pro-workflow:insights` | Session analytics, learning patterns, productivity metrics |
| `/pro-workflow:session-handoff` | Generate structured handoff for resuming later |
| `/pro-workflow:compact-guard` | Save state before compaction, restore after |
| `/pro-workflow:replay-learnings` | Surface past learnings relevant to current task |
| `/pro-workflow:safe-mode` | Prevent destructive operations (cautious/lockdown/clear) |
| `/pro-workflow:sprint-status` | Track parallel work sessions |
| `/pro-workflow:context-engineering` | Manage token budgets and compaction strategies |
| `/pro-workflow:file-watcher` | Auto-react to config/env/dependency changes |
| `/pro-workflow:mcp-audit` | Audit MCP servers for token overhead and redundancy |
| `/pro-workflow:permission-tuner` | Optimize allow/deny rules from denial patterns |
| `/pro-workflow:llm-gate` | LLM-powered quality validation via hooks |

## Scheduling

Use `/schedule` to create remote agents that execute on a cron schedule. For one-off remote triggers, use `RemoteTrigger`.
