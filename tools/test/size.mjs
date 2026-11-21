// Size budget: what each file a project loads weighs, gzipped, against its budget. Build first (npm run build).
//   node tools/test/size.mjs                  check
//   node tools/test/size.mjs --update Name    raise Name's budgets that what it weighs now (5% and 0.1 KiB over) is
//                                             past, in Name.<branch>.json; with no name, writes Name.json for the
//                                             component folders that have no budgets yet
//   node tools/test/size.mjs --update Name --only alone    raise that one budget only
//   node tools/test/size.mjs --update Name --exact   set Name.json from what it weighs now, lower too, and remove
//                                             its raise files
//   node tools/test/size.mjs --fold           fold every raise file into its Name.json (the Release pull request)
//   node tools/test/size.mjs --raise-shared "what grew"   raise each shared line that is over (a total, LABELS,
//                                             STARTER) in tools/test/baseline-size-shared/<branch>.json
//   node tools/test/size.mjs --json size.json --previous last.json   and compare with last night's (nightly, below)
// The JavaScript is measured as a project's bundler ships it (minified, React left out, the full icon set left to
// load on demand). Over budget fails; when a change is worth the bytes, raise the budget in the same pull request,
// so the growth is a decision someone reviews.
//
// Each component folder has its own budgets, in tools/test/baseline-size/<Name>.json. A pull request that raises one
// adds Name.<branch>.json with the raised keys, and a budget is the highest of its files, so two pull requests that
// raise the same component (shared code grew under both) add a file each instead of conflicting on the same line:
//   alone  what a project that imports only this folder's exports ships, its own words (labels.ts) included
//   share  what the folder adds to the whole package (all of index.js, less the same build without it)
//   css    its own CSS, gzipped by itself (only its own change moves it)
// The totals grow with the folders' budgets: TOTALS below holds each total's budget and what the folders' shares
// (or CSS) added up to when it was set, and the budget moves by however much that sum has moved since. So adding a
// component, or raising one's budget, raises the totals too, and only a change to the shared code edits TOTALS.
// The built-in label text (enLabels: every folder's labels.ts) has one budget of its own, LABELS, with room for a few
// dozen more labels; while the text is within it, a pull request that adds a label edits no total, and the totals
// allow for it. A component's bundle carries only its own words and the shared ones (GL4, 26 Oct 2026): before, it
// carried every folder's, about 1.9 KiB gzipped, so "alone" was measured without them.
// Also held: tokens.css (it ships from the package root), the two font files (as they are: woff2 is already
// compressed), and a starter page, what a first page with a sign-in form costs (STARTER below).
// CI writes the table to the run's summary page, with each file's Brotli size beside it (most servers send Brotli;
// the budgets stay on gzip).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import * as esbuild from 'esbuild';
import { HERE, PROJECT, done, report, sizeBudgets, sharedRaise, raiseTag, SIZE_FILE } from './lib.mjs';
import { execFileSync } from 'node:child_process';
import { purge, unusedComponentClasses, usedClasses } from '../../bin/serupa-purge.mjs';

