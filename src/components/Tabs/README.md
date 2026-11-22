# Tabs

Switches between related panels in one place, such as a project's Overview, Activity and Settings. It follows the WAI-ARIA tabs pattern: `Tabs` holds the state, `TabList` the row of `Tab`s, and each `TabPanel` the content for the tab with the same `value`.

**Also called:** tabbed interface.

```jsx
import { Tabs, TabList, Tab, TabPanel } from '@diki-stwn/serupa-ds';

<Tabs defaultValue="overview">
  <TabList aria-label="Project">
    <Tab value="overview">Overview</Tab>
    <Tab value="activity" icon="history">Activity</Tab>
    <Tab value="settings" disabled>Settings</Tab>
  </TabList>
  <TabPanel value="overview">…</TabPanel>
  <TabPanel value="activity">…</TabPanel>
  <TabPanel value="settings">…</TabPanel>
</Tabs>

// controlled, as pills
<Tabs value={view} onValueChange={setView} variant="pill" size="sm">…</Tabs>
```

## When to use

- Several views of the same thing that people switch between, one at a time: a project's Overview, Activity and Settings.
- A page with more content than fits, where each part stands on its own and people know which one they want.
- Panels that should keep their state while people look elsewhere, such as a half-filled form: hidden panels stay in the page.

## When not to use

- Choosing a value, such as a period (Day, Week, Month) for the same content: use [SegmentedControl](../SegmentedControl/README.md) instead. It's a radio group, not a set of panels.
- Steps people go through in order: use [Stepper](../Stepper/README.md) instead.
- Moving between the sub-pages of one thing that each have their own URL, such as a project's Overview and Settings: use [TabNav](../TabNav/README.md) instead. It looks like Tabs but is a nav of links. For the app's main pages, use a [Navbar](../Navbar/README.md) or a [Sidebar](../Sidebar/README.md).
- Sections people may want open side by side, or read one after another: use [Accordion](../Accordion/README.md) instead.

## Anatomy

Drawn from the `Pill` story.

1. **Tab list** (`.srp-tabs__list`): the tabs, in one row that scrolls when they don't fit.
2. **Tab** (`.srp-tabs__tab`): shows its panel; the arrow keys move between tabs.
3. **Icon** (`.srp-tabs__icon`): an optional picture beside the tab's name.
4. **Panel** (`.srp-tabs__panel`): the content of the chosen tab.

## Usage

- Keep tab labels to a word or two. When the tabs don't fit, the row scrolls sideways: the edge with more tabs past it fades out, and the selected tab, or one reached with Tab, is always scrolled into view clear of the fade, but people can still miss the tabs out of view. It scrolls in a CSS grid track or a flex row too, without widening the page.
- Use `orientation="vertical"` for a settings page or anything with more than about six tabs: a column at the start of the panels, which has room for them all.
- Set `activation="manual"` when a panel is slow to show, so arrowing past a tab doesn't select it.
- Keep each panel's controls about that panel: a Save or a filter inside one tab changes only what's in that tab. Controls that act on every tab go above the tab row.
- Hidden panels keep their state. Set `keepMounted={false}` on a panel that doesn't need to, so it renders only while it's selected.
- The browser's find-in-page searches kept panels too. They're `hidden="until-found"`, so a match on another tab selects that tab and shows it, as Accordion opens an item. A disabled tab's panel isn't searched.
- Show a tab people can't use yet as `disabled` rather than leaving it out, when knowing it exists helps them.
- Tabs people open and close, such as documents or queries: give each closable `Tab` an `onClose` that removes it, and the `TabList` an `onAdd` and `addLabel` for a "+ New query" button after the tabs. A closable tab has a × at its end for the pointer, and Delete closes it from the keyboard. Leave `onClose` off a tab that must stay, such as a pinned one. (`Closable`)
- When the selected tab is removed, uncontrolled Tabs select the next enabled tab (or else the previous one) and call `onValueChange`. If focus was on the closed tab (its own close button, or a Delete key you handle), it moves to the tab now selected, not to the page. With `value`, set it to another tab yourself when you remove the selected one; Tabs warns in the console otherwise.

### Do and don't

- **Do:** Keep each label to a word or two, so every tab stays in view. (`DoShortLabels`)
- **Don't:** Write long labels: the row scrolls, and people miss the tabs past the edge. (`DontLongLabels`)
- **Do:** Use a [SegmentedControl](../SegmentedControl/README.md) to pick a value, such as a period, for the same content. (`DoSegmentedForValue`)
- **Don't:** Use tabs for that: tabs say each choice has its own panel, and screen readers announce them that way. (`DontTabsForValue`)

## Accessibility

- `role="tablist"`, `"tab"` and `"tabpanel"`, with `aria-selected`, `aria-controls` and `aria-labelledby` set for you.
- Only the selected tab is in the Tab order, and the shown panel itself can take focus when it starts with text, so keyboard users always reach the content. A panel that starts with a link, button or field leaves the stop to that, so Tab from the tab lands on it directly; a kept panel of another tab is out of the Tab order. When a controlled `value` matches no tab (a stale link, data still loading), the first enabled tab takes the Tab stop instead, so the list can still be reached.
- Tab labels keep 4.5:1, and the selected line and pill 3:1 against `surface`, in every theme (`Tabs.test.tsx`). The focus ring sits inside the tab so the scrolling row can't clip it.
- The selected line or fill slides from the tab selected before. Pick another tab mid-slide and it turns back from where it is, not from the last tab. With reduced motion it moves at once, and so it does when an arrow, Home or End picks the tab.
- In forced-colors mode the selected tab is marked in `Highlight`.
- A closable tab's × is for the pointer and is hidden from screen readers: a tab can't hold a second button. The tab's description says "Press Delete to close." instead (`aria-keyshortcuts="Delete"`). The + after the tabs is a button beside the tab list, with `addLabel` as its visible words.

