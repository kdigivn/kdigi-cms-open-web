#!/usr/bin/env bash
# Generates raw 3D illustrations with the Codex built-in image_gen tool (`codex exec`, logged-in CLI, no separate API key).
#
# Usage:  illustrations-src/gen.sh [key ...]     no args = every key in keys.py; raw PNGs land in raw/ (gitignored)
#         then: python3 illustrations-src/process.py [key ...]
# Env:    JOBS (parallel codex runs, default 3)
# Cost:   one image per key per run; Codex output is not deterministic, so regenerate only off-style keys.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
OUT="$HERE/raw"
JOBS=${JOBS:-3}
mkdir -p "$OUT"

names=("$@")
if [ ${#names[@]} -eq 0 ]; then mapfile -t names < <(python3 "$HERE/keys.py" list); fi

run() {
  local n=$1 prompt
  prompt=$(python3 "$HERE/keys.py" prompt "$n")
  if (cd "$OUT" && timeout 600 codex exec --skip-git-repo-check -s workspace-write \
      "Use your built-in image_gen tool to generate exactly ONE image from the prompt below, then copy the generated PNG file to $OUT/$n.png and reply with that path only. Prompt: $prompt" \
      > "$OUT/$n.log" 2>&1) && [ -s "$OUT/$n.png" ]; then
    echo "ok $n"
  else
    echo "FAIL $n (see raw/$n.log)"
  fi
}

running=0
for n in "${names[@]}"; do
  run "$n" &
  running=$((running + 1))
  if [ "$running" -ge "$JOBS" ]; then wait -n || true; running=$((running - 1)); fi
done
wait
