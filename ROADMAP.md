# Roadmap

Where Serupa is going, by theme. It says what is coming and roughly in what order, not when: there are no dates, and the order can change as products tell us what they need. What has shipped is in [CHANGELOG.md](CHANGELOG.md), and what counts as a breaking change is in the README's [Versioning](README.md#versioning) section.

## Now

- **Deeper components.** The components that products lean on most get the features that come up again and again: options grouped under headings in Combobox, tables that stay fast with thousands of rows, and fixes from the bug queue, which always goes first.
- **More languages.** Every component's words in about 20 languages, each as its own entry so an app loads only the ones it uses.
- **Getting started faster.** `serupa-create` makes a new app with the system already set up, and `serupa-usage` shows how a product uses each component, so the next improvements follow real use.
- **A safer supply chain.** Dependency updates that check for known vulnerabilities, merge on their own only when small, and wait a week after each release; release tags and files that can't change once published.

## Next

- **Charts.** A family of chart components built on the same tokens, themes and accessibility rules as everything else: readable in all six themes, with the numbers available as text.
- **More of each component's details.** The remaining ideas per component (overlays, pickers, forms, navigation), one component at a time.

## Later

- **Page patterns.** Whole screens built from the components, such as sign-in, settings, a dashboard and a data table page, as examples to copy and as tests that the components work together.
- **A package registry.** Installing from GitHub releases works today. Publishing to a registry waits on the package's name there.

## Majors

The next major renames the package, once its final name is chosen. Your code keeps working: what changes is the name you install and import from, and the release comes with a migration guide and a codemod that makes the change for you. Nothing is marked deprecated today, so no other removals are waiting. Any major after that comes only when something has to stop working, and is written up for comment first.
