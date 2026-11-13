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
- `site/` is the docs site (`npm run site`): it draws the same .mdx pages, stories and types Storybook does, so a page is never written twice. Its blocks are in `site/src/blocks.tsx`; `node tools/test/site.mjs` opens every page.
- `dist/` and `src/generated/` are build output, and so are Storybook's and the site's own folders: never edit or commit them.
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

Before you push, `node tools/ci.mjs --since main` (or `npm run check -- --since main`; the pre-push hook that `npm install` sets up runs a five-minute part of it on every push: types, lint and the component tests of what the push adds) runs every job CI requires, the component tests in English and the commit's second language included (`--all-locales` for all four) (`--skip changeset` when the pull request takes `no-changeset`).

## Pull requests and CI

The repo is on GitHub. Every change goes on its own branch and pull request, never straight to `main`. Turn on auto-merge once a pull request is ready: it joins the merge queue when its own checks pass, and the queue merges it when the queue's run passes. Never merge one that isn't green, and never bypass the queue.

- A pull request's own run (`.github/workflows/ci.yml`) is the quick check: `fresh` (the branch changed a component's pictures and main changed that component: merge main and redraw them), build, types and lint, the changeset check, the fix proof, the checks, and the tests (in English, and the changed components' own tests in the other languages), Visual and Storybook checks of the components it changes.
- The merge queue runs every job but coverage (each pull request checked its own new functions) on the commit that becomes `main` (up to five pull requests at once): the component tests in the other languages, all of Storybook's pages, consumer and frameworks too, with the tests narrowed as a pull request's are, against the group before it. `main`'s own run is then build only, and the nightly flake hunt tests `main` whole, with the coverage floors.
- Without the queue (repository variable `SERUPA_QUEUE` not `1`), a pull request runs everything itself.
- Jobs run in Playwright's image on GitHub's runners or the project's own (repository variables `SERUPA_RUNNER` and `SERUPA_X86_RUNNER`; see "The CI runner" in `tools/README.md`). The nightly jobs are in `.github/workflows/nightly.yml`, `.github/workflows/cross-browser.yml`, `.github/workflows/canary.yml` and `.github/workflows/screen-readers.yml`.

On a fresh machine or cloud session, `node tools/setup.mjs` (with any Node) first fetches the Node major `devEngines` asks for, runs `npm ci`, and installs the Chromium revision Playwright pins from Chrome for Testing; put the Node it names on PATH. Run the fast checks above before pushing; push fixes in one batch, since every push restarts the pull request's run.

Releases are the Release workflow's job again: merging the Release pull request tags the version (a prebuilt commit off `main`) and makes the GitHub release.

## Every pull request

- **One kind of change per pull request, batched.** Work of the same kind goes in one pull request, even across many components: several fixes, one token or style change applied everywhere, a round of tooling fixes. Every pull request costs a full CI run and a queue slot, so don't open one per component or per tiny fix. Split only work of different kinds, or changes that touch the same baselines as another open pull request.
- **A fix starts with a test that fails on main.** Write the bug as a user meets it, see the test fail, then fix it. CI runs the changed tests against the base commit's `src/` (`tools/fix-proof.mjs`) and fails when they all pass there; a fix only the screenshots show takes the `no-repro-test` label.
- **Stay in your lane.** Something else you notice goes in an issue or the work queue, not in this pull request. Remove only what your own change left unused.
- **Every function you add to `src/` runs in a test.** The coverage job names any added function no test ran (`tools/coverage-new-functions.mjs`), because one untested handler can take main under its coverage floor. Cover it in the component's own tests, or remove it when nothing calls it.
- **A changeset** (`npx changeset`) when a project using the package gets something different. Otherwise the `no-changeset` label: only tests, tools, docs or workflows changed.
- **Baselines move only on purpose, in the same pull request, with the reason:**
  - Roles, names or structure: `npm run test:aria:update` (`tools/test/baseline-aria/`).
  - Markup: `npm run test:server-html:update` (`tools/test/baseline-server/`).
  - The public API: `node tools/test/api.mjs --update` (`tools/test/baseline-api/`).
  - A component's size: `node tools/test/size.mjs --update <Name>` (`tools/test/baseline-size/`).
  - Shared code (`src/internal/`, the labels) that grows: raise the "All components (index.js)" line of `TOTALS` in `tools/test/size.mjs` by up to 0.5 KiB, with a dated note. A bigger raise needs a reason in the pull request. This goes for any pull request that takes the total over, not only shared code: raise the line in that same pull request, rather than waiting for another one to make room.
  - Looks: add the `update-visual-baselines` label as soon as the pull request opens (or end the commit with a `Redraw-baselines: visual` trailer, which adds it; `cross-browser` for the other label), so CI draws the new screenshots. Then review them in all six themes: the Design QA job's summary shows each changed story in every theme, before and after. The Firefox and WebKit pictures (`tools/test/baseline-visual-firefox/`, `tools/test/baseline-visual-webkit/`) are checked nightly by Cross-browser; the `update-cross-browser-baselines` label redraws them. A change that moves many looks at once (a theme, a shared token) adds that label too, in the same pull request, or the nightly Visual jobs fail on every story until someone does.
- **WCAG 2.2 AA in all six themes.**
- **Docs follow [Writing the docs](CONTRIBUTING.md#writing-the-docs):** lead with the point, say how it is now, no queue ids for readers.
- **A failing test is fixed, never skipped.** When it fails in one browser only, find out whether the browser has a real bug (fix the component) or the test assumes too much (fix the test).
