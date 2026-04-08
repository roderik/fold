#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

npx skills add pbakaus/agent-reviews@resolve-agent-reviews --yes --agent openclaw --skill '*'
npx skills add vercel-labs/agent-browser --yes --agent openclaw --skill '*'
