# Issue Tracking Reference

Use **linear-cli** to manage Linear issues:

```bash
linear issue create --title "Bug: ..." --team ENG
linear issue list --status "In Progress"
linear issue update <ID> --status "Done"
linear issue comment <ID> "Fixed in <commit>"
```

Supports markdown file-based input (`--description-file`, `--body-file`), file uploads (`--attach`), and direct GraphQL API access (`linear api`).

See the linear-cli skill for full command reference and all available subcommands.
