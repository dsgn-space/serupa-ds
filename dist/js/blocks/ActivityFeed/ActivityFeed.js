// src/blocks/ActivityFeed/ActivityFeed.tsx
import * as React from "react";
import { Avatar } from "../../components/Avatar/Avatar.js";
import { Heading } from "../../components/Heading/Heading.js";
import { Link } from "../../components/Link/Link.js";
import { LoadMore } from "../../components/LoadMore/LoadMore.js";
import { RelativeTime } from "../../components/RelativeTime/RelativeTime.js";
import { Timeline, TimelineItem } from "../../components/Timeline/Timeline.js";
function line(e) {
  const target = e.target && (e.target.href ? /* @__PURE__ */ React.createElement(Link, { href: e.target.href }, e.target.label) : e.target.label);
  if (typeof e.action === "function") return e.action(target);
  return /* @__PURE__ */ React.createElement(React.Fragment, null, e.action, target && /* @__PURE__ */ React.createElement(React.Fragment, null, " ", target));
}
function ActivityFeed({ events, onLoadMore, hasMore, total, title = "Activity", headingLevel = 2, emptyText = "No activity yet", loadMoreLabel, endText }) {
  const id = React.useId();
  return /* @__PURE__ */ React.createElement("section", { "aria-labelledby": id, className: "flex flex-col gap-4" }, /* @__PURE__ */ React.createElement(Heading, { level: headingLevel, id }, title), events.length === 0 ? /* @__PURE__ */ React.createElement("p", { className: "text-sm text-text-muted" }, emptyText) : /* @__PURE__ */ React.createElement(Timeline, null, events.map((e) => /* @__PURE__ */ React.createElement(
    TimelineItem,
    {
      key: e.id,
      status: e.status,
      title: /* @__PURE__ */ React.createElement("span", { className: "flex items-start gap-2 font-normal" }, /* @__PURE__ */ React.createElement(Avatar, { size: "xs", name: e.actor.name, src: e.actor.avatar, alt: "" }), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("strong", { className: "font-semibold" }, e.actor.name), " ", line(e))),
      time: /* @__PURE__ */ React.createElement(RelativeTime, { date: e.date })
    },
    e.detail
  ))), events.length > 0 && /* @__PURE__ */ React.createElement(LoadMore, { onLoadMore, hasMore, count: events.length, total, label: loadMoreLabel, endText }));
}
export {
  ActivityFeed
};
//# sourceMappingURL=ActivityFeed.js.map
