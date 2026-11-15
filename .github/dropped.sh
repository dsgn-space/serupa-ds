#!/usr/bin/env bash
# Prints how many times the merge queue dropped a pull request since its head commit, when the queue's drop is the last
# word on it: its last queue or auto-merge event is removed_from_merge_queue by github-merge-queue[bot], and it isn't
# merged: 0 when its branch changed since the drop (a heal pushed). Prints "queued" when it is in the queue (the queue
# reads auto-merge off then too), and "-" otherwise (armed by a person since, turned to a draft, or never dropped).
# Update baselines' heal takes a queued pull request whose pictures main made stale out of the queue itself (its branch
# can't take the merge while queued, GH006) and labels it "queue-stale": with that label, a removal by anyone counts as
# the queue's.
# A drop turns auto-merge off. Until 15 Nov that kept a dropped pull request out until its author turned it on again,
# and nearly every drop was a stale picture another queued pull request made, so a person re-armed a dozen an hour.
# Dropped by the queue counts as still on its way: Update baselines heals it and Queue enqueue queues it again. A person
# keeps one out with the "hold-visual" label or a draft.
#   bash .github/dropped.sh <number>   (GH_TOKEN, GITHUB_REPOSITORY)
set -uo pipefail
n=$1
events=$(gh api --paginate "repos/$GITHUB_REPOSITORY/issues/$n/timeline?per_page=100" \
  --jq '.[] | select(.event | test("^(added_to_merge_queue|removed_from_merge_queue|auto_merge_enabled|auto_merge_disabled|convert_to_draft|ready_for_review|merged)$")) | "\(.created_at) \(.event) \(.actor.login // "")"') || { echo -; exit 0; }
last=$(tail -n1 <<< "$events")
pull=$(gh api "repos/$GITHUB_REPOSITORY/pulls/$n") || { echo -; exit 0; }
stale=$(jq -r '[.labels[].name] | index("queue-stale") != null' <<< "$pull")
case "$last" in
  *" added_to_merge_queue "*) echo queued; exit 0 ;;
  *" removed_from_merge_queue github-merge-queue[bot]") ;;
  *" removed_from_merge_queue "*) [ "$stale" = true ] || { echo -; exit 0; } ;;
  *) echo -; exit 0 ;;
esac
since=$(gh api "repos/$GITHUB_REPOSITORY/commits/$(jq -r .head.sha <<< "$pull")" --jq .commit.committer.date) || { echo -; exit 0; }
awk -v since="$since" -v any="$stale" '$1 > since && $2 == "removed_from_merge_queue" && ($3 == "github-merge-queue[bot]" || any == "true") { n++ } END { print n + 0 }' <<< "$events"
