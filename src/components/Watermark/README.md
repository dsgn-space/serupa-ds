# Watermark

Repeats the viewer's name, or a word such as "Draft", faintly across a document preview or a whole screen, so a screenshot, a photo of the screen or a printout shows where it came from. It deters casual sharing; it doesn't protect anything.

```tsx
import { Watermark } from "@diki-stwn/serupa-ds";

<Watermark text={["Ada Lovelace", "ada@example.com"]}>
  <p>Payslip, November 2026</p>
</Watermark>
```

## When to use

- A preview of something private, such as a payslip or an internal report, marked with the viewer's name and email.
- A document that isn't final yet, such as a contract draft marked "Draft" until it's signed.
- A screen that gets shared, such as a support agent's console, marked with `fullPage`.

## When not to use

- To stop copying or to protect data. Anyone can remove the mark with the browser's own tools; keep secrets on the server and show only what the viewer may see.
- To say something the person must read, such as "This document has expired". Say it in an [Alert](../Alert/README.md), where screen readers find it too.
- To brand a page with a logo. Use [Logo](../Logo/README.md) in the header.

## Anatomy

Drawn from the `Viewer` story.

1. **Root** (`.srp-watermark`): the box around your content, which the mark covers. With `fullPage`, the whole window.
2. **Mark** (`.srp-watermark__mark`): the repeated text, a faint tile over the content that clicks, selection and screen readers pass through.

## Usage

- Name the viewer, not the product. A name and an email, or an employee ID, makes a leak traceable; a product name doesn't.
- Keep it to one or two short lines. A long line spreads the marks out until a screenshot of one part can miss them.
- `gap="lg"` spreads the marks out for a single word such as "Draft"; `rotate` sets the angle (`0` for level text, −22 by default).
- `fullPage` covers the whole window and stays put on scroll. Use one per page.
- It is kept when printing, since a printout is the copy most often passed on, and it renders on the server.
- There is no tamper detection: a mark someone removes stays removed. Re-adding it would fight the browser's own tools and give a false sense of security.

## Accessibility

- **Role and name:** none. The mark is `aria-hidden` and holds no text: the words are drawn by a CSS mask, so screen readers, find in page, selection and copy never meet them. The content keeps its own roles.
- **Keyboard:** nothing to reach. The mark takes no focus and no pointer events, so every click, tap and selection lands on the content under it.
- **Contrast:** body text and muted text over the mark keep 4.5:1 in every theme (`Watermark.test.tsx`). The mark is drawn at 5% so it never competes with the text.
- **Forced colors:** the mark goes, because a system palette would draw it as strong as the text.
- **What's still yours:** if the viewer needs to know the page is marked, say so in words they can read, such as a line under the title.

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `text` | `string \| string[]` | | The words repeated across the content: one line, or one per item. Empty lines are left out; with none, there is no mark. |
| `gap` | `'md' \| 'lg'` | `'md'` | Room between marks. It grows with `--watermark-font-size`. |
| `rotate` | `number` | `-22` | The angle in degrees, −90 to 90. |
| `fullPage` | `boolean` | `false` | Cover the whole window instead of its own box. |
| `children` | `ReactNode` | | The content under the mark. |
| `id` | string | none | Goes to the root `<div>`. |

`className`, `ref` and other props go to the `<div>` round the content.

## Component tokens


Each is an optional override: set it on the page, a container or one Watermark. The list lives in `src/components/Watermark/watermark.tokens.json` (also in `design-tokens/components/`).

<!-- token-table:start (made from watermark.tokens.json by npm run tokens: edit the descriptions there) -->
| Token | Default | Use |
| --- | --- | --- |
| `--watermark-text` | `text-muted` | The mark's color, drawn at `opacity` (text over it keeps 4.5:1). |
| `--watermark-opacity` | `opacity-5` | How strongly the mark shows (5%). Text over it keeps 4.5:1 in every theme. |
| `--watermark-font-size` | `text-lg` | The mark's text size (18px). The room between marks grows with it. |
| `--watermark-z` | `z-10` | The stacking level over its own content. |
| `--watermark-full-page-z` | `z-tooltip` | The stacking level with `fullPage`: over everything on the page. Modal dialogs, in the top layer, stay above it. |
<!-- token-table:end -->
