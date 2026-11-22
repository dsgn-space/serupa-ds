---
name: serupa
description: Build React UI with the Serupa design system (serupa-ds). Use when a project depends on serupa-ds, or when asked to add a screen, form or component that should look and behave like the rest of a Serupa app.
---

# Serupa design system

Serupa is a React 19 component library with design tokens, a light and a dark theme for each of 17 brand colors, and utility classes. It is accessible to WCAG 2.2 AA in every theme. Use its components and tokens instead of writing your own. They already handle keyboard use, focus, screen readers, dark mode, right-to-left text and reduced motion.

## Install and load

```sh
npm install github:dsgn-space/serupa-ds#v17.1.0
```

Pin a release tag, never `#main`. Then load the CSS once, in this order, before any of your own CSS:

```js
import '@diki-stwn/serupa-ds/tokens.css';   // every token, the themes, the fonts: always first
import '@diki-stwn/serupa-ds/base.css';     // page defaults; leave out when adding Serupa to an existing app
import '@diki-stwn/serupa-ds/bundle.css';   // components and utility classes (or components.css, plus utilities.css)
import { Button, Field, Input } from '@diki-stwn/serupa-ds';
```

The styles sit in cascade layers (`srp.tokens`, `srp.base`, `srp.components`, `srp.utilities`). The app's own unlayered CSS always wins over them, so an override never needs `!important`.

For production, trim the CSS in the build: `import { serupaPurge } from '@diki-stwn/serupa-ds/purge'` and add `serupaPurge()` to Vite's `plugins` (or `serupaPurgePostcss()` to `postcss.config.mjs` for Next.js and webpack). Without a bundler: `npx serupa-purge src -o public/bundle.min.css --components`. List any class the code builds at runtime with `keep: [...]` (or `--keep`).

## Theme

Put the brand and mode on `<html>`, and load `theme.js` first in `<head>` (or paste its text in an inline script) so the page has no flash of the wrong theme:

```html
<html lang="en" data-brand="blue" data-mode="auto">   <!-- brand: blue, violet, emerald… any accent color; mode: auto | light | dark -->
```

Pick the brand by its color: `blue` (the default) or any other palette color (`red`, `orange`, `amber`, `yellow`, `lime`, `green`, `emerald`, `teal`, `cyan`, `sky`, `indigo`, `violet`, `purple`, `fuchsia`, `pink`, `rose`) and import its `brands/<brand>.css` after `tokens.css`. Tune the look on `<html>` or any section, never with your own CSS: `data-density="compact"`, `data-radius="sharp"` or `"round"`, `data-shadow="neutral"`, `data-contrast="more"`.

One theme on one element: `data-theme="violet-dark"`. For the app's own brand color, make a theme with `npx serupa-brand acme "#0f766e" -o src/acme-theme.css`, import it after `tokens.css` and use `data-brand="acme"` (plus `data-brands="acme"` on `<html>` for theme.js); never hand-pick shades for `primary`. For locale and the built-in words, wrap the app in `<SerupaProvider locale="id-ID" labels={idLabels}>`; its `size="sm"` (or `"lg"`) sets every form control's default size, so don't repeat `size` on each one. For router links, call `configure({ link: Link })` once at startup.

## Rules

1. **Reuse before you build, in this order.** Stop at the first step that does the job:
   1. A ready-made screen or section: `npx serupa-add` lists the patterns (Dashboard, Sign in, Settings form, Team members, …) and blocks (Page header, Pricing, Stats row, …), and `npx serupa-add <Name>` writes one into `src/serupa/` as source to change. For a whole screen, start from one of these.
   2. A Serupa component from the list below. Don't rebuild a button, field, dialog, menu or table out of `div`s.
   3. Serupa components put together: a settings page is `Card`, `Field` and `Switch` in a column, not a new widget.
   4. A native element (`<details>`, `<progress>`, `<dl>`) styled with the utility classes and tokens.
   5. Only then your own code, on tokens, with keyboard use, focus and an accessible name kept. End the answer with one line, "Built by hand: <what>, because Serupa has no <component>.", so the gap gets seen.
