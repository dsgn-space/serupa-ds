# TableOfContents

An "On this page" list of links to the sections of a long page, as a navigation landmark. It reads the page's headings (or takes a list), marks the section being read as the page scrolls, and a click scrolls to that section and moves focus to its heading.

```jsx
const { TableOfContents } = window.Serupa;

// from the h2 and h3 headings in <main>
<aside className="sticky top-4"><TableOfContents /></aside>

// from one article, under a 64px sticky header
<TableOfContents container="#article" offset={80} />

// your own list
<TableOfContents items={[{ id: "install", label: "Installation" }, { id: "npm", label: "With npm", level: 3 }]} />

// a narrow rail of dashes that shows the list on hover, focus or a tap
<TableOfContents variant="rail" />
```

## When to use

- A long page people scan and jump around in: documentation, a policy, a settings page with many sections, a long form.
- Beside the content on a wide screen, kept in view with `position: sticky`.
- `variant="rail"` where a side column has no room for the titles: a 24px column of dashes that shows the list in a panel when people point at it, Tab into it or tap it.

## When not to use

- Moving between pages: use a [Sidebar](../Sidebar/README.md) or [Tabs](../Tabs/README.md).
- A short page with two or three sections: the headings are enough.
- Steps people go through in order: use a [Stepper](../Stepper/README.md).

## Anatomy

Drawn from the `Playground` story.

1. **Title** (`.dk-toc__title`): "On this page"; it names the landmark.
2. **Link** (`.dk-toc__link`): one section; deeper ones step in, and the current one is marked by a line in primary, twice as wide as the others.

With `variant="rail"` (the `Rail` story), two more parts:

- **Rail** (`.dk-toc__rail`): a dash (`.dk-toc__dash`) per section, 12px long and 4px shorter a level, the current one in primary.
- **Panel** (`.dk-toc__panel`): the title and the links, over the page from the rail's top end corner, 256px wide at most.

## Usage

- Keep it to two levels (the default `h2, h3`): deeper lists are hard to scan.
- Give the headings `scroll-margin-top` the height of any sticky header, and set `offset` to about the same plus a little, so a section counts as reached when its heading clears the header.
- Headings without an `id` get one from their text ("Beta part" becomes `beta-part`), kept unique on the page, so links to them can be shared: a page opened with one (`#beta-part`) scrolls to that heading once its id is made. Headings added, removed or renamed later, such as content loaded after the page, update the list.
- On a phone, put it at the top of the page or in an [Accordion](../Accordion/README.md), not beside the text.
- The rail is for a column beside the text with little room, such as a docs page's end edge. Give it room to its start side: its panel opens over the page from its top end corner. Where people need the titles in view to choose (a long settings page), use the list.

## Behavior

- The list marks the section being read as the page scrolls. A click scrolls to the heading (smoothly unless motion is reduced), puts its id in the address and moves focus to it.
- The rail shows its panel while the pointer is over it or the panel, while focus is on one of its links, or after a tap (touch or pen) until a tap elsewhere or a link. The panel fades and grows in and out; from the keyboard it's there at once; under reduced motion it only fades. Escape hides it until the pointer and focus leave.

### Do and don't

- **Do:** Keep it to two levels (the default `h2, h3`). (`DoTwoLevels`)
- **Don't:** Go three or four levels deep: the list becomes hard to scan. (`DontDeepLevels`)

## Accessibility

- **Role and name:** a `nav` landmark named by its title (or `aria-label` with `title={null}`), holding a list of links. The current section's link has `aria-current="location"`, and is marked by a wider line, not by color alone.
- **Keyboard:** Tab moves through the links; Enter follows one. Focus then moves to the section's heading, so the next Tab continues from there in the content. In the rail, Tab to the first link shows the panel, and Escape hides it with focus kept (WCAG 1.4.13).
- **The rail:** its dashes are hidden from screen readers; the links are in the panel, so a screen reader reads the same landmark and links as the list, shown or not. A hidden panel takes no presses.
- **Motion:** the scroll is smooth only when the reader hasn't asked for reduced motion.
- **Contrast:** links read 4.5:1 on the page and on the rail's panel, the current section's line and dash 3:1, in all six themes (`TableOfContents.test.tsx`).
- **What's still yours:** headings that say what each section is about.

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `items` | `TocItem[]` | | `{ id, label, level? }`: your own entries instead of the headings |
| `container` | `Element \| string` | `<main>`, else `<body>` | Where to read the headings from. They may scroll with the page or in a pane of their own (`overflow: auto`). |
| `headings` | `string` | `"h2, h3"` | Which headings it lists |
| `title` | `ReactNode \| null` | "On this page" | The title and the landmark's name; `null` for none |
| `variant` | `"list" \| "rail"` | `"list"` | `"rail"`: dashes that show the list in a panel on hover, focus or a tap |
| `offset` | `number` | `96` | How far from the top of the window (or of the pane the headings scroll in), in pixels, a heading counts as reached |
| `id` | `string` | | Goes to the `<nav>`. |

`className`, `ref` and other props go to the `<nav>`.

## Component tokens

Each is an optional override: set it on the page, a container or one TableOfContents. The list lives in `src/components/TableOfContents/table-of-contents.tokens.json` (also in `design-tokens/components/`).

<!-- token-table:start (made from table-of-contents.tokens.json by npm run tokens: edit the descriptions there) -->
| Token | Default | Use |
| --- | --- | --- |
| `--table-of-contents-muted` | `text-muted` | The links (4.5:1 on the page). |
| `--table-of-contents-title` | `text` | The title, and a link under the pointer (4.5:1). |
| `--table-of-contents-current` | `text` | The current section's link (4.5:1). |
| `--table-of-contents-line` | `border` | The line along the links. |
| `--table-of-contents-line-current` | `primary` | The line beside the current section's link (3:1). |
| `--table-of-contents-focus-ring` | `focus-ring` | The ring around a focused link. |
| `--table-of-contents-dash` | `border-strong` | The rail's dashes (decorative: the links are in its panel). |
| `--table-of-contents-panel` | `surface-overlay` | The rail's panel, over the page. |
| `--table-of-contents-panel-border` | `border-overlay` | The rail's panel's edge. |
<!-- token-table:end -->
