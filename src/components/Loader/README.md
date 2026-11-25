# Loader

Shows that something is loading when you can't say how far along it is. Three looks: a **ring** (a quarter arc turning on a faint track), **dots** (three pulsing dots) and **text** (words with a shine sweeping through them). For placeholder shapes where the content will be, use [Skeleton](../Skeleton/README.md).

**Also called:** spinner, loading indicator.

Called Spinner before 3.0.0: see the upgrade table in the changelog.

```jsx
import { Loader } from '@diki-stwn/serupa-ds';

<Loader />                                   // ring, 24px, text color, "Loading…"
<Loader size="lg" />                         // a page or an empty area that is loading
<Loader variant="dots" />                    // softer: chat replies, inline waits
<Loader tone="primary" label="Loading projects" />
<Loader variant="text" label="Loading projects…" />   // words with a shine
<Loader tone="inverse" />                    // white, on a dark scrim or a photo

// next to text that already says it: decorative
<span className="flex items-center gap-2 text-text-muted">
  <Loader size="sm" label="" /> Loading projects…
</span>
```

## When to use

- Content or a result is on its way and you can't tell how long it will take: a list loading, a search running.
- A reply or an AI task is being prepared and people should see that work is going on.

## When not to use

- Waits you can measure (uploads, imports): use [Progress](../Progress/README.md) instead; a progress bar tells people how long it will take.
- The layout of what's coming is known: use [Skeleton](../Skeleton/README.md), which holds its place while it loads.
- A button whose action is running: use `<Button loading>` on the [Button](../Button/README.md) instead; it shows the ring in the center of the button, so buttons don't need a loader of their own.

## Anatomy

Drawn from the `Playground` story.

1. **Loader** (`.srp-loader`): the whole indicator, named "Loading" (or your label) for screen readers.
2. **Track** (`.srp-loader__track`): the spinner's faint full circle.
3. **Arc** (`.srp-loader__arc`): the part that turns; it stops under reduced motion and pulses instead.

## Usage

- Use a [Skeleton](../Skeleton/README.md) when you know the shape of what's loading, such as a list, a card or a profile; use the ring when you don't.
- Show one ring per loading area, not one per row.
- Keep the label specific when it helps ("Loading projects"), and short.
- If loading fails, replace the loader with an error message and a way to retry; never leave it spinning.

Mark the area that is loading with `aria-busy` while the loader shows, and replace the loader with the content when it arrives:

```jsx
<section aria-busy={loading}>
  {loading ? <Loader /> : <ProjectList projects={projects} />}
</section>
```

### Variants and sizes

| | sm | md | lg |
| --- | --- | --- | --- |
| Ring (16, 24, 40px) | Inline with `text-sm`, inside small controls | Default: cards, panels, list rows | A whole page or an empty area |
| Dots (16, 24, 40px) | Inline "typing…" style waits | Chat replies, short inline waits | Rarely; prefer the ring for large areas |
| Text (`text-xs`, `text-sm`, `text-base`) | Inline, in small type | Where words say more than a drawing: "Generating summary…" | Under a page title or in an empty area |

Use one look per kind of wait across the product: the ring for loading content you can't predict, a Skeleton when you know its shape, the dots for "someone is replying", the text when the words matter ("Thinking…", "Generating summary…").

### Text

`variant="text"` is a loader made of words: the label, with a shine sweeping through it. Use it where the words say more than a drawing would:

```jsx
<Loader variant="text" label="Thinking…" />
<Loader variant="text" size="sm" label="Saving…" />
```

The words rest at 65% of the text color, and a band of full color sweeps through them from left to right every 2 seconds, easing in and out (`ease-move`), a shine that shows it's still working. The resting words keep 4.5:1 contrast on `surface` in every theme (the tests check it), so the text stays in the text color around it: `primary` and `muted` don't apply to it, only `inverse`. Its size is the type size: `text-xs` for `sm`, `text-sm` for `md`, `text-base` for `lg`, in `font-medium`. Screen readers hear the words once, as the loader's name; the visible copy is hidden from them so it isn't read twice. With `label=""` it still shows "Loading" but is decorative. Under reduced motion it's plain text, without the shine.

To put words next to a ring, place a Text loader beside a decorative ring, or a ring beside your own text with `label=""`.

Keep it short and specific, and end with an ellipsis when the wait continues: "Loading projects…", "Saving…".

### Inverse tone

On a dark scrim, overlay, photo or video, which stay dark in every theme, use `tone="inverse"`: the ring, dots or text turn white.

```jsx
<div className="absolute inset-0 grid place-items-center bg-overlay">
  <Loader tone="inverse" size="lg" label="Uploading photo" />
</div>
```

Don't use it on `surface-inverse`, which turns light in dark themes; there, leave the tone as `neutral` and it takes `text-inverse` from its parent.

## Behavior

### Show-after delay

By default a loader waits 300ms before it appears. Most requests finish sooner, so people never see a loader flash on and off. While it waits it keeps its space (nothing jumps when it appears), shows nothing, and isn't announced. If the content arrives first and you remove the loader, it never shows at all. Use `delay={0}` where the wait is certain to be long, or when the loader replaces something the person just clicked.

