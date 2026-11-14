## Why it exists

Serupa is the system Diki starts every project from. The name is Indonesian for "alike": the same button, the same spacing and the same focus ring in every product, so a new project begins with the decisions already made and picks up each fix with a version bump.

It began as a way to stop solving the same problems twice. A form field that handles its error, a dialog that returns focus, a table that still reads on a phone: each was built once, tested, and written down so the next project could use it as it is.

## How it is built

Everything starts from design tokens. A color, a space, a radius or a duration is named once, and the components read the name, never the value. That is what lets one attribute on the page switch between six themes without a single component changing.

The components build on what the browser already does well. A select is a native select, a dialog is a native dialog, and newer CSS arrives as an enhancement over behavior that works today. Above them sit the blocks and patterns: whole sections and screens, such as a checkout or a dashboard, put together from the same parts.

## How it stays honest

Every component meets WCAG 2.2 AA in all six themes, and the tests check it on every story, in every theme, on every change. Each component is drawn and compared with its last picture, used with a keyboard, and read by its roles and names.

The docs are held to the same rule. This site is drawn from the same pages, examples and types as the workshop the components are built in, so what you read here is what ships.
