# Card

A surface that groups related content and its actions: a summary, a settings panel, an item in a grid. It's built from parts (`CardHeader`, `CardBody`, `CardFooter`) that you can mix with any content, and with `href` the whole card becomes one link.

```jsx
const { Card, CardHeader, CardBody, CardFooter, Button, Badge } = window.Serupa;

<Card>
  <CardHeader title="Team plan" description="Up to 10 members" action={<Badge tone="success">Active</Badge>} />
  <CardBody>Renews on 1 March. You're using 6 of 10 seats.</CardBody>
  <CardFooter>
    <Button variant="secondary">Manage seats</Button>
    <Button>Upgrade</Button>
  </CardFooter>
</Card>

// a whole card as a link, in a list (as is ignored with href, so wrap it in the <li>)
<li>
  <Card href="/projects/atlas">
    <CardHeader title="Atlas" description="Updated 2 hours ago" />
  </Card>
</li>

// full-bleed media: no padding on the card, pad the parts yourself
<Card padding="none" className="overflow-hidden">
  <img src="cover.jpg" alt="" />
  <div className="p-5"><CardHeader title="Release notes" /></div>
</Card>
```

## When to use

- A summary of one thing with its own actions: a plan, a project, a report.
- A set of similar items in a grid, each opening its own page.
- A panel that sets one group of settings or content apart from the rest of the page.

## When not to use

- Rows of similar items people scan down: use [List](../List/README.md) instead, or [Table](../Table/README.md) when there are columns to compare.
- Only separating two parts of a page: use space from [Stack](../Stack/README.md), or a [Divider](../Divider/README.md).
- Content that sits over the page, such as a confirmation or a short form: use [Dialog](../Dialog/README.md) or [Popover](../Popover/README.md) instead.

## Usage

- Use `outline` for most cards, `elevated` for content over the page, and `filled` for a panel inside another surface.
- Keep a linked card to a title and a line. When a card needs buttons, don't link it: put them in `CardFooter`.
- Wrap linked cards in a list's `<li>` yourself, since `as` is ignored with `href`.
- For full-bleed media, set `padding="none"` and pad the parts yourself.

## States

| State | Look |
| --- | --- |
| Rest | `surface` with a `border` border and `shadow-xs` (outline); `surface-raised` with `shadow-md` and a `border-raised` edge (elevated: the edge only shows in dark); `surface-muted` (filled) |
| Hover (a linked card) | A `border-strong` border |
| Focus (a linked card) | From the keyboard: a 2px `focus-ring` outline, 2px outside the card |

The hover border fades in 150ms (`duration-150`, `ease-in-out`), at once with `prefers-reduced-motion`.

## Accessibility

- A card is a plain container: give it `as="section"` with a title when it's a landmark-worthy region, or `as="article"` for a self-contained item.
- The title is a real heading, so screen reader users can jump between cards. Set `headingLevel` to fit the page.
- A linked card is one link: its name is all the text inside it. Keep it short (a title and a line), and keep buttons and other links out of it, since a link can't hold them.
- In forced-colors mode every card gets a visible border.
- The title, description and body text keep 4.5:1 on every variant, in all six themes (`Card.test.tsx`).

## Props

### Card

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `variant` | `'outline'` \| `'elevated'` \| `'filled'` | `'outline'` | A border and a hairline shadow; a raised shadow (for content over the page); or `surface-muted` and flat (a panel inside another surface) |
| `padding` | `'none'` \| `'sm'` \| `'md'` \| `'lg'` | `'md'` | 0, 12px, 20px or 24px inside, and the parts sit 16px apart |
| `as` | `'div'` \| `'section'` \| `'article'` \| `'li'` | `'div'` | The element. Use `article` for a self-contained item, `li` inside a list |
| `href` | string | | Makes the whole card a link (the link component set with `configure({ link })`, `<a>` by default). `target="_blank"` adds `rel="noopener noreferrer"` |

`className`, `style`, `ref` and everything else go to the card element, which has `data-component="card"` and `data-variant`.

### CardHeader

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `title` | node | | The title, as a heading in `text-base`, `font-semibold` |
| `description` | node | | A muted line under the title |
| `action` | node | | Something at the end of the header, such as a Badge or a menu button |
| `headingLevel` | `2`–`6` | `3` | The title's heading level; pick the one that fits the page's outline |

Children come after the description.

### CardBody and CardFooter

`CardBody` holds the main content. `CardFooter` lays its children out in a wrapping row: `justify` is `'end'` (default), `'start'` or `'between'`.

## Component tokens

Each is an optional override: set it on the page, a container or one card. The list lives in `src/components/Card/card.tokens.json` (also in `design-tokens/components/`).

| Token | Default | Use |
| --- | --- | --- |
| `--card-bg` | `surface` | The background of an outline card |
| `--card-bg-elevated` | `surface-raised` | The background of an elevated card (one step up from the page in dark). |
| `--card-border-elevated` | `border-raised` | An elevated card's edge: invisible in light, a 1px lighter edge in dark |
| `--card-bg-filled` | `surface-muted` | The background of a filled card |
| `--card-border` | `border` | The border of an outline card |
| `--card-title-color` | `text` | The title |
| `--card-description-color` | `text-muted` | The description |
| `--card-text` | `text` | Text in the body and footer |
| `--card-border-hover` | `border-strong` | A linked card's border on hover |
| `--card-focus-ring` | `focus-ring` | A linked card's keyboard focus ring |
| `--card-shadow` | `shadow-xs` | An outline card's shadow |
| `--card-shadow-elevated` | `shadow-md` | An elevated card's shadow |
| `--card-radius` | `rounded-xl` | The corners |
| `--card-border-width` | `border-width-1` | The border |
| `--card-padding-sm` | `spacing-3` | Padding, `sm` |
| `--card-padding-md` | `spacing-5` | Padding, `md` |
| `--card-padding-lg` | `spacing-6` | Padding, `lg` |
| `--card-gap` | `spacing-4` | The space between the parts |
| `--card-header-gap` | `spacing-1` | The space between the title and the description |
| `--card-title-weight` | `font-semibold` | The title's weight |

## Related

- [Grid](../Grid/README.md): lays out a set of cards in columns that fit the screen.