// A pull request whose shared code (src/internal, labels) grows on purpose may raise its line here itself, by up to
// 0.5 KiB, with a dated note saying what grew; a bigger raise needs a reason in the pull request.
// KiB, gzipped: [budget, the sum of the folders' budgets it was set at, which ones]. About 3 to 4% above the size
// when each was last set (index.js 62.2, serupa.iife.js 610.1 on 24 Oct 2026; components.css 27.3 once it shipped
// without the source comments).
const TOTALS = {
  'All components (index.js)': [84.6, 59.3, 'share'],   // +3.5 KiB on 21 Nov 2026: ten more components compiled by the React Compiler (Menu to Select, ADR-0017) carry its memo cache; the ones whose own share stayed within budget still add to the whole, 3.2 over once Engineering's second batch and SignaturePad to TreeView landed; +0.5 KiB on 15 Nov 2026: the app-wide control size (SerupaProvider's size read by every control) on top of the five pull requests queued ahead of it took main 0.4 over; +1.0 KiB on 15 Nov 2026: Calendar's month and year grids (the heading opens a year's months, then twelve years, with their keys) and the anchored layers hiding once their anchor scrolls out of view (internal/useAnchoredLayer.ts, in every menu, popover and tooltip) took it 0.9 over; +1.4 KiB on 14 Nov 2026: three HIG items in one pull request: Toolbar's overflow (the layout pass and the More menu built from the hidden controls), ChatReplyActions (Copy, Regenerate, Helpful and Not helpful) and their seven labels; +0.2 KiB on 14 Nov 2026: TableActionBar's select-all across pages and sticky, with tableSelectAll and tableAllSelected in all 20 languages, took main 0.1 over; +0.2 KiB on 14 Nov 2026: DateField's own messages (which box is wrong and why, the dateFieldError label in all 20 languages) and its month menu took it 0.1 over; +0.3 KiB on 14 Nov 2026: Ctrl+Z / ⌘Z choosing Undo on the newest toast.undo (the Toaster's key handler and the undo map) took main 0.2 over; +0.2 KiB on 14 Nov 2026: BottomNav's badge, Fab's extended="auto" and TagGroup's icons and avatars (Material Design 3 study) took main 0.1 over; +0.1 KiB on 14 Nov 2026: the close request (a CloseWatcher in internal/useAnchoredLayer.ts, so Back on a phone closes an open Menu or Popover) took main 65 B over; +0.1 KiB on 14 Nov 2026: the scoped package name (@diki-stwn/serupa-ds) in the shared page key and the warnings' text took main 6 B over; +0.7 KiB on 13 Nov 2026: EventCalendar's week and day views bring six labels in all 20 languages (labels count as shared code), which took it 0.6 over; +0.3 KiB on 13 Nov 2026: Drawer's snap points (a bottom sheet) and its two handle words in every label pack took main 0.2 KiB over; +0.4 KiB on 12 Nov 2026: the guards on index reads in internal/ (dates, numbers, masks, the virtual list's offsets) took main 0.3 over, with four components' share budgets reset to what they share now; +0.4 KiB on 12 Nov 2026: constraint messages in the locale's own numbers and dates (internal/validity.ts) and the shared sticky-header measurement (internal/stickyHead.ts) took main 0.2 over; +1.2 KiB on 12 Nov 2026: TabNav, the scrolling tab row it shares with Tabs (Tabs/tabRow.ts), and the platform-aware key names Menu's shortcuts share with Kbd (internal/keys.ts) took main 1.1 KiB over; +0.1 KiB on 12 Nov 2026: IconButton's tooltip (a Tooltip in place of the native title) took main 0.1 KiB over once KeyboardShortcuts' switch landed; +0.4 KiB on 11 Nov 2026: FormErrors (internal/formErrors.ts, read by Field and ErrorSummary) and Textarea's actions row took main 0.2 KiB over; +0.2 KiB on 11 Nov 2026: KeyboardShortcuts' single-key switch (WCAG 2.1.4) and FormattedNumber's animate landed together and took main 0.1 over; +0.5 KiB on 2 Nov 2026: main sat at 0 B spare after the day's merges, and Navbar's shadow-root focus fix (GR95) takes it a few bytes over; the rest is room for Rating's target size (GR104) and the components queued behind it; +0.2 KiB on 2 Nov 2026: Icon size steps and weights (116+76) took main 49 B over; +0.5 KiB on 1 Nov 2026: main sat at 0 B spare, and TableRow href (TF3) takes the bundle 0.2 over; the rest is room for the narrow-screen and shadow-root fixes queued behind it; +0.2 KiB on 1 Nov 2026: Slider refits its end labels when a web font changes their width (main sat within bytes of the line and this took it 99 B over); +1.0 KiB on 31 Oct 2026: a standing margin (main at 113.4 of 113.6, and four queued accessibility fixes, RelativeTime and the untilFound helper for ErrorSummary, Accordion and Tabs, add about 0.4; it leaves about 0.8 spare after them, so a one-line fix doesn't need a raise of its own); +0.3 KiB on 31 Oct 2026: headroom for one-line accessibility fixes (RadioGroup ref.focus, #1191, leaves main at 0 B spare, and CheckboxGroup's ref.current.focus() needs 5 B more); +0.2 KiB on 31 Oct 2026: the shared field-control call (useFieldControl) in Slider (#1172) took main 16 B over, and SegmentedControl (#1173) and ColorPicker (#1175) add the same call; +1.0 KiB on 31 Oct 2026: headroom for shared code (after #1047 main sat within bytes of the line and #1048 went 3 B over; three lanes land shared code at once, and 0.5 left none for the day); +0.5 KiB on 31 Oct 2026: headroom for shared code (#997, #1000, #1001 and #1002 landed together and took main 57 B over); +0.5 KiB on 26 Oct 2026: headroom for shared code (main sat 0.2 KiB under, and #735, #777 and #781 each went 0.0 to 0.1 over it); +0.2 KiB on 26 Oct 2026: Firefox strict-CSP server styles applied from React's props (internal/serverStyles.ts, FW1); +1.0 KiB on 25 Oct 2026: headroom for shared code (the trigger contract, internal/trigger.ts, G9, needs 0.2 with the total at its budget); +0.3 KiB on 25 Oct 2026: SerupaProvider keeping inline labels and icons stable (internal/provider.tsx, U2) needs 0.12 over the 48 B left; +0.2 KiB on 25 Oct 2026: the open-change reasons (internal/openChange.ts, #531) took the shared code 0.1 over once that day's merges landed together; +1.6 KiB on 25 Oct 2026: label text (every folder's labels.ts, FileUpload's refusal messages too) counts as shared code; +0.9 the same day: the accessible-name warnings (internal/nameCheck.ts)
  'components.css': [28.5, 126.5, 'css'],   // 53.6 until 13 Nov 2026, when "css" became each folder's own CSS gzipped alone (the budgets' sum went from 133.9 to 206.8, the total's budget stayed 108.8)
  'serupa.iife.js': [136.8, 99.0, 'share'],   // +0.3 KiB on 16 Nov 2026: the popup fields' open, defaultOpen and onOpenChange (useOpenState in internal/openChange.ts) on top of main's deprecated aliases; +0.3 KiB on 16 Nov 2026: one name for each idea (TimelineItem's tone, Combobox's onInputValueChange, PasswordInput's revealed, read beside the old names until 17.0.0); +0.1 KiB on 16 Nov 2026: Field's warning and checking, Calendar's week numbers and Pagination's jump on top of main's Field messages; +0.4 KiB on 15 Nov 2026: modern web guidance batch (Field's native-constraint messages, CopyButton's failed state with copyFailedShort in all 20 languages, Slider's cancelled press) took it 0.3 over; +0.3 KiB on 15 Nov 2026: modern web guidance platform batch (Sidebar's find-in-page, Carousel's one slide per swipe, the tab row's own scroll handling) took it 0.2 over; +0.1 KiB on 15 Nov 2026: SegmentedControl's quick clicks, as in index.js, took it 27 B over; +0.2 KiB on 15 Nov 2026: the Switch icon and vertical Slider landing first took it 34 B over (with FilterBar's share back at main's 2.0); +0.8 KiB on 15 Nov 2026: the IIFE bundles every component whole, so the app-wide control size and the debug overlay's theme panel, landing after the Toolbar overflow, Calendar grids, DateField messages and select-all across pages, took it 0.7 over (each component is still held to its own budget); +0.1 KiB on 15 Nov 2026: Back on a phone closing the Navbar's small-screen menu and a non-modal Drawer (internal/closeWatcher.ts) took it 24 B over; +0.5 KiB on 15 Nov 2026: Calendar's month and year grids and the anchored layers hiding with their anchor, as in index.js, took it 0.4 over; +1.2 KiB on 14 Nov 2026: Toolbar's overflow and ChatReplyActions, with their seven labels in all 20 languages, as in index.js; +0.3 KiB on 15 Nov 2026: Table's select all across pages and the layouts per screen width, landing after DateField's messages, took it 0.2 over; +0.5 KiB on 14 Nov 2026: EventCalendar's adding and moving (the pointer and key handling, and the eventChanged label in all 20 languages) took it a few bytes over once main's TableOfContents rail landed; +0.6 KiB on 13 Nov 2026: EventCalendar's week and day views (the hours grid, and six labels in all 20 languages) took it 0.5 over; +0.3 KiB on 13 Nov 2026: Drawer's snap points and their words, as in index.js; +0.4 KiB on 12 Nov 2026: constraint messages in the locale's own numbers and dates and the shared sticky-header measurement took it 0.3 over; +1.4 KiB on 12 Nov 2026: the IIFE bundles every component, so TabNav with the tab row it shares with Tabs, and the key names Menu and Kbd share (internal/keys.ts), land here whole and took it 1.4 KiB over; +0.1 KiB on 12 Nov 2026: IconButton's tooltip took it 0.1 KiB over; +0.3 KiB on 11 Nov 2026: FormErrors (a form's server errors by field name, internal/formErrors.ts) and Textarea's actions row are in the IIFE whole, and took it 0.1 over; +0.5 KiB on 11 Nov 2026: KeyboardShortcuts' "Single-key shortcuts" switch (WCAG 2.1.4, Level A: the switch, its two labels and the stored choice) took it 0.4 over; +0.5 KiB on 11 Nov 2026: Combobox's freeText, inlineComplete and limit, with the moreResults words, took it 76 B over; +0.5 KiB on 11 Nov 2026: Chat's assistant parts (thinking, reasoning, ChatSteps, ChatApproval, ChatCitation, versions) and their labels took it a few bytes over; +0.3 KiB on 11 Nov 2026: FormattedNumber's animate (the changed-character spans) took main, at 0 B spare after the public hooks, 0.1 KiB over; +0.3 KiB on 11 Nov 2026: the public hooks useMediaQuery, useBreakpoint, useReducedMotion and useCopyToClipboard (internal/media.ts, internal/clipboard.ts) are on window.Serupa too, and took it 21 B over; +0.5 KiB on 10 Nov 2026: the shared control size (internal/controlSize.ts) that ButtonGroup and Toolbar pass to their buttons took it 69 B over, with main within bytes of the line; +2.3 KiB on 9 Nov 2026: main went 3 B over (165.5 of 165.5), and raises of 0.2 at a time turned main red with each shared-code merge; this gives it the same standing room as index.js (about 2.5 KiB, 1.5%), and real growth is still caught by each folder's budget and the nightly trend check (3% in a night); +0.2 KiB on 9 Nov 2026: the deprecated aliases of the API naming table (Tooltip delay, Switch pending, Field layout, Splitter direction, Fab and Toaster position), each with its development warning, until 15.0.0 removes them; they took it 0.1 over. 119.4 on 31 Oct 2026, once the full icon table moved to serupa-icons.iife.js (PF1); 610.1 with it
};
// KiB, gzipped: [budget, the size it was set at]. The totals that count shared code move with the budget.
const LABELS = [5.5, 1.9];   // +0.1 KiB on 16 Nov 2026 for Calendar's week and weekShort and Pagination's goToPage (9 B over 5.4 with main's calendar systems). +0.1 KiB on 14 Nov 2026 for ChatReplyActions' six words and Toolbar's toolbarMore. +0.2 KiB on 14 Nov 2026 for DateField's messages (dateFieldError: which box is wrong and why, nine of them); +0.1 KiB on 13 Nov 2026 for the words of the day's three gap proposals: TagGroup's tagRemove, List's listSelectAll and RangeCalendar's inRange and rangeSelected. +0.1 KiB on 13 Nov 2026 for StatusTracker's four states, its summary and its day. +0.1 KiB on 13 Nov 2026 for TransferList's nine words (17 B over 4.8). +0.1 KiB on 11 Nov 2026 for PeriodPicker's four words, on top of Chat's. +0.2 KiB on 11 Nov 2026 for Chat's thirteen assistant words (thinking, reasoning, step states, approval, versions), which took enLabels over 4.4 with main's own growth. +0.1 KiB on 11 Nov 2026: KeyboardShortcuts' two words for the single-key switch (WCAG 2.1.4) took enLabels just over 4.4. +0.1 KiB on 10 Nov 2026: ShowMore's words (!253) and the locale-count labels merged at once took enLabels 9 B over 4.3 (GR329). +0.2 KiB on 9 Nov 2026 for SignaturePad's ten labels (RU9, 18 B over 4.0 with them, before Chart's). +0.1 KiB on 9 Nov 2026 for Chart's area and donut words (chartOther, chartShare, chartTotal). +0.1 KiB on 8 Nov 2026 for Table's column tools (resize, columns menu, row details: 40 B over). +0.1 KiB on 8 Nov 2026 for the date presets' nine labels (RU11). +0.2 KiB on 8 Nov 2026 for EventCalendar's words (RU8). +0.3 KiB on 7 Nov 2026 for CascadeSelect's words (about 0.1 KiB over 3.4), with room for the three ReUI components queued behind it (FilterBar, StatusTracker, TableOfContents), so each doesn't raise it again. +0.1 KiB on 7 Nov 2026 for Kanban's words (86 B over 3.2 by themselves, on top of Chat's). +0.1 KiB on 7 Nov 2026 for Chat's words (31 B over). +0.1 KiB on 6 Nov 2026: slack so neighbouring changes don't each raise it (four component lanes at once on GitLab). +0.1 KiB on 2 Nov 2026: main sat at its line after Sparkline's summary (CH3), and FileUpload's upload status (fileError, N9+48, #1450) takes enLabels 7 B over; 3.1 the same day for the words of CodeBlock (50), OfflineBanner (58) and Chart (CH2), about 3.05 with all three
// KiB, gzipped: PhoneInput's country table (PHONE_COUNTRIES in phone.ts, the calling codes, groupings and lengths;
// 2.4 on 26 Oct 2026). It's data, not code, and grows a row at a time, so it has its own line: a country added is
// a choice made here, not a few bytes lost in PhoneInput's own budget.
const PHONE_DATA = 2.8;
// Not made of component folders. theme.js went from 2 to 2.3 with theme-color (KW12: 2.2 when set), and to 2.4 on
// 31 Oct 2026 with the choice read again on a return from the back/forward cache (FEC6: 2.37), and to 2.5 on 2 Nov
// 2026 with the brands a page names in data-brands (I5: 2.44), and to 2.7 the same
// day with the crossfade on a switch (30), and to 2.9 the same day with switches in a row, and during an app's own View Transition (GR115: 2.86).
const FIXED = { 'utilities.css': 168, 'base.css': 1.85, 'theme.js': 3.2, 'tokens.css': 14.8, 'serupa-icons.iife.js': 450 };   // theme.js: 3.2 on 15 Nov 2026 (3.0) with the color-scheme meta (3.1 measured), so a dark page's canvas is dark from the first paint; tokens.css: 14.8 on 21 Nov 2026 (13.8) with the held-state colors, a press shown as a color one step past hover instead of a shrink: primary-pressed, primary-subtle-pressed and danger-pressed (a brand step per theme, flat and as light-dark() pairs), field-border-pressed and border-control-pressed, in all 34 themes and with more contrast, 14.7 measured (24 B over 14.7 in CI); 13.8 on 15 Nov 2026 (13.7) with the four cursor tokens, 46 B over; 13.7 on 15 Nov 2026 (13.6): the fluid scale's line heights follow their sizes on the 4px grid (AX9), 0.1 over; 13.6 on 14 Nov 2026 (12.3) with a theme for every accent color, 34 themes from 6: each new brand is its seven brand aliases, flat and as light-dark() pairs, and the neutrals are written once per mode, 13.5 measured; theme.js 3.0 (2.9) with the 17 brand names; 12.3 on 14 Nov 2026 (12.2) with the Inter fallback's two new faces (500 and 600) and each face's own ascent (GR405), 26 B over; 12.2 on 13 Nov 2026 (12.1) with highlight-indicator, the list highlight's bar that shows only with more contrast, in every theme; 12.1 on 13 Nov 2026 (11.9) with border-control and border-control-hover, the 3:1 edge the controls that aren't fields keep now that the field border is soft, and field-hover, field-pressed, field-border-invalid and field-action for the zinc-700 dark field, in every theme; 11.9 on 12 Nov 2026 (11.8) with the data-radius roundness axis on top of Modern's own corners; 11.7 on 12 Nov 2026 (11.6), main's tactile depth tokens on top of Modern's; 11.3 the same day (11.2), main's new tokens on top of Modern's; 11.2 on 11 Nov 2026 (11.1) with the Modern brand's own radii, elevation, motion and spacing roles and its teal chart colors, set in its theme and brand rules; 7.4 on 31 Oct 2026, once it shipped without the description comments (PF2), 8.5 on 1 Nov 2026 with a unicode-range @font-face per script (F6), 0.7 KiB that saves 240 KiB of font on an English page; 8.7 the same day with the four Inter Fallback faces (144), so text doesn't move when Inter arrives; 9.0 the same day with the line heights and CJK fonts by lang (143); 9.6 the same day with the opt-in data-type-scale="fluid" axis (22); 10.0 the same day with the 30 chart colors (CH1); 10.3 on 2 Nov 2026 with the 15 role tokens for corners, shadows and spacing (E13, I6: 10.2 with both); 10.5 on 8 Nov 2026 with the 12 status tokens for success, warning and info hover, on-, border and subtle hover; serupa-icons.iife.js: 492.9 the same day, every Material Symbol, loaded only when a plain page names one outside the everyday set (PF1); 450 on 9 Nov 2026 (430.4), once each path writes its smooth curves as t (the same drawing, 26% shorter)
// KiB as shipped (woff2 is compressed already). Since F6 (1 Nov 2026) tokens.css points at Inter split by script
// (tools/fonts/subset.py), so an English page downloads the latin files: 103.3 and 113.2 KiB, against 344 and 379
// for the whole fonts, which still ship for a page that links them itself.
const FONTS = { 'fonts/InterVariable-latin.woff2': 110, 'fonts/InterVariable-Italic-latin.woff2': 120, 'fonts/InterVariable.woff2': 360, 'fonts/InterVariable-Italic.woff2': 395 };
// KiB, gzipped, each file on its own as a server sends it: what a first page costs, a sign-in form (STARTER_PAGE)
// with tokens.css, base.css, bundle.css trimmed by serupa-purge --components to what the page uses, and the
// JavaScript of Button, Field and Input (29.5 on 31 Oct 2026: 7.4 + 1.3 + 9.9 of CSS, 10.8 of JavaScript). The
// number to watch when shared code or the base styles grow, since no single component's budget sees it.
const STARTER = 37.5;   // 37.5 on 16 Nov 2026 (37.4): --surface-behind in base.css, the fill behind a ring (BUG-R1), and a disabled Field dims its required mark too, 1 B over; 37.4 on 16 Nov 2026 (37.1): Field's warning and checking messages on top of main's native-constraint messages, both in Field, 37.4 measured; 37.1 also holds main's elevation-modal-up, -left and -right in tokens.css (36.8 on main, 15 Nov 2026); 37.1 on 15 Nov 2026 (36.7): Field says which native constraint fails, in the provider's words (internal/validity.ts's messages now reach Field), 0.3 over; 36.7 on 15 Nov 2026 (36.6) with the four cursor tokens in tokens.css and SerupaProvider's size; 36.6 on 15 Nov 2026 (36.5): the fluid scale's line heights in tokens.css (AX9), 84 B over; 36.5 on 15 Nov 2026 (36.2) with Button's onMedia rules (white or black over a photo), which the trimmed bundle keeps with every .srp-btn rule; 36.2 on 15 Nov 2026 (35.1) with a theme for every accent color in tokens.css (34 themes from 6), 36.1 measured; 35.1 on 14 Nov 2026 (35.0) with the touch-sized box behind every Button on touch screens; 35.0 on 14 Nov 2026 (34.9) with surface-page and surface-control, the dark page a step below its cards, in tokens.css; 34.9 on 14 Nov 2026 (34.8) with field-raised and the overlays setting --field to it, and highlight-indicator, in tokens.css; 34.8 on 13 Nov 2026 (34.6) with border-control, border-control-hover and the four field aliases in tokens.css; 34.6 on 13 Nov 2026 (34.5) with violet's wells, surfaces and resting cards (depth-well, depth-surface, depth-card) in tokens.css, on top of 34.5 for surface-hover-raised, the dark row hover on raised surfaces (GR374); 34.4 on 12 Nov 2026 (34.2) with the data-radius roundness axis on top of Modern; 34.2 on 12 Nov 2026 (34.1) with main's tactile depth tokens on top of Modern's; 33.7 the same day (33.5) with the Modern brand's own roles and chart colors in tokens.css; 33.0 on 1 Nov 2026 with the chart colors in tokens.css (CH1); 30.8 on 1 Nov 2026, once tokens.css had a unicode-range @font-face per script (F6); 32.0 on 1 Nov 2026 (D7: Input's hooks copy their props instead of changing them)
const STARTER_PAGE = `import { Button, Field, Input } from '@diki-stwn/serupa-ds';
export function SignIn() {
  return (
    <main className="mx-auto max-w-sm p-6 flex flex-col gap-4">
      <h1 className="type-2xl">Sign in</h1>
      <Field label="Email"><Input type="email" autoComplete="email" /></Field>
      <Field label="Password"><Input type="password" autoComplete="current-password" /></Field>
      <Button type="submit" className="w-full mt-2">Sign in</Button>
      <p className="text-center">No account yet?</p>
    </main>
  );
}
`;
// KiB, gzipped: Button bundled by a build that doesn't split dynamic imports (DM1), so the icon set drawn by name
// comes along (512.7 on 25 Oct 2026). Icon's README and Getting started say so; this keeps the number in sight.
// 550 on 1 Nov 2026 (548.5): the table is now 32 parts (I1), and a build that inlines them wraps each part and the
// re-exports in its own module helpers. A build that splits loads one part of about 25 KiB instead of the table.
// 505 on 9 Nov 2026 (485.2): each path writes its smooth curves as t, the same drawing in 26% fewer characters.
const NO_SPLIT = 505;

