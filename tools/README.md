# Tools

Everything needed to maintain Serupa: the test suite, the design tokens export, the custom icon build, the release script and the CSS trimmer. Nothing here ships to products; consumers only need the package: `tokens.css`, `dist/` and `fonts/`.

## Setup

Clone the repository, then from its folder:

```sh
npm install                       # the build (tsup, TypeScript), React, Playwright and Style Dictionary
npx playwright install chromium   # add firefox webkit to run the suite in those too
```

Node 24 (`.nvmrc`; 22.18 or later works). Dependencies are pinned to exact versions; Dependabot (`.github/dependabot.yml`) opens grouped update pull requests every Monday, for npm and the GitHub Actions, and CI decides whether each one lands. CodeQL (`.github/workflows/codeql.yml`) scans the code and the workflows on every pull request and weekly. Nothing else: Python is only needed to rebuild the Material Symbols from the font (`tools/icons/material.py`), which the font never changing makes rare.

## Build

```sh
npm run build       # src/ → dist/ (tools/build/build.mjs: tsup for the JavaScript and types, then the CSS)
npm run typecheck   # tsc over src/ (strict), then tools/ and bin/ (JavaScript, checked from JSDoc)
npm run lint        # ESLint (TypeScript, React hooks rules, the tools) and Stylelint (the CSS)
```

`dist/` is build output: never edit it, and it isn't committed. The utility classes come from `src/styles/utilities.template.css`: `tools/utilities/build.mjs` expands its `@each` loops over the tokens in `tokens.json` (so a new color or spacing token gets its classes) and its `@responsive` list into the `sm:` … `2xl:` variants, writing `src/styles/utilities.css` (not committed). The build, `npm run lint`, Storybook and Vitest run it first; `tools/utilities/template.mjs` describes the syntax. A new component's CSS joins `components.css` in the order of the `@import` list in `src/styles/index.css`.

## Test suite

```sh
npm test                                  # builds, then runs everything (about two minutes)
node tools/test/run.mjs                   # everything, against the dist/ you built last
node tools/test/run.mjs --update          # accept intended changes as the new baselines
node tools/test/run.mjs --browser webkit  # the suite in WebKit (or firefox); baselines are kept per engine
node tools/test/run.mjs --compat safari   # add the cross-browser comparison (safari, firefox or webkitgtk)
node tools/test/run.mjs --list            # the steps it would run (with --group, of one group)
npm run test:unit                         # only the component tests (Vitest), straight from src/, in a few seconds
npm run test:watch                        # the same, re-running as you edit
npm run test:coverage                     # the same, and which lines they run (coverage/index.html)
npx vitest run src/components/Checkbox    # one component's tests
```

### Component tests

