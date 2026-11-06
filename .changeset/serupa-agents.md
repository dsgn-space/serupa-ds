---
"serupa-ds": minor
---

Added: `npx serupa-agents` points a project's coding agents at the Serupa skill that came with its install. It adds a section to `AGENTS.md` (Codex, Cursor, Copilot and others) saying to read `node_modules/serupa-ds/skills/serupa/SKILL.md` before any UI work, and `@AGENTS.md` to `CLAUDE.md` for Claude Code. It makes either file when it's missing, and running it again changes nothing. The skill read this way always matches the installed release, unlike `npx skills add`, which takes it from `main`. Apps made with `serupa-create` now come with both files.
