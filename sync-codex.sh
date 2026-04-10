#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

ROOT_DIR="$(pwd)"
TARGET_DIR="${ROOT_DIR}/codex/fold/skills"
WORK_DIR="$(mktemp -d)"

cleanup() {
  rm -rf "${WORK_DIR}"
}
trap cleanup EXIT

run() {
  "$@"
}

clone_sparse() {
  local repo="$1"
  local ref="$2"
  local dest="$3"
  shift 3
  local sparse_paths=()
  local path
  for path in "$@"; do
    sparse_paths+=("/${path}")
  done

  run git clone --depth 1 --filter=blob:none --sparse --branch "${ref}" "https://github.com/${repo}.git" "${dest}"
  run git -C "${dest}" sparse-checkout set --no-cone "${sparse_paths[@]}"
}

clone_repo() {
  local repo="$1"
  local ref="$2"
  local dest="$3"

  run git clone --depth 1 --branch "${ref}" "https://github.com/${repo}.git" "${dest}"
}

sync_dir() {
  local source_dir="$1"
  local dest_dir="$2"

  if [[ ! -d "${source_dir}" ]]; then
    echo "missing source directory: ${source_dir}" >&2
    exit 1
  fi

  run mkdir -p "${dest_dir}"
  run rsync -a --delete "${source_dir}/" "${dest_dir}/"
  echo "synced ${dest_dir#${ROOT_DIR}/}"
}

sync_skill_tree() {
  local source_root="$1"
  local prefix="$2"

  if [[ ! -d "${source_root}" ]]; then
    echo "missing source root: ${source_root}" >&2
    exit 1
  fi

  local skill_dir
  for skill_dir in "${source_root}"/*; do
    [[ -d "${skill_dir}" ]] || continue
    local skill_name
    skill_name="$(basename "${skill_dir}")"
    sync_dir "${skill_dir}" "${TARGET_DIR}/${prefix}${skill_name}"
  done
}

sync_skill_mapping() {
  local source_root="$1"
  shift

  local mapping
  for mapping in "$@"; do
    local source_name="${mapping%%:*}"
    local dest_name="${mapping##*:}"
    sync_dir "${source_root}/${source_name}" "${TARGET_DIR}/${dest_name}"
  done
}

sync_single_skill_file() {
  local source_file="$1"
  local dest_name="$2"
  local dest_dir="${TARGET_DIR}/${dest_name}"

  if [[ ! -f "${source_file}" ]]; then
    echo "missing source file: ${source_file}" >&2
    exit 1
  fi

  run mkdir -p "${dest_dir}"
  run cp "${source_file}" "${dest_dir}/SKILL.md"
  echo "synced ${dest_dir#${ROOT_DIR}/}"
}

mkdir -p "${TARGET_DIR}"

# Caveman exposes plain skills and documents `npx skills add` for any agent.
CAVEMAN_DIR="${WORK_DIR}/caveman"
clone_sparse "JuliusBrussee/caveman" "main" "${CAVEMAN_DIR}" \
  "plugins/caveman/skills/caveman" \
  "plugins/caveman/skills/compress"
sync_dir "${CAVEMAN_DIR}/plugins/caveman/skills/caveman" "${TARGET_DIR}/caveman"
sync_dir "${CAVEMAN_DIR}/plugins/caveman/skills/compress" "${TARGET_DIR}/caveman-compress"

# Marketing Skills is a plain skill repo and documents `npx skills add`.
MARKETING_DIR="${WORK_DIR}/marketingskills"
clone_sparse "coreyhaines31/marketingskills" "main" "${MARKETING_DIR}" "skills"
sync_skill_tree "${MARKETING_DIR}/skills" ""

# Impeccable ships a dedicated Codex skill tree under `.codex/skills`.
IMPECCABLE_DIR="${WORK_DIR}/impeccable"
clone_sparse "pbakaus/impeccable" "main" "${IMPECCABLE_DIR}" ".codex/skills"
sync_skill_tree "${IMPECCABLE_DIR}/.codex/skills" "impeccable-"

# last30days ships plain skills; Codex-specific parity is partial but the core skills are portable.
LAST30_DIR="${WORK_DIR}/last30days-skill"
clone_sparse "mvanhorn/last30days-skill" "main" "${LAST30_DIR}" \
  "skills/last30days" \
  "skills/last30days-nux"
sync_dir "${LAST30_DIR}/skills/last30days" "${TARGET_DIR}/last30days"
sync_dir "${LAST30_DIR}/skills/last30days-nux" "${TARGET_DIR}/last30days-nux"

# ETHSkills is a top-level portable skill that routes to remote topic skills.
ETHSKILLS_DIR="${WORK_DIR}/ethskills"
clone_sparse "austintgriffith/ethskills" "master" "${ETHSKILLS_DIR}" "SKILL.md"
sync_single_skill_file "${ETHSKILLS_DIR}/SKILL.md" "ethskills"

# Trail of Bits ships a dedicated Codex sidecar under `.codex/skills`.
TRAIL_DIR="${WORK_DIR}/trailofbits-skills"
clone_repo "trailofbits/skills" "main" "${TRAIL_DIR}"
sync_skill_mapping "${TRAIL_DIR}/.codex/skills" \
  "ask-questions-if-underspecified:trailofbits-ask-questions-if-underspecified" \
  "audit-context-building:trailofbits-audit-context-building" \
  "differential-review:trailofbits-differential-review" \
  "entry-point-analyzer:trailofbits-entry-point-analyzer" \
  "gh-cli:trailofbits-gh-cli" \
  "sharp-edges:trailofbits-sharp-edges" \
  "skill-improver:trailofbits-skill-improver" \
  "designing-workflow-skills:trailofbits-workflow-skill-design" \
  "variant-analysis:trailofbits-variant-analysis" \
  "spec-to-code-compliance:trailofbits-spec-to-code-compliance"

cat <<'EOF'

Skipped parity items:
- `rohitg00/pro-workflow`: Codex support is documented through SkillKit translation rather than a native `.codex/skills` tree.
- `backnotprop/plannotator`: Codex support is CLI-driven (`!plannotator ...`), not a plain skill bundle.
- `openai/codex-plugin-cc`: Claude plugin for using Codex from Claude Code; not applicable inside Codex itself.
- `anthropics/claude-plugins-official`: Claude-only marketplace plugins, not a Codex skill bundle.
- `trailofbits/static-analysis`: present as a Claude plugin, but no matching `.codex/skills/static-analysis` sidecar was found.

Run `./sync.sh` separately to refresh Fold's local shared skills before mirroring them into the Codex plugin tree.
EOF
