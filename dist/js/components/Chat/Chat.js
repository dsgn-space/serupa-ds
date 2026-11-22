"use client";

// src/components/Chat/Chat.tsx
import { c as _c } from "../../internal/memoCache.js";
import { dateFormat, numberFormat, relativeFormat } from "../../internal/intl.js";
import * as React from "react";
import { cn, domId, omit, useMergedRef } from "../../internal/cn.js";
import { announce } from "../../internal/announce.js";
import { named } from "../../internal/component.js";
import { useLocale, useSettings } from "../../internal/provider.js";
import { displayNumber } from "../../internal/numbers.js";
import { isComposing } from "../../internal/ime.js";
import { activeIn } from "../../internal/root.js";
import { Button } from "../Button/Button.js";
import { IconButton } from "../IconButton/IconButton.js";
import { Tooltip } from "../Tooltip/Tooltip.js";
import { ToggleButton } from "../ToggleButton/ToggleButton.js";
import { CopyButton } from "../CopyButton/CopyButton.js";
import { Loader } from "../Loader/Loader.js";
import { Icon } from "../Icon/Icon.js";
import { RelativeTime } from "../RelativeTime/RelativeTime.js";
import { Textarea } from "../Textarea/Textarea.js";
import * as icons from "../../material/builtin.js";
import { en as ownWords } from "./labels.js";
import { useControllable } from "../../internal/controllable.js";
var words = /* @__PURE__ */ Object.assign({}, ownWords);
var SCROLL_STOP = {
  tabIndex: 0
};
var NEAR = 4;
var atBottom = (el) => el.scrollHeight - el.scrollTop - el.clientHeight <= NEAR;
var toEnd = (el) => {
  el.scrollTop = el.scrollHeight;
};
function ChatRender(t0) {
  const $ = _c(49);
  const {
    ref,
    ...props
  } = t0;
  const sds = useSettings(words);
  const L = sds.labels;
  const locale = useLocale();
  const rest = omit(props, {
    children: 1,
    hasOlder: 1,
    onLoadOlder: 1,
    loadingOlder: 1,
    className: 1,
    "aria-label": 1,
    "aria-labelledby": 1
  });
  const scroller = React.useRef(null);
  const items = React.Children.toArray(props.children).filter(React.isValidElement);
  const keys = items.map(_temp);
  const messages = items.filter(_temp2).length;
  const was = React.useRef(null);
  const [unread, setUnread] = React.useState(0);
  let t1;
  if ($[0] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t1 = () => {
      const el = scroller.current;
      if (el) {
        toEnd(el);
      }
    };
    $[0] = t1;
  } else {
    t1 = $[0];
  }
  const toBottom = t1;
  const first = keys[0] || "";
  const last = keys[keys.length - 1] || "";
  const all = "\n" + keys.join("\n") + "\n";
  let t2;
  if ($[1] !== all || $[2] !== first || $[3] !== last || $[4] !== messages || $[5] !== setUnread) {
    t2 = () => {
      const el_0 = scroller.current;
      if (!el_0) {
        return;
      }
      const before = was.current;
      if (!before) {
        toEnd(el_0);
      } else {
        if (first !== before.first && last === before.last && all.includes("\n" + before.first + "\n")) {
          el_0.scrollTop = before.top + (el_0.scrollHeight - before.height);
        } else {
          if (last !== before.last) {
            if (before.bottom) {
              toEnd(el_0);
            } else {
              if (messages > before.messages) {
                setUnread((n) => n + messages - before.messages);
              }
            }
          }
        }
      }
      was.current = {
        bottom: atBottom(el_0),
        first,
        last,
        height: el_0.scrollHeight,
        top: el_0.scrollTop,
        messages
      };
    };
    $[1] = all;
    $[2] = first;
    $[3] = last;
    $[4] = messages;
    $[5] = setUnread;
    $[6] = t2;
  } else {
    t2 = $[6];
  }
  let t3;
  if ($[7] !== all || $[8] !== first || $[9] !== last || $[10] !== messages) {
    t3 = [all, first, last, messages];
    $[7] = all;
    $[8] = first;
    $[9] = last;
    $[10] = messages;
    $[11] = t3;
  } else {
    t3 = $[11];
  }
  React.useLayoutEffect(t2, t3);
  const asked = React.useRef(null);
  const older = React.useRef(null);
  let t4;
  let t5;
  if ($[12] !== first || $[13] !== props.hasOlder || $[14] !== props.loadingOlder) {
    t4 = () => {
      const el_1 = scroller.current;
      if (asked.current == null || !el_1 || props.loadingOlder || first === asked.current && props.hasOlder) {
        return;
      }
      asked.current = null;
      const active = activeIn(el_1);
      if (!active || active === el_1.ownerDocument.body || older.current && older.current.contains(active)) {
        el_1.focus({
          preventScroll: true
        });
      }
    };
    t5 = [first, props.hasOlder, props.loadingOlder];
    $[12] = first;
    $[13] = props.hasOlder;
    $[14] = props.loadingOlder;
    $[15] = t4;
    $[16] = t5;
  } else {
    t4 = $[15];
    t5 = $[16];
  }
  React.useLayoutEffect(t4, t5);
  let t6;
  if ($[17] !== toBottom) {
    t6 = () => {
      const el_2 = scroller.current;
      if (!el_2 || typeof ResizeObserver === "undefined") {
        return;
      }
      const ro = new ResizeObserver(() => {
        if (was.current && was.current.bottom) {
          toBottom();
        }
      });
      for (const c_1 of Array.from(el_2.children)) {
        ro.observe(c_1);
      }
      const mo = typeof MutationObserver === "undefined" ? null : new MutationObserver((records) => {
        for (const r of records) {
          r.addedNodes.forEach((n_0) => {
            if (n_0.nodeType === 1) {
              ro.observe(n_0);
            }
          });
          r.removedNodes.forEach((n_1) => {
            if (n_1.nodeType === 1) {
              ro.unobserve(n_1);
            }
          });
        }
      });
      if (mo) {
        mo.observe(el_2, {
          childList: true
        });
      }
      return () => {
        ro.disconnect();
        if (mo) {
          mo.disconnect();
        }
      };
    };
    $[17] = toBottom;
    $[18] = t6;
  } else {
    t6 = $[18];
  }
  let t7;
  if ($[19] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t7 = [];
    $[19] = t7;
  } else {
    t7 = $[19];
  }
  React.useEffect(t6, t7);
  let t8;
  if ($[20] !== setUnread || $[21] !== unread) {
    t8 = (e) => {
      const el_3 = e.currentTarget;
      const bottom = atBottom(el_3);
      if (was.current) {
        was.current = {
          ...was.current,
          bottom,
          top: el_3.scrollTop,
          height: el_3.scrollHeight
        };
      }
      if (bottom && unread) {
        setUnread(0);
      }
    };
    $[20] = setUnread;
    $[21] = unread;
    $[22] = t8;
  } else {
    t8 = $[22];
  }
  const onScroll = t8;
  let t9;
  if ($[23] !== setUnread || $[24] !== toBottom) {
    t9 = () => {
      const el_4 = scroller.current;
      toBottom();
      setUnread(0);
      if (el_4) {
        el_4.focus({
          preventScroll: true
        });
      }
    };
    $[23] = setUnread;
    $[24] = toBottom;
    $[25] = t9;
  } else {
    t9 = $[25];
  }
  const jump = t9;
  let t10;
  if ($[26] !== props.className) {
    t10 = cn("srp-chat", props.className);
    $[26] = props.className;
    $[27] = t10;
  } else {
    t10 = $[27];
  }
  const t11 = props["aria-label"];
  const t12 = props["aria-labelledby"];
  let t13;
  if ($[28] !== L || $[29] !== first || $[30] !== props) {
    t13 = props.hasOlder ? /* @__PURE__ */ React.createElement("div", { className: "srp-chat__older", ref: older }, /* @__PURE__ */ React.createElement(Button, { variant: "ghost", size: "sm", loading: !!props.loadingOlder, onClick: () => {
      if (!props.loadingOlder && props.onLoadOlder) {
        asked.current = first;
        props.onLoadOlder();
      }
    } }, props.loadingOlder ? L.chatLoadingOlder : L.chatLoadOlder)) : null;
    $[28] = L;
    $[29] = first;
    $[30] = props;
    $[31] = t13;
  } else {
    t13 = $[31];
  }
  let t14;
  if ($[32] !== onScroll || $[33] !== props.children || $[34] !== t11 || $[35] !== t12 || $[36] !== t13) {
    t14 = /* @__PURE__ */ React.createElement("div", { ref: scroller, className: "srp-chat__log", role: "log", ...SCROLL_STOP, "aria-label": t11, "aria-labelledby": t12, onScroll }, t13, props.children);
    $[32] = onScroll;
    $[33] = props.children;
    $[34] = t11;
    $[35] = t12;
    $[36] = t13;
    $[37] = t14;
  } else {
    t14 = $[37];
  }
  let t15;
  if ($[38] !== L || $[39] !== jump || $[40] !== locale || $[41] !== unread) {
    t15 = unread ? /* @__PURE__ */ React.createElement(Button, { className: "srp-chat__jump", variant: "secondary", size: "sm", endIcon: /* @__PURE__ */ React.createElement(Icon, { icon: icons.ArrowDownward }), onClick: jump }, L.chatNewMessages(unread, displayNumber(unread, locale))) : null;
    $[38] = L;
    $[39] = jump;
    $[40] = locale;
    $[41] = unread;
    $[42] = t15;
  } else {
    t15 = $[42];
  }
  let t16;
  if ($[43] !== ref || $[44] !== rest || $[45] !== t10 || $[46] !== t14 || $[47] !== t15) {
    t16 = /* @__PURE__ */ React.createElement("div", { ...rest, ref, className: t10, "data-component": "chat" }, t14, t15);
    $[43] = ref;
    $[44] = rest;
    $[45] = t10;
    $[46] = t14;
    $[47] = t15;
    $[48] = t16;
  } else {
    t16 = $[48];
  }
  return t16;
}
function _temp2(c_0) {
  return c_0.type === ChatMessage;
}
function _temp(c) {
  return String(c.key);
}
var Chat = /* @__PURE__ */ named("Chat", ChatRender);
var TIME_OF_DAY = {
  timeStyle: "short"
};
function ChatMessageRender(t0) {
  const $ = _c(49);
  const {
    ref,
    ...props
  } = t0;
  const sds = useSettings(words);
  const L = sds.labels;
  const rest = omit(props, {
    children: 1,
    author: 1,
    avatar: 1,
    time: 1,
    own: 1,
    hideAuthor: 1,
    status: 1,
    onRetry: 1,
    attachments: 1,
    streaming: 1,
    thinking: 1,
    reasoning: 1,
    reasoningTime: 1,
    steps: 1,
    branch: 1,
    branches: 1,
    onBranchChange: 1,
    className: 1
  });
  const own = !!props.own;
  const failed = props.status === "failed";
  const hasText = props.children != null && props.children !== "";
  const time = Number(props.reasoningTime);
  const showAuthor = !props.hideAuthor && (props.author != null || own);
  const count = Math.floor(Number(props.branches)) || 0;
  const at = Math.min(Math.max(Math.floor(Number(props.branch)) || 1, 1), count);
  const num = numberFormat(useLocale());
  const go = (to) => {
    if (to < 1 || to > count || !props.onBranchChange) {
      return;
    }
    props.onBranchChange(to);
    announce(L.chatResponseOf(to, count));
  };
  const t1 = cn("srp-chat-message", own && "srp-chat-message--own", failed && "srp-chat-message--failed", props.hideAuthor && "srp-chat-message--follow", props.className);
  const t2 = "chat-message";
  const t3 = props.streaming || void 0;
  const t4 = props.hideAuthor ? null : props.avatar;
  let t5;
  if ($[0] !== t4) {
    t5 = /* @__PURE__ */ React.createElement("span", { className: "srp-chat-message__avatar", "aria-hidden": true }, t4);
    $[0] = t4;
    $[1] = t5;
  } else {
    t5 = $[1];
  }
  const t6 = "srp-chat-message__main";
  let t7;
  if ($[2] !== L || $[3] !== own || $[4] !== props.author || $[5] !== props.hideAuthor || $[6] !== props.time || $[7] !== showAuthor) {
    t7 = showAuthor || props.time != null && !props.hideAuthor ? /* @__PURE__ */ React.createElement("div", { className: "srp-chat-message__head" }, showAuthor ? /* @__PURE__ */ React.createElement("span", { className: "srp-chat-message__author" }, own && props.author == null ? L.chatYou : props.author) : null, props.time != null ? /* @__PURE__ */ React.createElement(RelativeTime, { className: "srp-chat-message__time", date: props.time, absoluteAfter: 1, absoluteFormat: TIME_OF_DAY }) : null) : props.hideAuthor ? /* @__PURE__ */ React.createElement("span", { className: "srp-visually-hidden" }, own ? L.chatYou : props.author) : null;
    $[2] = L;
    $[3] = own;
    $[4] = props.author;
    $[5] = props.hideAuthor;
    $[6] = props.time;
    $[7] = showAuthor;
    $[8] = t7;
  } else {
    t7 = $[8];
  }
  let t8;
  if ($[9] !== L || $[10] !== props.reasoning || $[11] !== props.reasoningTime || $[12] !== time) {
    t8 = props.reasoning != null ? /* @__PURE__ */ React.createElement("details", { className: "srp-chat-message__reasoning" }, /* @__PURE__ */ React.createElement("summary", { className: "srp-chat-message__reasoning-toggle" }, /* @__PURE__ */ React.createElement(Icon, { icon: icons.ExpandMore, className: "srp-chat-message__reasoning-icon" }), props.reasoningTime != null && isFinite(time) && time >= 0 ? L.chatThoughtFor(Math.round(time)) : L.chatReasoning), /* @__PURE__ */ React.createElement("div", { className: "srp-chat-message__reasoning-text", dir: "auto" }, props.reasoning)) : null;
    $[9] = L;
    $[10] = props.reasoning;
    $[11] = props.reasoningTime;
    $[12] = time;
    $[13] = t8;
  } else {
    t8 = $[13];
  }
  let t9;
  if ($[14] !== props.steps) {
    t9 = props.steps && props.steps.length ? /* @__PURE__ */ React.createElement(ChatSteps, { steps: props.steps }) : null;
    $[14] = props.steps;
    $[15] = t9;
  } else {
    t9 = $[15];
  }
  let t10;
  if ($[16] !== hasText || $[17] !== props.children) {
    t10 = hasText ? /* @__PURE__ */ React.createElement("div", { className: "srp-chat-message__bubble", dir: "auto" }, props.children) : null;
    $[16] = hasText;
    $[17] = props.children;
    $[18] = t10;
  } else {
    t10 = $[18];
  }
  const t11 = count > 1 ? /* @__PURE__ */ React.createElement("div", { className: "srp-chat-message__branches", role: "group", "aria-label": L.chatResponseOf(at, count) }, /* @__PURE__ */ React.createElement(IconButton, { icon: icons.ChevronLeft, label: L.chatPreviousResponse, size: "sm", "aria-disabled": at <= 1 || void 0, onClick: () => go(at - 1) }), /* @__PURE__ */ React.createElement("span", { className: "srp-chat-message__branch", "aria-hidden": true }, num.format(at) + " / " + num.format(count)), /* @__PURE__ */ React.createElement(IconButton, { icon: icons.ChevronRight, label: L.chatNextResponse, size: "sm", "aria-disabled": at >= count || void 0, onClick: () => go(at + 1) })) : null;
  let t12;
  if ($[19] !== L || $[20] !== hasText || $[21] !== props.thinking) {
    t12 = props.thinking && !hasText ? /* @__PURE__ */ React.createElement(Loader, { variant: "text", size: "sm", delay: 0, label: L.chatThinking, className: "srp-chat-message__thinking" }) : null;
    $[19] = L;
    $[20] = hasText;
    $[21] = props.thinking;
    $[22] = t12;
  } else {
    t12 = $[22];
  }
  let t13;
  if ($[23] !== props.attachments) {
    t13 = props.attachments ? /* @__PURE__ */ React.createElement("div", { className: "srp-chat-message__attachments" }, props.attachments) : null;
    $[23] = props.attachments;
    $[24] = t13;
  } else {
    t13 = $[24];
  }
  let t14;
  if ($[25] !== L || $[26] !== props.status) {
    t14 = props.status === "sending" ? /* @__PURE__ */ React.createElement("span", { className: "srp-chat-message__status" }, L.chatSending) : null;
    $[25] = L;
    $[26] = props.status;
    $[27] = t14;
  } else {
    t14 = $[27];
  }
  let t15;
  if ($[28] !== L || $[29] !== failed || $[30] !== props.onRetry) {
    t15 = failed ? /* @__PURE__ */ React.createElement("span", { className: "srp-chat-message__status srp-chat-message__status--failed" }, /* @__PURE__ */ React.createElement(Icon, { icon: icons.Error }), L.chatNotSent, props.onRetry ? /* @__PURE__ */ React.createElement(Button, { variant: "link", size: "sm", onClick: props.onRetry }, L.chatRetry) : null) : null;
    $[28] = L;
    $[29] = failed;
    $[30] = props.onRetry;
    $[31] = t15;
  } else {
    t15 = $[31];
  }
  let t16;
  if ($[32] !== t10 || $[33] !== t11 || $[34] !== t12 || $[35] !== t13 || $[36] !== t14 || $[37] !== t15 || $[38] !== t7 || $[39] !== t8 || $[40] !== t9) {
    t16 = /* @__PURE__ */ React.createElement("div", { className: t6 }, t7, t8, t9, t10, t11, t12, t13, t14, t15);
    $[32] = t10;
    $[33] = t11;
    $[34] = t12;
    $[35] = t13;
    $[36] = t14;
    $[37] = t15;
    $[38] = t7;
    $[39] = t8;
    $[40] = t9;
    $[41] = t16;
  } else {
    t16 = $[41];
  }
  let t17;
  if ($[42] !== ref || $[43] !== rest || $[44] !== t1 || $[45] !== t16 || $[46] !== t3 || $[47] !== t5) {
    t17 = /* @__PURE__ */ React.createElement("div", { ...rest, ref, className: t1, "data-component": t2, "aria-busy": t3 }, t5, t16);
    $[42] = ref;
    $[43] = rest;
    $[44] = t1;
    $[45] = t16;
    $[46] = t3;
    $[47] = t5;
    $[48] = t17;
  } else {
    t17 = $[48];
  }
  return t17;
}
var ChatMessage = /* @__PURE__ */ named("ChatMessage", ChatMessageRender);
var STEP_ICON = {
  done: icons.CheckCircle,
  failed: icons.Error
};
function ChatStepsRender(t0) {
  const $ = _c(11);
  const {
    ref,
    ...props
  } = t0;
  const L = useSettings(words).labels;
  const rest = omit(props, {
    steps: 1,
    children: 1,
    className: 1
  });
  let t1;
  if ($[0] !== L.chatStepDone || $[1] !== L.chatStepFailed || $[2] !== L.chatStepRunning) {
    t1 = {
      running: L.chatStepRunning,
      done: L.chatStepDone,
      failed: L.chatStepFailed
    };
    $[0] = L.chatStepDone;
    $[1] = L.chatStepFailed;
    $[2] = L.chatStepRunning;
    $[3] = t1;
  } else {
    t1 = $[3];
  }
  const said = t1;
  const t2 = "list";
  const t3 = cn("srp-chat-steps", props.className);
  const t4 = "chat-steps";
  let t5;
  if ($[4] !== said) {
    t5 = (step) => {
      const status = step.status === "done" || step.status === "failed" ? step.status : "running";
      return /* @__PURE__ */ React.createElement("li", { key: step.id, className: cn("srp-chat-steps__step", "srp-chat-steps__step--" + status), "data-status": status }, status === "running" ? /* @__PURE__ */ React.createElement(Loader, { size: "sm", delay: 0, label: "", className: "srp-chat-steps__icon" }) : /* @__PURE__ */ React.createElement(Icon, { icon: STEP_ICON[status], className: "srp-chat-steps__icon" }), /* @__PURE__ */ React.createElement("span", { className: "srp-chat-steps__text" }, /* @__PURE__ */ React.createElement("span", { className: "srp-chat-steps__label" }, step.label, /* @__PURE__ */ React.createElement("span", { className: "srp-visually-hidden" }, ", " + said[status])), step.detail != null ? /* @__PURE__ */ React.createElement("span", { className: "srp-chat-steps__detail" }, step.detail) : null));
    };
    $[4] = said;
    $[5] = t5;
  } else {
    t5 = $[5];
  }
  const t6 = (props.steps || []).map(t5);
  let t7;
  if ($[6] !== ref || $[7] !== rest || $[8] !== t3 || $[9] !== t6) {
    t7 = /* @__PURE__ */ React.createElement("ol", { role: t2, ...rest, ref, className: t3, "data-component": t4 }, t6);
    $[6] = ref;
    $[7] = rest;
    $[8] = t3;
    $[9] = t6;
    $[10] = t7;
  } else {
    t7 = $[10];
  }
  return t7;
}
var ChatSteps = /* @__PURE__ */ named("ChatSteps", ChatStepsRender);
function ChatApprovalRender(t0) {
  const $ = _c(14);
  const {
    ref,
    ...props
  } = t0;
  const L = useSettings(words).labels;
  const rest = omit(props, {
    children: 1,
    detail: 1,
    status: 1,
    onApprove: 1,
    onDeny: 1,
    className: 1
  });
  const status = props.status === "approved" || props.status === "denied" ? props.status : "pending";
  const t1 = React.useId();
  let t2;
  if ($[0] !== t1) {
    t2 = domId("srp-chat-approval", t1);
    $[0] = t1;
    $[1] = t2;
  } else {
    t2 = $[1];
  }
  const titleId = t2;
  const node = React.useRef(null);
  const pressed = React.useRef(false);
  const was = React.useRef(status);
  let t3;
  if ($[2] === /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel")) {
    t3 = (el) => {
      node.current = el;
    };
    $[2] = t3;
  } else {
    t3 = $[2];
  }
  const own = useMergedRef(ref, t3);
  React.useEffect(function() {
    if (was.current === status) {
      return;
    }
    was.current = status;
    const el_0 = node.current;
    if (status === "pending" || !el_0) {
      return;
    }
    announce(el_0.textContent);
    if (pressed.current) {
      el_0.focus();
    }
    pressed.current = false;
  }, [status]);
  const answer = (fn) => () => {
    pressed.current = true;
    if (fn) {
      fn();
    }
  };
  if (status !== "pending") {
    const t42 = status === "approved" ? icons.CheckCircle : icons.Close;
    let t52;
    if ($[3] !== t42) {
      t52 = /* @__PURE__ */ React.createElement(Icon, { icon: t42, className: "srp-chat-approval__icon" });
      $[3] = t42;
      $[4] = t52;
    } else {
      t52 = $[4];
    }
    return /* @__PURE__ */ React.createElement("div", { ...rest, ref: own, tabIndex: -1, className: cn("srp-chat-approval", "srp-chat-approval--" + status, props.className), "data-component": "chat-approval", "data-status": status }, t52, /* @__PURE__ */ React.createElement("span", null, (status === "approved" ? L.chatApproved : L.chatDenied) + ": ", props.children));
  }
  const t4 = cn("srp-chat-approval", props.className);
  let t5;
  if ($[5] !== props || $[6] !== titleId) {
    t5 = /* @__PURE__ */ React.createElement("div", { className: "srp-chat-approval__title", id: titleId, dir: "auto" }, props.children);
    $[5] = props;
    $[6] = titleId;
    $[7] = t5;
  } else {
    t5 = $[7];
  }
  let t6;
  if ($[8] !== props) {
    t6 = props.detail != null ? /* @__PURE__ */ React.createElement("div", { className: "srp-chat-approval__detail", dir: "auto" }, props.detail) : null;
    $[8] = props;
    $[9] = t6;
  } else {
    t6 = $[9];
  }
  const T0 = Button;
  const t7 = "sm";
  const t8 = "secondary";
  const t9 = answer(props.onDeny);
  let t10;
  if ($[10] !== L.chatDeny || $[11] !== T0 || $[12] !== t9) {
    t10 = /* @__PURE__ */ React.createElement(T0, { size: t7, variant: t8, onClick: t9 }, L.chatDeny);
    $[10] = L.chatDeny;
    $[11] = T0;
    $[12] = t9;
    $[13] = t10;
  } else {
    t10 = $[13];
  }
  return /* @__PURE__ */ React.createElement("div", { ...rest, ref: own, role: "group", "aria-labelledby": titleId, className: t4, "data-component": "chat-approval", "data-status": status }, t5, t6, /* @__PURE__ */ React.createElement("div", { className: "srp-chat-approval__actions" }, /* @__PURE__ */ React.createElement(Button, { size: "sm", variant: "primary", onClick: answer(props.onApprove) }, L.chatApprove), t10));
}
var ChatApproval = /* @__PURE__ */ named("ChatApproval", ChatApprovalRender);
function ChatReplyActionsRender(t0) {
  const $ = _c(8);
  const {
    ref,
    ...props
  } = t0;
  const L = useSettings(words).labels;
  const rest = omit(props, {
    copyText: 1,
    onRegenerate: 1,
    feedback: 1,
    onFeedback: 1,
    className: 1
  });
  const now = props.feedback === "good" || props.feedback === "bad" ? props.feedback : null;
  const rate = (to) => () => {
    const next = now === to ? null : to;
    if (props.onFeedback) {
      props.onFeedback(next);
    }
    announce(next ? L.chatFeedbackNoted : L.chatFeedbackRemoved);
  };
  const t1 = "group";
  const t2 = rest["aria-label"] || L.chatReplyActions;
  const t3 = cn("srp-chat-reply-actions", props.className);
  const t4 = "chat-reply-actions";
  const t5 = props.copyText != null ? /* @__PURE__ */ React.createElement(CopyButton, { value: props.copyText, iconOnly: true, variant: "ghost", size: "sm" }, L.copy) : null;
  const t6 = props.onRegenerate ? /* @__PURE__ */ React.createElement(IconButton, { icon: icons.Refresh, label: L.chatRegenerate, size: "sm", onClick: props.onRegenerate }) : null;
  const t7 = props.onFeedback ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Tooltip, { content: L.chatHelpful, role: "label" }, /* @__PURE__ */ React.createElement(ToggleButton, { variant: "ghost", size: "sm", icon: icons.ThumbUp, "aria-label": L.chatHelpful, pressed: now === "good", onClick: rate("good") })), /* @__PURE__ */ React.createElement(Tooltip, { content: L.chatNotHelpful, role: "label" }, /* @__PURE__ */ React.createElement(ToggleButton, { variant: "ghost", size: "sm", icon: icons.ThumbDown, "aria-label": L.chatNotHelpful, pressed: now === "bad", onClick: rate("bad") }))) : null;
  let t8;
  if ($[0] !== ref || $[1] !== rest || $[2] !== t2 || $[3] !== t3 || $[4] !== t5 || $[5] !== t6 || $[6] !== t7) {
    t8 = /* @__PURE__ */ React.createElement("div", { ...rest, ref, role: t1, "aria-label": t2, className: t3, "data-component": t4 }, t5, t6, t7);
    $[0] = ref;
    $[1] = rest;
    $[2] = t2;
    $[3] = t3;
    $[4] = t5;
    $[5] = t6;
    $[6] = t7;
    $[7] = t8;
  } else {
    t8 = $[7];
  }
  return t8;
}
var ChatReplyActions = /* @__PURE__ */ named("ChatReplyActions", ChatReplyActionsRender);
function ChatCitationRender(t0) {
  const $ = _c(10);
  const {
    ref,
    ...props
  } = t0;
  const rest = omit(props, {
    index: 1,
    children: 1,
    className: 1
  });
  const num = numberFormat(useLocale());
  let host;
  try {
    host = new URL(props.href, "https://localhost").host.replace(/^www\./, "");
  } catch {
    host = props.href;
  }
  const t1 = cn("srp-chat-citation", props.className);
  const t2 = "chat-citation";
  const t3 = "srp-chat-citation__index";
  const t4 = num.format(props.index);
  let t5;
  if ($[0] !== t4) {
    t5 = /* @__PURE__ */ React.createElement("span", { className: t3 }, t4);
    $[0] = t4;
    $[1] = t5;
  } else {
    t5 = $[1];
  }
  const t6 = props.children != null ? props.children : host;
  let t7;
  if ($[2] !== t6) {
    t7 = /* @__PURE__ */ React.createElement("span", { className: "srp-chat-citation__source", dir: "auto" }, t6);
    $[2] = t6;
    $[3] = t7;
  } else {
    t7 = $[3];
  }
  let t8;
  if ($[4] !== ref || $[5] !== rest || $[6] !== t1 || $[7] !== t5 || $[8] !== t7) {
    t8 = /* @__PURE__ */ React.createElement("a", { ...rest, ref, className: t1, "data-component": t2 }, t5, t7);
    $[4] = ref;
    $[5] = rest;
    $[6] = t1;
    $[7] = t5;
    $[8] = t7;
    $[9] = t8;
  } else {
    t8 = $[9];
  }
  return t8;
}
var ChatCitation = /* @__PURE__ */ named("ChatCitation", ChatCitationRender);
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
function ChatDividerRender(t0) {
  const $ = _c(7);
  const {
    ref,
    ...props
  } = t0;
  const locale = useLocale();
  const rest = omit(props, {
    date: 1,
    children: 1,
    className: 1
  });
  const today = React.useSyncExternalStore(subscribeDay, getDay, getServerDay);
  let text = props.children;
  if (text == null && props.date != null) {
    const d = new Date(props.date);
    const days = today == null ? NaN : Math.round((dayStart(d) - today) / DAY);
    if (!isFinite(d.getTime())) {
      text = "";
    } else {
      if (today == null) {
        text = dateFormat(locale, {
          dateStyle: "medium",
          timeZone: "UTC"
        }).format(d);
      } else {
        if (Math.abs(days) <= 1) {
          const word = relativeFormat(locale, {
            numeric: "auto"
          }).format(days, "day");
          text = word.charAt(0).toLocaleUpperCase(locale) + word.slice(1);
        } else {
          text = dateFormat(locale, {
            dateStyle: "medium"
          }).format(d);
        }
      }
    }
  }
  const t1 = cn("srp-chat-divider", props.className);
  let t2;
  if ($[0] !== text) {
    t2 = /* @__PURE__ */ React.createElement("span", { className: "srp-chat-divider__text" }, text);
    $[0] = text;
    $[1] = t2;
  } else {
    t2 = $[1];
  }
  let t3;
  if ($[2] !== ref || $[3] !== rest || $[4] !== t1 || $[5] !== t2) {
    t3 = /* @__PURE__ */ React.createElement("div", { ...rest, ref, className: t1, "data-component": "chat-divider" }, t2);
    $[2] = ref;
    $[3] = rest;
    $[4] = t1;
    $[5] = t2;
    $[6] = t3;
  } else {
    t3 = $[6];
  }
  return t3;
}
var ChatDivider = /* @__PURE__ */ named("ChatDivider", ChatDividerRender);
function ChatComposerRender(t0) {
  const $ = _c(36);
  const {
    ref,
    ...props
  } = t0;
  const sds = useSettings(words);
  const L = sds.labels;
  const rest = omit(props, {
    value: 1,
    defaultValue: 1,
    onValueChange: 1,
    onSend: 1,
    streaming: 1,
    onStop: 1,
    placeholder: 1,
    disabled: 1,
    attachments: 1,
    actions: 1,
    maxRows: 1,
    className: 1,
    "aria-label": 1
  });
  const [value, setOwn, controlled] = useControllable(props.value, props.defaultValue || "", "ChatComposer", "value");
  const field = React.useRef(null);
  const disabled = !!props.disabled;
  const set = (v) => {
    if (!controlled) {
      setOwn(v);
    }
    if (props.onValueChange) {
      props.onValueChange(v);
    }
  };
  let t1;
  if ($[0] !== value) {
    t1 = value.trim();
    $[0] = value;
    $[1] = t1;
  } else {
    t1 = $[1];
  }
  const empty = !t1;
  const send = () => {
    if (disabled || empty || props.streaming) {
      return;
    }
    if (props.onSend) {
      props.onSend(value);
    }
    if (!controlled) {
      setOwn("");
    }
    if (field.current) {
      field.current.focus();
    }
  };
  const t2 = cn("srp-chat-composer", props.className);
  let t3;
  if ($[2] !== send) {
    t3 = (e) => {
      e.preventDefault();
      send();
    };
    $[2] = send;
    $[3] = t3;
  } else {
    t3 = $[3];
  }
  let t4;
  if ($[4] !== props.attachments) {
    t4 = props.attachments ? /* @__PURE__ */ React.createElement("div", { className: "srp-chat-composer__attachments" }, props.attachments) : null;
    $[4] = props.attachments;
    $[5] = t4;
  } else {
    t4 = $[5];
  }
  const t5 = props.maxRows ?? 6;
  const t6 = props["aria-label"] || L.chatMessage;
  let t7;
  if ($[6] !== set) {
    t7 = (e_0) => set(e_0.target.value);
    $[6] = set;
    $[7] = t7;
  } else {
    t7 = $[7];
  }
  let t8;
  if ($[8] !== send) {
    t8 = (e_1) => {
      if (e_1.key === "Enter" && !e_1.shiftKey && !e_1.altKey && !e_1.ctrlKey && !e_1.metaKey && !isComposing(e_1)) {
        e_1.preventDefault();
        send();
      }
    };
    $[8] = send;
    $[9] = t8;
  } else {
    t8 = $[9];
  }
  let t9;
  if ($[10] !== disabled || $[11] !== props.placeholder || $[12] !== t5 || $[13] !== t6 || $[14] !== t7 || $[15] !== t8 || $[16] !== value) {
    t9 = /* @__PURE__ */ React.createElement(Textarea, { ref: field, className: "srp-chat-composer__field", rows: 1, autoResize: true, maxRows: t5, resize: "none", "aria-label": t6, placeholder: props.placeholder, disabled, value, onChange: t7, onKeyDown: t8 });
    $[10] = disabled;
    $[11] = props.placeholder;
    $[12] = t5;
    $[13] = t6;
    $[14] = t7;
    $[15] = t8;
    $[16] = value;
    $[17] = t9;
  } else {
    t9 = $[17];
  }
  let t10;
  if ($[18] !== L.chatSend || $[19] !== L.chatStop || $[20] !== disabled || $[21] !== empty || $[22] !== props.onStop || $[23] !== props.streaming) {
    t10 = props.streaming && props.onStop ? /* @__PURE__ */ React.createElement(IconButton, { icon: icons.Stop, label: L.chatStop, variant: "secondary", disabled, onClick: props.onStop }) : /* @__PURE__ */ React.createElement(IconButton, { type: "submit", icon: icons.Send, label: L.chatSend, variant: "primary", disabled, "aria-disabled": empty || props.streaming || void 0 });
    $[18] = L.chatSend;
    $[19] = L.chatStop;
    $[20] = disabled;
    $[21] = empty;
    $[22] = props.onStop;
    $[23] = props.streaming;
    $[24] = t10;
  } else {
    t10 = $[24];
  }
  let t11;
  if ($[25] !== props.actions || $[26] !== t10 || $[27] !== t9) {
    t11 = /* @__PURE__ */ React.createElement("div", { className: "srp-chat-composer__row" }, t9, props.actions, t10);
    $[25] = props.actions;
    $[26] = t10;
    $[27] = t9;
    $[28] = t11;
  } else {
    t11 = $[28];
  }
  let t12;
  if ($[29] !== ref || $[30] !== rest || $[31] !== t11 || $[32] !== t2 || $[33] !== t3 || $[34] !== t4) {
    t12 = /* @__PURE__ */ React.createElement("form", { ...rest, ref, className: t2, "data-component": "chat-composer", onSubmit: t3 }, t4, t11);
    $[29] = ref;
    $[30] = rest;
    $[31] = t11;
    $[32] = t2;
    $[33] = t3;
    $[34] = t4;
    $[35] = t12;
  } else {
    t12 = $[35];
  }
  return t12;
}
var ChatComposer = /* @__PURE__ */ named("ChatComposer", ChatComposerRender);
export {
  Chat,
  ChatApproval,
  ChatCitation,
  ChatComposer,
  ChatDivider,
  ChatMessage,
  ChatReplyActions,
  ChatSteps
};
//# sourceMappingURL=Chat.js.map
