# MaskedValue

Shows a sensitive value with most of it hidden behind bullets, keeping just enough for its owner to recognize it: "•••• 1208" for a card, "a••••" for an email. Screen readers hear what it is and the part kept ("Card number ending in 1208"), never a row of bullets. With `revealable`, a Show button lets the owner see the whole value until they leave the page.

**Also called:** masked text, redacted value, obfuscated value.

```tsx
import { MaskedValue, maskValue } from "@diki-stwn/serupa-ds";

<MaskedValue value={card.number} label="Card number" />                      // •••• 1208
<MaskedValue value={user.phone} label="Phone" end={3} />                     // •••• 402
<MaskedValue value={key.secret} label="API key" start={8} end={0} revealable />  // sk_live_•••• and a Show button

maskValue("4111111111111208")   // "•••• 1208", the same text outside React
```

## When to use

- A value a passer-by, a screenshot or a shared screen shouldn't show, but its owner needs to tell apart from others: a card or account number, a phone number or email on a profile, a national id, a key or a token.
- An amount people chose to hide, such as a balance on a shared screen: `end={0}` and `revealable`.

## When not to use

- A value someone types: use [PasswordInput](../PasswordInput/README.md), or an [Input](../Input/README.md) with `type="password"`.
- A value the reader isn't allowed to see at all. Mask it on the server and send only the end: masking in the browser only hides it from people looking at the screen.
- A key someone needs to copy once, right after making it: show it whole with a [CopyButton](../CopyButton/README.md), and say it won't be shown again.

## Anatomy

Drawn from the `Revealable` story.

1. **Value** (`.dk-masked-value__text`): the kept characters after four bullets, or the whole value once shown. Hidden from screen readers while masked.
2. **Show button** (`.dk-masked-value__toggle`): with `revealable`, an IconButton that shows and hides the value.

## Usage

- Keep the least that lets the owner recognize it: the last four of a card or an id, the last three or four of a phone, the first letter of an email, a key's prefix. The Data formats page lists them.
- The bullets are always four, whatever the length, so they don't give away how long the value is. Asking to keep more than half keeps nothing.
- `label` is what the value is, as a noun: "Card number", "Phone". Screen readers hear it with the end kept, and the Show button is named after it.
- Offer `revealable` only to the person the value belongs to. It hides again when they switch tabs or put the app in the background.
- Control it with `revealed` and `onRevealedChange` to ask for a password before showing, or to log who looked.

## Accessibility

- **Role and name:** inline text. While masked, the bullets are hidden from screen readers (`aria-hidden`), and a hidden text says what it is and the end kept, from the `maskedEnding` and `maskedHidden` labels: "Card number ending in 1208", "Balance, hidden". Shown, the value is plain text.
- **Keyboard:** with `revealable`, the Show button is a toggle button (`aria-pressed`) in the tab order, named by the `showValue` label ("Show Card number"). Its name stays the same whichever way it's pressed; its icon changes. Focus stays on it.
- **Contrast:** it takes the text color around it. The Show button is an IconButton, with its contrast and its 44px target on touch screens.
- **What's still yours:** the words for `label`, in the reader's language; asking again before showing something very sensitive; masking on the server what the reader may not see at all.

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `value` | string | required | The whole value. Only the characters kept are in the page until it's shown |
| `label` | string | required | What it is, as a noun ("Card number"): read with the end kept, and names the Show button |
| `end` | number | `4` | Characters kept at the end. `0` hides it all |
| `start` | number | `0` | Characters kept at the start, such as an email's first letter or a key's prefix |
| `revealable` | boolean | `false` | A Show button after it (`aria-pressed`); the value hides again when the page is left |
| `revealed` | boolean | | Whether the whole value shows (controlled), with `revealable` |
| `defaultRevealed` | boolean | `false` | Whether the whole value shows at first (uncontrolled), with `revealable` |
| `onRevealedChange` | (revealed) => void | | Called when Show is pressed, or the value hides because the page was left |
| `id` | string | none | Goes to the root `<span>`. |

`className`, `ref` and other props go to the `<span>`. `maskValue(value, start?, end?)` gives the masked text outside React, counting characters as people see them.

## Component tokens

Each is an optional override: set it on the page, a container or one MaskedValue. The list lives in `src/components/MaskedValue/masked-value.tokens.json` (also in `design-tokens/components/`).

<!-- token-table:start (made from masked-value.tokens.json by npm run tokens: edit the descriptions there) -->
| Token | Default | Use |
| --- | --- | --- |
| `--masked-value-gap` | `spacing-1` | Between the value and the Show button (4px). |
<!-- token-table:end -->
