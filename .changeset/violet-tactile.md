---
"serupa-ds": minor
---

- Added: the violet brand is now tactile. Its buttons, toggle buttons and FABs get a faint top highlight, a soft lift that rises on hover, a sheen on the filled ones and a press that sinks. Switch and slider thumbs and the selected segment get a highlight and a close shadow, fields a faint inner shade, and link cards lift on hover. Surfaces and text stay flat, and every label keeps its contrast. Blue and emerald look exactly as before.
- Added: the `data-depth` axis. `data-depth="tactile"` gives any brand or section the tactile look, and `data-depth="flat"` turns it off, violet included.
- Added: eight shared tokens for depth (`depth-control`, `depth-control-hover`, `depth-control-pressed`, `depth-sheen`, `depth-sheen-pressed`, `depth-part`, `depth-field`, `depth-card-lift`) and component tokens that read them: `--button-depth`, `--button-depth-hover`, `--button-depth-pressed`, `--toggle-button-depth-pressed`, `--switch-thumb-depth`, `--slider-thumb-depth`, `--segmented-control-indicator-depth`, `--input-depth`, `--textarea-depth`, `--select-depth` and `--card-depth-hover`. The sheen is read straight from `depth-sheen`, so set that on a button to change it. In design-tokens/, the violet theme files are marked `depth: "tactile"` and each depth token carries its tactile value.
- Changed (Button): the variants set `background-color` rather than the `background` shorthand, so the sheen (a background image) survives hover and press. A page that set `background-image` on a Button through its own CSS should check it still shows.
