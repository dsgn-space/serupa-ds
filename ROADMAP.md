# Roadmap

Where Serupa is going, by theme. It says what is coming and roughly in what order, not when: there are no dates, and the order can change as products tell us what they need. What has shipped is in [CHANGELOG.md](CHANGELOG.md), and what counts as a breaking change is in the README's [Versioning](README.md#versioning) section.

## Now

- **Deeper components.** The components that products lean on most get the features that come up again and again: options grouped under headings in Combobox, tables that stay fast with thousands of rows, and fixes from the bug queue, which always goes first.
- **More languages.** Every component's words in about 20 languages, each as its own entry so an app loads only the ones it uses.
- **Getting started faster.** `serupa-create` makes a new app with the system already set up, and `serupa-usage` shows how a product uses each component, so the next improvements follow real use.
- **A safer supply chain.** Dependency updates that check for known vulnerabilities, merge on their own only when small, and wait a week after each release; release tags and files that can't change once published.

## Next

- **More charts.** Chart (line and bar) and Sparkline ship in beta today; more kinds follow on the same tokens, themes and accessibility rules: readable in all six themes, with the numbers available as text.
- **More of each component's details.** The remaining ideas per component (overlays, pickers, forms, navigation), one component at a time.
- **More page patterns.** 24 whole screens ship today (`src/patterns/`: sign-in, settings, a dashboard, checkout and more), as examples to copy and as tests that the components work together. New ones come when a product asks for them.

## Majors

15.0.0 is scheduled for 22 December 2026 ([docs/rfcs/15.0.0.md](docs/rfcs/15.0.0.md)). It removes the props deprecated in 14.x, after at least four weeks of warnings, and moves the package to a private registry under a scoped name, `@diki-stwn/serupa-ds` on GitHub Packages, so imports change once. `npx serupa-migrate` makes the renames a script can. A major comes only when something has to stop working, and is written up for comment first, with a migration guide.
