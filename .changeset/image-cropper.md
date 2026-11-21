---
"@diki-stwn/serupa-ds": minor
---

Added: ImageCropper (beta), a picture in a frame of a fixed shape that people move and zoom to choose the part to keep, such as a profile photo, a logo or a cover. Drag, tap a spot, the arrow keys, a zoom slider with − and + buttons, + and − keys, and pinch all work; `shape="round"` dims the picture outside a circle. `onCropChange` gives the crop in the picture's own pixels, and the new `cropImage(src, area, { width, type, quality })` draws it as a Blob.
