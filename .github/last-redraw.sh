#!/usr/bin/env bash
# Prints "head_sha,created_at" of the newest push run of Update baselines (visual-baselines.yml) on main whose redraw
# ran and finished: a render shard succeeded. A push run that skipped the redraw while the merge queue was busy succeeds
# too, and counting it kept the redraw from ever running while the queue stayed busy (15 Nov: main's KitchenSink picture
# drifted at 01:50 and failed every queue group for five hours). Prints nothing when none of the last 30 did.
# Needs GH_TOKEN (actions: read) and GITHUB_REPOSITORY.
set -uo pipefail
gh api "repos/$GITHUB_REPOSITORY/actions/workflows/visual-baselines.yml/runs?event=push&branch=main&status=success&per_page=30" \
    --jq '.workflow_runs[] | "\(.id) \(.head_sha),\(.created_at)"' |
  while read -r id rest; do
    n=$(gh api "repos/$GITHUB_REPOSITORY/actions/runs/$id/jobs?per_page=50" \
      --jq '[.jobs[] | select((.name | test("^render \\([0-9]")) and .conclusion == "success")] | length' </dev/null) || continue
    if [ "${n:-0}" -gt 0 ]; then echo "$rest"; break; fi
  done
