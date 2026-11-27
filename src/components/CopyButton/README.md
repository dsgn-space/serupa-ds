# CopyButton

A button that copies text to the clipboard: an API key, an invite link, a command. Once it has copied, it shows a check and "Copied" for two seconds and says "Copied" to screen readers.

**Also called:** copy to clipboard, clipboard button.

```tsx
import { CopyButton } from "@diki-stwn/serupa-ds";

<CopyButton value={apiKey} />
<CopyButton value={inviteUrl} size="md">Copy link</CopyButton>
<CopyButton value="npm i serupa-ds" iconOnly variant="ghost">Copy the command</CopyButton>
<CopyButton value={() => editor.getText()} onCopy={(t) => track("copied", t.length)} />
```

## When to use

- Text people need somewhere else, exactly as it is: keys, links, codes, commands.
- Next to a read-only field or a code block that shows the same text.

## When not to use

- For sharing to another app: use the Web Share API (`navigator.share`) where it's offered.
- For text people will edit first: put it in an Input and let them select it.

## Anatomy

Drawn from the `VariantsAndSizes` story.

1. **Icons** (`.srp-copy-btn__icons`): the copy icon and, in the same place, the check that replaces it once copied.
2. **Copy icon** (`.srp-copy-btn__icon--copy`): shown until a copy.
3. **Copied icon** (`.srp-copy-btn__icon--done`): shown for a moment after a copy.
4. **Failed icon** (`.srp-copy-btn__icon--failed`): shown instead when the browser refused.
5. **Labels** (`.srp-copy-btn__labels`): "Copy" and "Copied" in the same place, so the button keeps the width of the longer one. "Couldn’t copy" joins them only while it shows.

## Usage

- Show the text next to the button too, so people can see what they copy and select it themselves if copying fails.
- Name what's copied when there are several on a page: "Copy link", "Copy the API key". With `iconOnly`, `children` is the button's name.
- `value` can be a function, called when the button is pressed, for text that's costly to build or changes. It can return a promise, such as a fetch: the copy is handed to the clipboard within the press and filled in when the text arrives, so Safari, which refuses a copy once the press is over, still takes it. While it's fetched the button takes no second press, and shows loading if it takes a while.

## Behavior

- Copies with the Clipboard API, and falls back to the older `execCommand("copy")` on pages where that API isn't available (plain `http:` or an iframe without permission).
- Then shows a check (success color) and "Copied" for `timeout` ms (2000). Both labels take the same space, so the button doesn't change width. The copy icon cross-fades into the check (a short scale and blur when motion is allowed).
- If the browser refuses, it says "Couldn’t copy. Select the text and copy it yourself." (`labels.copyFailed`), shows an error icon (danger color) and "Couldn’t copy" (`labels.copyFailedShort`) for the same `timeout`, and calls `onCopyError`. So people who see the button aren't left thinking it worked. The button can grow to fit those words while they show: a failure is rare, and worth noticing.
- Your `onClick` runs first; call `event.preventDefault()` in it to stop the copy.

### Do and don't

- **Do:** Show the text beside the button, so people see what they copy and can select it if copying fails. (`DoShowTheText`)
- **Don't:** Put the button on its own: people copy something they can't check. (`DontButtonAlone`)

## Accessibility

- It's a real `<button>`. "Copied" is announced in the shared polite status region, and a failure in the assertive one.
- Only the current label is read out: the other is hidden from screen readers. An `iconOnly` button's name changes to "Copied" while it shows the check, or "Couldn’t copy" while it shows the error icon, and its name shows in a Tooltip on hover and on keyboard focus, saying "Copied" too while the check shows.
- The check and the error icon keep 3:1 on the button in every theme (`CopyButton.test.tsx`). In forced-colors mode they use the button's text color.

### Keyboard

| Key | Does |
| --- | --- |
| Tab | To the button |
| Enter, Space | Copy; "Copied" is read out, or the failure, assertively |

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `id` | string | none | Goes to the root `<button>`. |
| `value` | `string \| () => string \| Promise<string>` | | What to copy. |
| `children` | `ReactNode` | `'Copy'` (`labels.copy`) | The label, or the name with `iconOnly`. |
| `copiedLabel` | `string` | `'Copied'` (`labels.copied`) | Shown and announced once it has copied. |
| `iconOnly` | `boolean` | `false` | Only the icon, with `children` as its name and tooltip. |
| `timeout` | `number` | `2000` | How long "Copied" stays, in ms. |
| `onCopy` | `(text) => void` | | Once the text is on the clipboard. |
| `onCopyError` | `(error) => void` | | When copying fails (it also shows and says so). |
| `variant`, `size` | as Button | `'outline'`, `'sm'` | |

Every other [Button](../Button/README.md) prop and `ref` go to the `<button>`, which has `data-component="button"`, the `srp-copy-btn` class, `data-copied` while it shows "Copied", and `data-failed` while it shows "Couldn’t copy".

## Component tokens

Each is an optional override: set it on the page, a container or one button. The list lives in `src/components/CopyButton/copy-button.tokens.json` (also in `design-tokens/components/`). Everything else is [Button](../Button/README.md)'s.

<!-- token-table:start (made from copy-button.tokens.json by npm run tokens: edit the descriptions there) -->
| Token | Default | Use |
| --- | --- | --- |
| `--copy-button-done-color` | `text-success` | The check icon once it has copied (3:1 on the button). |
| `--copy-button-failed-color` | `text-danger` | The error icon when the browser refused to copy (3:1 on the button). |
<!-- token-table:end -->