### Minimum time

Once it shows, a loader stays at least 500ms. Without that, work ending at 320ms would show a spinner for 20ms, cut off in the middle of its fade-in, which reads as a glitch. For the minimum to work, keep the Loader mounted and pass `loading={false}` when the work ends, rather than removing it. It then stays until the 500ms are up, and renders nothing after that. If the work ends within the delay, it never shows.

```tsx
<Loader loading={isFetching} />
```

### Do and don't

- **Do:** Show one ring for the area that's loading, with a specific label. (`DoOnePerArea`)
- **Don't:** Put a ring on every row: the page spins in many places at once. (`DontOnePerRow`)

## Accessibility

- A loader with a label is a `role="progressbar"` without a value, which is how ARIA says "busy, progress unknown". Its name is `label` ("Loading…").
- When it appears, `label` is announced once through the system's shared polite status region (the same one Button's loading uses), so screen-reader users hear that something started loading.
- `label=""` makes it decorative (`aria-hidden`), for when visible text next to it already says what's loading, or when a parent announces it (as Button does).
- It draws in the text color, so it keeps the contrast of the text it sits with. With `tone`, use it on `surface` backgrounds, where `primary` and `text-muted` meet the 3:1 non-text contrast.
- The text variant's visible words are hidden from screen readers, which already hear the same text as its name.
- Under reduced motion the text variant is plain text, the ring stands still and breathes between full and half strength (opacity, 2s), and the dots fade without growing. Nothing turns.
- **Keyboard:** none: it isn't focusable.

## Props

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `id` | string | none | Goes to the root `<span>`. |
| `variant` | `'ring'` \| `'dots'` \| `'text'` | `'ring'` | The look |
| `size` | `'sm'` \| `'md'` \| `'lg'` | `'md'` | 16px, 24px or 40px, the same steps as icons; for `text`, `text-xs`, `text-sm` or `text-base` |
| `tone` | `'neutral'` \| `'primary'` \| `'muted'` \| `'inverse'` | `'neutral'` | `neutral` takes the text color, so it fits any surface (white on a primary button, `text` on a page). `primary` and `muted` color the ring or dots with those aliases (`text` stays in the text color). `inverse` makes it white in every theme, for dark scrims, overlays and media |
| `label` | string | `'Loading…'` | Its accessible name, announced when it appears, and the words `text` shows. `''` makes it decorative |
| `delay` | number (ms) | `300` | Waits this long before showing. `0` shows it at once |
| `loading` | boolean | `true` | Pass `false` when the work ends. Once shown, it stays at least 500ms, then renders nothing |

Any other attribute (`id`, `className`, `style`, `data-*`, `ref`) goes to the outer `<span>`. Every loader has `data-component="loader"`, `data-variant` and `data-size` for tests.

## Component tokens

Each is an optional override: set it on the page, a container or one loader. Unset, it uses the shared token below. The list lives in `src/components/Loader/loader.tokens.json` (also in `design-tokens/components/`), and the tests check the CSS uses exactly these defaults.

```css
.sidebar { --loader-size-md: var(--spacing-5); }        /* smaller loaders in one area */
:root { --loader-track-opacity: var(--opacity-10); }   /* a fainter track everywhere */
```

<!-- token-table:start (made from loader.tokens.json by npm run tokens: edit the descriptions there) -->
| Token | Default | Use |
| --- | --- | --- |
| `--loader-primary` | `primary-text` | Color with `tone="primary"` |
| `--loader-muted` | `text-muted` | Color with `tone="muted"` |
| `--loader-inverse` | `white` | Color with `tone="inverse"` (every variant) |
| `--loader-size-sm` | `spacing-4` | Size sm (16px) |
| `--loader-size-md` | `spacing-6` | Size md (24px) |
| `--loader-size-lg` | `spacing-10` | Size lg (40px) |
| `--loader-stroke-width` | `stroke-width-2` | Ring thickness in its 24-unit drawing (about 8% of its size) |
| `--loader-track-opacity` | `opacity-20` | Strength of the ring's track |
| `--loader-dots-dim` | `opacity-25` | How faint a dot gets between pulses |
| `--loader-label-dim` | `opacity-65` | How strong the text variant's words are between shines (keeps 4.5:1 on `surface`) |
| `--loader-dots-duration` | `duration-1000` | One pulse of the dots |
| `--loader-dots-stagger` | `delay-150` | Delay from one dot to the next |
<!-- token-table:end -->

The ring is a quarter arc that turns once every `motion-loop-spinner` (700ms) with `ease-linear`, the one spinner speed of the library: Switch's loading ring and the indeterminate circular Progress turn with it. Only the drawing turns, so nothing is repainted on each frame. The text shine and the skeleton shimmer take 2s (`duration-1000` twice) with `ease-move`, and both move on `translate`, which the compositor runs without repainting: the skeleton slides a layer three bones wide through each bone, and the text slides a window holding a full-color copy of the words across them. Under reduced motion the ring stands still and breathes over twice that (2s, `ease-move`). It fades in over `duration-150` with `ease-out`.
