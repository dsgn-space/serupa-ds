---
"serupa-ds": minor
---

Polish from using the patterns as a real app:

- ActivityFeed: an event's time and detail start at the sentence's edge beside the avatar, so a wrapped line, its time and its detail line up instead of falling back under the avatar. New prop `headingSize` sets the heading's look to match the page's other sections.
- Dashboard: Activity's heading matches the other sections' (lg) and no longer moves or changes size when the events arrive; the loading state uses the feed's own avatar-and-lines skeleton. Recent projects shows each status as a Badge with a dot (new `statusTone` on `RecentProject`).
- Checkout: from lg up the order summary stays in view beside the long form, and the Security code hint is short enough that Expiry date and Security code line up.
