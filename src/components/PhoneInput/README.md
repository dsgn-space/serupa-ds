# PhoneInput

A phone number field with a country menu at the start. It groups the number the way that country writes it as people type ("812-3456-7890"), and reports it in E.164 ("+6281234567890"), the form to store and send to an SMS service. It's Input's box, so it has the same sizes, states and tokens.

```jsx
const { PhoneInput, Field, formatPhone } = window.Serupa;

<Field label="Mobile number"><PhoneInput defaultCountry="ID" name="phone" /></Field>

// Controlled, in E.164
<PhoneInput value={phone} onValueChange={(value, { complete }) => { setPhone(value); setDone(complete); }} />

// Only the countries you serve
<PhoneInput countries={["ID", "SG", "MY"]} />

formatPhone("+6281234567890");   // "+62 812-3456-7890"
```

## When to use

- Sign-up, checkout and contact forms that ask for a phone number, above all when people from more than one country fill them in.

## When not to use

- A number you only show: write it with `formatPhone`, in a `<a href="tel:+6281234567890">`.
- Extensions, short codes or numbers outside the countries listed below: use [Input](../Input/README.md) with `type="tel"`.

## Usage

- Label it with [Field](../Field/README.md). Say in the hint what the number is for ("We'll text you a code").
- Store the E.164 value, not the text in the field. `onValueChange` gives it, and `name` submits it.
- `complete` says whether the number has a length the country uses. Use it to enable submit or to show an error after blur. It doesn't check that the number exists.
- Set `defaultCountry` to where most of your users are. Without it, the country comes from the locale's region (`id-ID` gives Indonesia), else the US.
- Pasting or typing a number that starts with `+` or `00` picks the country from its calling code. A trunk prefix typed at the start (the `0` of `0812…`) is dropped, since the calling code replaces it.

## Accessibility

- The country menu is a native `<select>` named "Country", under the visible calling code. Phones open their own picker, and screen readers announce it as a menu with its value. Each option says the country's name in the locale's words and its calling code ("Indonesia (+62)").
- The menu draws its own focus ring inside the box, so it's clear whether the menu or the number has focus.
- The number is `type="tel"` with `inputmode="tel"` and `autocomplete="tel-national"`, so phones show the dial pad and browsers can fill it in.
- Backspace next to a space or dash removes the digit before it, so deleting never gets stuck on the grouping.
- The calling code keeps 4.5:1 and the chevron 3:1 on the field in all six themes (`PhoneInput.test.tsx`).

## Countries

Argentina, Australia, Austria, Bangladesh, Belgium, Brazil, Canada, Chile, China, Colombia, Denmark, Egypt, Finland, France, Germany, Greece, Hong Kong, India, Indonesia, Ireland, Israel, Italy, Japan, Kenya, Malaysia, Mexico, the Netherlands, New Zealand, Nigeria, Norway, Pakistan, Peru, the Philippines, Poland, Portugal, Russia, Saudi Arabia, Singapore, South Africa, South Korea, Spain, Sweden, Switzerland, Taiwan, Thailand, Turkey, Ukraine, the United Arab Emirates, the United Kingdom, the United States and Vietnam. Each has the usual grouping of a mobile number and the national number's shortest and longest lengths (`PHONE_COUNTRIES` in `phone.ts`).

## Props

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `value` | string | none | The number in E.164 (controlled) |
| `defaultValue` | string | none | The number at first (uncontrolled), in E.164 |
| `onValueChange` | `(value, { country, national, complete }) => void` | none | Called with E.164 (`""` when empty) as the number or country changes |
| `country` | string | none | The picked country's ISO code (controlled) |
| `defaultCountry` | string | the locale's region, else `"US"` | The country at first |
| `onCountryChange` | `(country) => void` | none | Called when the country changes, from the menu or a pasted number |
| `countries` | string[] | every country above | The countries in the menu, sorted by name |
| `countryLabel` | string | `"Country"` | The menu's name |
| `name` | string | none | Submits the E.164 number in a hidden input |
| `size` | `'sm'` \| `'md'` \| `'lg'` | `'md'` | 24, 32 or 44px, like Input |
| `invalid` | boolean | `false` | A danger border and `aria-invalid` |

`ref`, `placeholder`, `disabled`, `readOnly`, `onBlur` and the other input attributes go to the tel `<input>`; `className` and `style` go to the box, which has `data-component="phone-input"`.

### Helpers

- `formatPhone(e164, preferCountry?)`: "+62 812-3456-7890". A number with no known calling code comes back as it was.
- `parsePhone(text, preferCountry?)`: `{ country, national }` from "+62 0812…" or "0062…", or `undefined`.

## Component tokens

The box and the number use Input's tokens. These style the country part; each is an optional override. The list lives in `src/components/PhoneInput/phone-input.tokens.json` (also in `design-tokens/components/`).

| Token | Default | Use |
| --- | --- | --- |
| `--phone-input-dial` | `text` | The calling code (4.5:1 on the field). |
| `--phone-input-chevron` | `text-muted` | The chevron (3:1 on the field). |
| `--phone-input-divider` | `border` | The line between the country part and the number. |
| `--phone-input-bg-hover` | `surface-muted` | The country part's background on hover. |
| `--phone-input-focus-ring` | `focus-ring` | The menu's keyboard focus ring. |
| `--phone-input-gap` | `spacing-1` | Space around the chevron (4px). |
