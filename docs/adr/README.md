# Architecture decision records

Each record says why Serupa is built the way it is: the context, the options weighed, and what was chosen. Read the one behind a part before you change that part. If the change goes against the record, write a new record that supersedes it, and say why.

| # | Decision | Status |
|---|---|---|
| [0001](0001-three-layer-tokens.md) | Three token layers (palette, semantic, component) as CSS custom properties | Accepted |
| [0002](0002-token-source-and-generation.md) | Generate every token output from one source (written in the W3C format since [0014](0014-dtcg-token-source.md)) | Accepted |
| [0003](0003-theming.md) | Themes as brand × mode on `data-theme` | Superseded by [0011](0011-theming-v2.md) |
| [0004](0004-icon-font.md) | Icons from the Material Symbols font | Superseded by [0009](0009-svg-icons.md) |
| [0005](0005-build-and-packaging.md) | Build into `dist/` with tsup and joined CSS | Accepted |
| [0006](0006-installing-from-github.md) | Install releases from GitHub, prebuilt | Accepted |
| [0007](0007-release-flow.md) | Changesets, then a Release PR, then a tag and a GitHub release | Accepted |
| [0009](0009-svg-icons.md) | Material Symbols as inline SVG, by name or by import | Accepted |
| [0010](0010-serupa-provider.md) | One app-level provider instead of module-global settings | Accepted |
| [0011](0011-theming-v2.md) | Theme axes, CSS-only dark mode, one brand registry | Accepted |
| [0012](0012-data-state.md) | One `data-state` vocabulary across components | Accepted |
| [0013](0013-overlay-layers.md) | How overlays share Escape, focus and outside presses | Accepted |
| [0014](0014-dtcg-token-source.md) | Write the tokens in the W3C Design Tokens format | Accepted |
| [0015](0015-upgrades.md) | Majors start as an RFC, and a script makes their renames | Accepted |
| [0016](0016-draw-main-to-compare.md) | A pull request's pictures are compared with main's drawn on the spot | Accepted |
| [0017](0017-react-compiler-output.md) | The package ships its client components compiled by the React Compiler | Accepted |
| [0018](0018-tone-and-variant-names.md) | `tone` says what a color means, `variant` how it looks, and Button is the one exception | Accepted |
| [0019](0019-layout-components-and-utilities.md) | Layout components for a page's structure, utility classes for the details inside it | Accepted |
| [0020](0020-opt-in-brands-and-palette-classes.md) | Brands other than blue, and the palette utility classes, are files an app opts into | Accepted |
| [0021](0021-keep-native-email-script-tag-and-languages.md) | Keep the native and email tokens, the script-tag build and all 20 language packs | Accepted |
| [0022](0022-motion-roles-and-reduced-motion.md) | Motion comes from named roles, and under reduced motion only fades remain | Accepted |
| [0023](0023-every-pattern-shows-every-state.md) | Every pattern shows its loading, empty, failed, partial and offline states | Accepted |
| [0024](0024-density-through-spacing-roles.md) | Density changes the spacing roles, and components read the roles | Accepted |
| [0025](0025-state-as-attributes.md) | A state is an attribute, never a class: data-disabled, data-selected, data-current… beside data-state | Accepted |
| [0026](0026-dark-fills-are-the-light-themes.md) | A dark theme fills with its light theme's brand shade, and brand text is its own token | Accepted |

There is no 0008: that number was never used.

## Writing one

- Name the file `NNNN-short-title.md`, with the next free number, and start it with `# ADR-NNNN: Title`.
- Give it a `**Status:**` line set to `Proposed`, `Accepted`, or `Superseded by [ADR-NNNN](NNNN-….md)`. Put anything more about the status on its own line below that one.
- When a newer record replaces an old one, change only the old one's status line. Leave its body as it was written, and move any reason that still counts into the new record.
- Add a row to the table above.

`node tools/test/adr.mjs` checks these rules: every record has an allowed status, every link to another record resolves, every record has a row in this table, and every row matches its record's status.