const DIR = path.join(HERE, 'baseline-size');
const COMP = path.join(PROJECT, 'src', 'components');
const folders = fs.readdirSync(COMP).filter((n) => fs.statSync(path.join(COMP, n)).isDirectory()).sort();
const KEYS = ['alone', 'share', 'css'];
// "share" is the difference of two gzipped builds, so it moves when any other code changes: one unrelated edit
// moved other folders' shares by up to 20 B (26 Oct 2026), and a few merges in a day add up. A share is over its
// budget only past this many bytes, so merges that each passed don't turn main red together by "0.0 KiB" (SZ2).
// "css" is the folder's own CSS gzipped by itself, so only its own change moves it. It was what components.css
// lost without the folder, which moved with whatever the rest compressed against: Badge's new tones took Fab 3 B over
// on 10 Nov 2026 (GR347), and on 13 Nov a print block in DataGrid took PeriodPicker 67 B over and Select went over
// while its own CSS got shorter, past this margin. components.css as a whole still has its budget (TOTALS).
// "alone" and "css" measure only the folder's own code, so they get no margin.
const SHARE_NOISE = 64;

const gz = (buf) => zlib.gzipSync(buf, { level: 9 }).length;
const br = (buf) => zlib.brotliCompressSync(buf, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 11 } }).length;
// Icons drawn by name are a dynamic import(): a project loads them only when a page draws an icon by its name.
const lazy = { name: 'lazy', setup(b) { b.onResolve({ filter: /.*/ }, (a) => a.kind === 'dynamic-import' ? { path: a.path, external: true } : undefined); } };
const build = async (code, plugins) => (await esbuild.build({ stdin: { contents: code, resolveDir: PROJECT }, bundle: true, minify: true, write: false, format: 'esm', external: ['react', 'react-dom'], plugins, logLevel: 'silent' })).outputFiles[0].contents;
const bundled = async (code) => gz(await build(code, [lazy]));
// What a folder imported alone is made of, largest first, for a failure's detail: the files and their minified
// bytes, so a size that differs between machines (or grew) says which file brought the difference.
const inputsOf = async (code) => {
  const r = await esbuild.build({ stdin: { contents: code, resolveDir: PROJECT }, bundle: true, minify: true, write: false, metafile: true, format: 'esm', external: ['react', 'react-dom'], plugins: [lazy], logLevel: 'silent' });
  const ins = Object.entries(Object.values(r.metafile.outputs)[0].inputs).sort((a, b) => b[1].bytesInOutput - a[1].bytesInOutput);
  return `${ins.length} files, largest: ${ins.slice(0, 8).map(([f, i]) => `${f.replace(/^dist\/js\//, '')} ${i.bytesInOutput} B`).join(', ')}`;
};
const file = (f) => gz(fs.readFileSync(path.join(PROJECT, 'dist', f)));

// What each folder exports (its index.ts, as the package's index.js re-exports it), and its CSS in the build's order.
const exportsOf = (n) => [...fs.readFileSync(path.join(COMP, n, 'index.ts'), 'utf8').matchAll(/^export \{ ([^}]*) \} from/gm)].flatMap((m) => m[1].split(',').map((x) => x.trim()).filter(Boolean));
const names = Object.fromEntries(folders.map((n) => [n, exportsOf(n)]));
const order = [...fs.readFileSync(path.join(PROJECT, 'src', 'generated', 'components.css'), 'utf8').matchAll(/@import "\.\.\/components\/(\w+)\/([\w.-]+\.css)";/g)].map((m) => [m[1], fs.readFileSync(path.join(COMP, m[1], m[2]), 'utf8')]);
const cssOf = (n) => gz(Buffer.from(order.filter(([c]) => c === n).map(([, t]) => t).join('\n')));
const pick = (list) => `export { ${list.join(', ')} } from './dist/index.js';`;

const all = folders.flatMap((n) => names[n]);
const whole = await bundled(pick(all));
const labels = await bundled(pick(['enLabels']));
const measured = Object.fromEntries(await Promise.all(folders.map(async (n) => [n, {
  alone: await bundled(pick(names[n])),
  share: whole - await bundled(pick(all.filter((x) => !names[n].includes(x)))),
  css: order.some(([c]) => c === n) ? cssOf(n) : 0,
}])));

const kib = (n) => (n / 1024).toFixed(1);
// How far over: in bytes under 0.1 KiB, where kib() would print "0.0".
const over = (n) => (n < 102.4 ? `${Math.ceil(n)} B` : `${kib(n)} KiB`);
const budgetFile = (n) => path.join(DIR, `${n}.json`);
// The shared lines (TOTALS, LABELS, STARTER) take raises the same way: a pull request that takes one over adds its
// own tools/test/baseline-size-shared/<branch>.json, { "<line>": [KiB added, "what grew, dated"] }, rather than editing
// the line every such pull request edited (16 Nov 2026: #2067, #2074, #2078 and #2081 each conflicted on STARTER or
// serupa.iife.js and waited for a merge of main). The raises add up: each file is its own pull request's growth.
const SHARED_DIR = path.join(HERE, 'baseline-size-shared');
const sharedFiles = () => (fs.existsSync(SHARED_DIR) ? fs.readdirSync(SHARED_DIR).filter((f) => /^[\w-]+\.json$/.test(f)) : []);
const sharedRaises = sharedFiles().map((f) => JSON.parse(fs.readFileSync(path.join(SHARED_DIR, f), 'utf8')));
const raisedBy = (line) => sharedRaise(sharedRaises, line);
const STARTER_AT = +(STARTER + raisedBy('STARTER')).toFixed(1);
const LABELS_AT = +(LABELS[0] + raisedBy('LABELS')).toFixed(1);
const sizeFiles = () => (fs.existsSync(DIR) ? fs.readdirSync(DIR).filter((f) => SIZE_FILE.test(f)) : []);
const readSize = (f) => [f, JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'))];
const raisesOf = (n) => sizeFiles().filter((f) => SIZE_FILE.exec(f)[1] === n && SIZE_FILE.exec(f)[2]);
const write = (f, b) => fs.writeFileSync(path.join(DIR, f), JSON.stringify(b, null, 2) + '\n');
if (process.argv.includes('--fold')) {
  const all = sizeBudgets(sizeFiles().map(readSize));
  const folded = [...new Set(sizeFiles().filter((f) => SIZE_FILE.exec(f)[2]).map((f) => SIZE_FILE.exec(f)[1]))];
  for (const n of folded) {
    const { alone, share, css } = all[n];
    write(`${n}.json`, { alone, share, css });
    for (const f of raisesOf(n)) fs.rmSync(path.join(DIR, f));
  }
  console.log(folded.length ? `Folded the raises of ${folded.join(', ')}` : 'No raise files');
  process.exit(0);
}
const ui = process.argv.indexOf('--update');
if (ui > 0) {
  const asked = process.argv.slice(ui + 1).filter((a, i, all) => !a.startsWith('-') && all[i - 1] !== '--only');
  const which = asked.length ? asked : folders.filter((n) => !fs.existsSync(budgetFile(n)));
  const only = process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only') + 1] : null;
  const exact = process.argv.includes('--exact');
  let branch = process.env.SIZE_TAG;
  try { branch ||= execFileSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { cwd: PROJECT, encoding: 'utf8' }).trim(); } catch { /* not a checkout */ }
  const own = (n) => `${n}.${raiseTag(branch)}.json`;
  fs.mkdirSync(DIR, { recursive: true });
  for (const n of which) {
    if (!measured[n]) { console.log(`No component folder ${n}`); process.exit(1); }
    // 5% over plus 0.1 KiB, rounded up, so a small fix doesn't fail on a few bytes.
    const fit = Object.fromEntries(KEYS.map((k) => [k, Math.ceil((Math.max(0, measured[n][k]) / 1024 * 1.05 + 0.1) * 10) / 10]));
    if (exact || !fs.existsSync(budgetFile(n))) {
      // Name.json itself: a new folder, or --exact (which may lower, and so edits the line other pull requests raise).
      const kept = only && fs.existsSync(budgetFile(n)) ? readSize(`${n}.json`)[1] : {};
      const b = Object.fromEntries(KEYS.map((k) => [k, only && k !== only && k in kept ? kept[k] : fit[k]]));
      write(`${n}.json`, b);
      if (exact) for (const f of raisesOf(n)) fs.rmSync(path.join(DIR, f));
      console.log(`${n}: ${KEYS.map((k) => `${k} ${b[k]} KiB`).join(', ')}`);
      continue;
    }
    // A raise: only the keys over the budget every other file of the folder gives them (the check's own test, so a
    // key still within its budget isn't raised by the 5% a fit adds: #1977's merge raised Field's CSS that way).
    const others = sizeBudgets(sizeFiles().filter((f) => f !== own(n) && SIZE_FILE.exec(f)[1] === n).map(readSize))[n];
    const raised = Object.fromEntries(KEYS.filter((k) => (!only || k === only) && measured[n][k] > others[k] * 1024 + (k === 'share' ? SHARE_NOISE : 0)).map((k) => [k, fit[k]]));
    if (Object.keys(raised).length) {
      write(own(n), raised);
      console.log(`${n}: ${Object.entries(raised).map(([k, v]) => `${k} ${others[k]} → ${v} KiB`).join(', ')} (in ${own(n)})`);
    } else {
      if (fs.existsSync(path.join(DIR, own(n)))) fs.rmSync(path.join(DIR, own(n)));
      console.log(`${n}: within its budgets, nothing to raise`);
    }
  }
  process.exit(0);
}

const merged = sizeBudgets(sizeFiles().map(readSize));
const budgets = Object.fromEntries(folders.map((n) => [n, fs.existsSync(budgetFile(n)) ? merged[n] : null]));
const sum = (k) => folders.reduce((t, n) => t + (budgets[n]?.[k] || 0), 0);
const BUDGET = { ...Object.fromEntries(Object.entries(TOTALS).map(([f, [at, was, k]]) => [f, +(Number(at) + raisedBy(f) + sum(String(k)) - Number(was) + (k === 'share' ? LABELS_AT - LABELS[1] : 0)).toFixed(1)])), ...FIXED };
BUDGET['bundle.css'] = +(BUDGET['components.css'] + BUDGET['utilities.css']).toFixed(1);
const size = { 'All components (index.js)': whole }, brotli = {};
for (const f of ['components.css', 'utilities.css', 'bundle.css', 'base.css', 'theme.js', 'serupa.iife.js', 'serupa-icons.iife.js']) { size[f] = file(f); brotli[f] = br(fs.readFileSync(path.join(PROJECT, 'dist', f))); }
const tokensCss = fs.readFileSync(path.join(PROJECT, 'tokens.css'));
size['tokens.css'] = gz(tokensCss); brotli['tokens.css'] = br(tokensCss);

// The starter page: serupa-purge reads sources from files, so the page goes in a scratch folder for it.
const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'serupa-size-'));
fs.writeFileSync(path.join(scratch, 'SignIn.tsx'), STARTER_PAGE);
const manifest = JSON.parse(fs.readFileSync(path.join(PROJECT, 'dist', 'components.json'), 'utf8'));
const used = usedClasses([scratch], manifest.runtimeUtilities);
fs.rmSync(scratch, { recursive: true, force: true });
const trimmed = Buffer.from(purge(fs.readFileSync(path.join(PROJECT, 'dist', 'bundle.css'), 'utf8'), used, unusedComponentClasses(manifest, used)) + '\n');
const starterJs = await build(pick(['Button', 'Field', 'Input']), [lazy]);
const starterParts = [tokensCss, fs.readFileSync(path.join(PROJECT, 'dist', 'base.css')), trimmed, starterJs];
const starter = starterParts.reduce((t, b) => t + gz(b), 0);

