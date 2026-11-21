---
"@diki-stwn/serupa-ds": minor
---

- Added: The native tokens (`dist/native/`) carry the motion, depth and type too. Swift and Kotlin get the easings (`SerupaEasing.easeEnter`: a SwiftUI `Animation` for a duration, a Compose `CubicBezierEasing`), the drop shadows layer by layer (`SerupaShadow.elevationRaised` with `view.serupaShadow(…)` in SwiftUI, `SerupaShadows.elevationRaised` in Kotlin) and the type styles (`SerupaTypeStyle.typeHeading1` in Swift, `SerupaType.typeHeading1`, a `TextStyle`, in Kotlin). Swift also gets `SerupaAssetColors(brand: "blue").primary`, for the asset catalog below.
- Added: Each GitHub release attaches the native and email kits as archives of their own, for an iOS, Android or email project that doesn't install the package: `serupa-native-<version>.tar.gz` (`dist/native/` and an Xcode asset catalog, `SerupaColors.xcassets`, with each brand's colors in light and dark, so iOS picks by the appearance) and `serupa-email-<version>.tar.gz` (`dist/email/`).
- Added: A Health page in the docs: each component's tests, stories, size, test coverage, axe results and React Compiler status, the open issues and the latest releases, made every night by the Nightly run.
