# Dialog

A modal window over a dimmed page, for a task or a decision that needs attention before people go on: inviting someone, confirming a delete, editing a few fields. It's built on the native `<dialog>`, so the browser keeps focus inside it, makes the page behind unreachable, and puts it above everything.

## Usage

```jsx
const { Dialog, Button, Input, Field } = window.Diki;

const [open, setOpen] = React.useState(false);

<Button onClick={() => setOpen(true)}>Invite people</Button>
<Dialog open={open} onOpenChange={setOpen} title="Invite people" description="They'll get an email with a link."
  footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={send}>Send invite</Button></>}>
  <Field label="Email"><Input type="email" /></Field>
</Dialog>

// a confirmation
<Dialog alert size="sm" open={confirm} onOpenChange={setConfirm} title="Delete Atlas?" description="This can't be undone."
  footer={<><Button variant="secondary" onClick={() => setConfirm(false)}>Keep</Button><Button destructive onClick={remove}>Delete</Button></>} />
```

## Props

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `open` | boolean | required | Whether it's open |
| `onOpenChange` | `(open) => void` | | Called with `false` on Escape, the ×, or a click on the backdrop. Close it by setting `open` |
| `title` | node | | The heading (`text-lg`, `font-semibold`), which also names the dialog |
| `description` | node | | A muted line under the title, read when it opens |
| `footer` | node | | Buttons at the end, the main action last |
| `size` | `'sm'` \| `'md'` \| `'lg'` | `'md'` | 384, 512 or 672px wide; never more than the screen less 16px a side |
| `alert` | boolean | `false` | `role="alertdialog"` for a decision: no ×, and the backdrop doesn't close it |
| `closeButton` | boolean | `true` (`false` for alert) | The × in the corner |
| `closeLabel` | string | `'Close'` | The ×'s name |
| `closeOnBackdrop` | boolean | `true` (`false` for alert) | Whether a click on the dimmed page closes it |

`children` is the body, which scrolls when it's taller than the screen. `className`, `style`, `ref` and everything else go to the `<dialog>`, which has `data-component="dialog"` and `data-size`.

## Behavior

- Opening moves focus to the first thing in it that takes focus (put `autoFocus` on another to choose); closing moves it back to where it was.
- Tab and Shift+Tab stay inside. The page behind can't be clicked or reached, and doesn't scroll.
- It fades and grows in over 200ms, and appears at once with `prefers-reduced-motion`.

## Accessibility

- `aria-modal`, named by the title (`aria-labelledby`) and described by the description. Without a title, give it an `aria-label`.
- Use `alert` only for decisions people must make; Escape still cancels.
- The title and description keep 4.5:1 on the panel in all six themes (`tools/test/dialog.mjs`). In forced-colors mode the panel gets a border.

## Component tokens

Each is an optional override: set it on the page, a container or one dialog. The list lives in `src/components/Dialog/dialog.tokens.json` (also in `design-tokens/components/`).

| Token | Default | Use |
| --- | --- | --- |
| `--dialog-bg` | `surface` | The panel's background. |
| `--dialog-overlay` | `overlay` | The dimmed backdrop over the page. |
| `--dialog-title-color` | `text` | The title. |
| `--dialog-description-color` | `text-muted` | The description under the title (4.5:1 on surface). |
| `--dialog-shadow` | `shadow-xl` | The panel's shadow. |
| `--dialog-radius` | `rounded-xl` | The panel's corners (12px). |
| `--dialog-width-sm` | `container-sm` | size="sm" (384px). |
| `--dialog-width-md` | `container-lg` | size="md", the default (512px). |
| `--dialog-width-lg` | `container-2xl` | size="lg" (672px). |
| `--dialog-padding` | `spacing-6` | Padding inside the panel (24px). |
| `--dialog-gap` | `spacing-4` | Space between the header, body and footer (16px). |
| `--dialog-margin` | `spacing-4` | The least space between the panel and the edge of the screen (16px). |
| `--dialog-title-weight` | `font-semibold` | The title's weight (600). |