2. **Tokens only.** Write no raw colors, pixel sizes, durations or shadows. Use the utility classes (`p-4`, `gap-2`, `bg-surface`, `text-text-muted`, `rounded-md`, `shadow-md`) or `var(--…)` tokens in your CSS (`var(--spacing-4)`, `var(--primary)`).
3. **Colors by role, not hue.** Use the alias tokens, which change per theme: `primary` (a fill), `on-primary`, `primary-text` (brand text, icons and lines), `surface`, `surface-muted`, `text`, `text-muted`, `border`, `danger`, `danger-text`, `success-text`, `warning-text`, `focus-ring`. A palette color like `blue-600` looks the same in every theme. Use one only when no alias fits. For text in the brand or a status color, use the `*-text` alias (`primary-text`, `danger-text`), never the fill.
4. **Restyle through component tokens.** Each component reads its own tokens (`--button-*`, `--input-*`), which default to the aliases. Override them on the page, a container or one instance, rather than overriding its `srp-*` classes. Use the components directly: no `ui/Button.tsx` that wraps Button to set its defaults, and no second component, icon, animation or CSS-in-JS library beside Serupa.
5. **Shared props.** `size` is `'sm' | 'md' | 'lg'`, at heights of 24, 32 and 44px. Form controls take `invalid` and `disabled`, and get their label, hint and error from `Field`.
6. **Pick feedback by how long it stays.** To confirm that something worked ("Saved", "Invite sent"), call `toast("Saved")`, and render one `<Toaster />` near the app's root. It goes away on its own and screen readers hear it. Use an `Alert` for a message that must stay on the page until it's dealt with, and `SaveStatus` for autosave.
7. **Words.** Every button starts with a verb that says what it does ("Save changes", "Send message"), never "OK", "Submit" or "Click here", and a dialog's title uses the same verb ("Delete project?" has a "Delete" button). Sentence case everywhere. No exclamation marks, emoji or "Oops". An error says what to do: "Enter your email", not "This field is required" or "Invalid input"; "We couldn't load your projects. Try again.", not "Something went wrong". An empty state says what goes here and offers to add the first one. The rest is in Content and voice: https://github.com/dsgn-space/serupa-ds/blob/main/docs/foundations.md#content-and-voice
8. **In an existing app, change only what the task needs.** Leave the other code, its formatting and its names as they are, even a hand-built button or a raw color next to your change. Use Serupa for what you add, and end the answer by naming the parts that could move to Serupa rather than moving them.
9. **Respect people's work.** Act at once and offer Undo with `toast.undo({ title, commit, onUndo })` rather than asking "Are you sure?"; confirm only what can't be undone. Progress and "Saved" show real work, never a timer. Ask only what the task needs. Leaving a flow keeps what was typed.

## Accessibility: what the app must do

The components meet their part of WCAG 2.2 AA. The page meets the rest only if you also do these, in every answer, however short:

- **Page:** set `<html lang>` and a unique `<title>`. Use one `main` (`<main id="main">`, or `<Container as="main" id="main">`) and start it with `<SkipLink />`, the "Skip to content" link, which moves focus to the main content (`id="main"`).
- **Headings:** one `h1` per page and no skipped levels. Heading's `level` sets the element, and its look can differ.
- **Names:**
  - Wrap every form control in `<Field label="…">`. A placeholder is not a label.
  - Give every IconButton a `label` (its accessible name and tooltip). It takes no `aria-label`.
  - Give every meaningful Image `alt` text, and a decorative one `alt=""`.
  - Write link text that says where the link goes.
