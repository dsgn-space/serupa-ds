# OfflineBanner

Says when the connection drops and when it comes back, on screen and to screen readers. Put one in the app's layout: it shows nothing while the app is online.

```tsx
import { OfflineBanner } from "serupa-ds";

<OfflineBanner />
<OfflineBanner>Changes are kept and sent when you're back.</OfflineBanner>
<OfflineBanner online={!syncFailing} placement="top" onOnlineChange={(online) => online && sync()} />
```

## When to use

- Any app people use on the move or keep open for hours, where a dropped connection would otherwise show up as buttons that do nothing.
- An app that keeps working offline, to say what still works and that changes will be sent later.

## When not to use

- To report one request that failed: say it where it failed, with an [Alert](../Alert/README.md) or a [Toast](../Toast/README.md) and a way to try again.
- For the save state of one document: use [SaveStatus](../SaveStatus/README.md).

## Anatomy

Drawn from the `WithMoreWords` story.

1. **Bar** (`.dk-offline-banner`): the raised surface, fixed to an edge of the screen or in the page.
2. **Icon** (`.dk-offline-banner__icon`): a cloud crossed out while offline, a cloud with a check once it's back.
3. **Words** (`.dk-offline-banner__text`): the title, "You’re offline" or "Back online" (`.dk-offline-banner__title`), and your own words after it.

## Usage

- Put it once, near the root of the app. It follows `navigator.onLine` and the browser's `online` and `offline` events.
- The browser only knows whether there's a network, not whether your server answers: on a café's sign-in page or a dead mobile connection it can say online. When your requests keep failing, set `online={false}` yourself, and leave the prop out again (or set `true`) when they work.
- Add words after "You’re offline" as children: what still works, or what happens to their changes. Keep it to a sentence.
- It's fixed to the bottom of the screen, in the middle, by default; `placement="top"` puts it at the top, where a bottom navigation bar or a chat box sits. `placement="inline"` keeps it where you put it, under a header, say.
- `onOnlineChange` runs when the connection drops (`false`) and comes back (`true`): a good moment to send what was waiting.
- Rendered on the server it shows nothing (the server is online); in the browser it shows straight away if the page loaded offline.

## Behavior

- Offline, the bar slides in from its edge and stays until the connection comes back.
- Back online, it says "Back online" with a success icon for 2 seconds, then slides away.
- With reduced motion, it fades without sliding.

### Do and don't

- **Do:** Add one sentence after "You're offline": what still works, or what happens to their changes. (`DoOneSentence`)
- **Don't:** Explain at length: people don't read a paragraph in a banner. (`DontParagraph`)

## Accessibility

- **Announcements:** "You’re offline" and "Back online" are said once each through the polite live region the components share, which moves into an open Dialog or Drawer so they're heard there too. The bar isn't a live region itself, so it isn't read twice.
- **Role and name:** a plain `<div>`, with an icon screen readers skip and the words.
- **Keyboard:** none: nothing in it takes focus. It never covers a focused control's place in the tab order, nor the control itself: while a fixed bar shows, a field Tab moves to (or a #link jumps to) scrolls into view clear of it (WCAG 2.4.11), and the bar adds its room to that end of the page (the start for a top bar, the end for a bottom one) so the first or last field can scroll clear too. With a sticky Navbar, a top bar sits just below it, so the Navbar's links and Menu button stay in reach, and the room counts both.
- **Contrast:** its words read 4.5:1 and its icons 3:1 on its background in all six themes (`OfflineBanner.test.tsx`).
- **What's still yours:** keep what people typed while offline, and don't let buttons that need the server look like they worked. A fixed bar covers the bottom of the page: leave room for it, or use `placement="top"` or `"inline"`, where it would cover something people need.

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `id` | `string` | | Goes to the `<div>`. |
| `online` | `boolean` | follows the browser | Set it when the app knows better than `navigator.onLine`. |
| `placement` | `'bottom' \| 'top' \| 'inline'` | `'bottom'` | Fixed to an edge of the screen, in the middle, or in the page. |
| `children` | `ReactNode` | | More words after "You’re offline". |
| `onOnlineChange` | `(online: boolean) => void` | | Runs when it drops and when it comes back. |
| `onChange` | `(online: boolean) => void` | | Deprecated, removed in 15.0.0: use `onOnlineChange`. |

`className`, `ref` and other props go to the `<div>`, which has `data-component="offline-banner"` and `data-state="offline"` or `"back"`.

## Component tokens

Each is an optional override: set it on the page, a container or one OfflineBanner. The list lives in `src/components/OfflineBanner/offline-banner.tokens.json` (also in `design-tokens/components/`).

<!-- token-table:start (made from offline-banner.tokens.json by npm run tokens: edit the descriptions there) -->
| Token | Default | Use |
| --- | --- | --- |
| `--offline-banner-bg` | `surface-overlay` | The bar's background. |
| `--offline-banner-border-color` | `border-overlay` | Its border. |
| `--offline-banner-text` | `text` | The words (4.5:1 on bg). |
| `--offline-banner-icon` | `text-muted` | The icon while offline (3:1 on bg). |
| `--offline-banner-icon-online` | `success` | The icon once it's back online (3:1 on bg). |
| `--offline-banner-shadow` | `shadow-lg` | Its shadow, which lifts it off the page. |
| `--offline-banner-radius` | `radius-surface` | The corners (8px). |
| `--offline-banner-padding-x` | `spacing-4` | Space inside, at the start and end (16px). |
| `--offline-banner-padding-y` | `spacing-2` | Space inside, above and below (8px). |
| `--offline-banner-gap` | `spacing-2` | Between the icon and the words (8px). |
| `--offline-banner-offset` | `spacing-4` | From the edge of the screen when fixed (16px). |
| `--offline-banner-z-index` | `z-toast` | Its stacking level when fixed: with the toasts, over the page and its dialogs. |
<!-- token-table:end -->
