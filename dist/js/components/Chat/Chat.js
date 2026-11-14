"use client";

// src/components/Chat/Chat.tsx
import * as React from "react";
import { cn, domId, omit, useMergedRef } from "../../internal/cn.js";
import { announce } from "../../internal/announce.js";
import { component } from "../../internal/component.js";
import { useLocale, useSettings } from "../../internal/provider.js";
import { displayNumber } from "../../internal/numbers.js";
import { isComposing } from "../../internal/ime.js";
import { activeIn } from "../../internal/root.js";
import { Button } from "../Button/Button.js";
import { IconButton } from "../IconButton/IconButton.js";
import { Loader } from "../Loader/Loader.js";
import { Icon } from "../Icon/Icon.js";
import { RelativeTime } from "../RelativeTime/RelativeTime.js";
import { Textarea } from "../Textarea/Textarea.js";
import * as icons from "../../material/builtin.js";
import { en as ownWords } from "./labels.js";
var words = /* @__PURE__ */ Object.assign({}, ownWords);
var SCROLL_STOP = { tabIndex: 0 };
var NEAR = 4;
var atBottom = (el) => el.scrollHeight - el.scrollTop - el.clientHeight <= NEAR;
var toEnd = (el) => {
  el.scrollTop = el.scrollHeight;
};
var Chat = /* @__PURE__ */ component("Chat", function Chat2(props, ref) {
  const sds = useSettings(words), L = sds.labels, locale = useLocale();
  const rest = omit(props, { children: 1, hasOlder: 1, onLoadOlder: 1, loadingOlder: 1, className: 1, "aria-label": 1, "aria-labelledby": 1 });
  const scroller = React.useRef(null);
  const items = React.Children.toArray(props.children).filter(React.isValidElement);
  const keys = items.map((c) => String(c.key));
  const messages = items.filter((c) => c.type === ChatMessage).length;
  const was = React.useRef(null);
  const [unread, setUnread] = React.useState(0);
  const toBottom = () => {
    const el = scroller.current;
    if (el) toEnd(el);
  };
  const first = keys[0] || "", last = keys[keys.length - 1] || "", all = "\n" + keys.join("\n") + "\n";
  React.useLayoutEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const before = was.current;
    if (!before) toEnd(el);
    else if (first !== before.first && last === before.last && all.includes("\n" + before.first + "\n")) {
      el.scrollTop = before.top + (el.scrollHeight - before.height);
    } else if (last !== before.last) {
      if (before.bottom) toEnd(el);
      else if (messages > before.messages) setUnread((n) => n + messages - before.messages);
    }
    was.current = { bottom: atBottom(el), first, last, height: el.scrollHeight, top: el.scrollTop, messages };
  }, [all, first, last, messages]);
  const asked = React.useRef(null);
  const older = React.useRef(null);
  React.useLayoutEffect(() => {
    const el = scroller.current;
    if (asked.current == null || !el || props.loadingOlder || first === asked.current && props.hasOlder) return;
    asked.current = null;
    const active = activeIn(el);
    if (!active || active === el.ownerDocument.body || older.current && older.current.contains(active)) el.focus({ preventScroll: true });
  }, [first, props.hasOlder, props.loadingOlder]);
  React.useEffect(() => {
    const el = scroller.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => {
      if (was.current && was.current.bottom) toBottom();
    });
    for (const c of Array.from(el.children)) ro.observe(c);
    const mo = typeof MutationObserver === "undefined" ? null : new MutationObserver((records) => {
      for (const r of records) {
        r.addedNodes.forEach((n) => {
          if (n.nodeType === 1) ro.observe(n);
        });
        r.removedNodes.forEach((n) => {
          if (n.nodeType === 1) ro.unobserve(n);
        });
      }
    });
    if (mo) mo.observe(el, { childList: true });
    return () => {
      ro.disconnect();
      if (mo) mo.disconnect();
    };
  }, []);
  const onScroll = (e) => {
    const el = e.currentTarget, bottom = atBottom(el);
    if (was.current) was.current = { ...was.current, bottom, top: el.scrollTop, height: el.scrollHeight };
    if (bottom && unread) setUnread(0);
  };
  const jump = () => {
    const el = scroller.current;
    toBottom();
    setUnread(0);
    if (el) el.focus({ preventScroll: true });
  };
  return /* @__PURE__ */ React.createElement("div", { ...rest, ref, className: cn("dk-chat", props.className), "data-component": "chat" }, /* @__PURE__ */ React.createElement("div", { ref: scroller, className: "dk-chat__log", role: "log", ...SCROLL_STOP, "aria-label": props["aria-label"], "aria-labelledby": props["aria-labelledby"], onScroll }, props.hasOlder ? /* @__PURE__ */ React.createElement("div", { className: "dk-chat__older", ref: older }, /* @__PURE__ */ React.createElement(Button, { variant: "ghost", size: "sm", loading: !!props.loadingOlder, onClick: () => {
    if (!props.loadingOlder && props.onLoadOlder) {
      asked.current = first;
      props.onLoadOlder();
    }
  } }, props.loadingOlder ? L.chatLoadingOlder : L.chatLoadOlder)) : null, props.children), unread ? /* @__PURE__ */ React.createElement(Button, { className: "dk-chat__jump", variant: "secondary", size: "sm", rightIcon: /* @__PURE__ */ React.createElement(Icon, { icon: icons.ArrowDownward }), onClick: jump }, L.chatNewMessages(unread, displayNumber(unread, locale))) : null);
});
var ChatMessage = /* @__PURE__ */ component("ChatMessage", function ChatMessage2(props, ref) {
  const sds = useSettings(words), L = sds.labels;
  const rest = omit(props, { children: 1, author: 1, avatar: 1, time: 1, own: 1, hideAuthor: 1, status: 1, onRetry: 1, attachments: 1, streaming: 1, thinking: 1, reasoning: 1, reasoningTime: 1, steps: 1, branch: 1, branches: 1, onBranchChange: 1, className: 1 });
  const own = !!props.own, failed = props.status === "failed";
  const hasText = props.children != null && props.children !== "";
  const time = Number(props.reasoningTime);
  const showAuthor = !props.hideAuthor && (props.author != null || own);
  const count = Math.floor(Number(props.branches)) || 0, at = Math.min(Math.max(Math.floor(Number(props.branch)) || 1, 1), count);
  const num = new Intl.NumberFormat(useLocale());
  const go = (to) => {
    if (to < 1 || to > count || !props.onBranchChange) return;
    props.onBranchChange(to);
    announce(L.chatResponseOf(to, count));
  };
  return /* @__PURE__ */ React.createElement(
    "div",
    {
      ...rest,
      ref,
      className: cn("dk-chat-message", own && "dk-chat-message--own", failed && "dk-chat-message--failed", props.hideAuthor && "dk-chat-message--follow", props.className),
      "data-component": "chat-message",
      "aria-busy": props.streaming || void 0
    },
    /* @__PURE__ */ React.createElement("span", { className: "dk-chat-message__avatar", "aria-hidden": true }, props.hideAuthor ? null : props.avatar),
    /* @__PURE__ */ React.createElement("div", { className: "dk-chat-message__main" }, showAuthor || props.time != null && !props.hideAuthor ? /* @__PURE__ */ React.createElement("div", { className: "dk-chat-message__head" }, showAuthor ? /* @__PURE__ */ React.createElement("span", { className: "dk-chat-message__author" }, own && props.author == null ? L.chatYou : props.author) : null, props.time != null ? /* @__PURE__ */ React.createElement(RelativeTime, { className: "dk-chat-message__time", date: props.time }) : null) : props.hideAuthor ? /* @__PURE__ */ React.createElement("span", { className: "dk-visually-hidden" }, own ? L.chatYou : props.author) : null, props.reasoning != null ? /* @__PURE__ */ React.createElement("details", { className: "dk-chat-message__reasoning" }, /* @__PURE__ */ React.createElement("summary", { className: "dk-chat-message__reasoning-toggle" }, /* @__PURE__ */ React.createElement(Icon, { icon: icons.ExpandMore, className: "dk-chat-message__reasoning-icon" }), props.reasoningTime != null && isFinite(time) && time >= 0 ? L.chatThoughtFor(Math.round(time)) : L.chatReasoning), /* @__PURE__ */ React.createElement("div", { className: "dk-chat-message__reasoning-text", dir: "auto" }, props.reasoning)) : null, props.steps && props.steps.length ? /* @__PURE__ */ React.createElement(ChatSteps, { steps: props.steps }) : null, hasText ? /* @__PURE__ */ React.createElement("div", { className: "dk-chat-message__bubble", dir: "auto" }, props.children) : null, count > 1 ? /* @__PURE__ */ React.createElement("div", { className: "dk-chat-message__branches", role: "group", "aria-label": L.chatResponseOf(at, count) }, /* @__PURE__ */ React.createElement(IconButton, { icon: icons.ChevronLeft, label: L.chatPreviousResponse, size: "sm", "aria-disabled": at <= 1 || void 0, onClick: () => go(at - 1) }), /* @__PURE__ */ React.createElement("span", { className: "dk-chat-message__branch", "aria-hidden": true }, num.format(at) + " / " + num.format(count)), /* @__PURE__ */ React.createElement(IconButton, { icon: icons.ChevronRight, label: L.chatNextResponse, size: "sm", "aria-disabled": at >= count || void 0, onClick: () => go(at + 1) })) : null, props.thinking && !hasText ? /* @__PURE__ */ React.createElement(Loader, { variant: "text", size: "sm", delay: 0, label: L.chatThinking, className: "dk-chat-message__thinking" }) : null, props.attachments ? /* @__PURE__ */ React.createElement("div", { className: "dk-chat-message__attachments" }, props.attachments) : null, props.status === "sending" ? /* @__PURE__ */ React.createElement("span", { className: "dk-chat-message__status" }, L.chatSending) : null, failed ? /* @__PURE__ */ React.createElement("span", { className: "dk-chat-message__status dk-chat-message__status--failed" }, /* @__PURE__ */ React.createElement(Icon, { icon: icons.Error }), L.chatNotSent, props.onRetry ? /* @__PURE__ */ React.createElement(Button, { variant: "link", size: "sm", onClick: props.onRetry }, L.chatRetry) : null) : null)
  );
});
var STEP_ICON = { done: icons.CheckCircle, failed: icons.Error };
var ChatSteps = /* @__PURE__ */ component("ChatSteps", function ChatSteps2(props, ref) {
  const L = useSettings(words).labels;
  const rest = omit(props, { steps: 1, children: 1, className: 1 });
  const said = { running: L.chatStepRunning, done: L.chatStepDone, failed: L.chatStepFailed };
  return /* @__PURE__ */ React.createElement("ol", { role: "list", ...rest, ref, className: cn("dk-chat-steps", props.className), "data-component": "chat-steps" }, (props.steps || []).map((step) => {
    const status = step.status === "done" || step.status === "failed" ? step.status : "running";
    return /* @__PURE__ */ React.createElement("li", { key: step.id, className: cn("dk-chat-steps__step", "dk-chat-steps__step--" + status), "data-status": status }, status === "running" ? /* @__PURE__ */ React.createElement(Loader, { size: "sm", delay: 0, label: "", className: "dk-chat-steps__icon" }) : /* @__PURE__ */ React.createElement(Icon, { icon: STEP_ICON[status], className: "dk-chat-steps__icon" }), /* @__PURE__ */ React.createElement("span", { className: "dk-chat-steps__text" }, /* @__PURE__ */ React.createElement("span", { className: "dk-chat-steps__label" }, step.label, /* @__PURE__ */ React.createElement("span", { className: "dk-visually-hidden" }, ", " + said[status])), step.detail != null ? /* @__PURE__ */ React.createElement("span", { className: "dk-chat-steps__detail" }, step.detail) : null));
  }));
});
var ChatApproval = /* @__PURE__ */ component("ChatApproval", function ChatApproval2(props, ref) {
  const L = useSettings(words).labels;
  const rest = omit(props, { children: 1, detail: 1, status: 1, onApprove: 1, onDeny: 1, className: 1 });
  const status = props.status === "approved" || props.status === "denied" ? props.status : "pending";
  const titleId = domId("dk-chat-approval", React.useId());
  const node = React.useRef(null);
  const pressed = React.useRef(false), was = React.useRef(status);
  const own = useMergedRef(ref, (el) => {
    node.current = el;
  });
  React.useEffect(function() {
    if (was.current === status) return;
    was.current = status;
    const el = node.current;
    if (status === "pending" || !el) return;
    announce(el.textContent);
    if (pressed.current) el.focus();
    pressed.current = false;
  }, [status]);
  const answer = (fn) => () => {
    pressed.current = true;
    if (fn) fn();
  };
  if (status !== "pending") return /* @__PURE__ */ React.createElement("div", { ...rest, ref: own, tabIndex: -1, className: cn("dk-chat-approval", "dk-chat-approval--" + status, props.className), "data-component": "chat-approval", "data-status": status }, /* @__PURE__ */ React.createElement(Icon, { icon: status === "approved" ? icons.CheckCircle : icons.Close, className: "dk-chat-approval__icon" }), /* @__PURE__ */ React.createElement("span", null, (status === "approved" ? L.chatApproved : L.chatDenied) + ": ", props.children));
  return /* @__PURE__ */ React.createElement("div", { ...rest, ref: own, role: "group", "aria-labelledby": titleId, className: cn("dk-chat-approval", props.className), "data-component": "chat-approval", "data-status": status }, /* @__PURE__ */ React.createElement("div", { className: "dk-chat-approval__title", id: titleId, dir: "auto" }, props.children), props.detail != null ? /* @__PURE__ */ React.createElement("div", { className: "dk-chat-approval__detail", dir: "auto" }, props.detail) : null, /* @__PURE__ */ React.createElement("div", { className: "dk-chat-approval__actions" }, /* @__PURE__ */ React.createElement(Button, { size: "sm", variant: "primary", onClick: answer(props.onApprove) }, L.chatApprove), /* @__PURE__ */ React.createElement(Button, { size: "sm", variant: "secondary", onClick: answer(props.onDeny) }, L.chatDeny)));
});
var ChatCitation = /* @__PURE__ */ component("ChatCitation", function ChatCitation2(props, ref) {
  const rest = omit(props, { index: 1, children: 1, className: 1 });
  const num = new Intl.NumberFormat(useLocale());
  let host = "";
  try {
    host = new URL(props.href, "https://localhost").host.replace(/^www\./, "");
  } catch {
    host = props.href;
  }
  return /* @__PURE__ */ React.createElement("a", { ...rest, ref, className: cn("dk-chat-citation", props.className), "data-component": "chat-citation" }, /* @__PURE__ */ React.createElement("span", { className: "dk-chat-citation__index" }, num.format(props.index)), /* @__PURE__ */ React.createElement("span", { className: "dk-chat-citation__source", dir: "auto" }, props.children != null ? props.children : host));
});
var DAY = 864e5;
var dayStart = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
var subscribeDay = (cb) => {
  let t;
  const next = () => {
    const n = /* @__PURE__ */ new Date();
    t = setTimeout(() => {
      cb();
      next();
    }, new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1).getTime() + 1e3 - n.getTime());
  };
  next();
  return () => clearTimeout(t);
};
var getDay = () => dayStart(/* @__PURE__ */ new Date());
var getServerDay = () => null;
var ChatDivider = /* @__PURE__ */ component("ChatDivider", function ChatDivider2(props, ref) {
  const locale = useLocale();
  const rest = omit(props, { date: 1, children: 1, className: 1 });
  const today = React.useSyncExternalStore(subscribeDay, getDay, getServerDay);
  let text = props.children;
  if (text == null && props.date != null) {
    const d = new Date(props.date), days = today == null ? NaN : Math.round((dayStart(d) - today) / DAY);
    if (!isFinite(d.getTime())) text = "";
    else if (today == null) text = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: "UTC" }).format(d);
    else if (Math.abs(days) <= 1) {
      const word = new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(days, "day");
      text = word.charAt(0).toLocaleUpperCase(locale) + word.slice(1);
    } else text = new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(d);
  }
  return /* @__PURE__ */ React.createElement("div", { ...rest, ref, className: cn("dk-chat-divider", props.className), "data-component": "chat-divider" }, /* @__PURE__ */ React.createElement("span", { className: "dk-chat-divider__text" }, text));
});
var ChatComposer = /* @__PURE__ */ component("ChatComposer", function ChatComposer2(props, ref) {
  const sds = useSettings(words), L = sds.labels;
  const rest = omit(props, { value: 1, defaultValue: 1, onValueChange: 1, onSend: 1, streaming: 1, onStop: 1, placeholder: 1, disabled: 1, attachments: 1, actions: 1, maxRows: 1, className: 1, "aria-label": 1 });
  const controlled = props.value !== void 0;
  const [own, setOwn] = React.useState(props.defaultValue || "");
  const value = controlled ? props.value : own;
  const field = React.useRef(null);
  const disabled = !!props.disabled;
  const set = (v) => {
    if (!controlled) setOwn(v);
    if (props.onValueChange) props.onValueChange(v);
  };
  const empty = !value.trim();
  const send = () => {
    if (disabled || empty || props.streaming) return;
    if (props.onSend) props.onSend(value);
    if (!controlled) setOwn("");
    if (field.current) field.current.focus();
  };
  return /* @__PURE__ */ React.createElement(
    "form",
    {
      ...rest,
      ref,
      className: cn("dk-chat-composer", props.className),
      "data-component": "chat-composer",
      onSubmit: (e) => {
        e.preventDefault();
        send();
      }
    },
    props.attachments ? /* @__PURE__ */ React.createElement("div", { className: "dk-chat-composer__attachments" }, props.attachments) : null,
    /* @__PURE__ */ React.createElement("div", { className: "dk-chat-composer__row" }, /* @__PURE__ */ React.createElement(
      Textarea,
      {
        ref: field,
        className: "dk-chat-composer__field",
        rows: 1,
        autoResize: true,
        maxRows: props.maxRows ?? 6,
        resize: "none",
        "aria-label": props["aria-label"] || L.chatMessage,
        placeholder: props.placeholder,
        disabled,
        value,
        onChange: (e) => set(e.target.value),
        onKeyDown: (e) => {
          if (e.key === "Enter" && !e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey && !isComposing(e)) {
            e.preventDefault();
            send();
          }
        }
      }
    ), props.actions, props.streaming && props.onStop ? /* @__PURE__ */ React.createElement(IconButton, { icon: icons.Stop, label: L.chatStop, variant: "secondary", disabled, onClick: props.onStop }) : /* @__PURE__ */ React.createElement(IconButton, { type: "submit", icon: icons.Send, label: L.chatSend, variant: "primary", disabled, "aria-disabled": empty || props.streaming || void 0 }))
  );
});
export {
  Chat,
  ChatApproval,
  ChatCitation,
  ChatComposer,
  ChatDivider,
  ChatMessage,
  ChatSteps
};
//# sourceMappingURL=Chat.js.map
