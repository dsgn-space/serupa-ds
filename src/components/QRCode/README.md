# QRCode

Draws a QR code from a value, such as a payment link, a sign-in link or an authenticator setup string, so a phone can pick it up from the screen. It is dark on light with its quiet zone in every theme, dark ones included, because scanners need that whatever the page looks like. A status over it says when the code is loading, has expired (with a button for a new one) or has been scanned.

**Also called:** QR, barcode, 2D code, scan code.

```tsx
import { QRCode } from "@diki-stwn/serupa-ds";

<QRCode value={order.payUrl} label="QR code to pay order 1042" />
<QRCode value={login.url} label="Code to sign in on your phone" status={login.status} onRefresh={login.renew} />
<QRCode value={setupUri} label="Authenticator setup code" size="lg" logo="/brand-mark.svg" />
```

## When to use

- Handing something from a screen to a phone: paying at a counter or on a kiosk, signing in on a TV or a desktop with the phone, setting up an authenticator, opening a page on the phone that was found on a computer.
- A code that runs out: `status="expired"` with `onRefresh`, and `"scanned"` once the server sees it used.

## When not to use

- As the only way. Someone using a screen reader, or the phone that shows the code, can't scan it: put the link, the setup key or a "Pay in the app" button beside it, with a [CopyButton](../CopyButton/README.md) where it helps.
- For a long text. A code holds about 2,300 characters at most, and long ones get too dense to scan from a small screen: link to a page that holds the rest.
- To decorate. A code that does nothing for the reader is noise.

## Anatomy

Drawn from the `Statuses` story.

1. **Code** (`.dk-qr-code__code`): the SVG image, named by `label`.
2. **Light** (`.dk-qr-code__light`): the white square under the modules, quiet zone included, and the square behind a logo.
3. **Dark modules** (`.dk-qr-code__dark`): one path of every dark module.
4. **Status** (`.dk-qr-code__status`): over the faded code, with a status other than `active`.
5. **Message** (`.dk-qr-code__message`): "Code expired" or "Scanned".
6. **Check** (`.dk-qr-code__icon`): beside "Scanned".

## Usage

- Keep the value short. A short URL makes a code with big modules that scans fast, even at `sm`.
- `label` says what it is for, with the thing it opens: "QR code to pay order 1042". It is the image's accessible name.
- `size="md"` (160px) suits most screens. `lg` (240px) is for a counter or a long value; `sm` (96px) only beside text, for a short URL.
- `level` trades size for damage tolerance: `M` (the default) for a screen, `Q` or `H` for print that may get scuffed. A `logo` turns it up to `H` by itself, and covers about 4% of the code.
- Keep it dark on light. The `--qr-code-dark` token takes a brand color only when it keeps about 4.5:1 on white, and a light-on-dark code is one many scanners can't read.
- Don't show a stale code as working: switch to `"expired"` when the server says so, so the person gets a new one before trying.

### Do and don't

- **Do:** A short URL, which makes big modules that scan fast, even from a screen. (`DoShortValue`)
- **Don't:** A long text in the code: it packs the modules too small to scan. Link to a page that holds the text. (`DontLongValue`)

## Accessibility

- **Role and name:** the code is an SVG with `role="img"`, named by `label`. Its modules are one path with no text.
- **Keyboard:** the code isn't focusable, since there is nothing to do with it. With `status="expired"` and `onRefresh`, the "Get a new code" button is in the tab order and works with Enter and Space.
- **Status:** a status that changes after the code shows is said politely ("Code expired", "Scanned", from the `qrExpired` and `qrScanned` labels); loading shows a [Loader](../Loader/README.md) with its own name. The button's words come from the `qrRefresh` label.
- **Contrast:** the code is black on white in every theme and in forced colors. The status message reads 4.5:1 over the faded code in every theme (`QRCode.test.tsx`).
- **What's still yours:** another way to get what the code holds, for anyone who can't scan it; the words for `label`; telling the server's state to `status`.

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `value` | string | required | What the code holds, encoded as UTF-8 |
| `label` | string | required | What it is for: the image's accessible name |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 96, 160 or 240px, quiet zone included |
| `level` | `'L' \| 'M' \| 'Q' \| 'H'` | `'M'` (`'H'` with `logo`) | How much of it can be damaged and still scan: about 7, 15, 25 or 30% |
| `logo` | string | | An image URL drawn in the middle on a light square |
| `status` | `'active' \| 'loading' \| 'expired' \| 'scanned'` | `'active'` | A message over the faded code |
| `onRefresh` | () => void | | With `status="expired"`: the "Get a new code" button calls it |
| `id` | string | none | Goes to the root `<div>`. |

`className`, `ref` and other props go to the `<div>`. A value too long for any code draws an empty square and warns in development. `encodeQR(value, level?)` gives the modules as rows of booleans, for drawing the code yourself (on a canvas, in a PDF).

## Component tokens

Each is an optional override: set it on the page, a container or one QRCode. The list lives in `src/components/QRCode/qr-code.tokens.json` (also in `design-tokens/components/`).

<!-- token-table:start (made from qr-code.tokens.json by npm run tokens: edit the descriptions there) -->
| Token | Default | Use |
| --- | --- | --- |
| `--qr-code-dark` | `black` | The dark modules: black in every theme, since scanners need the contrast. A brand color works only if it keeps about 4.5:1 on light. |
| `--qr-code-light` | `white` | The light modules and the quiet zone: white in every theme, dark mode included (most scanners can't read a light-on-dark code). |
| `--qr-code-status-bg` | `surface` | Behind a status, where the faded code shows through. |
| `--qr-code-status-text` | `text` | A status message over the faded code (4.5:1). |
| `--qr-code-scanned-icon` | `success-text` | The check beside "Scanned". |
| `--qr-code-radius` | `radius-inner` | The corners, kept small: the quiet zone is part of the code. |
| `--qr-code-size-sm` | `spacing-24` | size="sm", quiet zone included (96px): a code beside text, for a short URL. |
| `--qr-code-size-md` | `spacing-40` | size="md", the default (160px). |
| `--qr-code-size-lg` | `spacing-60` | size="lg" (240px): a payment code to scan from across a counter, or a long value. |
| `--qr-code-faded` | `opacity-10` | How much of the code shows behind a status: a trace, so the message reads 4.5:1 over it. |
<!-- token-table:end -->
