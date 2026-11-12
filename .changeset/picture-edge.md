---
"serupa-ds": minor
---

Photos in Image and Avatar get a hairline just inside their edge, so a picture with a white or black background keeps its shape on a page of the same color. It comes from the new `picture-edge` token (black at 10% in light themes, white at 10% in dark), through `--image-edge` and `--avatar-edge`. Image leaves it off with `fit="contain"`, where the box is bigger than the picture, and both drop it in forced colors.
