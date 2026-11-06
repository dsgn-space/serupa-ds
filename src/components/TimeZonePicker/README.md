# TimeZonePicker

A searchable list of time zones, by city, with each one's offset now and its name in the reader's language. People find their zone by typing a city, a zone's name or an offset, and the value is the zone's IANA name, ready for dates and servers.

```tsx
import { TimeZonePicker } from "serupa-ds";

<Field label="Time zone"><TimeZonePicker defaultValue="Asia/Jakarta" /></Field>
<TimeZonePicker aria-label="Time zone" value={zone} onValueChange={setZone} />
<TimeZonePicker aria-label="Office" zones={["Asia/Jakarta", "Asia/Makassar", "Asia/Jayapura"]} />
```

## When to use

- A setting people choose once, such as their profile's time zone, or a meeting's zone when it isn't theirs.
- Anywhere a time is entered for a place other than where the reader is.

## When not to use

- To show a time in the reader's own zone: the browser already knows it. Format the time with their zone, and only ask when they want another.
- A short, fixed list of offices: a [Select](../Select/README.md) with their names says more than a list of cities.

## Usage

- Put it in a [Field](../Field/README.md) with a label, or give it `aria-label`. It's a [Combobox](../Combobox/README.md), so its other props (`size`, `clearable`, `disabled`, `name`, `invalid`…) work the same.
- The value is an IANA name ("America/New_York"), which `Intl.DateTimeFormat`'s `timeZone`, `Temporal` and most servers take. Store that, not the offset: the offset changes with daylight saving time.
- The reader's own zone comes first, marked "Your time zone", so most people pick it without typing. The rest run from the furthest behind UTC to the furthest ahead, then by city.
- Each option shows its offset at the moment: in March, New York is UTC−05:00 before the 9th and UTC−04:00 after. Set `at` to show the offsets on another date, such as the meeting's.
- `zones` limits the list to the zones you pass, in the same order.
- Typing finds a city ("jakarta"), a zone's name in the reader's language ("Waktu Indonesia"), the IANA name ("argentina") or an offset ("+7", "07:00", "utc-5", "−3:30").
- Zones go by their current names ("Europe/Kyiv", "Asia/Kolkata", "Asia/Ho_Chi_Minh"), the ones servers, databases and `Temporal` use, even where the browser still lists an older spelling. A value under an old name ("Europe/Kiev") shows too, and the picker hands back the current one. Typing the old name ("kiev") still finds it, as do common abbreviations and big cities that share a zone ("pst", "wib", "mumbai").
- The cities are as the IANA names spell them, in English ("New York"); the zone names are the browser's, in the locale (`locale`, the provider's, or the browser's).

## Accessibility

- **Role and name:** a Combobox: an `input` with `role="combobox"` and a `listbox` of `option`s. Each option is named by its city, and its offset and zone name are its `aria-description`, so a screen reader hears both.
- **Keyboard:** as [Combobox](../Combobox/README.md): type to filter, Up and Down to move, Enter to pick, Escape to close.
- **Contrast:** as Combobox, which its tests check in all six themes.
- **What's still yours:** label it, and say what the zone is for when it isn't the reader's own ("The meeting's time zone").

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `id` | `string` | | Goes to the input. |
| `zones` | `string[]` | every zone the browser knows, and UTC | The IANA names to offer. |
| `at` | `Date \| number` | now | The moment the offsets are for. |
| `locale` | `string` | the provider's, else the browser's | The language of the zone names. |
| `value` / `defaultValue` / `onValueChange` | `string \| null` | | The IANA name, as Combobox's value. |

Every other [Combobox](../Combobox/README.md) prop works too, except `options`, `loadOptions`, `filter` and `multiple`, which TimeZonePicker sets. `className` goes to its box, with `dk-time-zone-picker`; `ref` goes to the input.

`timeZoneInfo(zone, locale, at)` gives one zone's city, offset and name, and `allTimeZones()` the zones the browser knows, for showing a zone elsewhere the way the picker does.

## Component tokens

None of its own: it's a Combobox, and Combobox's tokens (`--combobox-…`, and Input's for the field) set its look.
