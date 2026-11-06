---
"serupa-ds": minor
---

- Added: Chat (beta), for support chats and AI assistants. `Chat` is a conversation log that stays at the newest message while the reader is there, shows "N new messages" when they've scrolled up, and keeps their place when earlier messages load. `ChatMessage` has an author, avatar, time, own and others' bubbles, "Sending…", "Not sent" with Retry, attachments and a streaming state. `ChatDivider` names the day. `ChatComposer` sends on Enter (Shift+Enter for a new line, input methods respected) and turns Send into Stop while a reply streams. With 13 component tokens.
