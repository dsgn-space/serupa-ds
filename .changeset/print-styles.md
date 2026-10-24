---
"serupa-ds": minor
---

- Changed: base.css: print styles. Browsers drop backgrounds when printing, so a primary Button printed as faint text on white and filled Badges lost their color. Now, when printing, filled controls (Button, Badge, Progress, Switch, checked Checkbox and Radio, Avatar, Stepper, SegmentedControl, Alert, Slider, Calendar, Pagination, Tabs) keep their colors. The toast stack, tooltips, menus, popovers and open pickers don't print. Put `data-print-urls` on a container to print each outside link's address after its text.
