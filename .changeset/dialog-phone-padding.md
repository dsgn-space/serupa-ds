---
'serupa-ds': patch
---

On a phone, Dialog and Drawer pad their panel 16px instead of 24px, so a 320px screen (or a desktop at 400% zoom) gives the content 256px instead of 240px. From 640px wide nothing changes, and `--dialog-padding` and `--drawer-padding` still set it everywhere.
