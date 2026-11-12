---
"serupa-ds": patch
---

EventCalendar no longer makes a new media query on every render to check the screen width, and Carousel follows its `perView` breakpoints from the first render in the browser. Both now read the width through the same shared queries as `useBreakpoint`, as do Navbar, Popover, Image, Accordion, Toast and TableOfContents for the screen width, data saving and reduced motion.
