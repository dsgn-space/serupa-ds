# PhoneInput

A phone number field with a country menu at the start. It groups the number the way that country writes it as people type ("812-3456-7890"), and reports it in E.164 ("+6281234567890"), the form to store and send to an SMS service. It's Input's box, so it has the same sizes, states and tokens.

**Also called:** phone number field, telephone input.

```jsx
import { PhoneInput, Field, formatPhone } from '@diki-stwn/serupa-ds';

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
- Extensions or short codes: use [Input](../Input/README.md) with `type="tel"`.

## Anatomy

Drawn from the `ByArea` story.

1. **Country** (`.srp-phone-input__country`): chooses the country, which sets the dialing code and the format.
2. **Dialing code** (`.srp-phone-input__dial`): the country's code, before the number.
3. **Number** (`.srp-input__field`): where the rest of the number is typed.

## Usage

- Label it with [Field](../Field/README.md). Say in the hint what the number is for ("We'll text you a code").
- Store the E.164 value, not the text in the field. `onValueChange` gives it, and `name` submits it.
- Digits typed on an Arabic, Persian or Bengali keyboard, or full width from a Japanese or Chinese IME (٠١٠, ０９０, ＋８１), are read as the same number, so the field and the value are always in ASCII digits. The calling codes are written in ASCII digits too, in the prefix (+20) and the country list (Egypt (+20)), even where the locale has its own digits (`ar-EG`), so they match the number beside them and what people dial.
- **Form reset** puts `defaultValue` and `defaultCountry` back, in the field and in what the form sends. A controlled field shows its `value` again.
- `complete` says whether the number has a length the country uses. Use it to enable submit or to show an error after blur. It doesn't check that the number exists.
- Set `defaultCountry` to where most of your users are. Without it, the country comes from the locale's region (`id-ID` gives Indonesia), else the US.
- Pasting or typing a number that starts with `+` or `00` picks the country from its calling code. Where countries share one, the area decides: `+1 416…` is Canada, `+1 684…` American Samoa, `+7 7…` Kazakhstan, `+44 1481…` Guernsey.
- A pasted `tel:` link reads as its number (`tel:+4930123456`, parameters such as `;phone-context=` too). An extension at the end ("ext. 12", "x12", "#12", "Durchwahl 12", `;ext=12`) is left off, not joined onto the number. Ask for it in a field of its own.
- A trunk prefix typed at the start (the `0` of `0812…`) is dropped, since the calling code replaces it. So is a calling code typed without `+` ("62 812…" with Indonesia picked), once the number is too long to be a national one.
- A `+` code PhoneInput doesn't know warns once in the console; its digits are read as a number in the picked country.
- A press on the box past the number field focuses the field with the caret at the end, as the text cursor over the box promises; a press on the country menu opens its list.

### Do and don't

- **Do:** Label it with [Field](../Field/README.md) and say in the hint what the number is for ("We'll text you a code"). (`DoSayWhy`)
- **Don't:** Ask without saying why: people wonder whether to give a real number. (`DontNoReason`)

## States

| State | Look |
| --- | --- |
| Rest | `field` background, 1px `field-border`, the country and its calling code at the start |
| Hover | `field-border-hover`; the country picker under the pointer takes a `field-hover` fill, `field-pressed` while pressed |
| Focus | Like Input: the border and a 1px ring hugging it in `focus-ring` (2px in all), and a visible outline in forced-colors mode. The box draws the one ring whether the country menu or the number has focus; the menu also takes its `field-hover` fill while it has focus |
| Invalid | `danger` border, and a `danger` focus ring |
| Read-only | `field-readonly` background, no hover change; still focusable and selectable; the country can't be changed, and its picker keeps a plain cursor |
| Disabled | `field-readonly` background, `disabled-border` edge and `disabled-text` at full opacity, `not-allowed` cursor; the calling code is in `disabled-text` too, and the country can't be changed |

## Accessibility

- The country menu is a button showing the calling code, named "Country" with the country ("Country: Indonesia (+62)"). It opens a list of the countries, as Combobox's list looks, with a search field at its top: the field is a combobox for the listbox under it, and how many match is said after a pause. Each option has the country's name in the locale's words and its calling code; the picked one is selected and has a check.
- The search finds a country by its name, ignoring case and accents ("cote" finds Côte d'Ivoire), by its ISO code ("id") or by its calling code ("62" or "+62"). Names that start with what's typed come first.
- In a right-to-left page the calling code still reads left to right, "+20", in the prefix and in each option.
- One focus ring, on the box, for the menu and the number alike. The menu takes its hover fill while it has focus, so it's clear which part does.
- The number is `type="tel"` with `inputmode="tel"` and `autocomplete="tel"`, so phones show the dial pad and browsers fill in the saved number with its country code. The field reads a "+44 …" and moves the country to match. `tel-national` would fill the digits alone under the default country, a wrong number that looks right.
- Backspace next to a space or dash removes the digit before it, so deleting never gets stuck on the grouping.
- The calling code keeps 4.5:1 and the chevron 3:1 on the field in every theme (`PhoneInput.test.tsx`).

### Keyboard

| Key | Does |
| --- | --- |
| Tab | The country menu, then the number field. In the open list, closes it and goes on to the number |
| Enter / Space / Down / Up | On the country menu, opens the list on the picked country, focus in its search field |
| A letter | On the country menu, opens the list searching for it; a digit does too, to find a calling code |
| Down / Up | In the list, move through the countries, wrapping at the ends |
| Enter | In the list, picks the highlighted country and puts focus in the number |
| Escape | Closes the list, nothing picked, focus back on the menu |
| Backspace / Delete | Next to a space, dash or bracket in the number, removes the digit beyond it rather than the punctuation |

## Countries

Every calling code in the world: 244 countries and territories, one row each in `PHONE_COUNTRIES` (`phone.ts`).

- About 120 have their usual grouping and the national number's shortest and longest lengths. The rest keep their digits ungrouped and accept 4 digits up to E.164's 15 in all.
- Germany groups by its area code, which is 2 to 5 digits: Berlin is "30 123456", a mobile "151 23456789", Cologne "221 1234567", and the rest "4621 1234567". Tokyo and Osaka (one digit) and London (two) group the same way.
- The North American Numbering Plan (+1) tells Canada and the Caribbean and Pacific territories from the US by the area code.
- A row you pass in `countries` replaces the built-in one with the same code, or adds a country: `{ code: "SG", dial: "65", trunk: "", pattern: "## ## ## ##", min: 8, max: 8 }`. The row can also have `patterns` (groupings by the number's start) and `areas` (for a shared calling code).

## Props

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `id` | string | none | Goes to the native `<input type="tel">` (not the wrapper), so a `<label htmlFor>` or a Field can point at it. |
| `value` | string | none | The number in E.164 (controlled) |
| `defaultValue` | string | none | The number at first (uncontrolled), in E.164 |
| `onValueChange` | `(value, { country, national, complete }) => void` | none | Called with E.164 (`""` when empty) as the number or country changes |
| `country` | string | none | The picked country's ISO code (controlled) |
| `defaultCountry` | string | the locale's region, else `"US"` | The country at first |
| `onCountryChange` | `(country) => void` | none | Called when the country changes, from the menu or a pasted number |
| `countries` | `Array<string \| PhoneCountry>` | every country | The countries in the menu, as ISO codes or your own rows, sorted by name |
| `countryLabel` | string | `"Country"` | The menu's name |
| `name` | string | none | Submits the E.164 number in a hidden input. With `form`, the hidden input belongs to that form too |
| `size` | `'sm'` \| `'md'` \| `'lg'` | `'md'` | 24, 32 or 44px, like Input |
| `invalid` | boolean | `false` | A danger border and `aria-invalid` |

`ref`, `placeholder`, `disabled`, `readOnly`, `onBlur` and the other input attributes go to the tel `<input>`; `className` and `style` go to the box, which has `data-component="phone-input"`.

### Helpers

- `formatPhone(e164, preferCountry?)`: "+62 812-3456-7890". A number with no known calling code comes back as it was.
- `parsePhone(text, preferCountry?, countries?)`: `{ country, national }` from "+62 0812…" or "0062…", or `undefined`. `preferCountry` decides a shared calling code while the area isn't typed yet.

## Component tokens

The box and the number use Input's tokens. These style the country part; each is an optional override. The list lives in `src/components/PhoneInput/phone-input.tokens.json` (also in `design-tokens/components/`).

<!-- token-table:start (made from phone-input.tokens.json by npm run tokens: edit the descriptions there) -->
| Token | Default | Use |
| --- | --- | --- |
| `--phone-input-dial` | `text` | The calling code (4.5:1 on the field). |
| `--phone-input-chevron` | `text-muted` | The chevron (3:1 on the field). |
| `--phone-input-divider` | `field-border` | The line between the country part and the number: the field's own edge color. |
| `--phone-input-bg-hover` | `field-hover` | The country part's background on hover, as the other buttons inside fields. |
| `--phone-input-bg-pressed` | `field-pressed` | The country picker's background while it's held down, one step past hover. |
| `--phone-input-listbox-bg` | `surface-overlay` | The country list's background. |
| `--phone-input-listbox-border` | `border-overlay` | The country list's outline, and the line under its search field. |
| `--phone-input-option-color` | `text` | A country's name, the search text, and the calling code of the highlighted country. |
| `--phone-input-option-bg-active` | `highlight` | The highlighted country (hover or arrow keys). |
| `--phone-input-option-indicator` | `highlight-indicator` | The 2px bar at the highlighted country's start: none by default (the grey fill marks it), `text`-dark with more contrast. |
| `--phone-input-muted` | `text-muted` | A country's calling code in the list, the search icon and the no-match message. |
| `--phone-input-focus-ring` | `focus-ring` | The box's focus ring while the country button has keyboard focus (the field's own is Input's). |
| `--phone-input-gap` | `spacing-1` | Space around the chevron (4px). |
| `--phone-input-offset` | `spacing-1` | The gap between the box and the country list (4px). |
| `--phone-input-listbox-shadow` | `elevation-overlay` | The country list's shadow. |
| `--phone-input-listbox-radius` | `radius-surface` | The country list's corners (8px). |
| `--phone-input-listbox-max-height` | `spacing-80` | The country list's height, search field included, before it scrolls (320px). |
| `--phone-input-z-index` | `z-popover` | The country list's stacking order, where the top layer isn't available. |
<!-- token-table:end -->