- **Errors:** say what's wrong and how to fix it, next to the field. On submit, move focus to the first error or to an ErrorSummary.
- **Color:** in your own content, color never carries meaning alone. Add text, an icon or a pattern.
- **Focus:** never use `outline: none` alone (use `outline-hidden` if you must). Keep targets at least 24px, and keep sticky headers off the focused element (`scroll-padding-top`).
- **Route changes:** call `announcePage()` after a client-side route change. Say status changes with `announce("Saved")`, not with a visual change alone. When markup must change with the screen width, use `useBreakpoint('md')` (the same widths as the `md:` utilities), not your own `matchMedia`; `useReducedMotion()` gates an animation you run from JavaScript, and an in-app "Reduce motion" setting is `data-motion="reduce"` on `<html>`; `useCopyToClipboard()` copies from a control that isn't a CopyButton, such as a menu item.
- **Motion:** use the motion tokens, and don't animate anything that `prefers-reduced-motion` would want still.

## Before you finish

1. **Run the check and fix until it passes.** In an app `serupa-create` made, that's `npm run check`: the types, ESLint with jsx-a11y and `@diki-stwn/serupa-ds/eslint` (an Image with no `alt`, an IconButton with no `label`), and Stylelint with `@diki-stwn/serupa-ds/stylelint` (a raw color, spacing or radius). In another app, add `@diki-stwn/serupa-ds/eslint` after jsx-a11y in `eslint.config.js` and `extends: ['@diki-stwn/serupa-ds/stylelint']` to its Stylelint config, then run its lint.
2. **Tab through the page once.** Every control is reached in reading order, shows its focus ring, and works from the keyboard.
3. **Look at it in dark mode** (`data-mode="dark"` on `<html>`). Nothing you wrote should stay light.

## Components

Each component's guide covers when to use it, when not to, its props, its keyboard keys and its tokens. Print it from the installed release with `npx serupa-docs <Name>`, or one part with `npx serupa-docs <Name> props` (or `keyboard`, `accessibility`, `when not to use`). `npx serupa-docs search <words>` finds components, topics and tokens. It answers for the version the project pinned, so read it rather than the repository on GitHub, which shows main.

<!-- components:start (written by tools/build/registry.mjs) -->

### Actions

- **Button**: Triggers an action: submitting a form, opening a dialog, confirming or cancelling. Also called: call to action, CTA.
- **ButtonGroup**: Related buttons side by side, or stacked: joined into one control with shared borders (the default), or spaced apart. Also called: button bar, action group.
- **CopyButton**: A button that copies text to the clipboard: an API key, an invite link, a command. Also called: copy to clipboard, clipboard button.
- **Fab**: A floating action button: the one main action of a screen, such as "New project" or "Compose", in a round, raised button fixed to a corner. Also called: floating action button.
- **FabMenu** (beta): A floating action button that opens a few related actions, such as "New document", "New folder" and "Upload a file", when a screen's main action comes in kinds. Also called: speed dial, FAB menu.
- **IconButton**: A button that shows only an icon: a menu trigger, a close button, a toolbar action. Also called: icon-only button.
- **Link**: An inline text link: underlined, in the primary color or the surrounding text's. Also called: anchor, hyperlink.
- **SplitButton** (beta): A main action joined to an arrow button that opens a menu of other ways to do it: Publish, with Schedule and Save as draft one click away. Also called: button with dropdown, split dropdown button.
- **ToggleButton**: A Button that stays on or off, for a setting that applies right away: bold in a text editor, mute, show the grid. Also called: on/off button, state button.
- **ToggleGroup**: A set of ToggleButtons that share one value: one on at a time, such as text alignment or a view mode, or any number, such as bold, italic and underline. Also called: toggle button group, icon toggle group.
- **Toolbar**: A set of controls, such as an editor's formatting buttons, that takes one Tab stop instead of one per control. Also called: action bar, button toolbar.

### Content

