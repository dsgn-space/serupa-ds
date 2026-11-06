// src/blocks/EmptyStates/EmptyStates.tsx
import * as React from "react";
import { Button } from "../../components/Button/Button.js";
import { EmptyState } from "../../components/EmptyState/EmptyState.js";
import { Link } from "../../components/Link/Link.js";
import { announce } from "../../internal/announce.js";
function EmptyFirstRun({ title = "Nothing here yet", description, createLabel, onCreate, learnHref, learnLabel = "How it works", headingLevel }) {
  return /* @__PURE__ */ React.createElement(
    EmptyState,
    {
      icon: "add_circle",
      title,
      description,
      headingLevel,
      actions: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Button, { onClick: onCreate }, createLabel), learnHref ? /* @__PURE__ */ React.createElement(Link, { href: learnHref }, learnLabel) : null)
    }
  );
}
function EmptyNoResults({ query, title = (q) => `No results for \u201C${q}\u201D`, description = "Check the spelling, or try fewer words.", suggestions, onSuggestion, onClearFilters, headingLevel }) {
  return /* @__PURE__ */ React.createElement(
    EmptyState,
    {
      icon: "search_off",
      announce: true,
      title: title(query),
      description,
      headingLevel,
      suggestions,
      onSuggestion,
      onClearFilters
    }
  );
}
function EmptyNoAccess({ title = "You don't have access", description, onRequest, requestLabel = "Request access", requestedLabel = "Request sent", requestFailedLabel = "Couldn't send the request. Try again.", backHref, backLabel = "Go back", headingLevel }) {
  const [sent, setSent] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const request = onRequest ? async () => {
    if (sent) return;
    setFailed(false);
    try {
      await onRequest();
    } catch {
      setFailed(true);
      announce(requestFailedLabel);
      return;
    }
    setSent(true);
    announce(requestedLabel);
  } : void 0;
  return /* @__PURE__ */ React.createElement(
    EmptyState,
    {
      icon: "lock",
      title,
      headingLevel,
      description: failed ? /* @__PURE__ */ React.createElement(React.Fragment, null, description, /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("span", { className: "text-danger-text" }, requestFailedLabel)) : description,
      actions: /* @__PURE__ */ React.createElement(React.Fragment, null, request ? /* @__PURE__ */ React.createElement(Button, { onClick: request, "aria-disabled": sent || void 0 }, sent ? requestedLabel : requestLabel) : null, backHref ? /* @__PURE__ */ React.createElement(Link, { href: backHref }, backLabel) : null)
    }
  );
}
function EmptyLoadFailed({ title = "Couldn't load this", description = "Check your connection, then try again.", onRetry, retryLabel = "Try again", reference, referenceLabel = "Reference", headingLevel }) {
  return /* @__PURE__ */ React.createElement(
    EmptyState,
    {
      icon: "cloud_off",
      announce: true,
      title,
      headingLevel,
      description: reference ? /* @__PURE__ */ React.createElement(React.Fragment, null, description, /* @__PURE__ */ React.createElement("br", null), referenceLabel, ": ", /* @__PURE__ */ React.createElement("span", { className: "font-mono" }, reference)) : description,
      actions: /* @__PURE__ */ React.createElement(Button, { onClick: onRetry }, retryLabel)
    }
  );
}
export {
  EmptyFirstRun,
  EmptyLoadFailed,
  EmptyNoAccess,
  EmptyNoResults
};
//# sourceMappingURL=EmptyStates.js.map
