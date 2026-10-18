# Changelog

Every change to Serupa (called the Diki Design System up to 4.8.1), newest first. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and versions follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html); the README's Versioning section says what counts as a breaking change.

## [Unreleased]

## [5.1.0] - 2026-10-18

### Added

- Text: new names for its four component tokens, so they no longer read like the shared text tokens (`--text-muted`, `--text-xs`): `--text-tone-default`, `--text-tone-muted`, `--text-tone-primary` and `--text-tone-danger` (one per `tone`). The old names (`--text-color`, `--text-color-muted`, `--text-color-primary`, `--text-color-danger`) keep working; when both are set, the new name wins. The old names will be removed in 6.0.0.

### Changed

- `package.json` lists esbuild and fsevents under `allowScripts` as not needing their install scripts, so npm 11's "install scripts not yet covered by allowScripts" warning goes away. Both already worked without them.
- in `text.tokens.json`, `$extensions["com.serupa"].cssVar` gives the new name and the old one is in `deprecatedCssVar`, so Style Dictionary and Figma exports use the new names.
- The neutral colors in every theme (surfaces, text, borders, fields, the secondary fill and the overlay) now come from the `zinc` palette instead of `gray`, so they read as neutral rather than blue-tinted. The token names don't change; every pair still meets WCAG 2.1 AA in all six themes. If you set a color next to the system's, such as `bg-gray-100` beside a `surface-muted` panel, switch it to `zinc` to match.

### Fixed

- Docs: The AvatarGroup usage guide follows the guide template: when to use it, when not to (and what to use instead), usage, accessibility, props and component tokens. Existing content is kept and moved under the new headings.
- Docs: The Carousel usage guide follows the guide template: when to use it, when not to (and what to use instead), usage, accessibility with its keys, props and component tokens. Existing content is kept and moved under the new headings. Every guide now follows the template.
- Dialog no longer closes when a press starts inside it and ends on the backdrop, such as when selecting text in a field and letting go outside the panel. Only a press that starts and ends on the backdrop closes it.
- Docs: Dialog's page shows the small and large sizes and a dialog with no close button as stories.
- Drawer no longer closes when a press starts inside it and ends on the backdrop, such as when selecting text in a field and letting go outside the panel. Only a press that starts and ends on the backdrop closes it.
- theme.js moves a theme chosen on 4.x (saved as `diki-theme`) to `serupa-theme` the first time it runs, so `Serupa.theme.reset()` now forgets it for good instead of the old choice coming back on the next page load.

### Security