const rows = Object.entries(BUDGET).map(([name, budget]) => ({ name, now: size[name], budget }));
if (process.env.GITHUB_STEP_SUMMARY) {
  const brCell = (name) => (name in brotli ? `${kib(brotli[name])} KiB` : '');
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `## Size (gzipped; Brotli for reference)\n\n| | Size | Brotli | Budget | |\n| --- | ---: | ---: | ---: | --- |\n${rows.map((r) => `| ${r.name} | ${kib(r.now)} KiB | ${brCell(r.name)} | ${r.budget} KiB | ${r.now <= r.budget * 1024 ? 'ok' : '**over**'} |`).join('\n')}\n| Starter page | ${kib(starter)} KiB | ${kib(starterParts.reduce((t, b) => t + br(b), 0))} KiB | ${STARTER} KiB | ${starter <= STARTER * 1024 ? 'ok' : '**over**'} |\n`);
}
const totals = rows.map((r) => ({
  name: `${r.name}: ${kib(r.now)} KiB gzipped, within ${r.budget} KiB`,
  // Under 1 KiB means it wasn't measured (a budget number pasted in place of the measurement), not that it's tiny.
  ok: r.now <= r.budget * 1024 && r.now >= 1024,
  detail: r.now < 1024 ? 'not measured: its line in `size` must measure the build, not repeat the budget'
    : `${over(r.now - r.budget * 1024)} over; ${r.name in FIXED ? 'if the growth is worth it, raise its budget in tools/test/size.mjs' : 'the shared code grew (each component is held to its own budget): if that is worth it, run node tools/test/size.mjs --raise-shared "what grew" and commit its raise file'}`,
}));
for (const [f, budget] of Object.entries(FONTS)) {
  const bytes = fs.statSync(path.join(PROJECT, f)).size;
  totals.push({ name: `${f}: ${kib(bytes)} KiB, within ${budget} KiB`, ok: bytes <= budget * 1024,
    detail: `${over(bytes - budget * 1024)} over; a bigger font is a slower first paint for every page: if it's worth it, raise FONTS in tools/test/size.mjs` });
}
totals.push({ name: `Starter page (sign-in form: tokens.css, base.css, bundle.css trimmed to it, Button, Field and Input): ${kib(starter)} KiB gzipped, within ${STARTER_AT} KiB`,
  // Under 8 KiB means part of it went missing (the trim kept nothing, or the components didn't bundle).
  ok: starter <= STARTER_AT * 1024 && starter >= 8 * 1024,
  detail: starter < 8 * 1024 ? 'not measured: the trimmed CSS or the components came out nearly empty' : `${over(starter - STARTER_AT * 1024)} over: a first page got heavier (tokens, base styles, shared code or one of the three); if that's worth it, run node tools/test/size.mjs --raise-shared "what grew" and commit its raise file` });
