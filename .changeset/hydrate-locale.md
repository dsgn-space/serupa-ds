---
"serupa-ds": patch
---

- Fixed: DatePicker, DateRangePicker, TimePicker, Calendar and NumberInput no longer break server-rendered pages when no `locale` is set. The server and the first client render agree on `en-US`, so React reports no hydration mismatch, and the components switch to the browser's locale right after hydrating, placeholder included. Before, a server in `en-US` and a browser in `id-ID` gave a mm/dd/yyyy placeholder next to 23/10/2026, and typing 03/04/2026 the way it asked gave 3 April. For the visitor's format from the first paint, set `<SerupaProvider locale>` from the request (see the Localization guide).
