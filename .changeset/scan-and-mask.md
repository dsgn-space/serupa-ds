---
"@diki-stwn/serupa-ds": minor
---

Added: MaskedValue, which shows a sensitive value with most of it behind bullets ("•••• 1208") and says to screen readers what it is and the part kept, with an optional Show button for its owner; and QRCode, a QR code drawn from serupa's own encoder, dark on light in every theme, with loading, expired and scanned states. `maskValue` and `encodeQR` give the same results outside React.