- **Accordion**: A stack of items whose content shows and hides under a title button: FAQs, settings groups, long forms split into sections. Also called: collapsible, disclosure, expander, expandable section.
- **Attachment** (beta): A file shown as one compact row: an icon for its kind, the name, the kind and size, and, while it uploads, a bar. Also called: file, download link.
- **Avatar**: A small picture of a person (a circle) or of a team, project or organization (a square). Also called: profile picture, user image.
- **AvatarGroup**: Avatars in an overlapping row, such as the people on a project or the assignees of a task. Also called: avatar stack, facepile.
- **Card**: A surface that groups related content and its actions: a summary, a settings panel, an item in a grid. Also called: tile.
- **Carousel**: One slide at a time, with previous and next buttons, a dot per slide and swipe. Also called: content slider, slideshow.
- **Chat** (beta): A conversation: messages in a log that stays at the newest one while the reader is there, day dividers, and a composer where Enter sends. Also called: chat window, assistant panel, message thread.
- **CodeBlock** (beta): Code for people to read and copy: an install command, a config file, an example. Also called: code snippet, syntax highlighter.
- **DataGrid** (beta): A grid of cells people work on in place, like a spreadsheet: move with the arrow keys, edit a cell where it is, select a range, and copy or paste a block to and from a spreadsheet. Also called: spreadsheet, editable data table.
- **DescriptionList** (beta): A list of terms and their details: a record's fields on a detail page, an order's subtotal and total, a dialog of keyboard shortcuts. Also called: key-value list, definition list, property list.
- **Duration**: How long something takes or took, written the way the reader's locale writes it: "1 hr, 30 min", "1 jam, 30 menit", "1 hour, 30 minutes", "1h 30m" or "1:30:00". Also called: formatted duration, time span, elapsed time.
- **FormattedDate**: Writes a date, a time or a range of dates the way the reader's language does: "November 20, 2026" in English, "20 November 2026" in Indonesian, "٢٠ نوفمبر ٢٠٢٦" in Egyptian Arabic. Also called: date format, date display, formatted time.
- **FormattedNumber**: Writes a number the way the reader's language does: `1.234,5` in Indonesian, `1,234.5` in English, `١٬٢٣٤٫٥` in Egyptian Arabic. Also called: number format, currency display.
- **Highlight**: Shows text with the parts that match a search marked, ignoring case and accents, for search results, Combobox options and a command palette. Also called: mark, match highlighting.
- **Icon**: Shows one icon as an inline SVG: from Material Symbols, always in the **Rounded** style with **Fill** on, or one of your own custom icons. Also called: glyph, symbol.
- **IconTile**: An icon centered in a tinted rounded square (or a circle), to mark what a card, a settings row or an empty state is about at a glance. Also called: icon container, icon box.
- **Image**: A picture in a frame: a fixed ratio, rounded corners, a placeholder while it loads and a fallback if it fails. Also called: picture, img.
- **Kanban** (beta): A board of columns of cards, such as a sprint or a sales pipeline, that people move by dragging a handle, by keyboard, or from each card's "Move to…" menu. Also called: board, task board, kanban board.
- **Kbd**: Shows a keyboard key or shortcut as keycaps, in help text, tooltips, menus and empty states. Also called: keycap, keyboard key.
- **Lightbox**: A set of pictures shown full size, one at a time, over the page. Also called: image viewer, media viewer, photo gallery viewer, slideshow.
- **List**: Rows of related things: people, files, notifications, settings. Also called: list view, item list.
- **Logo** (beta): The product's logo at a set height, with a version for dark themes and a small mark for narrow screens. Also called: brand mark, logotype.
- **MaskedValue** (beta): Shows a sensitive value with most of it hidden behind bullets, keeping just enough for its owner to recognize it: "•••• 1208" for a card, "a••••" for an email. Also called: masked text, redacted value, obfuscated value.
- **QRCode** (beta): Draws a QR code from a value, such as a payment link, a sign-in link or an authenticator setup string, so a phone can pick it up from the screen. Also called: QR, barcode, 2D code, scan code.
- **Quote** (beta): Quoted words with who said them, for a testimonial, a pull quote, or a quote in a page that isn't Prose. Also called: blockquote, testimonial, pull quote.
- **RelativeTime**: Says how long ago, or how far ahead, a moment is, in the reader's language: "3 minutes ago", "yesterday", "in 2 hours". Also called: time ago, relative date.
- **ShowMore** (beta): Long text cut after a few lines, with a "Show more" button under it that shows the rest. Also called: read more, expandable text.
- **SortableList**: A list people put in their own order: tasks by priority, steps in a flow, columns in a table. Also called: reorderable list, drag and drop list.
- **Table**: A data table built on native table markup: a header row, body rows and an optional footer, in a bordered frame that scrolls sideways when the table is too wide. Also called: data table.
- **TagGroup** (beta): Short labels people remove or pick: the labels on a ticket, the recipients of a message, the skills on a profile. Also called: chip group, tag list.
- **VirtualList** (beta): A List of any length that draws only the rows in view, so ten thousand people, files or log lines scroll as smoothly as ten. Also called: virtualized list, windowed list, virtual scroller.

