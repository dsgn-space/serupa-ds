# Text

Body text in the system's type: a paragraph, a caption, an error line. `size`, `tone` and `weight` set only what you give them, so anything you leave out follows the parent, and Text can sit inside a card, a cell or a button without fighting it.

## Usage

```jsx
const { Text } = window.Diki;

<Text>Invite people to work on this project with you.</Text>
<Text size="sm" tone="muted">Last edited 2 hours ago</Text>
<Text as="span" weight="semibold">6 of 10</Text> seats used
<Text tone="danger" size="sm">The name is already taken.</Text>
<Text as="span" truncate style={{ maxWidth: 200 }}>{fileName}</Text>
```

## Props

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `as` | `'p'` \| `'span'` \| `'div'` \| `'label'` \| `'strong'` \| `'em'` \| `'small'` \| `'li'` \| `'figcaption'` | `'p'` | The element |
| `size` | `'xs'` \| `'sm'` \| `'base'` \| `'lg'` \| `'xl'` | inherited | A step of the type scale, with its line height |
| `tone` | `'default'` \| `'muted'` \| `'primary'` \| `'danger'` | inherited | `text`, `text-muted`, `primary` or `danger-text` |
| `weight` | `'normal'` \| `'medium'` \| `'semibold'` \| `'bold'` | inherited | 400, 500, 600 or 700 |
| `truncate` | boolean | `false` | One line, cut with an ellipsis. It becomes a block, so give it a width or a parent that has one |

Text has no margins (space it with the layout). `className`, `style`, `ref`, `htmlFor` (with `as="label"`) and everything else go to the element, which has `data-component="text"`.

## Accessibility

- Every tone keeps 4.5:1 on `surface` in all six themes (`tools/test/typography.mjs`). On other backgrounds, check it yourself.
- Don't use color alone to say something is wrong: say it in the words too.
- A truncated line hides the rest: put the full text in a `title` or somewhere else on the page.

## Component tokens

Each is an optional override: set it on the page, a container or one element. The list lives in `src/components/Text/text.tokens.json` (also in `design-tokens/components/`).

| Token | Default | Use |
| --- | --- | --- |
| `--text-color` | `text` | tone="default". |
| `--text-color-muted` | `text-muted` | tone="muted": secondary text (4.5:1 on surface). |
| `--text-color-primary` | `primary` | tone="primary". |
| `--text-color-danger` | `danger-text` | tone="danger": error text (4.5:1 on surface and danger-subtle). |
