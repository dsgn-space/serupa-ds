---
"serupa-ds": minor
---

- Added: FormattedNumber, a `<data value>` that writes a number the way the locale does, with its digits: plain (`1.234,5` in Indonesian), compact (`1.2K`, with the full number as its tooltip), percent, currency, bytes (`1.5 MB`, in steps of 1024 like `formatFileSize`) and units (`50 km/h`). `options` takes any other `Intl.NumberFormat` option, and `formatNumber(value, locale, options)` gives the same words outside React and in Server Components.
