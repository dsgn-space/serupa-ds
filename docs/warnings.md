# Console warnings

A Serupa component warns in the browser console, once, when it can see a mistake in how it's used. Each warning ends with its code and a link to its section here. Warnings show in development only: a production build (`NODE_ENV=production`) drops them, and `serupa.iife.js` keeps them for plain pages.

## accordion-single-value

An Accordion with `type="single"` got a `value` with more than one item, so more than one item shows open. Pass one value, or use `type="multiple"`.

## bad-locale

A `locale` (on a component or SerupaProvider) that Intl can't read, so it's ignored and the next one is used: the provider's, else the browser's. An underscore is mended first ("en_US" works as "en-US"), so this is something like "english" or "en-". Use a BCP 47 tag such as "en-US" or "id-ID". See Localization.

## badge-indicator

A dot Badge with no label, icon or count is an indicator: too small to click or to remove. Its `onClick`, `href` and `onRemove` are ignored. Name and handle the control it sits on instead.

## badge-remove-interactive

A Badge with `onClick` or `href` is a button or a link, which can't hold another button, so its `onRemove` is ignored. Use one or the other.

## button-icon-label

A Button with only an icon has no text for a screen reader to say. Give it an `aria-label` (or `aria-labelledby`, or a `title`), or use IconButton, whose `label` is required.

## combobox-duplicate-value

Two or more of a Combobox's options have the same value. Picking the second one shows the first one's label in the field, and both are marked as selected. Give every option its own value; an id is a good one when labels repeat.

## command-palette-href

A CommandPalette command's `href` isn't a web page (http or https), a `mailto:` or a `tel:` link, for example `javascript:…`. Choosing it does nothing, so a link built from user data can't run script. Use `onSelect` to run code.

## date-string

A date component (Calendar, DatePicker, DateRangePicker) got a string it can't read as a day, such as "tomorrow", "2026-13-01" or "2026-02-31", so it shows no date and the app holds a value nobody sees. Pass the day as "yyyy-mm-dd" or as a Date. An empty string is read as no date and doesn't warn. What people type is reported through `onInvalidInput` instead.

## datetime-string

A date component got a date and time as a string (`"2026-10-24T00:00:00Z"`, as an API often sends a date). It's read as the day it writes, 24 October, and the time is ignored, so the day doesn't move with the reader's time zone. Pass the `"yyyy-mm-dd"` day itself (`value.slice(0, 10)`) to say that's what you mean.

## drawer-side

Drawer's `side` is deprecated, and removed in 15.0.0. It still works as `placement` does. Rename it to `placement`, the name the API naming table gives to where a floating part sits (CONTRIBUTING.md). `placement` also takes `start` and `end`, the edges the reading starts and ends at, so a navigation drawer opens from the right in a right-to-left page with no code of yours. A NotificationCenter passes both to its Drawer.

## fab-position

Fab's `position` is deprecated, and removed in 15.0.0. It still works as `placement` does. Rename it to `placement`, the name the API naming table gives to where a floating part sits (CONTRIBUTING.md).

## field-control

A Field's label points at its control by id, and nothing on the page has that id, so the label names nothing. Put the control inside the Field, or pass the control's `id`.

## field-layout

Field's `layout` is deprecated, and removed in 15.0.0. It still works as `orientation` does. Rename it to `orientation`, the name the API naming table gives to which way parts run.

## filter-value

FilterBar was given a value its field can't take, or one for a field it doesn't have, as can happen when the value is read from a URL someone edited or that arrived cut short. That filter is left out, and the bar shows the rest. A select field takes a string, or an array of strings with `multiple`; a date range `{ start, end }`, each a `"yyyy-mm-dd"` day or null; a boolean field `true`; a text field a string. Check the value where you read it if you need to tell people a filter was dropped.

## icon-load

The icons drawn by name come from a chunk loaded on demand (on a plain page, `serupa-icons.iife.js` from beside `serupa.iife.js`), and that load failed: a network error, a deploy that removed the chunk the page asked for, or `serupa.iife.js` copied without `serupa-icons.iife.js`. The box stays empty; the next Icon tries again, and each empty one tries again when the browser is back online. To draw an icon without loading anything, import it and pass `icon={…}`, or register the icons first.

## icon-unknown

The `name` given to Icon (or to an icon prop) isn't a Material Symbol, a custom icon or a registered one, so the box stays empty. Check the spelling on the Icons page (Foundations/Icons).

## image-size

An Image with `ratio="auto"` and no `width` and `height` has no height until the picture loads, so the page jumps when it does. Pass the picture's `width` and `height`, or a `ratio`.

## label-prop

Radio, Checkbox or Switch was given `label`, as other libraries name these controls. It isn't one of their props, so it lands on the `<input>` as an HTML attribute and names nothing: a screen reader announces only "radio button" or "checkbox". Put the text in `children`, or use `aria-label` when there's no visible text.

## link-neutral-hover

A Link with `tone="neutral"` and `underline="hover"` looks like plain text until it's hovered, so people can't tell it's a link. Keep the underline, or use `tone="primary"` where the place already says it holds links.

## no-name

A control (a slider, a dialog, a group…) has no accessible name, so a screen reader announces only its role. The warning says how to name that kind of control: a Field label, a `<label htmlFor>`, `aria-label` or `aria-labelledby`.

## number-options

