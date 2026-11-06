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