### Data display

- **Chart** (beta): A line, bar or area chart of a few series over the same categories, such as visitors per month or orders per region, a donut of one series' shares, such as traffic by source, or a heatmap of a grid of values, such as orders by weekday and hour. Also called: graph, data visualization.
- **Countdown**: Shows the time left until a moment, as a clock ("4:59") or in words ("4 minutes, 59 seconds"), and keeps itself up to date. Also called: timer, countdown timer.
- **EventCalendar** (beta): A month of events: meetings, deadlines, bookings. Also called: scheduler, agenda.
- **Sparkline** (beta): A small trend line that sits in a sentence, a table cell or a stat card, with a dot on the latest value. Also called: microchart, trend line, inline chart.
- **StatTile** (beta): One key number on a card, for the top of a dashboard: what it is, the number, how it changed since the period before (in words, with an arrow), and an optional trend line. Also called: KPI card, stat card, metric tile, scorecard.
- **StatusTracker** (beta): A strip of bars, one a day, for uptime or a job's history: up, degraded, down or no data, told apart by shape as well as color. Also called: uptime bar, uptime tracker, status page bar.
- **Timeline**: An ordered list of events, each with a marker on a line that joins them, a title, a time and optional content. Also called: activity feed, history.

### Feedback

- **Alert**: A message about the page or a task: something saved, something to know, something that went wrong. Also called: callout, banner, inline message.
- **Badge**: A short label for status, counts and categories, optionally clickable. Also called: tag, chip, pill, label.
- **EmptyState**: What a page or a panel shows when there's nothing in it yet, or nothing matches: an icon, a few words saying what's empty, what it means, and the action that fills it. Also called: blank slate, zero state.
- **ErrorBoundary**: Catches an error thrown while rendering anything inside it and shows a message with "Try again" in its place, so one broken widget doesn't blank the whole page. Also called: error fallback, crash screen.
- **Illustration** (beta): A small line drawing for an empty state, an error page or a finished flow. Also called: spot illustration, artwork.
- **Loader**: Shows that something is loading when you can't say how far along it is. Also called: spinner, skeleton, loading indicator.
- **Meter**: Shows a measurement within a known range: storage used, a plan's seats, a password's strength, a battery level. Also called: gauge.
- **OfflineBanner** (beta): Says when the connection drops and when it comes back, on screen and to screen readers. Also called: connection banner, offline indicator.
- **Progress**: Shows how far along a task is when you can tell: an upload, a setup, a quota. Also called: progress bar.
- **SaveStatus**: A small line that says whether autosaved changes are safe: "Saving…", "Saved 2 minutes ago", or "Couldn't save" with a Try again button. Also called: autosave indicator, sync status.
- **Toast**: A short message that confirms something happened ("Changes saved", "Moved to trash") without getting in the way. Also called: snackbar, notification.

### Forms

