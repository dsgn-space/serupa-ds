# VisuallyHidden

Content that screen readers announce but nobody sees: "(opens in a new tab)", the label of an icon-only control you build yourself, a heading for a section that's obvious by sight. With `focusable` it shows while it has keyboard focus, for a "Skip to content" link.

## Usage

```jsx
const { VisuallyHidden } = window.Diki;

<span>3 <VisuallyHidden>unread messages</VisuallyHidden></span>
<VisuallyHidden as="h2">Filters</VisuallyHidden>

// First thing in the page: shown when someone presses Tab
<VisuallyHidden focusable as="div"><a href="#main">Skip to content</a></VisuallyHidden>
```

## Props

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `focusable` | boolean | `false` | Shows it while it, or something inside it, has focus |
| `as` | `'span'` \| `'div'` \| `'h1'`…`'h6'` \| `'p'` \| `'label'` \| `'legend'` | `'span'` | The element |

`className`, `style`, `ref` and everything else go to the element, which has `data-component="visually-hidden"`. The `sr-only` utility class does the same in plain HTML.

## Accessibility

- It's clipped to 1px and taken out of the layout, not `display: none`, so screen readers still read it.
- Don't hide anything someone who can see needs: if it matters, show it.
- A focusable skip link takes its own place in the layout when shown: style it with your page so it doesn't push content around, or put it in a fixed spot.

## Component tokens

None: it has nothing to see.
