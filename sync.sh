#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

npx skills add pbakaus/agent-reviews@resolve-agent-reviews --yes --agent openclaw --skill '*'
npx skills add vercel-labs/agent-browser --yes --agent openclaw --skill 'agent-browser'
npx skills add vercel-labs/agent-browser --yes --agent openclaw --skill 'dogfood'
npx skills add fallow-rs/fallow-skills --yes --agent openclaw --skill '*'
npx skills add boristane/agent-skills --yes --agent openclaw --skill '*'
npx skills add mattpocock/skills --yes --agent openclaw --skill 'tdd'
npx skills add mattpocock/skills --yes --agent openclaw --skill 'ubiquitous-language'
npx skills add vercel/turborepo --yes --agent openclaw --skill '*'