FormattedNumber or `formatNumber` got options Intl rejects, such as a currency that isn't an ISO code ("US" for "USD"), a unit Intl doesn't know ("km/h" for "kilometer-per-hour"), or `minimumFractionDigits` above `maximumFractionDigits`. Rather than throw and unmount the page, the number is written in the locale's plain form. Fix the options; see FormattedNumber.

## number-range

A NumberInput got a `min` above its `max`, so no value fits, and `aria-valuemin` is above `aria-valuemax`. Swap them, or check where they come from (a limit computed from data can cross over).

## overlay-in-form

A Popover, Dialog or Drawer was opened inside a `<form>` and holds a form or a text field. The panel renders where it's placed, so it sits in that form: a form of its own nests in the page's form, and Enter or its submit button reloads the page without calling either `onSubmit`; with no form of its own, Enter in its field submits the page's form. Place it after the form. A field in it that belongs to the page's form can say so with the `form` attribute (`<Input form="profile" />`).

## phone-code

PhoneInput was given a number starting with `+` or `00` and a calling code it doesn't know, so it reads the digits as a number in the current country. Add the country's row to `countries`.

## relative-time-date

A RelativeTime whose `date` isn't a date (a typo, an empty string, a format `Date` can't read) shows nothing, with no other sign. Pass a `Date`, a timestamp in milliseconds, or an ISO string such as `"2026-10-24T09:30:00Z"`.

## select-multiple

Select doesn't support `multiple` (a native multi-select is hard to use), so it was ignored. Use a group of Checkboxes instead.

## select-value

A controlled Select got a `value` that none of its options has, so the `<select>` shows its first option, and a form sends that, while the app holds the value it passed. Set `value` to one of the options' values, add an option for it, or use a `placeholder` (its value is `""`) for "nothing picked yet".

## server-locale

A locale-dependent component (a date, a number) rendered on the server without a locale, so the server HTML uses en-US and the page switches to the browser's locale after hydration, which shows as a flash. Set `<SerupaProvider locale>` from the request. See Localization.

## shortcut-keys

useShortcut was given keys that aren't one key with its modifiers, such as `["G", "I"]` (two keys can't be pressed together) or `["mod"]` alone, so the shortcut isn't set up and isn't listed in KeyboardShortcuts. Give one key, plus `mod`, `ctrl`, `cmd`, `alt` or `shift` if it needs them: `["mod", "K"]`, `["?"]`.

## skip-link-target

A SkipLink was followed, but there's no element on the page with its target's id ("main" unless you pass `target`), so it can't move focus to the main content. Give the main content that id (`<main id="main">`), or pass its id as `target`.

## splitter-direction

Splitter's `direction` is deprecated, and removed in 15.0.0. It still works as `orientation` does. Rename it to `orientation`.

## splitter-two

Splitter needs exactly two children, its two panes.

## switch-pending

Switch's `pending` is deprecated, and removed in 15.0.0. It still works as `loading` does. Rename it to `loading`, as Button and the API naming table name it.

## table-row-click

A TableRow got `onClick` without `href`. A click on a row reaches mouse users only: the keyboard and screen readers can't press a table row. To open something, give the row an `href` (the whole row becomes one link, from its first cell); for an action, put a button in a cell.

## tabs-removed

The selected Tab was removed, so no tab is selected. When you remove the selected tab, set `value` to another one.

## tabs-value

Tabs' `value` or `defaultValue` matches no Tab. With `value`, no tab is selected; with `defaultValue`, the first tab is. Set it to one of the Tabs' values.

## toast-promise-threw

A `toast.promise` `success` or `error` message function threw. Rather than leave the loading toast up for good, a throwing `success` message shows the `error` message for what it threw, and a throwing `error` message closes the toast. Fix the message function: it gets the promise's value (`success`) or its reason (`error`), which may not be the shape it expects.

## toast-undo-no-toaster

`toast.undo` was called with no Toaster on the page, so nobody could see its Undo. The action is committed at once (its `commit` runs) instead of waiting for an Undo that can't come. Render one Toaster, once, near the root.

## toaster-position

Toaster's `position` is deprecated, and removed in 15.0.0. It still works as `placement` does. Rename it to `placement`.

## toaster-twice

A second Toaster mounted, so only the newer one shows toasts. Render one Toaster, once, near the root of the app.

## tooltip-delay

Tooltip's `delay` is deprecated, and removed in 15.0.0. It still works as `openDelay` does. Rename it to `openDelay`, as HoverCard names it.

## tooltip-interactive

A Tooltip's `content` holds a link, button, field or other focusable element. Nobody can use it: focus leaving the tooltip's element hides it, so the keyboard can't reach what's inside, touch screens don't show tooltips, and on the tooltip's inverse fill a link's color reads under 4.5:1 in every theme. Keep the content to short plain text, and use a Popover for anything people press.

## trigger-ref

The element given to a Popover, Menu, ContextMenu or Tooltip as its trigger doesn't pass its ref to a DOM element, so the panel can't be placed beside it or give focus back to it. Use a component that forwards its ref (every Serupa control does), or wrap it in one.

## utc-date

A date component got a `Date` at UTC midnight, which is the day before in a time zone behind UTC. A `Date` made from `"yyyy-mm-dd"` is UTC. Pass the `"yyyy-mm-dd"` string itself instead.