### Keyboard

| Key | Does |
| --- | --- |
| Tab | Into the tab list (on the selected tab), then to the selected panel |
| ← → | The previous or next tab, wrapping, following the text direction; disabled tabs are skipped. Also selects it unless `activation="manual"`. With `orientation="vertical"`, ↑ ↓ do this instead |
| Home, End | The first or last tab |
| Enter, Space | Selects the focused tab |
| Delete | Closes the focused tab, when it has `onClose`. Focus goes to the tab selected next, or to the tab beside it |

## Props

### Tabs

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `id` | string | none | Goes to the root `<div>`. |
| `value` | string | | The selected tab (controlled), with `onValueChange` |
| `defaultValue` | string | the first enabled tab | The tab selected at first (uncontrolled) |
| `onValueChange` | `(value) => void` | | Called when a tab is chosen |
| `variant` | `'line'` \| `'pill'` | `'line'` | A line under the selected tab, or the selected tab filled in `primary` |
| `size` | `'sm'` \| `'md'` \| `'lg'` | `'md'` | 32px, 36px or 44px tabs; `lg` has 16px text, to sit beside large fields and buttons and give a touch-sized target |
| `activation` | `'auto'` \| `'manual'` | `'auto'` | Whether arrow keys also select, or only move (then Enter or Space selects). Use manual when a panel is slow to show |
| `orientation` | `'horizontal'` \| `'vertical'` | `'horizontal'` | A row over the panels, or a column beside them (`aria-orientation`, ↑ ↓). The line variant's line moves to the column's end side |

### TabList, Tab and TabPanel

- `TabList`: the row. Give it an `aria-label` when nothing on the page says what the tabs are for. `onAdd` with `addLabel` ("New query") shows a + after the tabs; select the new tab in it, and focus goes with the selection. It scrolls sideways when the tabs don't fit (down, when vertical and its height is limited), fading out the edge with more tabs past it, and keeps the selected tab in view.
- `Tab`: `value` (required), `icon` (a name or element), `disabled`, `onClose` (a × at its end and the Delete key close it; remove the tab in it), and every `<button>` prop.
- `TabPanel`: `value` (required). Hidden panels stay in the page and keep their state; `keepMounted={false}` renders a panel only while it's selected.

Each part takes `className`, `style`, `ref` and other props. `Tabs` has `data-component="tabs"` and `data-variant`; tabs and panels have `data-state="active"` or `"inactive"`.

## Component tokens

Each is an optional override: set it on the page, a container or one set of tabs. The list lives in `src/components/Tabs/tabs.tokens.json` (also in `design-tokens/components/`).

<!-- token-table:start (made from tabs.tokens.json by npm run tokens: edit the descriptions there) -->
**Colors**

| Token | Default | Use |
| --- | --- | --- |
| `--tabs-text` | `text-muted` | A tab's label (4.5:1 on surface). |
| `--tabs-text-hover` | `text` | A tab's label on hover. |
| `--tabs-text-selected` | `text` | The selected tab's label (line). |
| `--tabs-indicator` | `primary` | The line under the selected tab (3:1 on surface). |
| `--tabs-border` | `border` | The line under the whole tab list (line). |
| `--tabs-pill-bg-hover` | `secondary` | A pill tab's background on hover. |
| `--tabs-pill-bg-pressed` | `pressed` | A pill tab's background while it's pressed, before it's selected, one step past hover. |
| `--tabs-pill-bg-selected` | `primary` | The selected pill tab's background. |
| `--tabs-pill-text-selected` | `on-primary` | The selected pill tab's label. |
| `--tabs-focus-ring` | `focus-ring` | The keyboard focus ring, on a tab and on the panel. |
| `--tabs-focus-gap-color` | `surface` | The gap between the focus ring and the selected pill's fill. |
| `--tabs-text-disabled` | `disabled-text` | Disabled: the text, icon or mark, in place of fading it (3:1 or more on its background, more with more contrast). |
| `--tabs-close-bg-hover` | `secondary` | A closable tab's × under the pointer. |
| `--tabs-close-bg-pressed` | `pressed` | A closable tab's × while it's pressed, one step past hover. |

**Sizing**

| Token | Default | Use |
| --- | --- | --- |
| `--tabs-height-sm` | `control-height-md` | A tab's height with size="sm" (32px). |
| `--tabs-height-md` | `spacing-9` | A tab's height with size="md", the default (36px). |
| `--tabs-height-lg` | `control-height-lg` | A tab's height with size="lg" (44px), the touch-target size. |

**Border**

| Token | Default | Use |
| --- | --- | --- |
| `--tabs-indicator-width` | `border-width-2` | The thickness of the selected tab's line (2px). |
| `--tabs-radius` | `radius-control` | A tab's corners (6px): the focus ring, and the pills. |
| `--tabs-close-radius` | `radius-inner` | The corners of a closable tab's ×. |

**Spacing**

| Token | Default | Use |
| --- | --- | --- |
| `--tabs-padding-x` | `spacing-3` | Padding at a tab's sides (12px). |
| `--tabs-gap` | `spacing-1` | Space between tabs (4px). |
| `--tabs-icon-gap` | `spacing-1.5` | Space between a tab's icon and label (6px), as in Button and SegmentedControl. |
| `--tabs-panel-gap` | `spacing-4` | Space above a panel, or beside it when vertical (16px). |
| `--tabs-fade-size` | `spacing-8` | How far the row fades out at an edge with more tabs past it (32px). |

**Type**

| Token | Default | Use |
| --- | --- | --- |
| `--tabs-weight` | `font-medium` | A tab's label weight (500). |
<!-- token-table:end -->
