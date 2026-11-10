# ContextualHelp

A small "?" or "i" button beside a label, heading or value that opens a sentence or two of explanation in a panel next to it: a toggletip. Unlike a Tooltip it opens on press, so it works on touch screens and with a keyboard, and what's inside can hold a link.

```tsx
import { ContextualHelp } from "serupa-ds";

<Field label={<>Tax ID <ContextualHelp label="Help: tax ID" title="Where to find it">It's the 15-digit NPWP on your tax card.</ContextualHelp></>}>
  <Input />
</Field>
```

## When to use

- A term or setting most people know but some don't: "workspace", "tax ID", "rounding".
- Where a value comes from or how it's worked out: an exchange rate, a score, an estimate (`variant="info"`).

## When not to use

- What an icon button does: use [Tooltip](../Tooltip/README.md), which shows on hover and focus.
- A preview of a person, page or record on hover: use [HoverCard](../HoverCard/README.md).
- Controls, a form or several links: use [Popover](../Popover/README.md) with a labelled button.
- Anything people need to finish the task, such as a field's format or a requirement: put it on the page, as the Field's `description`.

## Anatomy

Drawn from the `Default` story.

1. **Button** (`.dk-contextual-help__button`): a small round "?" (or "i" with variant info) beside the term it explains.
2. **Panel** (`.dk-contextual-help`): the non-modal dialog the button opens, with an optional title, text and links.

## Usage

- **Variants:** `help` (default) shows a "?" for how something works; `info` shows an "i" in the info color for facts about a value.
- **Name:** the button is "Help" or "Information" by default (`labels.contextualHelp`, `labels.contextualInfo`). When a page has more than one, give each a `label` that names its topic ("Help: tax ID").
- **Title:** an optional heading names the panel (an `h3` by default, `headingLevel` to fit the outline). Without one the panel takes the button's name.
- **Content:** a sentence or two, and at most one link to more. The panel is 256px wide and wraps long words. It is a `<div>`, so put the help beside a label or heading, not inside a `<p>`.
- Put it right after the text it explains, inside the label when it's about a field, so it reads in order.

## Accessibility

- **Role and name:** a `<button>` named by `label` (or "Help" / "Information"), with `aria-expanded` and `aria-controls` pointing at the panel. The panel is a non-modal `role="dialog"` named by its title or the button's name.
- **Keyboard:** Enter or Space opens and closes it. Opening moves focus to the first link inside, or the panel; Escape closes it and returns focus to the button. Tab out of it, or a click outside, closes it.
- **Target size:** the button is 24×24px, the WCAG 2.2 minimum (2.5.8).
- **Contrast:** the "?" and "i" read 3:1 on the page in all six themes (`ContextualHelp.test.tsx`).
- **What's still yours:** a topic in `label` when there are several, and nothing essential hidden in the panel.

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `children` | `ReactNode` | | What the help says |
| `id` | string | none | Goes to the panel. |
| `title` | `ReactNode` | | A heading at the top of the panel |
| `headingLevel` | `2` \| `3` \| `4` \| `5` \| `6` | `3` | The title's heading level |
| `variant` | `'help'` \| `'info'` | `'help'` | "?" or "i" |
| `label` | `string` | "Help" / "Information" | The button's name |
| `placement` | Popover placement | `'bottom-start'` | Where the panel goes; it flips when there's no room |
| `open`, `defaultOpen`, `onOpenChange` | | | Controlled or uncontrolled, as in [Popover](../Popover/README.md) |

`className`, `style`, `ref` and other props go to the panel.

## Component tokens

Each is an optional override: set it on the page, a container or one ContextualHelp. The list lives in `src/components/ContextualHelp/contextual-help.tokens.json` (also in `design-tokens/components/`).

<!-- token-table:start (made from contextual-help.tokens.json by npm run tokens: edit the descriptions there) -->
| Token | Default | Use |
| --- | --- | --- |
| `--contextual-help-icon` | `text-muted` | The "?" of variant help (3:1+ on surface). |
| `--contextual-help-info-icon` | `info` | The "i" of variant info (3:1+ on surface). |
<!-- token-table:end -->
