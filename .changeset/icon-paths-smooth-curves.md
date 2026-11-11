---
"serupa-ds": patch
---

Fixed (Icon): every Material Symbol's path is 26% shorter, with the same drawing. A curve that continues smoothly from the one before is now written as a smooth curve (`t`, its end point only) instead of repeating its control point, so the full icon set (`serupa-icons.iife.js`) is 430 KiB gzipped instead of 493, each part of it a page loads for an unknown name is smaller, and the icons the components draw take about 0.4 KiB less in every bundle. Every icon draws exactly the same shape: each new path resolves to the same points as the old one.
