// src/blocks/CommentThread/CommentThread.tsx
import * as React from "react";
import { Avatar } from "../../components/Avatar/Avatar.js";
import { Button } from "../../components/Button/Button.js";
import { Field } from "../../components/Field/Field.js";
import { Heading } from "../../components/Heading/Heading.js";
import { RelativeTime } from "../../components/RelativeTime/RelativeTime.js";
import { Textarea } from "../../components/Textarea/Textarea.js";
import { toast } from "../../components/Toast/Toast.js";
import { announce } from "../../internal/announce.js";
var english = {
  title: "Comments",
  noComments: "No comments yet. Start the conversation.",
  reply: "Reply",
  replyHint: (max) => `Up to ${max} characters.`,
  post: "Post reply",
  posted: "Reply posted",
  empty: "Write a reply first.",
  edit: "Edit",
  editBox: "Edit comment",
  save: "Save",
  saved: "Comment saved",
  cancel: "Cancel",
  delete: "Delete",
  deleted: "Comment deleted",
  edited: "edited"
};
var thenable = (v) => v != null && typeof v.then === "function";
var settle = (out, done) => {
  if (thenable(out)) out.then(done, () => {
  });
  else done();
};
function CommentThread({ comments, onReply, onEdit, onDelete, maxLength = 1e3, headingLevel = 2, labels }) {
  const l = { ...english, ...labels };
  const id = React.useId();
  const [hidden, setHidden] = React.useState(/* @__PURE__ */ new Set());
  const [editing, setEditing] = React.useState(null);
  const [draft, setDraft] = React.useState("");
  const [reply, setReply] = React.useState("");
  const [error, setError] = React.useState(false);
  const heading = React.useRef(null);
  const shown = comments.filter((c) => !hidden.has(c.id));
  const [busy, setBusy] = React.useState(false);
  const focus = (find) => {
    window.requestAnimationFrame(() => find()?.focus());
  };
  const byId = (elementId) => () => document.getElementById(elementId);
  const article = (cid) => byId(`${id}${cid}-comment`);
  const post = (e) => {
    e.preventDefault();
    if (busy) return;
    if (!reply.trim()) {
      setError(true);
      focus(byId(`${id}-reply`));
      return;
    }
    setError(false);
    const out = onReply(reply.trim());
    setBusy(thenable(out));
    settle(out, () => {
      setReply("");
      announce(l.posted);
    });
    if (thenable(out)) out.then(() => setBusy(false), () => setBusy(false));
  };
  const startEdit = (c) => {
    setEditing(c.id);
    setDraft(c.body);
    focus(byId(`${id}${c.id}-edit`));
  };
  const stopEdit = (cid) => {
    setEditing(null);
    focus(byId(`${id}${cid}-edit-button`));
  };
  const save = (c) => (e) => {
    e.preventDefault();
    if (!draft.trim() || !onEdit) return;
    settle(onEdit(c.id, draft.trim()), () => {
      stopEdit(c.id);
      announce(l.saved);
    });
  };
  const remove = (c) => {
    const at = shown.indexOf(c), next = shown[at + 1] || shown[at - 1];
    setHidden((h) => new Set(h).add(c.id));
    if (next) focus(article(next.id));
    else focus(() => heading.current);
    toast.undo({
      title: l.deleted,
      commit: () => onDelete?.(c.id),
      onUndo: () => {
        setHidden((h) => {
          const n = new Set(h);
          n.delete(c.id);
          return n;
        });
        focus(article(c.id));
      }
    });
  };
  return /* @__PURE__ */ React.createElement("section", { "aria-labelledby": id, className: "flex flex-col gap-4" }, /* @__PURE__ */ React.createElement(Heading, { level: headingLevel, id, ref: heading, tabIndex: -1, className: "outline-none" }, l.title), shown.length === 0 ? /* @__PURE__ */ React.createElement("p", { className: "text-sm text-text-muted" }, l.noComments) : /* @__PURE__ */ React.createElement("ol", { className: "m-0 flex list-none flex-col gap-4 p-0" }, shown.map((c) => /* @__PURE__ */ React.createElement("li", { key: c.id }, /* @__PURE__ */ React.createElement("article", { "aria-labelledby": `${id}${c.id}-who`, id: `${id}${c.id}-comment`, tabIndex: -1, className: "flex gap-3 rounded-md" }, /* @__PURE__ */ React.createElement(Avatar, { size: "sm", name: c.author.name, src: c.author.avatar, alt: "" }), /* @__PURE__ */ React.createElement("div", { className: "flex min-w-0 flex-1 flex-col gap-1" }, /* @__PURE__ */ React.createElement("p", { id: `${id}${c.id}-who`, className: "text-sm" }, /* @__PURE__ */ React.createElement("strong", { className: "font-semibold" }, c.author.name), " ", /* @__PURE__ */ React.createElement("span", { className: "text-text-muted" }, /* @__PURE__ */ React.createElement(RelativeTime, { date: c.date }), c.edited && /* @__PURE__ */ React.createElement(React.Fragment, null, ", ", l.edited))), editing === c.id ? /* @__PURE__ */ React.createElement("form", { onSubmit: save(c), className: "flex flex-col gap-2" }, /* @__PURE__ */ React.createElement(Field, { label: l.editBox, id: `${id}${c.id}-edit` }, /* @__PURE__ */ React.createElement(
    Textarea,
    {
      value: draft,
      onChange: (e) => setDraft(e.target.value),
      maxLength,
      showCount: true,
      autoResize: true,
      onKeyDown: (e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          stopEdit(c.id);
        }
      }
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "flex gap-2" }, /* @__PURE__ */ React.createElement(Button, { type: "submit", size: "sm" }, l.save), /* @__PURE__ */ React.createElement(Button, { variant: "ghost", size: "sm", onClick: () => stopEdit(c.id) }, l.cancel))) : /* @__PURE__ */ React.createElement("p", { className: "whitespace-pre-wrap wrap-break-word" }, c.body), c.mine && editing !== c.id && (onEdit || onDelete) && /* @__PURE__ */ React.createElement("div", { className: "flex gap-2" }, onEdit && /* @__PURE__ */ React.createElement(Button, { variant: "ghost", size: "sm", id: `${id}${c.id}-edit-button`, onClick: () => startEdit(c) }, l.edit), onDelete && /* @__PURE__ */ React.createElement(Button, { variant: "ghost", size: "sm", onClick: () => remove(c) }, l.delete))))))), /* @__PURE__ */ React.createElement("form", { onSubmit: post, noValidate: true, className: "flex flex-col gap-2" }, /* @__PURE__ */ React.createElement(Field, { label: l.reply, id: `${id}-reply`, hint: l.replyHint(maxLength), error: error ? l.empty : void 0 }, /* @__PURE__ */ React.createElement(Textarea, { value: reply, onChange: (e) => {
    setReply(e.target.value);
    if (error && e.target.value.trim()) setError(false);
  }, maxLength, showCount: true, autoResize: true, rows: 3 })), /* @__PURE__ */ React.createElement(Button, { type: "submit", className: "self-start", loading: busy }, l.post)));
}
export {
  CommentThread
};
//# sourceMappingURL=CommentThread.js.map
