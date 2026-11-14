---
"@diki-stwn/serupa-ds": minor
---

Buttons and Pagination pages take a press 44px across on touch screens, without changing how anything looks. Every Button and IconButton (and the close and action buttons built on them, in Dialog, Drawer, Toast, Attachment and Calendar), and each page in Pagination, now reaches past its edges with an invisible box on a touch screen, so a default 32px IconButton takes a finger-sized press on a phone. Next to another button in the same row the box stops halfway into the gap, so a press always goes to the nearer button; ButtonGroup and Toolbar tell it their gap, and an attached ButtonGroup keeps each button to its own face. Nothing changes with a mouse.
