---
"@diki-stwn/serupa-ds": minor
---

- Added (Sidebar): find-in-page reaches the items of a closed group, and a match opens it (`hidden="until-found"`, as Accordion and Tabs already do).
- Added (Carousel): a sideways trackpad swipe, or Shift and the mouse wheel, moves one slide per swipe, without scrolling the page sideways or going back a page.
- Fixed (ScrollArea, Tabs): something scrolled into view in a faded scroller (a control reached with Tab, `scrollIntoView`) stops clear of the fade instead of half see-through in it.
- Fixed: an element inside a `.stagger` child that reads `--dk-stagger-delay` gets the child's delay (the variable is now a registered `<time>`).
- Fixed (Navbar): the scroll-driven lift and condense run only where `animation-range` is supported too, so a browser with partial support doesn't run them over the whole page.
- Fixed (Tabs): scrolling a row of tabs no longer re-measures every tab on each scroll event, only the edge fades.
- Added (theme.js): it keeps `<meta name="color-scheme">` on the mode shown, so a dark page's canvas, scrollbars and form controls are dark from the first paint, before the stylesheets; a page's own meta is left alone.