const noSplit = gz(await build(pick(['Button']), []));
totals.push({ name: `Button in a build without code splitting (the icon set comes along): ${kib(noSplit)} KiB gzipped, within ${NO_SPLIT} KiB`,
  ok: noSplit <= NO_SPLIT * 1024 && noSplit > 100 * 1024,
  detail: noSplit <= 100 * 1024 ? 'the icon set no longer comes along: lower NO_SPLIT in tools/test/size.mjs and update Icon\'s README and Getting started'
    : `${over(noSplit - NO_SPLIT * 1024)} over: the icons drawn by name grew; if that's worth it, raise NO_SPLIT in tools/test/size.mjs` });
totals.push({ name: `Built-in label text (enLabels): ${kib(labels)} KiB gzipped, within ${LABELS_AT} KiB`, ok: labels <= LABELS_AT * 1024 && labels >= 512,
  detail: labels < 512 ? 'not measured: enLabels should bundle every folder\'s labels.ts' : `${over(labels - LABELS_AT * 1024)} over; if the words are worth it, run node tools/test/size.mjs --raise-shared "what grew" and commit its raise file` });
const phoneData = gz((await esbuild.build({ stdin: { contents: "export { PHONE_COUNTRIES } from './src/components/PhoneInput/phone.ts';", resolveDir: PROJECT, loader: 'ts' }, bundle: true, minify: true, write: false, format: 'esm', logLevel: 'silent' })).outputFiles[0].contents);
totals.push({ name: `PhoneInput's country table (PHONE_COUNTRIES): ${kib(phoneData)} KiB gzipped, within ${PHONE_DATA} KiB`, ok: phoneData <= PHONE_DATA * 1024 && phoneData >= 1024,
  detail: phoneData < 1024 ? 'not measured: the table should bundle from src/components/PhoneInput/phone.ts' : `${over(phoneData - PHONE_DATA * 1024)} over; if the countries are worth it, raise PHONE_DATA in tools/test/size.mjs` });
