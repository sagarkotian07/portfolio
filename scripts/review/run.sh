#!/bin/bash
# Codex review round: builds, captures frames with Playwright, sends references + frames to Codex, saves the review.
# Usage: scripts/review/run.sh <round-number>
set -euo pipefail
ROUND=${1:-1}
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
OUT="${REVIEW_OUT:-$ROOT/qa/review}/round-$ROUND"
REF="${REVIEW_REF:-/Users/sagarkotian/.claude/image-cache/788137eb-dea9-458c-bf02-670e3d23f4a4}"
VID="${REVIEW_VID:-/private/tmp/claude-501/-Users-sagarkotian/788137eb-dea9-458c-bf02-670e3d23f4a4/scratchpad/video-ref/frames}"
mkdir -p "$OUT"
cd "$ROOT"
npx vite build >/dev/null 2>&1
node scripts/qa-game.mjs http://localhost:4173/ "$OUT" > "$OUT/qa.txt" 2>&1 || true
cat "$OUT/qa.txt" | tail -3
IMGS=(-i "$REF/11.png" -i "$REF/13.png" -i "$REF/15.png" -i "$REF/16.png" -i "$VID/f002.png" -i "$VID/f005.png" -i "$VID/f008.png")
for f in game-bottom game-spring game-island game-plank game-top phone-game; do IMGS+=(-i "$OUT/$f.png"); done
PROMPT="$(cat scripts/review/brief.md)

QA result of the scripted run and the phone touch test:
$(tail -3 "$OUT/qa.txt")

Attached images: 7 reference images first (four screenshots, three playthrough stills), then our 6 captures in this order: bottom of the level (start), the vine spring island, the big island mid-climb, the moving plank, the top with the flower, and the phone view."
printf '%s' "$PROMPT" > "$OUT/prompt.txt"
codex exec -s read-only "${IMGS[@]}" < "$OUT/prompt.txt" > "$OUT/review.md" 2> "$OUT/codex.log" || true
echo "--- review saved to $OUT/review.md"
grep -E "^VERDICT|VERDICT:" "$OUT/review.md" | tail -1 || echo "no verdict line"