- Cleared 4 of the 22 `npm audit` warnings (the `sprintf-js` denial-of-service advisory, reached through Changesets' YAML reader) by pointing that old YAML library at a newer `argparse`. These were all in release tooling; nothing in the installed package changed.

## [5.0.2] - 2026-10-18

### Fixed

- A toast no longer closes while keyboard focus is inside it after the mouse passes over and off it, or after switching back from another tab while it's hovered. Hover, focus and a background tab each stop its time on their own.
- Docs: Toast's page shows every tone, a toast with an action and a top-center Toaster as stories, so each is checked in all six themes.

## [5.0.1] - 2026-10-18

### Changed

- Storybook's sidebar groups the components under Components into Actions, Content, Feedback, Forms, Layout and type, Navigation and Overlays, and sorts the groups and the components in them A-Z; the docs and Foundations pages keep their order. Links to a component's page now include its group (`?path=/docs/components-forms-input--docs`), so old bookmarks to component pages land on Storybook's "not found" page.

## [5.0.0] - 2026-10-18

### Added

- React 19 support. CI type-checks, runs the component tests and server-renders every component on React 19 as well as 18. The peer dependency is now `^18.0.0 || ^19.0.0`.

### Changed

- Cleared out what was left from the artifact era. The README no longer carries the generated "Consuming this system" and index sections (the foundations moved to docs/foundations.md, which Storybook's Foundations pages read), the Cover preview page is gone, and serupa.iife.js no longer starts with the `@ds-bundle` manifest comment.
- The styles now sit in cascade layers, declared in this order at the top of every file: `dk.tokens`, `dk.base`, `dk.components`, `dk.utilities`. Your own CSS outside a layer now wins over the system's whatever order the files load in, so overrides need no `!important` or extra specificity. A page rule that used to lose to a component style on specificity now wins; check pages that style `.dk-*` elements. `@property` rules stay outside the layers.
- Components and utilities read shared tokens as `var(--token)` with no fallback value, so `tokens.css` must load (it always had to for themes). The CSS files are smaller.
- `design-tokens/` is generated by Node (`npm run tokens`), so the project no longer needs Python for its tokens. Whole numbers are written as `1` instead of `1.0`; the values are the same.
- `RadioGroup`'s `onChange` and `Slider`'s `onValueChange` and `onValueCommit` are typed instead of `any`. RadioGroup takes the value type from `value` or `onChange` (`string | number` unless you say), and Slider gives `number` for one thumb or `[number, number]` for a range. Code that relied on `any`, such as passing the value straight to a `useState<string>` setter without a typed `value`, may need a type now. `SliderValue` is exported.
- Release tags are prebuilt. Each tag points at a release commit made off `main` that carries `dist/` and a `package.json` without scripts or devDependencies, so `npm install github:diki-stwn/serupa-ds#vX.Y.Z` copies files and builds nothing.
- The system is now **Serupa**, by Diki. The package is `serupa-ds` and the repository is `diki-stwn/serupa-ds`. To update a project:

  | Before (4.x) | Now (5.0) |
  | --- | --- |
  | `npm install github:diki-stwn/design-system#v4.8.0` | `npm install github:diki-stwn/serupa-ds#v5.0.0` |
  | `import { Button } from '@diki/design-system'` and `'@diki/design-system/tokens.css'` | `import { Button } from 'serupa-ds'` and `'serupa-ds/tokens.css'` |
  | `dist/diki.iife.js`, `window.Diki` (`Diki.configure`, `Diki.theme`) | `dist/serupa.iife.js`, `window.Serupa` (`Serupa.configure`, `Serupa.theme`) |
  | `DikiConfig`, `DikiTheme` types | `SerupaConfig`, `SerupaTheme` |
  | `design-tokens/diki.tokens.json`, `$extensions["com.diki"]` | `design-tokens/serupa.tokens.json`, `$extensions["com.serupa"]` |

  Class names (`dk-*`), CSS variables, tokens and the `dk.*` cascade layers keep their names. The saved theme choice moves from `diki-theme` to `serupa-theme` in localStorage, and the old value is read once so visitors keep their theme.

### Removed

- The 23 old component token names that kept working since they were renamed (`--link-color`, `--card-border-color`, `--heading-color` and the rest in the 4.x notes). Use the new names: `--link-text`, `--card-border`, `--heading-text`.

### Fixed

- A Badge whose `count` goes from 0 to a number (or back) no longer crashes with React's "rendered more hooks" error.
- Menu, Popover and Tooltip no longer warn on React 19 when their trigger has a ref (they read it as a prop there).
- The components' own code no longer uses `any`. Props passed through to the DOM keep their real types, so the type checker catches mistakes inside the system. Nothing changes for projects; `List`'s `linkProps` is now typed `Record<string, unknown>` (any object still works).

## [4.8.1] - 2026-10-17

### Changed

- The documentation runs on Storybook 10.6 (from 8.6). Nothing in the package changes; `npm run storybook` and `npm run build-storybook` work as before. The Essentials addon is gone (its parts are now built into Storybook), and the Docs addon takes its place.

### Fixed

- Avatar falls back to initials when its picture fails to load quickly (as in Safari), instead of keeping the broken picture.
- Calendar, DatePicker and DateRangePicker start the week on the locale's day in Firefox too (Monday for de-DE, for example); Firefox has no Intl.Locale week info, so they always started on Sunday.
- Textarea with `autoResize` no longer raises "ResizeObserver loop completed with undelivered notifications" on the window when its width changes.

## [4.8.0] - 2026-10-17

### Added

- Storybook is the documentation: `npm run storybook`. A toolbar switches the brand and light or dark (the six themes), the Accessibility tab checks each story, and there's a page per component (props, every state as a story, and its guidelines) plus introduction, getting started, foundations (colors and the palette, themes and every alias, typography, spacing, radius, effects, motion, utility classes), versioning and the changelog. The pages read `tokens.json` and the guidelines, so they can't drift.
- 55 stories, one per state and variant, and a Storybook test: every page and story renders without errors, and every story passes WCAG 2.1 AA (axe) in all six themes. CI builds Storybook.
- The components install as a package: `import { Button } from '@diki/design-system'` works in Vite, Next.js, Remix and Storybook. ES modules with types (`dist/index.js`, `dist/index.d.ts`); React 18 or later is a peer dependency, so the app and the system share one React; the components render on the server (nothing touches `window` or `document` until they run in the browser, and no React warnings).
- `components.css` (the `dk-*` component styles, about 90 KB) and `utilities.css` (the utility classes), beside `bundle.css`, which is still both in one file.
- `diki.iife.js`: the browser script under its new name. `bundle.js` is the same file.
- `version` is exported from the package, as `Diki.version` is on plain pages.
- `npm run build`, `npm run typecheck`, and a Package test: every export exists, every component renders on the server, the types declare every component, and `bundle.css` is `components.css` + `utilities.css`.
- Accordion and AccordionItem components (single or multiple, collapsible, controlled, plain or card, keyboard navigation), with 15 component tokens.
- Alert component: info, success, warning, danger and neutral tones, a title, actions and a close button, with 20 component tokens.
- AvatarGroup component (avatars in an overlapping row, each in a surface ring, with `max` folding the rest into a "+N" avatar, `total` for counts beyond the avatars passed, and one `size` for all), with 7 component tokens.
- Avatar: a picture with initials or a person icon as fallback (also when the picture fails to load), five sizes, circle or square, and a status dot, with 15 component tokens. `initials(name)` is exported too.
- Breadcrumb and BreadcrumbItem components (chevron or slash separators, icons, router links, `maxItems` to collapse the middle), with 11 component tokens.
- ToggleButton component (a Button with aria-pressed; outline or ghost), with 3 component tokens.
- ButtonGroup component (attached or spaced, horizontal or vertical), with 2 component tokens.
- Card component (`Card`, `CardHeader`, `CardBody`, `CardFooter`): outline, elevated and filled variants, four paddings, and a whole-card link with `href`, with 16 component tokens.
- Carousel component (one slide at a time with previous and next buttons, a dot per slide, swipe, `loop`, controlled or uncontrolled `index`, RTL; slides not shown are inert, and it never moves on its own), with 10 component tokens.
- Combobox component (a text field with a list that narrows as you type; descriptions, clearable, loading, your own filtering for server results), with 16 component tokens.
- Calendar component (a month grid to pick a day from, with arrow, Home/End and PageUp/PageDown keys, min, max, disabled days and the locale's names and first day of the week), with 14 component tokens.
- DatePicker component (a date field people type in the locale's order or fill from a Calendar popup; a hidden yyyy-mm-dd input with `name`), with 8 component tokens.
- DateRangePicker component (start and end date fields with a two-month calendar popup; pick the start then the end, with a preview of the range), with 4 component tokens.
- Calendar tokens `--calendar-range-bg` and `--calendar-range-color` for the days inside a range.
- Dialog: a modal on the native `<dialog>` (focus kept inside and returned, page inert and not scrolling, top layer), with a title, description, footer, three sizes, Escape, × and backdrop closing, and an alert mode for confirmations, with 13 component tokens.
- Drawer component (a modal panel that slides in from the right, left, top or bottom; title, description, a pinned footer, three widths), with 15 component tokens.
- EmptyState component (icon or illustration, title, description, actions; md or sm; plain or dashed), with 17 component tokens.
- FileUpload component (a drop area and a button for choosing files, with type, size and count checks and the chosen files listed with remove buttons), with 15 component tokens, and `formatFileSize()`.
- IconButton (an icon-only Button with a required label, ghost by default, square or round) and Fab (a floating action button: round, raised and fixed to a corner, 56 or 40px, optionally extended with its label), with 1 and 9 component tokens.
- Image component (a picture in a frame with a ratio, cover or contain, rounded corners, lazy loading, a placeholder while loading and a fallback on error; `viewable` opens it full size in a Dialog and `onRemove` adds a remove button), with 8 component tokens.
- Kbd component (keyboard keys and shortcuts as keycaps; named keys like `mod`, `shift` and arrows show as symbols on Apple devices and words elsewhere), with 9 component tokens.
- Stack, Grid, Container and Divider layout components, with 11 component tokens. Stack and Grid take `gap` as a step of the spacing scale.
- Link component (inline text link; primary or neutral; external links open a new tab and say so; `as` for router links), with 8 component tokens.
- VisuallyHidden component (screen-reader-only content; `focusable` for skip links).
- List and ListItem components (plain or card, dividers, leading and trailing slots, link and button rows, selected and disabled), with 17 component tokens.
- Menu (`Menu`, `MenuItem`, `MenuGroup`, `MenuSeparator`): the WAI-ARIA menu button with arrow, Home, End, letter and Escape keys, icons, shortcuts, disabled, destructive and link items, and groups, in the top layer, with 19 component tokens.
- Navbar and NavbarLink components (brand, links, actions; sticky; folds into a menu button below 768px), with 18 component tokens.
- NumberInput component (a number field with − and + buttons, arrow keys, min, max and step; clamps and rounds on blur), with 6 component tokens.
- Pagination component (buttons or links, siblings and boundaries, md or sm) and `paginationRange()`, with 14 component tokens.
- PasswordInput component (Input with a show/hide button; controlled or not; sizes and states like Input), with 6 component tokens.
- Popover component (a non-modal dialog next to its trigger; title, placement, close() for buttons inside, controlled or not), with 15 component tokens.
- Progress component (a bar or a ring showing how far along a task is; label, value, four tones, three sizes, indeterminate), with 18 component tokens.
- SearchInput component (a search field with a clear button, Escape to clear, Enter to search, and a loading state), with 7 component tokens.
- SegmentedControl component (picks one of a few options shown side by side; a radio group with a sliding selection, icons, full width, two sizes), with 18 component tokens.
- Sidebar, SidebarSection and SidebarItem components (header and footer, sections, icons, badges, nested groups, a collapsed icon rail with tooltips), with 23 component tokens.
- Slider component (one value or a range with two thumbs; drag, press or keys; step, commit events, form inputs), with 12 component tokens.
- Stepper component (numbered steps joined by lines, horizontal or vertical; complete, current, upcoming and error states; completed steps can be clickable), with 19 component tokens.
- Releases with Changesets. Each pull request carries a short note (`npx changeset`); on `main` a Release pull request gathers them into the next version and `CHANGELOG.md`, and merging it tags the version and makes a GitHub release with the package attached.
- Projects can install a released version straight from GitHub (`npm install github:diki-stwn/design-system#v4.8.0`); the package builds itself on install.
- Table, TableHead, TableBody, TableFoot, TableRow, TableHeaderCell and TableCell components (sizes, stripes, selected rows, sortable columns, sticky header, a scrolling frame), with 17 component tokens.
- Tabs (`Tabs`, `TabList`, `Tab`, `TabPanel`): the WAI-ARIA tabs pattern with arrow, Home and End keys (right-to-left aware), automatic or manual activation, line and pill variants and two sizes, with 17 component tokens.
- Heading (h1 to h6, with the look set apart from the level) and Text (size, tone and weight, each inherited when unset, and truncate), with 8 and 4 component tokens.
- TimePicker component (a time field people type in, such as "2:30 pm" or "1430", or fill from a list every `step` minutes between `min` and `max`; values are "HH:mm"), with 14 component tokens.
- Toast: `toast()` messages in a `<Toaster>` (six positions), with tones, an action, a close button, replacing by id, auto-dismiss that pauses on hover, focus and in the background, and polite announcements, with 18 component tokens.
- consistent names for 23 component tokens, so one pattern works everywhere: a component's text color is `-text`, a part's color is `-<part>-color`, and a border color is `-border`. The old names keep working (when both are set, the new name wins) and will be removed in 5.0.0. Rename any you override:

  | Old name | New name |
  | --- | --- |
  | `--accordion-title`, `--accordion-content`, `--accordion-icon` | `--accordion-title-color`, `--accordion-content-color`, `--accordion-icon-color` |
  | `--alert-text-color` | `--alert-text` |
  | `--avatar-color` | `--avatar-text` |
  | `--card-border-color`, `--card-hover-border-color` | `--card-border`, `--card-border-hover` |
  | `--empty-state-icon`, `--empty-state-title`, `--empty-state-description` | `--empty-state-icon-color`, `--empty-state-title-color`, `--empty-state-description-color` |
  | `--file-upload-icon` | `--file-upload-icon-color` |
  | `--heading-color` | `--heading-text` |
  | `--link-color`, `--link-color-hover` | `--link-text`, `--link-text-hover` |
  | `--list-title`, `--list-description` | `--list-title-color`, `--list-description-color` |
  | `--menu-border-color`, `--menu-item-color` | `--menu-border`, `--menu-item-text` |
  | `--popover-title` | `--popover-title-color` |
  | `--search-input-icon` | `--search-input-icon-color` |
  | `--sidebar-section-title` | `--sidebar-section-title-color` |
  | `--toast-border-color` | `--toast-border` |
  | `--tooltip-color` | `--tooltip-text` |

- Tooltip: a short hint shown on hover (after a delay) and keyboard focus, in the top layer, with 12 placements that flip and stay on screen, Escape to dismiss and a hoverable body (WCAG 1.4.13), with 9 component tokens.

### Changed

- The source moved to `src/`: each component is a folder in `src/components/<Name>/` with its TypeScript source, its CSS, its component tokens, its guidelines and its preview. The types are generated from the code, so they can't drift from it. Every component behaves and looks exactly as before (all 90 screenshots and 25,561 utility classes match 4.7.0).
- The built files are in `dist/` (not committed): `bundle.css`, `bundle.js`, `base.css`, `theme.js` and React (`dist/lib/`). Package imports such as `@diki/design-system/bundle.css` keep working; only direct file paths change (`components/bundle.css` is now `dist/bundle.css`).
- The browser script is built for ES2019 browsers (all current ones) instead of being hand-written ES5.
- `tools/icons/build.py` writes custom icons into `src/icons.ts`; `npm run build` puts them in the components.
- in the token files, `$extensions["com.diki"].cssVar` now gives the new name, and the old one is in `deprecatedCssVar`. Style Dictionary and Figma exports use the new names.

### Removed

- The generated docs site (`tools/docs/`, `npm run docs` and its test): Storybook replaces it.

### Fixed

- `window.Diki`'s TypeScript type now lists every component on it (Accordion, ButtonGroup, Drawer, EmptyState, List, Navbar, Pagination, PasswordInput, Popover, Sidebar, ToggleButton and their parts were missing).
- Docs: The usage guides for Button, IconButton, Fab, ButtonGroup, ToggleButton, Link now follow the guide template: when to use each one, when not to (and what to use instead), usage, accessibility, props and component tokens. Existing content is kept and moved under the new headings.
- Docs: The usage guides for Card, Table, List, Accordion, Avatar, Image, Icon, Kbd, Stack, Grid, Container, Divider, Heading, Text, VisuallyHidden now follow the guide template: when to use each one, when not to (and what to use instead), usage, accessibility, props and component tokens. Existing content is kept and moved under the new headings.
- Docs: The usage guides for Alert, Toast, Loader, Progress, Badge, EmptyState now follow the guide template: when to use each one, when not to (and what to use instead), usage, accessibility, props and component tokens. Existing content is kept and moved under the new headings.
- Docs: The usage guides for Field, Input, Textarea, Select, Combobox, Checkbox, Radio, Switch, Slider now follow the guide template: when to use each one, when not to (and what to use instead), usage, accessibility, props and component tokens. Existing content is kept and moved under the new headings.
- Docs: The usage guides for NumberInput, PasswordInput, SearchInput, SegmentedControl, DatePicker, DateRangePicker, TimePicker, Calendar, FileUpload now follow the guide template: when to use each one, when not to (and what to use instead), usage, accessibility, props and component tokens. Existing content is kept and moved under the new headings.
- Docs: The usage guides for Dialog, Drawer, Popover, Tooltip, Menu, Navbar, Sidebar, Tabs, Breadcrumb, Pagination, Stepper now follow the guide template: when to use each one, when not to (and what to use instead), usage, accessibility, props and component tokens. Existing content is kept and moved under the new headings.
- Docs: The README now opens with what the system is, how to install a pinned version from GitHub, how to pick a theme and what to do before shipping, and lists every component by group. The Getting started page adds the install, update and before-you-ship steps.
- Docs: One outline for every component's usage guide (`docs/usage-guide-template.md`): When to use, When not to use, Usage, Accessibility, Props and Component tokens. A new test (`tools/test/guides.mjs`) checks the headings; guides still in the old outline are listed in it and move over in the next docs releases.
- TimePicker keeps typed text on Enter while the list is open (the highlight follows the typing), the clock button no longer blurs the field, the list is at least as wide as the field, steps count from `min` like `<input type="time">`, a step under one minute falls back to 30, and a new `locale` or `hour12` rewrites the field.
- `tokens.css` is now generated from `tokens.json` in the repository (`npm run tokens`, also run by `npm run build`) instead of by the frozen design system page, so token changes can pass CI again. The file's contents are unchanged.

## [4.7.0] - 2026-10-16

### Added

- Switch component: an on/off setting that applies at once, a native checkbox with `role="switch"` drawn as a track and thumb. Sizes `sm`, `md` and `lg` (28×16, 36×20 and 44×24 tracks on the label's first line), a `description`, `labelPosition` `end` or `start`, `invalid` and disabled. The thumb slides in 150ms (not with reduced motion), follows the text direction and uses system colors in forced-colors mode. 21 component tokens (`--switch-*`), its own docs page and `tools/test/switch.mjs`.

## [4.6.0] - 2026-10-16

### Added

- Radio and RadioGroup components: native radios with labels, in a `RadioGroup` (`role="radiogroup"`) that gives them a name, holds `value` or `defaultValue`, calls `onChange(value, event)`, lays them out `vertical` or `horizontal`, and passes `size`, `invalid`, `disabled` and `required` down. Sizes `sm`, `md` and `lg` (14, 16 and 20px circles on the label's first line) and a `description`. Arrow keys move the choice natively; Field group labels it and sets `invalid` from its error. 21 component tokens (`--radio-*`), its own docs page and `tools/test/radio.mjs`.

### Changed

- Field's preview and docs show a group of radios.

## [4.5.0] - 2026-10-16

### Added

- Checkbox component: a native checkbox and its label, with sizes `sm`, `md` and `lg` (14, 16 and 20px boxes on the label's first line), a `description` linked with `aria-describedby`, `indeterminate` (a dash, announced as mixed), `invalid` and disabled (also inside a disabled `Field group`). The whole label toggles it. 20 component tokens (`--checkbox-*`), its own docs page and `tools/test/checkbox.mjs`.

## [4.4.0] - 2026-10-16

### Added

- Select component: a native `<select>` styled like Input, with sizes `sm`, `md` and `lg` at the control heights, a chevron, an optional `leftIcon`, a `placeholder` (an empty first option in the placeholder color until something is picked), `options` as strings, `{ value, label, disabled }` or groups (or `<option>` children), and focus, `invalid` and disabled states. It keeps the browser's picker, keyboard and screen-reader support. `multiple` isn't supported and is ignored with a warning. 20 component tokens (`--select-*`), its own docs page and `tools/test/select.mjs`.

## [4.3.0] - 2026-10-16

### Added

- Field component: a label, an optional `hint` and an `error` message around one form control, wired up for screen readers. It links the label to the control (its own `id` or a generated one), adds the hint and error to the control's `aria-describedby`, makes it invalid with an error, marks `required` (a hidden `*` and `aria-required`) or `optional`, and passes `disabled`. `group` renders a `<fieldset>` and `<legend>` for a set of choices. 8 component tokens (`--field-*`), its own docs page and `tools/test/field.mjs`.

## [4.2.0] - 2026-10-16

### Added

- Textarea component: a multi-line text field, Input's sibling (a native `<textarea>` in a box). Sizes `sm`, `md` and `lg` with Input's text sizes and side padding; `rows` (default 3); a vertical resize handle, or `resize="none"`; `autoResize`, which grows with the text from `rows` up to `maxRows` and then scrolls; `showCount`, a character count under the text ("32 / 280" with `maxLength`, linked by `aria-describedby`); focus, `invalid`, read-only and disabled like Input. 16 component tokens (`--textarea-*`), its own docs page and `tools/test/textarea.mjs`.

## [4.1.1] - 2026-10-11

### Fixed

- Docs: the Button page's hand-written loading spinners (the playground and the loading demo) were missing the Loader's inner wrapper, so the ring only grew and shrank without turning and looked laggy. The Button component itself was never affected. The docs test now checks that every ring on the docs pages turns.

## [4.1.0] - 2026-10-11

### Added

- Input component: a single-line text field (a native `<input>` in a box) with sizes `sm`, `md` and `lg` at the control heights (24, 32, 44px, like Button), optional `leftIcon` and `rightIcon`, a focus ring, and `invalid`, read-only and disabled states. Field colors come from the `field`, `field-border` and `placeholder` aliases. 19 component tokens (`--input-*`), its own docs page and `tools/test/input.mjs`.

## [4.0.0] - 2026-10-10

### Removed

- **Badge sizes.** Badges now come in one size: 20px tall, `text-xs`, 12px icons (the old `sm`). The `size` prop is gone: it's ignored, with a console warning, and never reaches the DOM. Badges that used the old default (`md`, 24px, `text-sm`, 14px icons) are now smaller. The indicator dot is 8px.
  - Component tokens renamed: `--badge-height-sm` / `-md` → `--badge-height`; `--badge-icon-size-sm` / `-md` → `--badge-icon-size`; `--badge-padding-x-sm` / `-md` → `--badge-padding-x`; `--badge-indicator-size-sm` / `-md` → `--badge-indicator-size`.
  - The `dk-badge--size-sm` / `dk-badge--size-md` classes and the `data-size` attribute are gone.
  - To migrate: remove `size` from your badges. To keep the old 24px look somewhere, set `--badge-height: var(--spacing-6)`, `--badge-padding-x: var(--spacing-2)` and `--badge-icon-size: var(--spacing-3\.5)` on a container, plus `text-sm` for the type.
- **Loader `tone="current"`**, deprecated in 3.8.0, is removed as announced. It now falls back to `neutral` (the same look) like any unknown tone, without the warning. Use `tone="neutral"`.

### Changed

- Badge's remove × keeps a 24×24 target (the WCAG 2.2 minimum, as on a small Button): its hit area reaches 2px past the badge's top and bottom, and its focus ring goes round all of it.

## [3.17.0] - 2026-10-10

### Added

- Badge `ping` (off by default): with `dot`, in a label or as the indicator, the dot pings with the system's `ping` animation (the `--animate-ping` token behind `animate-ping`): a copy grows to twice its size and fades every second, for live states. Off under reduced motion and in forced-colors mode.

## [3.16.1] - 2026-10-10

### Changed

- Badge: the status dot's box is 2px narrower than an icon box, 12×14px at md and 10×12px at sm (was 14×14 and 12×12), so the dot gets a little less room than an icon. Dot badges are 2px narrower.

## [3.16.0] - 2026-10-10

### Added

- Badge indicator: `<Badge dot />` with no label, icon or count renders a lone dot for "something new" without a number, on the corner of an icon or avatar. A solid circle in the tone (10px md, 8px sm) with a 2px ring in the surface color; decorative unless given `aria-label`; not clickable or removable. New component tokens `--badge-indicator-size-sm`, `--badge-indicator-size-md` and `--badge-indicator-ring`.

## [3.15.1] - 2026-10-10

### Changed

- Badge: the status dot sits centered in an icon-sized box (14px at md, 12px at sm), so it takes the same space as a leading icon and dot badges line up with icon badges. Dot badges are 8px (md) or 6px (sm) wider.

## [3.15.0] - 2026-10-10

### Changed

- Badge: optical balance like Button's. With an icon on one side only, the text side gets 2px more padding: a leading icon or dot pads the end, a remove × pads the start; icons on both sides, or none, stay even. New component token `--badge-icon-offset` (`spacing-0.5`); right-to-left mirrors it.

## [3.14.3] - 2026-10-10

### Fixed

- Badge: the remove × now mirrors a leading icon, so a badge with an icon, a label and a × is balanced (about 11 / 6 / 6 / 11px of visible space at md, 9 / 6 / 6 / 9 at sm; before, the × side was looser). The × sits in an icon-sized box with the badge's gap and end padding, nudged 2px in to make up for the glyph's built-in space; the button keeps a 24×24 target and its focus ring goes round all of it. Removable badges are 2px narrower.

## [3.14.2] - 2026-10-10

### Fixed

- Badge: the remove × sat too far from the label (about 14px, versus 10px at the badge's start). The × button now sits right against the label and the badge's end, so the × is about 10px from both at md, matching the start; removable badges are 6px narrower. The button keeps its 24×24 target.

## [3.14.1] - 2026-10-10

### Fixed

- Docs: the Badge page shows the disabled state (in States, the props table and a playground toggle); before, it was only in the Badge README.

## [3.14.0] - 2026-10-10

### Added

- Badge micro-interactions, the same as Button's: clickable badges shrink to 97% while held (pointer, Space or Enter) and ripple from the press point in the text color; loading cross-fades the content into a ring that grows in. New component tokens `--badge-press-scale`, `--badge-press-duration`, `--badge-ripple-opacity`, `--badge-ripple-duration`, `--badge-ripple-fade-duration` and `--badge-loading-duration`; reduced motion turns press and ripple off.

## [3.13.0] - 2026-10-10

### Added

- Badge states. With `onClick` a badge renders a `<button>`, and with `href` a link (through `Diki.configure`), with hover (a 10% layer), active (15%) and focus (the 2px focus ring) states; the layer always moves away from the text, so every tone and style keeps 4.5:1. `loading` (any badge) puts a ring over the hidden content, keeps the width, sets `aria-busy`, announces `loadingText` and, on a clickable badge, blocks clicks while keeping focus. `disabled` works on clickable badges. New component tokens `--badge-hover-layer`, `--badge-active-layer`, `--badge-state-text` and `--badge-focus-ring`.

## [3.12.0] - 2026-10-10

### Changed

- Badge: the subtle style has a 1px outline in its text color at 20%, so it follows every tone and theme. New component token `--badge-subtle-border` (`opacity-20`); set it to `0%` for the previous borderless look.

## [3.11.0] - 2026-10-10

### Added

- **Badge** component: a short label for status, counts and categories. Styles `subtle` (default), `solid` and `outline`; tones `neutral` and `primary` (alias colors), `success` (green), `warning` (amber), `danger` (red), `info` (sky) and the 17 chromatic palette families for categories and tags. Palette and status tones use fixed steps per style (light: 100 fill and 700 text, 600 or 700 solid with white, 700 outline; dark: 950 fill and 300 text, 400 solid with 950, 300 outline on a 400 border), each keeping 4.5:1 text in all six themes and following the nearest theme. Sizes `sm` (20px) and `md` (24px). Extras: a status `dot`, a `leftIcon`, a `count` (a round pill, with `max` and `showZero`) and `onRemove` (a real × button named "Remove" + the label). Component tokens in `components/Badge/badge.tokens.json`.
- Docs site: a Badge page with a playground, all tones and styles, the extras, props, accessibility notes and component tokens.
- Tests: `tools/test/badge.mjs`, including contrast for all 69 tone and style combinations in every theme.

## [3.10.0] - 2026-10-10

### Changed

- Button `variant="secondary"` is now an outline in the brand color: `primary` border and text on `surface`, with a `primary-subtle` tint on hover as the text and border darken to `primary-hover` (was a solid `secondary` gray fill with `text`). Destructive secondary matches: a solid `danger` border with `danger-text` on `surface` and a `danger-subtle` tint on hover (was a `danger-subtle` fill). Component tokens: `--button-secondary-bg`, `-bg-hover` and `-text` take new defaults; new `--button-secondary-text-hover`, `--button-secondary-border`, `--button-secondary-border-hover` and `--button-destructive-secondary-border`.
- The contrast audit checks the new pairs: `primary` text on `surface` (4.5:1), `primary-hover` on `primary-subtle` (4.5:1) and the `danger` border on `surface` (3:1), in all six themes.

## [3.9.1] - 2026-10-10

### Changed

- Loader `variant="spokes"`: closer to iOS proportions. Spokes are thicker and shorter, about 10% of the loader's size wide (was 8%) and 25% long (was 27%), round a larger empty middle, about 40% across (was 33%). `--loader-spokes-width` now defaults to `stroke-width-4` in a drawing at 5/8 scale (2.5 of the 24 units).

## [3.9.0] - 2026-10-10

### Added

- Loader `variant="spokes"`, like the current iOS activity indicator: eight rounded spokes round a circle, the lead one at full strength and the rest fading behind it to 25%, ticking a spoke at a time (45°, every 125ms: a turn a second). Same sizes, tones and delay as the ring; half speed under reduced motion. Component tokens `--loader-spokes-width` (`stroke-width-2`) and `--loader-spokes-duration` (`duration-1000`).
- Docs site: spokes in the Loader playground, demos and props.

## [3.8.0] - 2026-10-10

### Changed

- Loader: the default tone is now called `neutral` (was `current`). It looks the same: the text color around it. The docs, playground and types use the new name.

### Deprecated

- Loader `tone="current"`: use `tone="neutral"`. It still works, the same as `neutral`, with a console warning, and will be removed in 4.0.0.

## [3.7.2] - 2026-10-10

### Changed

- Pixel loader `pattern="random"`: calmer, with each square's clock now 1.5s to 2.2s (was 1.2s to 1.9s), so it reads as thinking rather than flicker. Under reduced motion its squares share a 4s clock and keep their scattered starts.

## [3.7.1] - 2026-10-10

### Changed

- Pixel loader loop lengths per pattern: `snake` and `spiral` now loop in 1.5s and `cross` and `checker` in 1s (all were 1.2s). `wave`, `sweep`, `fall` and `rise` stay at 1.2s (`--loader-pixel-duration`). Under reduced motion each runs at half speed (3s, 2s, 2.4s).

## [3.7.0] - 2026-10-10

### Added

- Token `duration-1200` (1200ms) and its `duration-1200` class, for long decorative loops.

### Changed

- Pixel loader: one loop now takes 1.2s in every pattern (was 1s): `--loader-pixel-duration` now defaults to `duration-1200`. Steps stay 75ms apart; `random`'s clocks run 1.2s to 1.9s; under reduced motion every pattern runs at half speed (2.4s).

## [3.6.0] - 2026-10-10

### Changed

- Pixel loader: one loop now takes 1s in every pattern (was 1.5s to 2.4s), set by the new component token `--loader-pixel-duration` (`duration-1000`). Steps are 75ms apart (`--loader-pixel-stagger`, now `delay-75`, was `delay-100`); `cross` and `checker` light their second group half a loop later; `random`'s clocks run 1s to 1.7s. The rise and fade keep the wave's smooth curve. Under reduced motion every pattern runs at half speed (2s, was 3s).

## [3.5.1] - 2026-10-10

### Changed

- Pixel loader patterns `random`, `sweep`, `fall`, `rise`, `snake`, `spiral`, `cross` and `checker` now move as smoothly as `wave`: each square rises, holds and fades with the wave's curve (30% of its cycle to rise, 30% to fade, `ease-in-out`), not the quick snap of before. `random`'s clocks are longer to match (1.5s to 2.4s, were 1s to 1.9s). Orders and cycle lengths are unchanged otherwise.

## [3.5.0] - 2026-10-10

### Added

- Seven more pixel loader patterns: `sweep` (columns, left to right), `fall` (rows, top to bottom), `rise` (rows, bottom to top), `snake` (square by square, left to right then back), `spiral` (clockwise round the edge, then the center), `cross` (the corners, then the plus) and `checker` (the X, then the edges). Each fills the grid and empties it in the same order (`ease-in-out`, steps of `--loader-pixel-stagger`), and slows to 3s under reduced motion.
- Loader `glow` prop (pixel only): a soft halo of the loader's color round the lit squares, off by default. Its size is the new component token `--loader-pixel-glow-size` (`spacing-0.5`, 2px). Setting `--loader-pixel-glow` yourself still works.
- Docs site: a Pixel patterns gallery and table, all nine patterns and a glow toggle in the Loader playground.

### Changed

- Under reduced motion every pixel pattern now slows to 3s (the wave and random did already).

## [3.4.0] - 2026-10-10

### Added

- Loader `pattern="random"` for `variant="pixel"`: the squares light up at random instead of in a diagonal wave. Each twinkles on its own clock (1s to 1.9s, sums of the duration tokens, starting 0 to 1s in), so they drift apart and the grid shows an ever-changing order with no visible loop. Same dim, divider, tone and glow as the wave; under reduced motion each square slows to 3s. `pattern="wave"` stays the default.
- Docs site: a pattern control in the Loader playground (for pixel), a random demo and the prop in the table.

## [3.3.2] - 2026-10-10

### Changed

- Loader `variant="pixel"`: lighter, thinner dividers. They're now hairlines, half a unit of the 24-unit grid (0.5px at 24px, was 1px), at 10% of the loader's color (`--loader-pixel-divider`, was `opacity-30`). They still look the same next to lit and dim squares.

## [3.3.1] - 2026-10-10

### Changed

- Loader `variant="pixel"`: the dividers now look the same whether the squares beside them are lit or dim. They're cut out of the squares and drawn in the loader's color at a fixed strength, `--loader-pixel-divider` (now `opacity-30`, was a 50% cut that faded with the squares).

## [3.3.0] - 2026-10-10

### Changed

- Loader `variant="pixel"`: the squares are now square pixels, edge to edge with no rounded corners and no gaps, split by subtle dividers (1 unit of the 24-unit drawing, letting half of the background through). New component tokens `--loader-pixel-divider` (`opacity-50`; 0 hides the dividers) and `--loader-pixel-divider-width` (`stroke-width-1`).

## [3.2.0] - 2026-10-10

### Added

- Loader `variant="pixel"`: a 3×3 grid of rounded squares in one color (the loader's tone) with a wave of light running along the diagonals from the top-left corner: each square rises from 15% to full and fades again, 100ms after the diagonal before it, every 1.5s with `ease-in-out`. Sizes 16, 24 and 40px like the ring; `primary`, `muted` and `inverse` tones. Opacity only, so it keeps running under reduced motion, at half speed.
- Loader component tokens `--loader-pixel-dim` (`opacity-15`), `--loader-pixel-stagger` (`delay-100`) and `--loader-pixel-glow` (`spacing-0`: off; a small spacing step adds a soft halo of the same color, for dark surfaces).
- Docs site: pixel in the Loader playground, demos and props.

## [3.1.0] - 2026-10-10

### Changed

- The neutral aliases in all six themes now use `gray` instead of `slate`, the same steps as before: `secondary`, `secondary-hover`, `surface` (dark), `surface-muted`, `surface-inverse`, `text`, `text-muted`, `text-inverse`, `border`, `border-strong`, `field` (dark), `field-border`, `field-border-hover` and `placeholder`. `overlay` is now `gray-900` at 50% (light) and `gray-950` at 70% (dark). Every contrast pair still passes. The `slate` palette is unchanged and still available.

## [3.0.0] - 2026-10-10

### Changed (breaking)

- Spinner is now **Loader**, as it covers more than spinners. Everything named after it moved; nothing else about the ring, dots or text changed.

  | Before (2.x) | Now (3.0.0) |
  | --- | --- |
  | `<Spinner>`, `Diki.Spinner` | `<Loader>`, `Diki.Loader` |
  | `SpinnerProps`, `SpinnerVariant`, `SpinnerTone` (TypeScript) | `LoaderProps`, `LoaderVariant`, `LoaderTone` |
  | `--spinner-*` component tokens | `--loader-*` (same names after the prefix) |
  | `dk-spinner`, `dk-spinner--*`, `dk-spinner__*` classes | `dk-loader`, `dk-loader--*`, `dk-loader__*` |
  | `data-component="spinner"` | `data-component="loader"` |
  | `components/Spinner/`, `design-tokens/components/spinner.tokens.json` | `components/Loader/`, `design-tokens/components/loader.tokens.json` |
  | `showLabel` (deprecated in 2.8.0) | removed: use `variant="text"`, or a Text loader beside a decorative ring |

  To upgrade, rename `Spinner` to `Loader` and `--spinner-` to `--loader-` in your code. Button's `loading` already uses the Loader; its `dk-btn__spinner` class keeps its name.

### Added

- Loader `variant="skeleton"`: gray placeholder shapes where the content will be, so nothing jumps when it arrives. `shape="text"` (default) draws `lines` (1 to 20) as tall as the size's text line, the last of several 60% wide; `"circle"` is an avatar at the loader's size; `"rect"` is an image or card, full width and 96px tall. Set other sizes with `className` (`size-12`, `h-40`, `w-48 h-32`). The fill is the text color at 10%, with a lighter band sweeping through it every 2s (`ease-in-out`, like the text variant); a still fill under reduced motion. Lines and rects shrink beside an avatar in a row. While it waits out the delay its shapes keep their space.
- Loader component tokens `--loader-skeleton-fill` (`opacity-10`), `--loader-skeleton-shine` (`opacity-5`), `--loader-skeleton-rect-height` (`spacing-24`), `--loader-skeleton-radius` (`rounded-md`) and `--loader-skeleton-text-radius` (`rounded-sm`).
- Docs site: the Loader page (was Spinner) with skeleton demos, and `shape` and `lines` in the playground. The old `spinner.html` link takes you there.

## [2.8.3] - 2026-10-10

### Changed

- Spinner text variant: the shine now uses `ease-in-out` (was `ease-in` in 2.8.1), easing in at the start of the words and out at the end. Same 2s cycle.

## [2.8.2] - 2026-10-10

### Added

- Docs site: a Spinner playground, like Button's. Pick the variant, size, tone, delay and label, see it live in the sidebar's theme (on a dark stage for `inverse`), copy the code, and press Replay to watch the show-after delay. Notes explain decorative spinners and why the text variant keeps the text color. The docs test drives it.

## [2.8.1] - 2026-10-10

### Changed

- Spinner text variant: the shine now uses `ease-in` instead of `linear`, so it starts slow and speeds through the words. Same 2s cycle.

## [2.8.0] - 2026-10-10

### Added

- Spinner `variant="text"`: a loader made of words, the label with a shine sweeping through it every 2s. It rests at 65% of the text color (4.5:1 on `surface` in every theme), stays in the text color (only `inverse` changes it), sizes with the type scale (`text-xs`, `text-sm`, `text-base`), is named and announced by its label, and is plain text under reduced motion.

### Deprecated

- Spinner `showLabel`: use `variant="text"` instead. It still writes the label beside a ring or dots, with a console warning, and will be removed in 3.0.0.

## [2.7.0] - 2026-10-10

### Added

- Spinner `showLabel` (off by default): writes the label beside the spinner, with a shine sweeping through the words every 2s. The words rest at 65% of the text color (`--spinner-label-dim`, `opacity-65`), which keeps 4.5:1 on `surface` in every theme; the visible text is hidden from screen readers, which already hear it as the spinner's name; plain text under reduced motion. The label follows the spinner's size.
- Spinner `tone="inverse"`: a white ring or dots and label in every theme, for dark scrims, overlays and media (`--spinner-inverse`, `white`).
- Tests for both, including the label's contrast in all six themes.

### Changed

- Spinner tones `primary` and `muted` now color the ring or dots only, so a visible label stays in the text color around it. A spinner without a label looks the same as before. Its markup gains an inner `.dk-spinner__art` element around the drawing.

## [2.6.0] - 2026-10-10

### Changed

- The Spinner's ring is livelier: while it turns (now 2s a turn), its arc stretches from a dot to most of the ring and shrinks again every 1.5s, its tail chasing its head, so each stretch starts somewhere new. Colors, sizes and tokens are unchanged. Under reduced motion the arc stays a steady quarter and turns at `animate-spin-reduced` (3s). Button's loading spinner follows.

## [2.5.0] - 2026-10-10

### Added

- `Spinner` component: shows that something is loading when progress is unknown. Two variants, `ring` (an arc turning on a faint track) and `dots` (three pulsing dots); sizes `sm` 16px, `md` 24px, `lg` 40px; `tone` `current` (the text color), `primary` or `muted`. It waits `delay` ms (300) before showing, so fast requests don't flash it, keeping its space meanwhile; then it is a `role="progressbar"` named by `label` ("Loading") and announced once through the shared status region. `label=""` makes it decorative. Ring turns with `animate-spin`; under reduced motion it turns slower and the dots only fade.
- Spinner component tokens (`components/Spinner/spinner.tokens.json`, also in `design-tokens/components/`): colors, sizes, ring thickness, track and dot strength, dot timing.
- Docs site: a Spinner page with every variant, size and tone, a live demo of the show-after delay, props, accessibility and tokens.
- Tests: `tools/test/spinner.mjs`, and a Button test that unmounts Buttons and Spinners.

### Changed

- Button's loading spinner is now the Spinner ring (decorative, at the button's icon size) instead of the `progress_activity` icon, so there's one spinner across the system.

### Fixed

- Removing a Button from the page (unmounting it) threw an error in React: an effect returned the shared status region instead of a cleanup function. Buttons and Spinners now unmount cleanly.

## [2.4.0] - 2026-10-10

### Changed

- Button's icon nudge is off by default: a right icon no longer slides on hover unless you turn it on with `--button-icon-nudge: var(--spacing-0\.5)` (2px), on the page, a container or one button. It suits forward arrows, but every right icon moved, including chevrons and "open in new" icons. The token's default is now `spacing-0`.

## [2.3.3] - 2026-10-10

### Added

- Docs site: a Changelog page (under Start) built from `CHANGELOG.md`, with a link to each release. It shows released versions only; changes waiting for the next release stay under Unreleased in `CHANGELOG.md`.

### Fixed

- Docs site: the Button playground and the hand-written demo buttons had no ripple, because they're plain HTML without the ripple layer the Button component renders. They now get it, and the docs test presses them to check.

## [2.3.2] - 2026-10-10

### Fixed

- Button's ripple still didn't show on a normal click: a click lasts about a tenth of a second, so the ripple started fading while it was a small circle under the mouse pointer. It now always spreads across the whole button before it fades, over `duration-500` (was 700ms in 2.3.1), so every click shows the full wave.

## [2.3.1] - 2026-10-10

### Fixed

- Button's ripple was hard to see: on a button-sized area it spread almost instantly (front-loaded `ease-out` over 500ms) at 15%, so a click read as a brief flash rather than a ripple. It now spreads evenly (`ease-in-out`) over `duration-700` at `opacity-20`, so the wave from the press point is visible on a normal click. `--button-ripple-opacity` and `--button-ripple-duration` default to the new values.

## [2.3.0] - 2026-10-10

### Added

- Button micro-interactions: press feedback (shrinks to 97% while held by pointer, Space or Enter), a ripple from the press point in the text color, a 2px nudge of a right icon on hover (mirrored in right-to-left text), and a cross-fade between the content and the loading spinner. They move only `scale`, `translate` and `opacity`, skip disabled, loading and `link`-variant buttons, and turn off under reduced motion (loading keeps its fade).
- Eight motion component tokens to tune or turn them off: `--button-press-scale`, `--button-press-duration`, `--button-icon-nudge`, `--button-icon-nudge-duration`, `--button-loading-duration`, `--button-ripple-opacity`, `--button-ripple-duration`, `--button-ripple-fade-duration`.
- Token `scale-97` (pressed buttons and small controls) with its utility classes (`scale-97`, `scale-x-97`, `scale-y-97`, `scale-z-97` and negatives): 25,560 classes.
- Tests: `tools/test/button-motion.mjs` (38 checks).

### Changed

- Button transitions name the properties it changes (background, text and border color, text decoration, the focus ring, and scale) instead of the whole `transition-colors` set, so the press can run at its own speed. Nothing changes visually.
- `scale-95` is now described for pressed cards and large surfaces; buttons use `scale-97`.

## [2.2.0] - 2026-10-10

### Added

- Custom icons: draw your own SVGs on the 24×24 grid, put them in `assets/Icons/` and run `python3 tools/icons/build.py`. `<Icon name="…">` and Button's `leftIcon`, `rightIcon` and `icon` take their names, with the same sizes, colors, alignment and accessibility as Material Symbols. The build keeps only shapes in `currentColor` and refuses anything unsafe or off-system with the reason.
- `Diki.customIcons` lists the custom icons; TypeScript gets `CustomIconName` and `IconName`, so custom names autocomplete.
- Tests: `tools/test/icons.py` (the build) and `tools/test/icons.mjs` (custom icons in Icon and Button).

## [2.1.0] - 2026-10-10

### Added

- Button component tokens: 44 `--button-*` tokens for its colors, spacing, sizes and borders (`components/Button/button.tokens.json`). Each is an optional override, set on the page, a container or one button; unset, Button looks exactly as before. Also in the W3C Design Tokens files as `design-tokens/components/button.tokens.json`.
- Tests: every component token refers to a shared token, the CSS uses exactly the defaults in the tokens file, and overrides and nested themes work.

## [2.0.0] - 2026-10-10

Button's API is now the system's own: the names that came from shadcn/ui and Radix are gone.

### Added

- `<Button href="…">` renders a link (`<a>`) that looks like a button, for navigation. With `target="_blank"` it adds `rel="noopener noreferrer"`. A disabled link Button renders without `href` (with `role="link"` and `aria-disabled`), so it can't be focused or followed and isn't listed as a link.
- `Diki.configure({ link })` registers a router's link component (Next.js `Link`, React Router `Link`…) for every Button with `href`.
- TypeScript: a Button with `href` takes link attributes, one without takes button attributes; mixing them (a link with `type="submit"`) is a type error.

### Changed

- Variant `default` is now `primary`, and size `default` is now `md`. Their classes are `dk-btn--primary` and `dk-btn--size-md`.
- `buttonVariants()` is now `buttonClass()`.
- The `data-slot="button"` attribute is now `data-component="button"`.

### Removed

- `asChild`: use `href` for links, or `buttonClass()` to style any other element as a button.
- The names deprecated in 1.0.0: `window.TailwindPalette` (use `window.Diki`), `variant="destructive"` (use `destructive`), `size="icon"` (use `icon`).

### Upgrading from 1.x

| 1.x | 2.0 |
| --- | --- |
| `<Button asChild><a href="/x">Go</a></Button>` | `<Button href="/x">Go</Button>` |
| `<Button asChild><Link to="/x">Go</Link></Button>` | `Diki.configure({ link: … })` once, then `<Button href="/x">Go</Button>` |
| `<Button>` (variant `default`) | unchanged: `primary` is the default |
| `variant="default"` | `variant="primary"` |
| `size="default"` | `size="md"`, or leave it out |
| `buttonVariants({ … })` | `buttonClass({ … })` |
| `[data-slot="button"]` | `[data-component="button"]` |
| `.dk-btn--default`, `.dk-btn--size-default` | `.dk-btn--primary`, `.dk-btn--size-md` |
| `window.TailwindPalette` | `window.Diki` |
| `variant="destructive"` / `size="icon"` | `destructive` / `icon="…"` |

## [1.0.0] - 2026-10-10

The first versioned release. It collects everything built before versioning started; the "Changed" and "Deprecated" sections list what differs from the earlier unversioned builds, for anyone who used them.

### Added

- **Color.** 22 palette families with 11 shades each (`50`–`950`) plus `white` and `black`: 244 colors. 33 role-based alias colors (`primary`, `surface`, `text`, `border`, `focus-ring`, status colors, `field`, `field-border`, `field-border-hover`, `placeholder`, `overlay`…) in six themes: Blue, Violet and Emerald, each light and dark. Contrast checked for 21 text, control and focus pairs in every theme (WCAG 2.2).
- **Tokens.** Spacing (35 steps on a 4px grid), radius, shadows, borders and outlines, typography (families, weights, tracking, leading), font sizes with line heights (`fontSize`), type styles (`type-xs` … `type-9xl`), transitions (durations, delays, easings, transition properties, animations, `animate-spin-reduced`), layout (breakpoints, numbered and named z-index layers, aspect ratios, column widths), sizing (containers, fractions, viewport units, `control-height-sm/md/lg`), flexbox and grid, filters, transforms and opacity.
- **Utility classes.** 25,552 classes in `components/bundle.css`, every value read from its token. Responsive versions (`sm:` `md:` `lg:` `xl:` `2xl:`) of the 524 classes that shape a layout.
- **Components.** `Button` (five variants plus `destructive`, three sizes, left, right and icon-only icons, `loading` with a centered spinner and a screen-reader announcement, `asChild`, `type="button"` by default, data attributes for tests) and `Icon` (Material Symbols Rounded, filled, the font's own optical sizing), with TypeScript types in `components/index.d.ts`.
- **Pages.** `components/base.css` (optional page defaults from tokens), `components/theme.js` (automatic dark mode that follows the system setting and remembers a visitor's choice; `Diki.theme`).
- **Self-contained.** Inter, Material Symbols Rounded and React 18.3.1 ship with the system; nothing loads from another server. Licenses in `licenses/`, credits in the README.
- **Design tokens export.** `design-tokens/` holds the tokens in the W3C Design Tokens format (2025.10) for design tools and token pipelines, kept in step with `tokens.json` by the tests.
- **Tools.** `tools/test/` (foundation audit, all utility classes against a baseline, Button behaviour, visual snapshots, page groundwork, docs site, cross-browser comparison through WebDriver for Safari, Firefox and WebKit), `tools/docs/` (documentation site generator), `tools/purge.py` (trims `bundle.css` to the classes a product uses), `tools/tokens/export.py`, `tools/release.py`.

### Changed

- The namespace is `window.Diki` (was `window.TailwindPalette`), and component classes and internal variables use the `dk-` prefix (were `tw-`).
- Type styles are named `type-*` (were `text-*`), so the classes `tokens.css` generates never clash with the `text-*` utilities.
- Motion tokens are one `transitions` group (were `duration`, `easing`, `transitionProperty` and `animation`).
- Shadow names follow the current scale: `shadow-2xs`, `shadow-xs`, `shadow-sm`…; `shadow` and `shadow-inner` still work.
- Numbered z-index steps (`z-0` … `z-50`) are for local stacking inside a component; page layers use the named layers (`z-sticky` … `z-tooltip`).
- `border-strong` is for emphasised dividers; form fields use `field-border`, which meets the 3:1 a control's boundary needs.

### Deprecated

These still work and will be removed in 2.0.0:

- `window.TailwindPalette`: use `window.Diki`.
- `<Button variant="destructive">`: use `<Button destructive>`.
- `<Button size="icon">`: use `<Button icon="…" aria-label="…">`.
