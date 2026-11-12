---
"serupa-ds": minor
---

Chat: an assistant's reply can show its work. ChatMessage takes `thinking` ("Thinking…" until its words arrive), `reasoning` with `reasoningTime` (a closed "Thought for 12 seconds" section) and `steps` (the tools it called, each in progress, done or failed, said in words). The new ChatSteps draws that list on its own. A regenerated reply switches between its versions (`branch`, `branches`, `onBranchChange`: "2 / 3"). New ChatApproval asks before an assistant acts (Approve and Deny, then a one-line record) and ChatCitation shows a numbered source as a link. The README shows a model picker and a context Meter in the composer.
