# Carousel

One slide at a time, with previous and next buttons, a dot per slide and swipe. Use it for a few related pictures or cards, such as product photos. It never moves on its own.

```tsx
import { Carousel, Image } from "@diki/design-system";

<Carousel label="Product photos">
  {photos.map((p) => <Image key={p.id} src={p.url} alt={p.alt} ratio="4:3" rounded={false} />)}
</Carousel>

<Carousel label="Featured" index={i} onIndexChange={setI} loop dots={false}>
  <Card>…</Card>
  <Card>…</Card>
</Carousel>
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `children` | `ReactNode` | | One slide per child. |
| `label` | `string` | | Required. What the carousel shows; it names the region. |
| `index` | `number` | | The slide shown (from 0), when you control it. |
| `defaultIndex` | `number` | `0` | The first slide shown when you don't. |
| `onIndexChange` | `(index) => void` | | Called with the new slide's index. |
| `loop` | `boolean` | `false` | Past the last slide comes the first. Without it, the buttons hide at the ends. |
| `arrows` | `boolean` | `true` | The previous and next buttons on the sides. |
| `dots` | `boolean` | `true` | A dot for each slide, under the carousel. |
| `previousLabel` | `string` | `"Previous slide"` | The previous button's name. |
| `nextLabel` | `string` | `"Next slide"` | The next button's name. |
| `slideLabel` | `(index, count) => string` | `"2 of 5"` | Each slide's name, and its dot's. |

`ref`, `className`, `style` and other props go to the outer `<section>`.

## Behavior

- The previous and next buttons move one slide. A click on a dot goes to that slide. On the dots, the arrow keys move to the previous or next slide, and Home and End go to the first and last.
- A swipe of 40px or more, with touch, pen or mouse, moves one slide; a shorter one springs back. Up and down swipes still scroll the page. Swiping works over pictures, and a swipe that starts on a link doesn't follow it.
- Without `loop`, the button for the way you can't go hides; if it had focus, focus moves to the other button.
- Slides slide in over 300ms, and change at once with reduced motion. With one slide there are no buttons or dots.
- In RTL (a `dir` attribute or CSS `direction`) the row runs right to left, and the buttons and arrow keys follow it.

## Accessibility

- The `<section>` is a region named by `label`, with `aria-roledescription="carousel"`. Each slide is a group named "2 of 5" (`aria-roledescription="slide"`). The slides not shown are `inert` and hidden, so Tab and screen readers only reach the current one.
- The slides are in a polite live region, so a screen reader reads the new slide after a button press.
- The dots are buttons named like their slide; the current one has `aria-current="true"` and is the only one in the Tab order.
- It never moves on its own, so nothing needs pausing (WCAG 2.2.2).
- The dots keep 3:1 and the buttons 3:1 in all six themes (`tools/test/carousel.mjs`).

## Component tokens

Each is an optional override: set it on the page, a container or one carousel. The list lives in `src/components/Carousel/carousel.tokens.json` (also in `design-tokens/components/`).

| Token | Default | Use |
| --- | --- | --- |
| `--carousel-dot` | `field-border` | The dots for the slides not shown (3:1 on surface). |
| `--carousel-dot-hover` | `text-muted` | A dot under the pointer. |
| `--carousel-dot-active` | `primary` | The current slide's dot. |
| `--carousel-focus-ring` | `focus-ring` | A dot's keyboard focus ring. |
| `--carousel-radius` | `rounded-xl` | The slides' corners (12px). |
| `--carousel-dot-size` | `spacing-2` | A dot's size (8px). |
| `--carousel-dot-active-width` | `spacing-6` | The current dot's width (24px). |
| `--carousel-gap` | `spacing-3` | Space between the slides and the dots (12px). |
| `--carousel-arrow-offset` | `spacing-2` | The previous and next buttons' distance from the sides (8px). |
| `--carousel-arrow-shadow` | `shadow-sm` | The previous and next buttons' shadow, so they stand out on any slide. |
