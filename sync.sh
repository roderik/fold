#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

CODEX_SKILLS_DIR="codex/fold/skills"
MANUAL_SKILLS=("audit" "workflow" "grafana" "linear-cli")

npx skills add pbakaus/agent-reviews@resolve-agent-reviews --yes --agent openclaw --skill '*'
npx skills add vercel-labs/agent-browser --yes --agent openclaw --skill 'agent-browser'
npx skills add vercel-labs/agent-browser --yes --agent openclaw --skill 'dogfood'
npx skills add fallow-rs/fallow-skills --yes --agent openclaw --skill '*'
npx skills add boristane/agent-skills --yes --agent openclaw --skill '*'
npx skills add mattpocock/skills --yes --agent openclaw --skill 'tdd'
npx skills add mattpocock/skills --yes --agent openclaw --skill 'ubiquitous-language'
npx skills add vercel/turborepo --yes --agent openclaw --skill '*'

mkdir -p "$CODEX_SKILLS_DIR"

for skill_dir in skills/*; do
  [[ -d "$skill_dir" ]] || continue

  skill_name="$(basename "$skill_dir")"

  case " ${MANUAL_SKILLS[*]} " in
    *" $skill_name "*) continue ;;
  esac

  rsync -a --delete "$skill_dir/" "$CODEX_SKILLS_DIR/$skill_name/"
done
