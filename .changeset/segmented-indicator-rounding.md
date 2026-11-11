---
"serupa-ds": patch
---

SegmentedControl: the indicator sits on its segment to the fraction of a pixel again. The scale-back for a zoomed container read the control's rounded width, so an unscaled control whose width was a fraction of a pixel had its indicator drift by up to half a pixel. A difference under a pixel now counts as no scale.
