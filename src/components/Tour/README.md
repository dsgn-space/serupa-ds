# Tour

A short guided walk through a page: one step at a time, a small panel points at a part of the page, says what it's for, and offers Back, Next and Done. Use it to show someone new the few things they need first.

**Also called:** product tour, walkthrough, coach marks.

```tsx
import { Tour } from "serupa-ds";

<Tour
  open={open}
  onOpenChange={setOpen}
  steps={[
    { title: "Welcome to Projects", content: "A quick look at the three things you'll use most." },
    { target: "#search", title: "Find a project", content: "Search by name or owner." },
    { target: newButton, title: "Start something new", content: "Opens a blank board.", placement: "bottom-end" },
  ]}
/>
```

## When to use

- A first visit to a page or a new feature, where three to five pointers save someone from hunting.
- Something they asked for: a "Take the tour" button in Help, so they can see it again.

## When not to use

- To explain one control: a [Tooltip](../Tooltip/README.md) or a [Popover](../Popover/README.md) next to it does that without a walk.
- For a task with steps they must finish: use a [Stepper](../Stepper/README.md) in the page, or a [Dialog](../Dialog/README.md).
- For anything they need every time: put it in the page. A tour is seen once and forgotten.

## Anatomy

Drawn from the `Default` story, opened.

1. **Title** (`.dk-tour__title`): the step's heading, which names its panel. The panel is a non-modal dialog next to the step's element, or in the middle of the screen when there's none.
2. **Close button** (`.dk-tour__close`): ends the tour.
3. **Text** (`.dk-tour__text`): what the step says, which describes the panel.
4. **Step count** (`.dk-tour__count`): "Step 1 of 3", when there's more than one step.
5. **Actions** (`.dk-tour__actions`): Back (from the second step) and Next, or Done on the last step.

The element the step points at gets a 2px primary ring (`[data-tour-target]`), set by the tour and taken off when it moves on.

## Usage

- Keep it short: three to five steps, a title and a sentence or two each. Say what the part does for them, not what it is.
- Start it from something they press, or once on a first visit, and remember (onFinish, onOpenChange) that they've seen it.
- A target is a CSS selector, an element or a ref. It's looked up each time its step shows; one that isn't on the page puts the step in the middle of the screen, so a missing part never breaks the tour.
- The page stays usable while it's open: nothing is dimmed and a press outside doesn't end it, so they can try what a step points at.
- Placement says where the panel goes ('bottom' by default); it flips when there's no room.

### Do and don't

- **Do:** Say what each part does for people, in a title and a sentence or two. (`DoSayWhatItDoes`)
- **Don't:** Describe what the part is ("This is the search field"): they can already see that. (`DontSayWhatItIs`)

## Accessibility

- **Role and name:** each step is a `dialog` named by its title (a heading, level 2 by default: `headingLevel` fits it to the page) and described by its text.
- **Focus:** showing a step moves focus to its panel, so a screen reader reads its title and text; when the tour ends, focus goes back to where it was.
- **Contrast:** its text and its step count read 4.5:1 on its background in all six themes (`Tour.test.tsx`).
- **What's still yours:** the target's own name, and a way to start the tour again. It isn't modal, so don't put anything in a step that must be done before going on.

### Keyboard

| Key | Does |
| --- | --- |
| Tab, Shift+Tab | Moves between the close button, Back and Next, and any link in the step; from Next it goes round to the close button, so focus never lands on the page under the panel. Click the page to leave the tour open and work there. |
| Enter, Space | Presses the focused button. |
| Escape | Ends the tour; focus goes back. |

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `steps` | `TourStep[]` | | Each `{ target?, title, content?, placement? }`. `target` is a selector, an element or a ref; left out, the step sits in the middle. |
| `open` | `boolean` | | Show it yourself (controlled), with `onOpenChange`. |
| `defaultOpen` | `boolean` | `false` | Show it at first (uncontrolled). |
| `onOpenChange` | `(open, { reason }) => void` | | `reason` is `'escape'` or `'close'` (the close button, or Done). |
| `step` | `number` | | The step shown, from 0 (controlled), with `onStepChange`. |
| `defaultStep` | `number` | `0` | The step shown each time it opens (uncontrolled). |
| `onStepChange` | `(step) => void` | | Called with the new step on Back or Next. |
| `onFinish` | `() => void` | | Called when Done is pressed on the last step, before it closes. |
| `headingLevel` | `2 \| 3 \| 4 \| 5 \| 6` | `2` | The heading level of each title. |

`className`, `id`, `ref` and other props go to the panel's `<div>` (its title and text take ids made from `id`). The words (Back, Next, Done, Step 2 of 4, Close) come from `<SerupaProvider labels>`.

## Component tokens

Each is an optional override: set it on the page, a container or one Tour. The list lives in `src/components/Tour/tour.tokens.json` (also in `design-tokens/components/`).

<!-- token-table:start (made from tour.tokens.json by npm run tokens: edit the descriptions there) -->
| Token | Default | Use |
| --- | --- | --- |
| `--tour-bg` | `surface-overlay` | The panel's background. |
| `--tour-text` | `text` | The text (4.5:1 on bg). |
| `--tour-muted` | `text-muted` | "Step 2 of 4" (4.5:1 on bg). |
| `--tour-border` | `border-overlay` | The panel's edge. |
| `--tour-ring` | `primary` | The ring round the element a step points at (3:1 on the page). |
| `--tour-focus-ring` | `focus-ring` | The panel's focus ring, when the keyboard brings focus to it. |
| `--tour-shadow` | `shadow-lg` | The panel's shadow. |
| `--tour-radius` | `radius-surface` | The panel's corners (8px). |
| `--tour-border-width` | `border-width-1` | The panel's edge (1px). |
| `--tour-ring-width` | `border-width-2` | The ring round the element (2px). |
| `--tour-ring-offset` | `outline-offset-2` | The gap between the element and its ring (2px). |
| `--tour-title-size` | `text-base` | The step's title (16px). |
| `--tour-title-weight` | `font-semibold` | The step's title. |
| `--tour-width` | `container-2xs` | The panel's width (288px), never wider than the screen. |
| `--tour-padding` | `spacing-4` | Space inside the panel (16px). |
| `--tour-gap` | `spacing-3` | Space between the title, the text and the buttons (12px). |
| `--tour-offset` | `spacing-3` | The gap between the element and the panel (12px). |
| `--tour-z-index` | `z-popover` | Its stacking order, for a browser without the top layer. |
<!-- token-table:end -->
