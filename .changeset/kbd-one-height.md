---
"@diki-stwn/serupa-ds": minor
---

Kbd has one height: every key is 20px tall wherever text is around it, in a sentence, a tooltip, Prose, KeyboardShortcuts and CommandPalette's rows. The default was 24px, which filled a whole line of body text and stretched 14px lines; CommandPalette and KeyboardShortcuts already drew 20px keys and look the same. Inside Prose, a Kbd keeps its own 12px sans label instead of turning mono 14px. A one-character key (K, ⌘, ↑) is now square, so ⌘ and K are the same width.

`size="sm"` is now the quiet key for inside a control, such as the search button in a header: 16px (was 20px), a 1px outline all round in the light `border` color, and no + between its keys (screen readers still hear "Command + K"). New component tokens: `--kbd-border-sm`, `--kbd-border-bottom-width`, `--kbd-padding-x-sm` and `--kbd-gap-sm`. `--kbd-height-md` is now `spacing-5` (20px) and `--kbd-height-sm` `spacing-4` (16px): set them to bring the old sizes back.
