# ADR-0016: A pull request's pictures are compared with main's drawn on the spot

**Status:** Accepted
**Accepted:** 15 November 2026, after the merge queue dropped 14 picture pull requests in two hours.

## Context

Each pull request that changed a look committed its own screenshots (`tools/test/baseline-visual/`), drawn on the main it left. CI compared each run with those files, and the merge queue compared each group with them too. When another pull request that touched the same components merged first, the committed pictures no longer matched the tree they would merge into. The queue's `fresh` check then dropped the pull request, which also turned its auto-merge off. A person or a bot had to merge main into the branch, draw the pictures again and queue it again, and a busy queue made more of them stale meanwhile. Gates and heals (#1990, #1996) shortened that loop but couldn't end it: a committed picture is a copy of main's look, and any merge makes it old.

## Decision

- **Visual on a pull request draws main too.** Its jobs build Storybook from the commit the pull request merges into, in a worktree beside the branch's, and draw main's pictures of the components the change reaches (`SERUPA_VISUAL_BASE`, `tools/test/run.mjs`). They then draw the branch's and report every picture that differs, every new story and every story gone (`SERUPA_VISUAL_REPORT`, `tools/test/visual.mjs`). A difference is the change to review, not a failure. A story that can't be drawn still fails.
- **The review is the gate.** CI's `visual review` job (`tools/visual-review.mjs`) puts each changed picture, main's and the branch's side by side, in its summary, with the pictures on the branch `visual-review/pr-<number>`. It passes when nothing differs, or once the `design-qa` label was added after the pull request's last commit that isn't a merge. Whoever owns the pull request reviews and adds the label, and adding it runs the job again (`design-qa.yml`). A merge of main doesn't ask for it again.
- **The queue doesn't draw pictures.** A group runs no Visual job and no `fresh` check: the pull request's review saw its change against main, and nothing committed has to be fresh to merge.
- **No picture is committed** (since 21 November 2026). Every Visual run draws the pictures it compares with: `tools/test/run.mjs --group visual` builds the base commit's Storybook in a worktree beside the tree (`tools/test/visual-base.mjs`; `SERUPA_VISUAL_REF`, else where the branch left main) and draws it first. On main itself it draws the tree twice and fails on a story that comes out different, which is what the nightly flake hunt and Cross-browser (Firefox and WebKit) check. The release notes' before and after pictures are drawn by the Release workflow from the two releases' commits and attached to the GitHub release (`tools/release-screenshots.mjs`). The pictures had been 438 MB and 83% of the repository's files, rewritten by every merge that changed a look.

## Consequences

- A pull request's Visual jobs build Storybook twice and draw the reached components twice: a few minutes longer, on the pull request, where it delays no one else. The queue's run loses its longest jobs.
- Two pull requests that change one component are each reviewed against the main they left; the second merges on top of the first without a review of the two together. The next pull request to change that component shows the merged look as its "before".
- `update-visual-baselines` now measures only the utility classes' baseline (`tools/test/baseline-utilities.json`), and `update-cross-browser-baselines` is gone.
- A local run builds main's Storybook once per main commit (kept in `<repo>-visual-base/`), about two minutes, before it draws.
- Revisit: main's pictures could come from a cache keyed by main's commit, filled after each merge, if drawing them on demand costs too much.
