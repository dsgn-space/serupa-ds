# Drawer

A modal panel that slides in from an edge of the screen: navigation on small screens, filters, or details and edits without leaving the page. For a short question or form, use Dialog; for something people keep open while they work, put it in the page.

```tsx
import { Drawer, Button } from "@diki/design-system";

const [open, setOpen] = React.useState(false);
<Button onClick={() => setOpen(true)}>Filters</Button>
<Drawer open={open} onOpenChange={setOpen} title="Filters" description="Narrow the list."
  footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Reset</Button><Button onClick={() => setOpen(false)}>Apply</Button></>}>
  …
</Drawer>
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `open` | `boolean` | | Controlled: close it yourself in `onOpenChange`. |
| `onOpenChange` | `(open) => void` | | Called with `false` on Escape, the ×, or a click on the backdrop. |
| `side` | `'right' \| 'left' \| 'top' \| 'bottom'` | `'right'` | The edge it slides in from. These are physical edges, so they stay put in right-to-left pages. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | The width of a left or right drawer: 320, 384 or 512px, never wider than the screen. |
| `title` | `ReactNode` | | The heading; it also names the drawer. Without one, give it an `aria-label`. |
| `description` | `ReactNode` | | A muted line under the title. |
| `footer` | `ReactNode` | | Buttons pinned to the bottom under a line, with the main action last. |
| `closeButton` | `boolean` | `true` | The × in the corner. |
| `closeLabel` | `string` | `'Close'` | The ×'s name. |
| `closeOnBackdrop` | `boolean` | `true` | Whether a click on the backdrop closes it. Turn it off when closing would lose work. |

Every other prop, `className` and `ref` go to the native `<dialog>`.

## Behavior

- It's a native `<dialog>` opened with `showModal()`, like Dialog. Focus moves inside and stays there, the page behind can't be reached and doesn't scroll, and closing moves focus back to where it was.
- Left and right drawers are full height. Top and bottom drawers are full width, as tall as their content up to the screen less 64px, and rounded on the open side.
- The body scrolls on its own, so the header and footer stay in view.
- It slides in over 300ms, and appears at once with `prefers-reduced-motion`.

## Accessibility

- `aria-modal`, named by the title (`aria-labelledby`) and described by the description.
- The title, description and body text keep 4.5:1 on the panel in all six themes (`tools/test/drawer.mjs`). In forced-colors mode the panel gets a border.

## Component tokens

Each is an optional override: set it on the page, a container or one drawer. The list lives in `src/components/Drawer/drawer.tokens.json` (also in `design-tokens/components/`).

| Token | Default | Use |
| --- | --- | --- |
| `--drawer-bg` | `surface` | The panel's background. |
| `--drawer-overlay` | `overlay` | The dimmed backdrop over the page. |
| `--drawer-title-color` | `text` | The title. |
| `--drawer-description-color` | `text-muted` | The description under the title (4.5:1 on surface). |
| `--drawer-border` | `border` | The line above the footer. |
| `--drawer-shadow` | `shadow-xl` | The panel's shadow. |
| `--drawer-width-sm` | `container-xs` | size="sm" (320px). |
| `--drawer-width-md` | `container-sm` | size="md", the default (384px). |
| `--drawer-width-lg` | `container-lg` | size="lg" (512px). |
| `--drawer-padding` | `spacing-6` | Padding inside the panel (24px). |
| `--drawer-gap` | `spacing-4` | Space between the header and the body (16px). |
| `--drawer-border-width` | `border-width-1` | The line above the footer (1px). |
| `--drawer-radius` | `rounded-xl` | The corners on the open side of a top or bottom drawer (12px). |
| `--drawer-title-weight` | `font-semibold` | The title's weight (600). |
| `--drawer-duration` | `duration-300` | Sliding in (300ms). |
