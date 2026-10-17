---
"@diki/design-system": minor
---

- Added: consistent names for 23 component tokens, so one pattern works everywhere: a component's text color is `-text`, a part's color is `-<part>-color`, and a border color is `-border`. The old names keep working (when both are set, the new name wins) and will be removed in 5.0.0. Rename any you override:

  | Old name | New name |
  | --- | --- |
  | `--accordion-title`, `--accordion-content`, `--accordion-icon` | `--accordion-title-color`, `--accordion-content-color`, `--accordion-icon-color` |
  | `--alert-text-color` | `--alert-text` |
  | `--avatar-color` | `--avatar-text` |
  | `--card-border-color`, `--card-hover-border-color` | `--card-border`, `--card-border-hover` |
  | `--empty-state-icon`, `--empty-state-title`, `--empty-state-description` | `--empty-state-icon-color`, `--empty-state-title-color`, `--empty-state-description-color` |
  | `--file-upload-icon` | `--file-upload-icon-color` |
  | `--heading-color` | `--heading-text` |
  | `--link-color`, `--link-color-hover` | `--link-text`, `--link-text-hover` |
  | `--list-title`, `--list-description` | `--list-title-color`, `--list-description-color` |
  | `--menu-border-color`, `--menu-item-color` | `--menu-border`, `--menu-item-text` |
  | `--popover-title` | `--popover-title-color` |
  | `--search-input-icon` | `--search-input-icon-color` |
  | `--sidebar-section-title` | `--sidebar-section-title-color` |
  | `--toast-border-color` | `--toast-border` |
  | `--tooltip-color` | `--tooltip-text` |

- Changed: in the token files, `$extensions["com.diki"].cssVar` now gives the new name, and the old one is in `deprecatedCssVar`. Style Dictionary and Figma exports use the new names.
