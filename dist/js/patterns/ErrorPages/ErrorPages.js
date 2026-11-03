// src/patterns/ErrorPages/ErrorPages.tsx
import * as React from "react";
import { SkipLink } from "../../components/SkipLink/SkipLink.js";
import { Heading } from "../../components/Heading/Heading.js";
import { EmptyState } from "../../components/EmptyState/EmptyState.js";
import { Button } from "../../components/Button/Button.js";
import { Link } from "../../components/Link/Link.js";
var SITE = "Acme";
var TITLES = {
  "not-found": "Page not found",
  offline: "You're offline",
  server: "Something went wrong on our side",
  "no-access": "You don't have access to this page"
};
function ErrorPage({ kind, onRetry, home = "/", reference }) {
  const title = TITLES[kind];
  React.useEffect(() => {
    const before = document.title;
    document.title = `${title} \u2013 ${SITE}`;
    return () => {
      document.title = before;
    };
  }, [title]);
  const [online, setOnline] = React.useState(false);
  React.useEffect(() => {
    if (kind !== "offline") return;
    const on = () => setOnline(true), off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, [kind]);
  const retry = onRetry || (() => window.location.reload());
  const toHome = /* @__PURE__ */ React.createElement(Button, { href: home, variant: kind === "offline" || kind === "server" ? "secondary" : "primary" }, "Go to the home page");
  const body = {
    "not-found": {
      icon: "search_off",
      what: "Check the address, or start again from the home page",
      why: "The page may have moved, or the link you followed may have a typo in it.",
      actions: /* @__PURE__ */ React.createElement(React.Fragment, null, toHome, /* @__PURE__ */ React.createElement(Button, { variant: "secondary", onClick: () => window.history.back() }, "Go back"))
    },
    offline: {
      icon: "wifi_off",
      what: "Check your connection, then try again",
      why: "This page needs the internet to load. Once you are back online, try again.",
      actions: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Button, { onClick: retry }, "Try again"), toHome)
    },
    server: {
      icon: "error",
      what: "Try again in a moment",
      why: /* @__PURE__ */ React.createElement(React.Fragment, null, "It isn't something you did. If it keeps happening, contact support", reference ? /* @__PURE__ */ React.createElement(React.Fragment, null, " and give them this reference: ", /* @__PURE__ */ React.createElement("span", { className: "font-mono" }, reference)) : null, "."),
      actions: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Button, { onClick: retry }, "Try again"), toHome)
    },
    "no-access": {
      icon: "lock",
      what: "Ask for access, or sign in with another account",
      why: "This page belongs to a team or a person you aren't signed in as. Whoever shared the link can give you access.",
      actions: /* @__PURE__ */ React.createElement(React.Fragment, null, toHome, /* @__PURE__ */ React.createElement(Button, { href: "#sign-in", variant: "secondary" }, "Sign in as someone else"))
    }
  }[kind];
  return /* @__PURE__ */ React.createElement("div", { className: "min-h-screen bg-surface-muted text-text" }, /* @__PURE__ */ React.createElement(SkipLink, null), /* @__PURE__ */ React.createElement("header", { className: "mx-auto max-w-xl px-4 pt-6" }, /* @__PURE__ */ React.createElement(Link, { href: home, className: "text-base font-semibold" }, SITE)), /* @__PURE__ */ React.createElement("main", { id: "main", className: "mx-auto flex max-w-xl flex-col gap-4 px-4 py-12 outline-none" }, /* @__PURE__ */ React.createElement(Heading, { level: 1, className: "text-center" }, title), /* @__PURE__ */ React.createElement(EmptyState, { icon: body.icon, headingLevel: 2, title: body.what, description: body.why, actions: body.actions }), kind === "offline" ? (
    // Always there, so a screen reader is listening before the connection comes back.
    /* @__PURE__ */ React.createElement("div", { role: "status", className: "text-center text-sm" }, online ? "You're back online. Try again to load the page." : null)
  ) : null));
}
export {
  ErrorPage
};
//# sourceMappingURL=ErrorPages.js.map
