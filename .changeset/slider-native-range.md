---
"@diki-stwn/serupa-ds": minor
---

Slider: each thumb is now a native `<input type="range">` over the drawn thumb, so screen readers' adjust gestures (VoiceOver's swipe up and down, TalkBack's volume keys) move it, by `step`, and call `onValueCommit`. The range inputs take `name` and `form`, in place of hidden inputs. A disabled Slider's thumbs are `disabled` range inputs rather than `aria-disabled` spans. Looks, keys and presses are unchanged.
