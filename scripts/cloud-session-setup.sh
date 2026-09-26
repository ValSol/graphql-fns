#!/bin/bash
# Installs dependencies in Claude Code cloud sessions; no-op locally.

if [ "$CLAUDE_CODE_REMOTE" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR" || exit 0

# Project pins yarn@4.x via "packageManager"; corepack provides it.
export COREPACK_ENABLE_DOWNLOAD_PROMPT=0
corepack enable >/dev/null 2>&1 || true

if ! yarn install --immutable; then
  echo "cloud-session-setup: yarn install failed" >&2
fi

exit 0
