---
"@diki-stwn/serupa-ds": minor
---

- Added (Field): a control that fails its own native constraint (`required`, `type="email"`, `minLength`, `pattern`, `min`…) once people have changed it and left it, or tried to send the form (`:user-invalid`), now shows which one in the Field's error slot, in the provider's words, with `aria-invalid` and the description, so its red border is never the only sign. It goes once the value is fine. An `error` you pass, or a FormErrors message, still wins.
- Added (CopyButton): a failed copy shows an error icon and "Couldn’t copy" (`copyFailedShort`, in all 20 languages; `--copy-button-failed-color`) for the same time "Copied" would, as well as being announced; `data-failed` while it shows.
- Fixed (Slider): a swipe across the page that starts on a slider scrolls the page on touch screens (`touch-action: pan-y`, `pan-x` when vertical); the thumb goes back and nothing commits.
- Fixed (CodeBlock): line numbers are no longer read by screen readers, as the guide already said.
- Fixed (Menu): separators show in forced-colors mode.
- Fixed (Accordion): the Expand all button has `aria-expanded`, true once every item is open.
- Fixed: the same announcement twice in a row ("Copied", then "Copied") is said both times in VoiceOver.
- Fixed (SignUp): the email field autofills as the account's username, so password managers save it with the new password.
