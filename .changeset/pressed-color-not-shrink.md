---
'@diki-stwn/serupa-ds': minor
---

A press now shows as a darker color, one step past hover, instead of a shrink. A shrink is hard to see under a finger and reads as a glitch on a small control, so Button, ToggleButton, Badge, linked Card, Checkbox, Radio, Switch, SegmentedControl and Stepper no longer change size while held (Slider's thumb still grows while dragged). New shared tokens: `primary-pressed`, `primary-subtle-pressed`, `danger-pressed`, `field-border-pressed` and `border-control-pressed`, in every theme. New component tokens for the held fills, such as `--button-primary-bg-pressed`, `--checkbox-bg-checked-pressed`, `--switch-track-pressed` and `--card-pressed-layer`. The `--*-press-scale` tokens stay and now default to 100%: set one, e.g. `--button-press-scale: var(--scale-97)`, to bring a shrink back.