Each component's behaviour test sits next to it as `src/components/<Name>/<Name>.test.tsx`. They run in
[Vitest](https://vitest.dev) browser mode: a real Chromium through Playwright, so computed styles, focus and
the keyboard behave as they do for people (set `SERUPA_BROWSER=firefox` or `webkit` for another engine). They
render the components from `src/` with `vitest-browser-react`, find things the way people do
(`page.getByRole('checkbox', { name: 'Newsletter' })`), and each `test()` names one behaviour, so a failure
says which one broke, with the expected and received values and a screenshot. Shared helpers (resolved
colors, WCAG contrast in all six themes) are in `tools/test/vitest/helpers.ts`.

Accordion, Alert, Avatar, AvatarGroup, Badge, Breadcrumb, Calendar, Card, Checkbox, Combobox, Container, DatePicker, DateRangePicker, Dialog, Divider, Drawer, EmptyState, Field, FileUpload, Grid, Heading, Image, Input, Kbd, Link, List, Loader, Menu, Navbar, NumberInput, Pagination, PasswordInput, Popover, Progress, Radio, SearchInput, SegmentedControl, Select, Sidebar, Slider, Stack, Stepper, Switch, Table, Tabs, Text, Textarea, TimePicker, Toast, Tooltip and VisuallyHidden have moved; the other components are still tested by the scripts in
the table below, listed in `SCRIPT_TESTED` in `contract.mjs`. Move them one at a time: write the test file,
delete the script, take the component off `SCRIPT_TESTED`. A new component needs
its own `<Name>.test.tsx`; the contract check fails without one.

### Suite scripts

| Test | What it checks |
| --- | --- |
| `package.mjs` | The package as a project installs it: every file in `exports` exists, React is a peer dependency, `dist/index.js` imports in Node and every component renders on the server with no browser globals or React warnings, `dist/index.d.ts` declares every component, and `bundle.css` is exactly `components.css` + `utilities.css` |
| `package-lint.mjs` | The package exactly as a release ships it, through publint (package.json fields, `exports`, file formats) and Are the Types Wrong (every export's types resolve in Node 16+ and bundlers; ESM only, so CommonJS projects `import()` it) |
| `foundation.mjs` | Contrast of 24 text, control and focus pairs in all six themes (WCAG 2.2) · responsive variants switch at the `screen-*` values · `base.css` reads tokens only · `tokens.json` names are unique and valid · `bundle.css` under 2 MB · every `var()` names a real token, with no fallback value · every stylesheet keeps its rules in its `dk.*` cascade layer · no utility class writes out a value a token holds · Button and Icon use only tokens · every component token (Button, Spinner) refers to a shared token, and the CSS uses each one with exactly the default its tokens file gives · nothing loads from another server · `tokens.css` is in step with `tokens.json` · every width in a media query in `src/` (CSS and `matchMedia()`) is a `screen-*` value (a `max-width` may be the value − 0.02px or − 1px) · one brand list: `theme.js` (`BRANDS`, its default and header), the `ThemeBrand` type and every theme list written out in `tools/test/` match `tokens.json`'s `color.themes`, each brand with a light and a dark theme, and Storybook's toolbar reads `tokens.json` |
| `design-tokens.mjs` | `design-tokens/` is in step with `tokens.json`; every token has a standard `$type` and a value of the right shape (DTCG 2025.10); every reference resolves; every token in `tokens.json` is exported somewhere |
| `style_dictionary.mjs` | Builds `design-tokens/` with Style Dictionary 5 through `tools/tokens/style-dictionary.config.mjs` together with the component tokens, and checks every variable it outputs equals the token, in every theme (skipped if Style Dictionary isn't installed) |
| `utilities.mjs` | All 25,559 utility classes (including the `sm:` … `2xl:` versions), each rendered on its own and compared with `baseline-utilities.json` (computed styles on the element and its children, plus the system's `--dk-*` variables and `::placeholder`) |
| `api.mjs` | The public API: `dist/index.d.ts` without comments, compared with `baseline-api.d.ts`. A removed export fails as breaking, a new one as minor, and any other change in an exported type needs a look; `--update` accepts it (with a changeset) |
| `button.mjs` | 38 behaviour checks: form submission and `type`, loading (blocks clicks, keys and Enter-key resubmission, keeps focus and name, announces "Loading", centered spinner), links (`href` through `Serupa.configure`, `rel` for new tabs, refs, disabled links without `href`), the API names, native attributes (`form*`, `popoverTarget`, `command`), Icon accessibility, reduced motion, component tokens (overrides on a container and on one button, defaults that follow a nested theme), and that Buttons and Spinners can be unmounted without errors |
| `button-motion.mjs` | Button's micro-interactions: press (97% while held by pointer or Enter, back on release, the click still fires once, scale only at 100ms), right-icon nudge (off by default; turned on, 2px, mirrored in right-to-left, left icons still), loading cross-fade, ripple (from the press point, covers the far corner, text color at 20%, under the label, no pointer events, removed after release, spreads all the way before fading so a quick click shows the whole wave); none on link, disabled or loading buttons, right-clicks or when your `onPointerDown` prevents the default; your handlers still run; each component token turns its interaction off; reduced motion turns press, nudge and ripple off |
| `icon-builder.mjs` | The custom icon build (`tools/icons/build.mjs`): accepts Figma, Illustrator and outlined exports and draws them in `currentColor`; refuses scripts, event handlers, links, images, text, gradients, masks, DOCTYPEs, other grids, second colors and bad names, each with its reason; repeatable; `--check` notices a stale bundle; a bad file leaves the bundle untouched; the icons now in `src/icons.ts` and `dist/index.d.ts` are exactly the build's output |
| `icons.mjs` | Builds two sample icons into a scratch bundle and checks them in the browser: an inline SVG in the 1em box, 24px by default and `size` honoured, the text color (also inline in text and in a nested theme), the same line position as font icons, `aria-hidden` by default and `role="img"` with `aria-label`, Button icon sizes, icon-only and loading, the font for every other name, and real pixels |
| `visual.mjs` | Each component preview in all six themes, at rest, hovered and focused, compared with `baseline-visual/` (0.2% pixel tolerance for anti-aliasing). Hover and focus act on the element the preview marks with `data-visual-target`, or `data-visual-target="hover"` and `="focus"` when the two states need different elements (an unselected tab to hover, the selected one to focus); focus comes from pressing Tab until it lands on that element or inside it, so `:focus-visible` applies. A preview with no mark uses its first enabled `.dk-btn` (and the first Tab stop for focus); one with neither gets only the rest shot. CI runs it as three parallel shards: `SERUPA_SHARD=2/3` checks every third component, starting with the second |
| `page.mjs` | Page groundwork: responsive classes switch at each breakpoint (390–1536px), `base.css` defaults (and that utilities still win), `theme.js` (follows the system live, remembers a choice, `reset()`, ignores bad values), and `serupa-purge` output renders identically to the full CSS |
| `compat.mjs` | Cross-browser, through WebDriver: every utility class in Safari (`safaridriver`), Firefox (`geckodriver`) or WebKitGTK compared with Chromium (colors as RGBA, lengths within 1px), browser-support gaps listed with reasons in `KNOWN`; plus responsive classes, `base.css`, `theme.js`, Button behaviour, the Loader's ring, dots, text and skeleton, and `serupa-purge` output in that engine. Safari: run `safaridriver --enable` once |
| `storybook.mjs` | Opens every Storybook docs page and story (from `storybook-static/`): no errors, no missing README sections, and every story passes axe's WCAG 2.1 AA checks in all six themes (text inside a disabled control is exempt from contrast, as WCAG allows). Skipped locally until `npm run build-storybook`; a failure in CI |

When a test fails, it names what changed. If the change is intended, run with `--update` and commit the new baselines with the change.

**Baselines belong to CI.** Screenshots and computed styles differ a little between machines (fonts, anti-aliasing), so `baseline-visual/` and `baseline-utilities.json` are rendered on GitHub's runner: add the `update-visual-baselines` label to a pull request and the Update baselines workflow commits new ones to its branch. Locally, Visual snapshots and Utility classes can fail for that reason alone.

**When `tokens.css` is reported out of date:** it's generated from `tokens.json` by `tools/tokens/build.mjs`. Run `npm run tokens` (or `npm run build`, which runs it first) and commit the new `tokens.css` with the `tokens.json` change. CI checks they match.

## Releasing a version

Releases run on GitHub, from changesets (`.changeset/README.md` has the details):

1. **Each pull request** that changes what projects get adds a changeset: `npx changeset` (patch, minor or major, and a note whose lines start with Added, Changed, Fixed…).
2. **On `main`**, the Release workflow keeps a pull request called "Release: next version" open. It runs `npm run version-packages` (`tools/version.mjs`): the notes go into `CHANGELOG.md` under the new version, and `tools/release.mjs` stamps the version into `package.json`, `src/styles/base.css`, `src/theme.js` and the install lines in `README.md` and `docs/GettingStarted.mdx` (the build puts it in `dist/` and `Serupa.version`).
3. **Merging that pull request** releases it: `npm run release` (`tools/publish.mjs`) tags `vX.Y.Z` and makes a GitHub release with the notes and the package (`npm pack`) attached.

The workflow needs one repository setting: Settings → Actions → General → Workflow permissions → **Allow GitHub Actions to create and approve pull requests**. Pull requests the workflow opens don't start CI themselves; the changes in them are the changelog and version numbers.

By hand, without GitHub: write the notes under `## [Unreleased]` and run `node tools/release.mjs minor` (or major, patch, or a number). `node tools/release.mjs --check` checks that every file carries the same version (CI runs it). The README's Versioning section says which kind of release a change needs.

## Design tokens export

```sh
npm run tokens                                       # after changing tokens.json: tokens.css and design-tokens/
node tools/tokens/build.mjs                          # tokens.css only (--check: exit 1 if it's out of date)
node tools/tokens/export.mjs                         # design-tokens/ only (--check: exit 1 if it's out of date)
node tools/tokens/style-dictionary.config.mjs out/   # build them into CSS with Style Dictionary (one file per theme)
```

`export.mjs` writes the W3C Design Tokens files (see the README). The Style Dictionary config adds two things Style Dictionary 5.6 lacks: converting the format's duration objects (`{ "value": 150, "unit": "ms" }`), and using the system's own variable names (from `$extensions["com.serupa"].cssVar`). Add platforms to it for iOS, Android or Sass.

## Custom icons

```sh
node tools/icons/build.mjs                    # build assets/Icons/*.svg into src/icons.ts (then npm run build)
node tools/icons/build.mjs path/to/svgs       # from another folder
node tools/icons/build.mjs --check            # exit 1 if the components are out of step (for CI)
node tools/icons/builtin.mjs                  # after a component names a new icon: src/material/builtin.ts
python3 tools/icons/material.py               # rebuild src/material/icons.ts from the font in tools/icons/source/ (needs fonttools, brotli)
```

Each file becomes an icon named after the file. The build keeps only shapes, draws them in the text color, and refuses unsafe or off-system files with the reason; the Icon guidelines (`src/components/Icon/README.md`) have the drawing rules. On the design system page, icons dropped into an Icons set are uploads: download them into `assets/Icons/` (or ask Claude) and run the build.

## Trimming CSS for production

```sh
node bin/serupa-purge.mjs src/ public/index.html -o dist/bundle.min.css   # in a project: npx serupa-purge …
```

Scans the sources for class names and writes a copy of `bundle.css` with only the rules they need, plus the component styles, keyframes and variables. A typical page keeps the component styles (about 220 KB) and a few KB of utilities, instead of nearly 2 MB. Class names built at runtime (`"grid-cols-" + n`) can't be found; list them with `--keep grid-cols-2 grid-cols-3` or `--keep @safelist.txt`.

## Storybook

```sh
npm run storybook         # the documentation at http://localhost:6006, updating as you edit
npm run build-storybook   # a static copy in storybook-static/ (CI builds it and the Storybook test opens every page)
```

Storybook is the system's documentation. `.storybook/` holds its setup (the brand and mode toolbar sets `data-theme`, with the brands taken from `tokens.json`; the Accessibility addon checks each story). The pages are in `docs/` (introduction, getting started, foundations, versioning, changelog) and `src/components/<Name>/<Name>.mdx`; they read `tokens.json`, the README and each component's `README.md`, so they can't drift. Stories are `src/components/<Name>/<Name>.stories.tsx`, one per state and variant.

## Rules the tests enforce

- Components and utilities read tokens; no value is written out when a token holds it. The documented exceptions are breakpoints inside `@media` (which must still be `screen-*` values), shadow shapes (so color classes can recolor them) and `rounded-full` (9999px).
- Shared tokens are read as `var(--token)`, with no fallback value: `tokens.css` always loads first. Component tokens keep their default: `var(--button-bg, var(--primary))`.
- Tokens, page defaults, components and utilities each sit in their cascade layer (`dk.tokens`, `dk.base`, `dk.components`, `dk.utilities`), declared in that order at the top of every file.
- Utility classes keep the same names and effects; a change is deliberate and goes with an updated baseline.
- The system loads nothing from other servers.
- `tokens.json`'s `color.themes` is the one list of brands and themes. Adding a brand means adding its `<brand>-light` and `<brand>-dark` themes there, then `BRANDS` in `src/theme.js`, `ThemeBrand` in `src/theme-types.ts` and the theme lists in the tests; the foundation audit names any that's missing.
