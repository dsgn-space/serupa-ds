# ShowMore

Long text cut after a few lines, with a "Show more" button under it that shows the rest. It keeps a list of reviews, comments or product descriptions short enough to scan, while each one is a press away from in full.

```tsx
import { ShowMore } from "serupa-ds";

<ShowMore lines={3}>{review.text}</ShowMore>
```

## When to use

- A review, comment, bio or description that is sometimes long, in a list or a card where every item should take about the same room.
- Help text or terms under a form field that most people won't need to read in full.

## When not to use

- Text people must read before acting, such as a warning or a price condition: show all of it.
- A single line that has to fit, such as a file name: [Text](../Text/README.md) `truncate`.
- A section with its own heading that can be opened and closed: [Accordion](../Accordion/README.md).
- A preview that links to the full item on its own page: [Text](../Text/README.md) `lines`, with the link.

## Anatomy

Drawn from the `Expanded` story.

1. **Text** (`.dk-show-more__text`): the long text, cut after `lines` lines with an ellipsis while closed.
2. **Toggle** (`.dk-show-more__toggle`): the link-style button under the text, "Show more" or "Show less"; there only when the text is cut, or open.

## Usage

- Pick `lines` for the shortest useful preview: 2 or 3 in a dense list, 4 to 6 for a description on its own page.
- The button only appears when the text is cut, and its check runs again when the width changes, so a short comment shows as it is and a phone shows the button where a wide screen may not.
- Keep the children to text and inline content (links, emphasis) or a few paragraphs. A cut line is drawn with an ellipsis; a table or image inside would be cut off without one.
- Controlled, `expanded` with `onExpandedChange`, when something else opens it too (a "Show all" for the page). Otherwise `defaultExpanded`.

## Accessibility

- **Role and name:** the button is a `<button>` named "Show more", then "Show less" (the `showMore` and `showLess` labels), with `aria-expanded` and `aria-controls` pointing at the text.
- **Hidden lines:** they are cut for the eye only. Screen readers read the whole text and find-in-page finds it, so nobody who can't see the screen misses any of it.
- **Keyboard:** Tab reaches the button; Enter or Space opens and closes. Focus stays on the button, which keeps its place under the text.
- **Contrast:** the button is a link-style [Button](../Button/README.md), 4.5:1 in all six themes; the text keeps the color of where it sits.
- **What's still yours:** a heading or the author's name before each item, so people know whose text they're reading.

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `id` | `string` | | Goes to the outer `<div>`. |
| `lines` | `number` | `3` | Lines shown while closed, the last cut with an ellipsis. |
| `expanded` | `boolean` | | Open (controlled). Use with `onExpandedChange`. |
| `defaultExpanded` | `boolean` | `false` | Open at first (uncontrolled). |
| `onExpandedChange` | `(expanded: boolean) => void` | | Called with the new state when the button is pressed. |
| `children` | `ReactNode` | | The long text. |

`className`, `ref` and other props go to the outer `<div>`, which has `data-component="show-more"` and `data-expanded` while open.

## Component tokens

Each is an optional override: set it on the page, a container or one ShowMore. The list lives in `src/components/ShowMore/show-more.tokens.json` (also in `design-tokens/components/`).

<!-- token-table:start (made from show-more.tokens.json by npm run tokens: edit the descriptions there) -->
| Token | Default | Use |
| --- | --- | --- |
| `--show-more-gap` | `spacing-1` | Space between the text and the button (4px). |
<!-- token-table:end -->