// The sizes Getting started and the README quote, which decide which stylesheet a plain page links: each must be
// within 15% of the build, so the prose can't drift from it (components.css was "about 290 KB" at 384 KB, 11 Nov 2026).
const raw = (f) => fs.statSync(path.join(PROJECT, 'dist', f)).size;
const QUOTED = [
  ['docs/GettingStarted.mdx', /`components\.css` \(about ([\d.]+) KB\)/, raw('components.css'), 'components.css'],
  ['docs/GettingStarted.mdx', /every utility class, about ([\d.]+) MB/, raw('bundle.css'), 'bundle.css', 1024 ** 2],
  ['docs/GettingStarted.mdx', /the component styles \(about ([\d.]+) KB\)/, raw('components.css'), 'components.css'],
  ['docs/GettingStarted.mdx', /to about ([\d.]+) KB with Brotli/, brotli['bundle.css'], 'bundle.css with Brotli'],
  ['docs/GettingStarted.mdx', /and `components\.css` to about ([\d.]+) KB/, brotli['components.css'], 'components.css with Brotli'],
  ['README.md', /every utility class \(about ([\d.]+) MB\)/, raw('bundle.css'), 'bundle.css', 1024 ** 2],
  ['README.md', /\(`srp-\*`\), about ([\d.]+) KB \(([\d.]+) KB gzipped/, raw('components.css'), 'components.css'],
  ['README.md', /\(`srp-\*`\), about [\d.]+ KB \(([\d.]+) KB gzipped/, size['components.css'], 'components.css gzipped'],
];
for (const [doc, re, bytes, what, unit = 1024] of QUOTED) {
  const m = fs.readFileSync(path.join(PROJECT, doc), 'utf8').match(re);
  const said = m ? Number(m[1]) * unit : 0;
  totals.push({ name: `${doc} quotes ${what} within 15% of the build (${m ? m[0] : 'not found'}; built ${kib(bytes)} KiB)`, ok: !!m && Math.abs(said - bytes) <= bytes * 0.15,
    detail: m ? `the build is ${kib(bytes)} KiB: update the number in ${doc}` : `the sentence that quotes it changed: update ${re} in tools/test/size.mjs` });
}
const LABEL = { alone: 'imported alone', share: 'adds to the whole package', css: 'CSS gzipped by itself' };
const overAlone = new Set(folders.filter((n) => budgets[n] && measured[n].alone > budgets[n].alone * 1024));
const made = Object.fromEntries(await Promise.all([...overAlone].map(async (n) => [n, await inputsOf(pick(names[n]))])));
const own = folders.flatMap((n) => (budgets[n]
  ? KEYS.map((k) => ({ name: `${n} ${LABEL[k]}: ${kib(measured[n][k])} KiB, within ${budgets[n][k]} KiB`, ok: measured[n][k] <= budgets[n][k] * 1024 + (k === 'share' ? SHARE_NOISE : 0),
    detail: `${over(measured[n][k] - budgets[n][k] * 1024)} over; if the growth is worth it, run node tools/test/size.mjs --update ${n} and commit its raise file${k === 'alone' && made[n] ? ` (${made[n]})` : ''}` }))
  : [{ name: `${n} has size budgets`, ok: false, detail: `run node tools/test/size.mjs --update ${n} and commit tools/test/baseline-size/${n}.json` }]));
// Size over time (nightly, as the benchmarks are): a budget allows 5% over what a folder weighed when it was set, so a
// package that grows a little with every merge passes for months. --json writes tonight's sizes; --previous compares
// them with the last night's and fails when a total, the starter page or a folder imported alone grew 3% (and 0.2 KiB)
// in one night without its budget moving.
const flag = (f) => (process.argv.includes(f) ? process.argv[process.argv.indexOf(f) + 1] : null);
// css: each folder's own CSS gzipped, for the health page (tools/health.mjs); the trend reads the others.
const tonight = { totals: Object.fromEntries(rows.map((r) => [r.name, r.now])), starter, alone: Object.fromEntries(folders.filter((n) => measured[n]).map((n) => [n, measured[n].alone])),
  css: Object.fromEntries(folders.filter((n) => measured[n]).map((n) => [n, measured[n].css])) };
if (flag('--json')) fs.writeFileSync(flag('--json'), JSON.stringify(tonight, null, 1));
const trend = [];
if (flag('--previous') && fs.existsSync(flag('--previous'))) {
  const last = JSON.parse(fs.readFileSync(flag('--previous'), 'utf8'));
  const grew = (name, was, now) => trend.push({ name: `${name}: ${kib(was)} → ${kib(now)} KiB since last night`, ok: !(was && now > was * 1.03 && now - was > 0.2 * 1024),
    detail: `${(100 * (now / was - 1)).toFixed(1)}% in one night: find the merge that grew it and decide whether it's worth the bytes` });
  for (const [n, now] of Object.entries(tonight.totals)) grew(n, last.totals?.[n], now);
  grew('Starter page', last.starter, starter);
  for (const [n, now] of Object.entries(tonight.alone)) if (last.alone?.[n]) grew(`${n} imported alone`, last.alone[n], now);
}
// A raise file without its component's Name.json is an orphan too: Name.json holds every key.
const orphans = fs.existsSync(DIR) ? fs.readdirSync(DIR).filter((f) => !SIZE_FILE.test(f) || !folders.includes(SIZE_FILE.exec(f)[1]) || !fs.existsSync(budgetFile(SIZE_FILE.exec(f)[1]))) : [];
// --raise-shared "what grew": each shared line over its budget gets the KiB it is over (rounded up to 0.1, at least
// 0.1) added to this branch's raise file, with the note dated today.
if (process.argv.includes('--raise-shared')) {
  const note = process.argv[process.argv.indexOf('--raise-shared') + 1];
  if (!note || note.startsWith('-')) { console.log('--raise-shared needs a note: what grew'); process.exit(1); }
  const overBy = [...rows.filter((r) => !(r.name in FIXED)).map((r) => ({ line: r.name, by: r.now - r.budget * 1024 })),
    { line: 'STARTER', by: starter - STARTER_AT * 1024 }, { line: 'LABELS', by: labels - LABELS_AT * 1024 }].filter((o) => o.by > 0)
    // A LABELS raise raises the totals that count shared code too, so it goes alone; run it again for what is left.
    .filter((o, _, all) => !all.some((x) => x.line === 'LABELS') || o.line === 'LABELS');
  let branch = process.env.SIZE_TAG;
  try { branch ||= execFileSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { cwd: PROJECT, encoding: 'utf8' }).trim(); } catch { /* not a checkout */ }
  const file = path.join(SHARED_DIR, `${raiseTag(branch)}.json`);
  const mine = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
  const day = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
  for (const { line, by } of overBy) {
    const add = Math.max(0.1, Math.ceil(by / 1024 * 10) / 10);
    mine[line] = [+((Number(mine[line]?.[0]) || 0) + add).toFixed(1), `+${add} KiB on ${day}: ${note}${mine[line] ? `; ${mine[line][1]}` : ''}`];
    console.log(`${line}: +${add} KiB (in ${path.relative(PROJECT, file)})`);
  }
  if (overBy.length) { fs.mkdirSync(SHARED_DIR, { recursive: true }); fs.writeFileSync(file, JSON.stringify(mine, null, 2) + '\n'); }
  else console.log('Every shared line is within its budget, nothing to raise');
  process.exit(0);
}
done(report('Size', [...totals, ...own, ...trend, { name: 'every size budget file belongs to a component folder', ok: !orphans.length, detail: orphans.join(', ') }]));
