# Skill eval

Does the Serupa skill (`skills/serupa/SKILL.md`) make coding agents write better Serupa code? Small tasks a project would give an agent go to Claude Code twice each: once with the skill as its instructions and once without. Then `grade.mjs` scores both answers on what the skill asks for. When an edit to the skill lowers the score, it made agents worse.

```sh
node tools/skill-eval/run.mjs                    # every task, 5 runs each way, 4 at a time
node tools/skill-eval/run.mjs --runs 10 --jobs 6 # more runs, more at once
node tools/skill-eval/run.mjs --only sign-in     # some tasks
node tools/skill-eval/grade.mjs <answers dir>    # grade a folder of <task>.tsx answers again
```

`run.mjs` needs the `claude` CLI signed in. The agent runs in an empty folder with no tools, so it has only the prompt and, in one of the two runs, the skill. The answers go to `results/<date>/with/` and `results/<date>/without/` as `<task>.<run>.tsx`, with each run's cost, tokens, time and length in `meta.json` beside them. The two score tables go to `results/<date>.md`. Commit them. Run it again whenever the skill changes.

## The tasks

`tasks.json` holds each task's prompt and the components a good answer uses. An `"A|B"` entry accepts either one. Thirteen tasks. The first seven are everyday pages: a sign-in form, a team settings table, a confirm-delete, a profile form with a toast, a formatting toolbar, an empty projects list and a search bar with filters. The other six tempt an agent to build the widget by hand, the way a date field can turn into a 300-line calendar: a due date with a picker, a command palette, a three-step wizard, icon buttons with tooltips, a sortable paged table and a settings page with tabs.

## What the grader checks

The grader reads the code only, so it can't tell whether the page works. It checks each answer for:

| Check | Passes when |
|---|---|
| `parses` | the answer is TSX that parses |
| `serupa` | it imports from `serupa-ds` |
| `components` | it uses the components the task expects |
| `no-rebuilds` | it has no native `<button>`, `<input>`, `<select>`, `<textarea>`, `<table>` or `<dialog>` where Serupa has a component, and no widget built by hand: a widget role (`dialog`, `menu`, `listbox`, `option`, `tab`, `tooltip`, …) or `aria-expanded` on a plain element, a month's grid of days, or a panel placed absolutely at `top: 100%` under its trigger |
| `tokens` | it has no raw colors (`#hex`, `rgb()`, `hsl()`), and no pixel sizes or durations in style props, CSS strings or classes such as `p-[12px]` |
| `names` | every form control sits in a `Field` or has its own name, every IconButton has a `label`, and every picture has `alt` |
| `no-div-click` | no `onClick` on a `div`, `span`, `li`, `tr`, `td`, `p`, `img` or `section` |

`tools/test/skill-eval.mjs` checks the grader itself. A good answer passes every check, and each kind of mistake fails only the check that names it.

## Reading the results

Each cell is how many of a task's runs passed that check, in bold when any failed. One run per task can't tell a better skill from a worse one: a check that passes 3 times in 5 shows up as a pass or a fail by chance. Compare pass counts across all the runs instead. A change to the skill is a gain when the counts go up across several tasks, not when one cell moves by one.

Each row also gives the answers' mean length in lines and the agent's mean cost, tokens and seconds. Reusing components should make answers shorter as well as better, so a skill change that adds lines without adding passes is worth a second look.

## The review skill's eval

`review.mjs` does the same for the review skill (`skills/serupa-review/SKILL.md`). Each case in `reviews.json` is a file in `reviews/`: two have seven problems planted in them, Must fix and Should fix, and one is clean. Claude Code reviews each one five times with the two Serupa skills and five times without.

```sh
node tools/skill-eval/review.mjs                          # every case, 5 runs each way
node tools/skill-eval/review.mjs --only invite-member     # some cases
node tools/skill-eval/review.mjs --grade <reviews dir>    # grade a folder of <case>.<run>.md reviews again
```

| Column | Counts |
|---|---|
| Found | planted problems the review names. Each has a pattern a review that found it can't avoid: the component that replaces a hand-built one (`Dialog`, `Alert`), the quoted words, "placeholder" |
| Placed | of those, the ones under the right heading, Must fix or Should fix |
| Verdict | runs whose "Verdict:" line is right: "Not ready" when something was planted, "Ready to merge" when not |
| No alarm | runs of the clean case with nothing under Must fix |

A review can find more than was planted, and that isn't counted against it. The clean case is what keeps the skill honest about that: a review that invents a Must fix in a change that has none fails it. The results go to `results/<date>-review/` and `results/<date>-review.md`.

## Agentic mode

`run.mjs` reads the agent's answer. `agentic.mjs` grades what the agent leaves behind instead. Each run makes a fresh app with `serupa-create`, with the packed package installed, so the agent can read `node_modules/serupa-ds`. Claude Code then works in that app with its tools: read, edit, write, and `npm run`. With the skill, the app's `AGENTS.md` and `CLAUDE.md` send the agent to it. Without the skill, the app has neither file. Then hidden checks run on the app the agent left:

| Check | Passes when |
|---|---|
| typecheck | `npm run typecheck` is clean |
| lint | `npm run lint` is clean |
| render | the built page shows text in `#root`, with no page error and no console error |
| axe | axe finds no WCAG 2.2 A or AA violation in any of the six themes |
| tab | Tab from the top reaches every visible control. A radio group counts once, and so does a roving-tabindex widget. |
| task | the agent did the task: `src/App.tsx` is no longer the starter, and it imports at least half the components the task expects from `serupa-ds` |

The starter app passes the first five checks by itself. So a run whose agent failed (not signed in, timed out, no JSON) fails every check, with the error as the reason, and `task` catches an agent that changed nothing.

```sh
node tools/skill-eval/agentic.mjs --runs 2 --jobs 5             # every task without a start file
node tools/skill-eval/agentic.mjs --only sign-in,filters        # some tasks
node tools/skill-eval/agentic.mjs --grade <app dir>             # grade one app
```

Each run takes about a minute and costs about $0.25. The apps' `src/` and each run's `grade.json` go to `results/<date>-agentic/`, and the table goes to `results/<date>-agentic.md`. The tasks are `tasks.json`'s, except the surgical ones, which start from a file. The code-reading grader stays the fast mode.

The first run, 2026-11-06, had five tasks, two runs each way. All 50 checks passed both with and without the skill. That means these checks don't separate the two modes on these tasks: an agent with tools fixes what typecheck and lint report, and the components carry their own accessibility. Harder tasks are what would separate them, such as a page with several widgets or a change to an existing app.
