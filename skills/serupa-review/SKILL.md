---
name: serupa-review
description: Review a change to the UI of an app built with the Serupa design system (serupa-ds). Use when asked to review a pull request, a diff or a file that adds or changes screens, forms or components in a project that depends on serupa-ds.
---

# Reviewing a Serupa UI change

This skill reviews a change to an app built with Serupa. It checks what lint and the type checker can't judge: whether the right component does the job, whether the page meets its part of accessibility, and whether the words are right. The rules come from the Serupa skill beside this one (`skills/serupa/SKILL.md`). Read that first if you haven't.

## How to review

1. **Read what the change touches, not only the diff.** Open each changed file whole, the components it renders and the page it sits on. A missing `h1`, `main` or skip link shows only on the page, and a duplicate `Toaster` only at the app's root.
2. **Stay on the change.** Review the lines it adds or changes. Don't report what was already there, and don't ask for a rewrite of code the change didn't touch. In an existing app a hand-built button next to the change is not this change's problem. You can name it under Nice to have.
3. **Check each point below** against the changed code.
4. **Report in the format at the end.** Every finding says where it is, what's wrong, the fix and what happens if it's skipped. When there's nothing to find, say so: don't invent findings to fill a section.

## What to check

### Must fix: someone can't use the page

- **A widget built by hand where Serupa has one.** A `div` or `span` with `onClick`, a widget role (`dialog`, `menu`, `listbox`, `tab`, `tooltip`) or `aria-expanded` on a plain element, a dropdown placed absolutely under its trigger, a month grid of days. These miss keyboard use, focus or screen reader names that the component already has. Name the component that replaces it (`Dialog`, `Menu`, `Select`, `Combobox`, `Tabs`, `Tooltip`, `DatePicker`).
- **A native control in place of the component**: `<button>`, `<input>`, `<select>`, `<textarea>`, `<table>` or `<dialog>` in new code where Serupa has `Button`, `Input`, `Select`, `Textarea`, `Table` or `Dialog`.
- **A missing name.** A form control outside a `Field` and with no name of its own. A placeholder used as the label. An `IconButton` with no `label`. A meaningful `Image` with no `alt`. A link whose text doesn't say where it goes ("Click here", "Read more" alone).
- **Errors that don't help.** An error not next to its field, or one that doesn't say how to fix it. A submit that fails without moving focus to the first error or an `ErrorSummary`.
- **Color alone carries meaning** in the app's own content: a red row with no text or icon, a status dot with no word.
- **Focus lost or hidden.** `outline: none` with nothing in its place. A dialog or menu built so focus can leave it. A target under 24px. A sticky header that covers the focused element.
- **The page frame**, when the change adds a page: no `<html lang>` or `<title>`, more than one `main` or none, no skip link, no `h1` or a skipped heading level, no `announcePage()` after a client-side route change.

### Should fix: it works, but against the system

- **Raw values instead of tokens**: a hex, `rgb()` or `hsl()` color, a pixel size, a duration or a shadow in a style prop, CSS or an arbitrary class (`p-[12px]`). Give the token or utility class that replaces it (`p-4`, `bg-surface`, `var(--spacing-4)`).
- **A palette color where an alias fits**: `blue-600` instead of `primary`, or a status fill used for text instead of its `*-text` alias. It won't follow the theme.
- **Restyling the internals**: overriding a `dk-*` class instead of the component's own tokens (`--button-*`, `--input-*`).
- **A wrapper or a second kit**: a `ui/Button.tsx` that only sets defaults on Button, another component, icon, animation or CSS-in-JS library beside Serupa.
- **The wrong feedback for how long it stays.** A toast for a message that must stay until it's dealt with (an error, a warning that blocks), where an `Alert` belongs. An `Alert` for "Saved", where `toast("Saved")` belongs. A second `Toaster`. A status change said only by a visual change, where `announce()` belongs. Autosave without `SaveStatus`.
- **Words** (Content and voice): a button that doesn't start with a verb ("OK", "Submit", "Yes"), a dialog title and button that use different verbs, Title Case, an exclamation mark, emoji or "Oops", "Something went wrong" with nothing more, "Invalid input" or "This field is required", an empty state that doesn't say what goes there or offer to add the first one.
- **Motion** not from the motion tokens, or movement that `prefers-reduced-motion` would want still.

### Nice to have: worth doing, not now

- Code beside the change that could move to Serupa (a hand-built button, a raw color it didn't touch).
- A component that would fit better than the one used, where the one used still works (a `Card` list that could be a `Table`).
- Words that are right but could be shorter or clearer.

## How to report

Group the findings under three headings, in this order, and leave out a heading with nothing under it:

```md
### Must fix
1. **<file>:<line>: <what this is, in a few words>**
   Problem: <what's wrong, and who it stops>.
   Fix: <the change, naming the component, prop, token or words to use>.
   If skipped: <what happens to the people using the page>.

### Should fix
…

### Nice to have
…

Verdict: <one line>
```

The verdict is one of two lines:

- "Verdict: Ready to merge." when nothing is under Must fix or Should fix.
- "Verdict: Not ready: 2 must fix, 3 should fix." otherwise, with the counts.

When nothing is wrong, the whole review is "No findings." and "Verdict: Ready to merge."

Keep each finding to its four lines. Quote the code only when the line number isn't enough to find it.
