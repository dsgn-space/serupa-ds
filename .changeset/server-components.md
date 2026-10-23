---
"serupa-ds": minor
---

- Fixed: Importing serupa-ds from a React Server Component (the Next.js App Router) failed with "createContext is not a function", because the whole package was one module. Each source file is now its own module under `dist/js/`, and the 44 interactive components start with `"use client"`. Layout and text components still render on the server, and `buttonClass`, `paginationRange`, `formatFileSize` and `initials` can be called there. Imports, exports and types are unchanged, and a bundler still drops the components you don't use.
