---
"serupa-ds": patch
---

Disabled, read-only and invalid states agree across the form controls. PhoneInput's calling code dims with the number when disabled, and its country part shows the plain arrow when read-only, as Combobox and Select do. A disabled Field's required mark dims with its label instead of staying red. An invalid Rating draws its empty stars as red outlines, so a row with nothing picked no longer reads as five red stars. A read-only SignaturePad's box takes the read-only field background (new token `--signature-pad-bg-readonly`). A read-only FileUpload shows the plain arrow over its button too.
