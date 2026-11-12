# CodeBlock

Code for people to read and copy: an install command, a config file, an example. It shows the code in the mono font in a framed box, with an optional title, line numbers and marked lines, and a button that copies it all.

```tsx
import { CodeBlock } from "serupa-ds";

<CodeBlock title="SignIn.tsx" language="tsx" code={source} lineNumbers highlight={[3, [6, 7]]} />
```

## When to use

- A command or a file people will copy into their own work.
- An example longer than a line, where its layout matters.

## When not to use

- A word of code inside a sentence: use `<code>` in [Prose](../Prose/README.md).
- Text people type into: use [Textarea](../Textarea/README.md).
- A single value to copy, such as an API key: use [CopyButton](../CopyButton/README.md) beside it.

## Anatomy

Drawn from the `LineNumbers` story.

1. **Header** (`.dk-code-block__header`): the title, or the language when there's no title, and the copy button.
2. **Title** (`.dk-code-block__title`): the file name or what the code is.
3. **Copy button** (`.dk-code-block__copy`): copies the whole code and says "Copied".
4. **Code** (`.dk-code-block__pre`): the code, which scrolls sideways when it's wider than the box.
5. **Line** (`.dk-code-block__line`): one line, with its number before it; a marked line (`.dk-code-block__line--marked`) has a tint and a bar at its start.

## Usage

- Give it a `title` when the code is a file ("SignIn.tsx") or a step ("Install"). Without one, the `language` shows in the header.
- Mark the lines a step is about with `highlight`, rather than leaving people to find what changed.
- Use `lineNumbers` when the text around it points at lines; `startLine` when it shows part of a longer file.
- Long lines scroll sideways, which keeps code's layout. Use `wrap` for prose-like lines, such as a long message string.
- CodeBlock doesn't color the syntax. The `<code>` has a `language-*` class and the box a `data-language`, for a highlighter you add.

## Accessibility

- **Role and name:** a `<pre>` with the code as text, read as it is. When it's wider (or taller) than its box it becomes a region named by its title (or its language, or "Code") and a tab stop, so a keyboard can scroll it (WCAG 2.1.1); a box that fits is neither.
- **Keyboard:** Tab reaches the copy button, then the code when it scrolls. In the code, the arrow keys scroll it.

  | Key | Does |
  | --- | --- |
  | Tab | To the copy button, then to the code when it scrolls |
  | ArrowLeft, ArrowRight, ArrowUp, ArrowDown | Scroll the code, when it has focus |

- **Marked lines:** each is a `<mark>`, and has a bar at its start as well as the tint, so the mark isn't only a color. Line numbers are drawn by CSS, so they're neither selected, copied nor read.
- **Direction:** code reads left to right on every page, so `run();` never becomes `;()run` on a right-to-left page.
- **Contrast:** the code, the language and the line numbers read 4.5:1 on the box and on a marked line in all six themes (`CodeBlock.test.tsx`).
- **What's still yours:** say before the block what the code does. Colors from a highlighter you add need 4.5:1 on `--code-block-bg` in each theme.

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `code` | `string` | | The code, as text. |
| `title` | `ReactNode` | | In the header; names the scroll area. |
| `language` | `string` | | In the header without a title; a `language-*` class. |
| `lineNumbers` | `boolean` | `false` | |
| `startLine` | `number` | `1` | The first line's number. |
| `highlight` | `(number \| [number, number])[]` | | Lines and ranges to mark. |
| `wrap` | `boolean` | `false` | Wraps long lines instead of scrolling. |
| `copyable` | `boolean` | `true` | The copy button. |
| `id` | string | none | Goes to the root `<div>`. |

`className`, `ref` and other props go to the root `<div>`.

## Component tokens

Each is an optional override: set it on the page, a container or one CodeBlock. The list lives in `src/components/CodeBlock/code-block.tokens.json` (also in `design-tokens/components/`).

<!-- token-table:start (made from code-block.tokens.json by npm run tokens: edit the descriptions there) -->
| Token | Default | Use |
| --- | --- | --- |
| `--code-block-bg` | `surface-muted` | The background. |
| `--code-block-text` | `text` | The code and title (4.5:1 on bg). |
| `--code-block-muted` | `text-muted` | The language and the line numbers (4.5:1 on bg). A marked line's number takes the text color. |
| `--code-block-border` | `border` | The frame and the line under the header. |
| `--code-block-mark-bg` | `primary-subtle` | A marked line's tint. |
| `--code-block-mark-bar` | `primary` | The bar at a marked line's start. |
| `--code-block-focus-ring` | `focus-ring` | The ring inside the frame when the code scrolls and has keyboard focus. |
| `--code-block-radius` | `radius-control` | The corners (6px). |
| `--code-block-padding` | `spacing-4` | Space around the code (16px). |
| `--code-block-font-size` | `text-sm` | The code's size (14px). |
<!-- token-table:end -->
