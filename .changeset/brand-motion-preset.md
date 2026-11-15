---
"@diki-stwn/serupa-ds": minor
---

- `serupa-brand` takes `--motion brisk` or `--motion calm`. It sets how quickly a brand moves, as `--corners` sets how round it is. Brisk moves every surface and change one step quicker on the duration scale (a dialog enters in 150ms instead of 200ms), and calm one step slower (300ms). The spinner, the placeholder pulse, the press and the waits keep their pace, and every exit stays shorter than its enter. Without the option, nothing changes.
