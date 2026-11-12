---
"serupa-ds": minor
---

The Comment thread block takes `people`: its reply and edit boxes become MentionInputs, the reply's hint says "Type @ to mention someone.", mentions in comments are bold, and `onReply` and `onEdit` get `{ mentions }`, the people to notify. MentionInput opens its list again when a mention closed with Escape is deleted and its "@" typed again in the same place.
