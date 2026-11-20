---
"@diki-stwn/serupa-ds": minor
---

Carousel: the slides sit in a native scroll container with scroll snap. A touch swipe, a trackpad and Shift with the wheel now scroll with the platform's own momentum, one slide per gesture, and the index and dots follow where it settles; before JavaScript runs, every slide can be scrolled to and read. The buttons, dots and a controlled `index` scroll there smoothly (at once with reduced motion). With `loop`, next on the last slide now scrolls back to the first rather than carrying on forward, and a mouse flick with `perView` moves one slide, as a touch swipe does.
