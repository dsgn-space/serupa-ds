# Working on Serupa

For coding agents, and people, changing this repository. Building an app with Serupa is a different job: [skills/serupa/SKILL.md](skills/serupa/SKILL.md) is for that.

This page is short on purpose and points to the real rules: [CONTRIBUTING.md](CONTRIBUTING.md) is the order to do things in, [tools/README.md](tools/README.md) describes every tool and check, and the README's [Versioning](README.md#versioning) section says what is a patch, a minor or a major.

## Setup

Node 26 (`.nvmrc`), then `npm install` and `npx playwright install chromium`.

## Where things live

- `src/components/<Name>/` holds one component and everything the contract asks for (`node tools/test/contract.mjs` lists it). Start a new one with `npm run new-component`, never by hand.
- `src/internal/` is shared code. A change there reaches every component that uses it, so `node tools/test/run.mjs --since main` tests them all.
- `tokens/serupa.tokens.json` is the source of the design tokens, in the W3C Design Tokens format (ADR-0014). `npm run tokens` makes `tokens.json` from it, then `tokens.css` and `design-tokens/` from `tokens.json`. Never edit `tokens.json` by hand.
- A component's `<name>.tokens.json` is the source of the token table in its README, which `npm run tokens` writes between the `token-table` markers. Change a token's description in the JSON, not the README.
- `dist/` and `src/generated/` are build output: never edit or commit them.
- `docs/adr/` holds the architecture decision records: why tokens, theming, icons, the build and the release work as they do. Read the one behind a part before you change how it works.
- `tools/` never ships. `tools/test/` holds the checks, and their baselines live next to them.

## Fast checks

Run these before every push:

```sh
npm run typecheck
npm run lint
npm run test:unit
node tools/test/run.mjs --since main
```

Before you push, `node tools/ci.mjs --since main` (or `npm run check -- --since main`) runs every job CI requires, the component tests in English and the commit's second language included (`--all-locales` for all four) (`--skip changeset` when the pull request takes `no-changeset`).

## While the repo is on GitLab

The repo lives on GitLab for now, on the free plan's 400 CI minutes a month, which buy only about two runs of the full suite. So a merge request's pipeline is a single job of about half a minute, and everything else runs on your machine (nothing runs on pushes to `main`): the merge request's description must hold a passing `npm run check` report for its head commit (`tools/local-checks-gate.mjs` fails the pipeline otherwise). A merge request merges itself when its pipeline passes: set auto-merge once it's ready (`PUT /merge_requests/<iid>/merge` with `auto_merge=true`, see `tools/README.md`). Never merge one whose pipeline isn't green. The full suite runs on GitLab only in a pipeline started by hand.

On a fresh machine or cloud session, `node tools/setup.mjs` (with any Node) first fetches the Node major `devEngines` asks for, runs `npm ci`, and installs the Chromium revision Playwright pins from Chrome for Testing; put the Node it names on PATH. Before you push, on the branch rebased onto main:

```sh
npm run check -- --clean --since origin/main --report local-checks.md
```

`--clean` starts from `npm ci`, as CI does, and `--report` writes the results (commit, Node, every step with its test counts) as Markdown. Commit first, run it, put the report in the merge request's description (`PUT /merge_requests/<iid>` with `description`), then push: the gate reads the description the pipeline starts with. A report with uncommitted changes, left-out steps or another commit doesn't count.

There is no Release workflow either: after a Release merge request (`npm run version-packages`) lands on `main`, `node tools/tag-release.mjs --make --push` tags the new version the way the workflow did (a prebuilt commit off `main`). Nothing goes to a registry.

## Every pull request

- **One change per pull request.** Fixes for the same component go in one pull request. Different components go in different ones.
- **A fix starts with a test that fails on main.** Write the bug as a user meets it, see the test fail, then fix it. CI runs the changed tests against the base commit's `src/` (`tools/fix-proof.mjs`) and fails when they all pass there; a fix only the screenshots show takes the `no-repro-test` label.
- **Stay in your lane.** Something else you notice goes in an issue or the work queue, not in this pull request. Remove only what your own change left unused.
- **A changeset** (`npx changeset`) when a project using the package gets something different. Otherwise the `no-changeset` label: only tests, tools, docs or workflows changed.
- **Baselines move only on purpose, in the same pull request, with the reason:**
  - Roles, names or structure: `npm run test:aria:update` (`tools/test/baseline-aria/`).
  - Markup: `npm run test:server-html:update` (`tools/test/baseline-server/`).
  - The public API: `node tools/test/api.mjs --update` (`tools/test/baseline-api/`).
  - A component's size: `node tools/test/size.mjs --update <Name>` (`tools/test/baseline-size/`).
  - Shared code (`src/internal/`, the labels) that grows: raise the "All components (index.js)" line of `TOTALS` in `tools/test/size.mjs` by up to 0.5 KiB, with a dated note. A bigger raise needs a reason in the pull request. This goes for any pull request that takes the total over, not only shared code: raise the line in that same pull request, rather than waiting for another one to make room.
  - Looks: add the `update-visual-baselines` label as soon as the pull request opens, so CI draws the new screenshots. Then review them in all six themes: the Design QA job's summary shows each changed story in every theme, before and after.
- **WCAG 2.2 AA in all six themes.**
- **Docs follow [Writing the docs](CONTRIBUTING.md#writing-the-docs):** lead with the point, say how it is now, no queue ids for readers.
- **A failing test is fixed, never skipped.** When it fails in one browser only, find out whether the browser has a real bug (fix the component) or the test assumes too much (fix the test).