- **Calendar**: A month of days to pick one from, with full keyboard navigation. Also called: date grid, month view.
- **CascadeSelect** (beta): One choice made through a hierarchy, such as Provinsi › Kabupaten/Kota › Kecamatan or Category › Subcategory › Item. Also called: cascader, cascading dropdown, nested select.
- **Checkbox**: A native checkbox with its label, for turning one option on or off, or picking any number from a list. Also called: check box, tick box.
- **ColorPicker**: Picks a color from a set of swatches, or any color by its hex code or with the browser's own picker. Also called: color input, swatch picker.
- **Combobox**: A text field with a list of options that narrows as you type: pick a country, an assignee, a project. Also called: autocomplete, autosuggest, typeahead.
- **DateField** (beta): A date people know or copy from a document, such as a date of birth or a passport's expiry, typed as day, month and year in three labelled boxes, in the locale's order. Also called: date input, segmented date input.
- **DatePicker**: A date field: people type a date, or pick one from a calendar that opens under the field. Also called: date chooser, calendar input.
- **DateRangePicker**: Two date fields for the start and end of a range (a stay, a report period, a filter), with a popup of two months to pick both. Also called: range picker, date range input.
- **ErrorSummary**: After a form fails to submit, a box at the top of the form that says what's wrong, with each error a link to its field. Also called: error list, form error summary.
- **Field**: A label, an optional hint and a message (an error, a warning or "checking…") around one form control, wired up for screen readers. Also called: form field, form label, fieldset.
- **FieldList** (beta): Rows people add and remove in a form, such as phone numbers, emergency contacts or the lines of an invoice. Also called: repeater, dynamic fields, form list.
- **FileUpload**: A drop area with a button for choosing files, and the chosen files listed under it with their size and a remove button. Also called: dropzone, file input, file uploader.
- **FilterBar** (beta): The filters on a list or a table, as a row of chips. Also called: filters, filter chips, faceted search.
- **Form** (beta): A `<form>` checked against one schema. Also called: form validation, schema form, form wrapper.
- **ImageCropper** (beta): A picture in a frame of a fixed shape, which people move and zoom to choose the part to keep: a profile photo, a team logo, a cover. Also called: image crop, avatar editor, photo cropper.
- **InlineEdit**: Text people can change where it is: a project name, a card title, a slug. Also called: click to edit, editable text.
- **Input**: A single-line text field: a native `<input>` in a box that can hold icons. Also called: text input, text field.
- **MentionInput** (beta): A multi-line text field where typing "@" opens a list of people to mention, at the caret. Also called: mentions, @-mentions, user tagging.
- **NumberInput**: A field for a number, with − and + buttons at the end. Also called: nudger, quantity input, counter, spin button.
- **PasswordInput**: A password field with a button at the end that shows and hides what was typed, so people can check it before they submit. Also called: password field, show password field.
- **PeriodPicker** (beta): A month, a quarter or a year, picked from a grid: for a report's month, a billing period or a dashboard's quarter. Also called: month picker, month and year picker, quarter picker, fiscal period selector.
- **PhoneInput**: A phone number field with a country menu at the start. Also called: phone number field, telephone input.
- **PinInput**: A one-time code or PIN, shown as one box per character, such as the 6-digit code texted at sign-in. Also called: OTP input, one-time code input, verification code input.
- **Radio**: Native radios for one choice from a short list. Also called: radio button, radio group.
- **RangeCalendar** (beta): A calendar on the page that picks a range of days: the check-in and check-out of a booking, a report's period, the first and last day of a leave request. Also called: date range calendar.
- **Rating**: Stars to pick a score (how was your stay, how useful was this article) or to show one (a product's average). Also called: star rating.
- **SearchInput**: A search field: a search icon at the start, and a × at the end once something is typed. Also called: search, search field, search box.
- **SegmentedControl**: Picks one of a few options shown side by side, such as a view (List, Board) or a period (Day, Week, Month). Also called: segmented button, button toggle group.
- **Select**: A native `<select>` styled like Input: the same three heights (24, 32 and 44px), colors, focus ring and states, with a chevron and an optional left icon. Also called: dropdown, select input, picker.
- **SignaturePad** (beta): A place to sign: people draw their signature with a mouse, pen or finger, or type their full name instead. Also called: signature field, e-signature input.
- **Slider**: Picks a number, or a range with two thumbs, by dragging along a track or with the keyboard. Also called: range input, range slider.
- **Switch**: An on/off setting that takes effect at once. Also called: toggle, toggle switch, lightswitch.
- **Textarea**: A multi-line text field, Input's sibling: a native `<textarea>` in a box. Also called: text box, multiline text field.
- **TimePicker**: A time-of-day field: people type a time, or pick one from a list. Also called: time input, time selector.
- **TimeZonePicker** (beta): A searchable list of time zones, by city, with each one's offset now and its name in the reader's language. Also called: time zone select, timezone dropdown.
- **TransferList**: Two lists, Available and Chosen, with Add and Remove between them, for picking a set out of many: the columns a table shows, the permissions a role has, the people on a team. Also called: dual list, shuttle, list builder, pick list.
- **TypeToConfirm**: A field and a destructive button for an action that can't be undone: the button works only once the person types a phrase, usually the name of what's being deleted. Also called: confirmation input, type to delete.

### Layout and type

- **AppShell** (beta): The frame around an app's pages: a skip link, the header, the sidebar, main, the footer and a bottom navigation, laid out and kept in place as the page scrolls. Also called: app layout, page shell, application frame.
- **Center** (beta): Keeps content to a maximum width in the middle of the space it's in, and with `vertical`, in the middle of the screen's height too. Also called: centered layout, auth layout.
- **Container**: Centers a page's content with a maximum width, and side padding that grows with the screen: 16px, 24px from 640px and 32px from 1024px wide. Also called: wrapper, page width.
- **Divider**: A 1px line between content, horizontal or vertical, with an optional label in the middle such as "or". Also called: separator, horizontal rule, vertical rule.
- **Grid**: Cells in equal columns, or as many columns as fit, with the same space between them from the spacing scale. Also called: layout grid, columns.
- **Heading**: A heading, `h1` to `h6`, in the system's type. Also called: title, headline.
- **PageSection** (beta): One full-width band of a long page, such as a landing page's hero, features, pricing or questions. Also called: section, band, strip, hero.
- **Prose**: Styles for content nobody wrote in components: HTML from Markdown, a CMS or a rich-text editor, such as a help article, a changelog or a blog post. Also called: rich text, article content.
- **ScrollArea** (beta): A box whose content scrolls inside it, such as a long activity list in a card or a row of chips in a narrow column. Also called: scroll container, scroll box.
- **SidebarLayout** (beta): Puts a narrow column beside a wide one, and stacks them once the space gets too narrow for both. Also called: two-column layout, aside layout, split layout.
- **Splitter**: Two panes with a handle between them that people drag, or move with the keys, to give one pane more room: a list and its detail, a sidebar and an editor, code and its output. Also called: resizable panels, split view, split pane.
- **Stack**: Lays its children out in a column, or a row, with the same space between each, taken from the spacing scale. Also called: flex stack, VStack, HStack, inline, cluster.
- **Text**: Body text in the system's type: a paragraph, a caption, an error line. Also called: paragraph, body text.
- **TruncatedText** (beta): Text that may not fit its space, such as a file name in a narrow column: cut with an ellipsis, with the whole text shown beside it on hover, keyboard focus or a tap. Also called: ellipsis, text overflow, line clamp.
- **VisuallyHidden**: Content that screen readers announce but nobody sees: "(opens in a new tab)", the label of an icon-only control you build yourself, a heading for a section that's obvious by sight. Also called: screen-reader only, sr-only.

### Navigation

- **BottomNav** (beta): A bar of three to five main destinations fixed along the bottom of a phone screen, where a thumb reaches: each an icon over a short label, the current page marked. Also called: tab bar, bottom navigation bar.
- **Breadcrumb**: Shows where the current page sits: links to the pages above it, from the top level down, with chevrons between them. Also called: breadcrumbs, breadcrumb trail.
- **LoadMore**: The end of a list that loads in pages: "Showing 20 of 134" over a Load more button, or infinite scroll, and an announcement of what each load added. Also called: load more button, more results button.
- **Navbar**: The bar across the top of an app: the brand on the left, the main page links, and actions on the right (search, a user menu, sign in). Also called: header, top bar, app bar.
- **Pagination**: Moves through pages of results: previous and next arrows around the page numbers, with … where pages are skipped. Also called: pager.
- **Sidebar**: A vertical nav for an app's pages: an optional header (a logo, a workspace switcher), sections of items with icons, badges and nested groups, and a footer pinned to the bottom (settings, the signed-in user). Also called: side navigation, side nav, navigation rail.
- **SkipLink**: The "Skip to content" link that keyboard and screen reader users need first on every page (WCAG 2.4.1 Bypass Blocks). Also called: skip to content link.
- **Stepper**: Shows where people are in a task split into steps, such as sign-up, checkout or setup. Also called: progress indicator, steps, wizard steps, progress tracker.
- **TabNav** (beta): Moves between the sub-pages of one thing, such as a project's Overview, Activity and Settings, when each has its own URL. Also called: navigation tabs, tab links.
- **TableOfContents** (beta): An "On this page" list of links to the sections of a long page, as a navigation landmark. Also called: TOC, on this page, page outline.
- **Tabs**: Switches between related panels in one place, such as a project's Overview, Activity and Settings. Also called: tabbed interface.
- **TreeView**: Nested items that open and close, such as folders and files, a table of contents or categories. Also called: tree, nested list navigation.

### Overlays

- **CommandPalette** (beta): A search over the app's commands and pages in a dialog, opened with ⌘K (Ctrl+K off Apple devices) from anywhere: type a few letters, move with the arrows, press Enter. Also called: command menu, quick switcher, ⌘K menu.
- **ContextualHelp** (beta): A small "?" or "i" button beside a label, heading or value that opens a sentence or two of explanation in a panel next to it: a toggletip. Also called: toggletip, info tip, help popover.
- **Dialog**: A modal window over a dimmed page, for a task or a decision that needs attention before people go on: inviting someone, confirming a delete, editing a few fields. Also called: modal, modal window, popup.
- **Drawer**: A modal panel that slides in from an edge of the screen: navigation on small screens, filters, or details and edits without leaving the page. Also called: sheet, tray, flyout, side panel.
- **HoverCard**: A preview of what a link points to: a person, a page, a repository. Also called: preview card, link preview.
- **KeyboardShortcuts**: Keyboard shortcuts for an app, in one place: `useShortcut` sets one up where it's used, and `<KeyboardShortcuts>` is the help dialog that lists them all, opened with <kbd>?</kbd>. Also called: shortcut help, hotkeys dialog, cheat sheet.
- **Menu**: A list of actions behind a button: a row's "More" menu, an "Actions" dropdown, a user menu. Also called: dropdown menu, action menu, overflow menu.
- **Menubar** (beta): An application's menu bar: File, Edit, View along the top of an editor or tool, each opening a menu. Also called: menu bar, application menu.
- **NotificationCenter**: A drawer of past notifications with read states: newest first, unread ones with a dot and a bolder title, and buttons to mark them read or clear the list. Also called: inbox, notification panel.
- **Popover**: A small panel next to its trigger for content people interact with: a short form, filters, details with links. Also called: floating panel, dropdown panel.
- **Tooltip**: A short hint about one element, shown while it's hovered or focused: what an icon button does, a keyboard shortcut, why something is unavailable. Also called: hint, info tooltip.
- **Tour**: A short guided walk through a page: one step at a time, a small panel points at a part of the page, says what it's for, and offers Back, Next and Done. Also called: product tour, walkthrough, coach marks.

<!-- components:end -->
