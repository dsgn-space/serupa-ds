---
"serupa-ds": patch
---

The package no longer ships `dist/js/blocks/` and `dist/js/patterns/` (28 files, about 200 KB), which no export could reach. Blocks and patterns are for copying from the repository, as before. The ones that use state or handlers now start with `"use client";`, so a copy pasted into a Next.js App Router page builds.
