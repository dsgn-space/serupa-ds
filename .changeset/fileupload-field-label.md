---
"serupa-ds": patch
---

- Fixed: FileUpload: in a Field, the button is named by the label and its own text ("Due date, Choose a file") and described by the Field's hint and error. Before, a screen reader heard only "Choose a file". `aria-describedby` now goes to the button, not the wrapper.
