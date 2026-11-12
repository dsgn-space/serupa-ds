'use client';
import * as React from 'react';
import { isComposing } from '../../internal/ime';
import { Avatar } from '../../components/Avatar/Avatar';
import { Button } from '../../components/Button/Button';
import { Field } from '../../components/Field/Field';
import { Heading } from '../../components/Heading/Heading';
import { RelativeTime } from '../../components/RelativeTime/RelativeTime';
import { Textarea } from '../../components/Textarea/Textarea';
import { MentionInput, mentionsIn, type MentionOption } from '../../components/MentionInput/MentionInput';
import { toast } from '../../components/Toast/Toast';
import { announce } from '../../internal/announce';

/* Comment thread (BL8): comments with who and when, a reply box with a character count, and edit and delete for
   your own, for an app to copy. What it carries (WCAG 2.2):
   - 1.3.1 in Safari: role="list" on the lists without bullets, since WebKit stops calling them lists (FU1, GR151).
   - 1.3.1: the thread is a region named by its heading; the comments are an ordered list of articles, each named by
     its author and time, so Edit and Delete inside one are heard in its context.
   - 3.3.1 / 3.3.2: the reply box has a visible label, the limit in its hint and a count that is read out near the
     limit (Textarea); an empty reply says what to do in words, next to the box.
   - 2.4.3: Edit puts focus in the comment's own box, and Save or Cancel brings it back to Edit. Delete moves focus to
     the next comment (or the one before, or the heading), so it isn't lost, and Undo brings the comment back focused.
   - With people, the boxes are MentionInputs: "@" lists who can be mentioned, the hint says so in words (3.3.2), and
     a mention in a comment is bold as well as named, so it isn't shown by color alone (1.4.1).
   - 4.1.3: posting and saving are said once, politely. Delete waits for the toast to go (toast.undo), so Undo is a
     real undo and nothing is gone until then.
   - Each word is a label, English by default. */

export interface ThreadComment {
  id: string;
  author: { name: string; avatar?: string | undefined };
  body: string;
  /** When it was posted. A Date, a timestamp or an ISO string. */
  date: Date | number | string;
  /** It was changed after posting: says "edited". */
  edited?: boolean | undefined;
  /** The person wrote it, so they can edit and delete it. */
  mine?: boolean | undefined;
}

export interface CommentThreadLabels {
  title: string;
  noComments: string;
  reply: string;
  /** Under the reply box: the limit in words. */
  replyHint: (max: number) => string;
  /** Under the reply box, after the limit, when people can be mentioned. */
  mentionHint: string;
  post: string;
  posted: string;
  empty: string;
  /** Under the reply box when onReply's promise rejects. */
  postFailed: string;
  edit: string;
  editBox: string;
  save: string;
  saved: string;
  /** Under the edit box when it's saved empty. */
  editEmpty: string;
  /** Under the edit box when onEdit's promise rejects. */
  saveFailed: string;
  cancel: string;
  delete: string;
  deleted: string;
  edited: string;
}

const english: CommentThreadLabels = {
  title: 'Comments',
  noComments: 'No comments yet. Start the conversation.',
  reply: 'Reply',
  replyHint: (max) => `Up to ${max} characters.`,
  mentionHint: 'Type @ to mention someone.',
  post: 'Post reply',
  posted: 'Reply posted',
  empty: 'Write a reply first.',
  postFailed: 'Couldn’t post the reply. Try again.',
  edit: 'Edit',
  editBox: 'Edit comment',
  save: 'Save',
  saved: 'Comment saved',
  editEmpty: 'Write something, or delete the comment.',
  saveFailed: 'Couldn’t save the comment. Try again.',
  cancel: 'Cancel',
  delete: 'Delete',
  deleted: 'Comment deleted',
  edited: 'edited',
};

export interface CommentThreadProps {
  comments: readonly ThreadComment[];
  /** Posts a reply. Return its promise: the button shows it's working, and the box clears once it succeeds.
   *  details.mentions: the people it mentions, in order, to notify. */
  onReply: (body: string, details: { mentions: MentionOption[] }) => void | PromiseLike<unknown>;
  /** Saves an edited comment. Return its promise to keep the box open until it's saved. details.mentions: who it
   *  mentions now. */
  onEdit?: ((id: string, body: string, details: { mentions: MentionOption[] }) => void | PromiseLike<unknown>) | undefined;
  /** Who can be mentioned with "@" in the reply and edit boxes. Without it, they're plain Textareas. */
  people?: readonly MentionOption[] | undefined;
  /** Deletes a comment for good, once the Undo toast has gone without Undo. */
  onDelete?: ((id: string) => void) | undefined;
  /** The longest reply, in characters. Default: 1000. */
  maxLength?: number | undefined;
  headingLevel?: 2 | 3 | 4 | undefined;
  labels?: Partial<CommentThreadLabels> | undefined;
}

// The reply and edit boxes: a MentionInput when people can be mentioned, else a Textarea; both count and grow.
// Ctrl+Enter (⌘+Enter on a Mac) sends the box's form, as in most comment boxes; Enter alone is a new line.
function Box({ people, value, onValue, onKeyDown, ...rest }: { people: readonly MentionOption[] | undefined; value: string; onValue: (v: string) => void; maxLength: number; rows?: number; onKeyDown?: React.KeyboardEventHandler<HTMLTextAreaElement> }) {
  const keys = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (onKeyDown) onKeyDown(e);
    if (!e.defaultPrevented && e.key === 'Enter' && (e.ctrlKey || e.metaKey) && !isComposing(e)) { e.preventDefault(); e.currentTarget.form?.requestSubmit(); }
  };
  return people
    ? <MentionInput {...rest} onKeyDown={keys} options={people} value={value} onValueChange={onValue} showCount autoResize />
    : <Textarea {...rest} onKeyDown={keys} value={value} onChange={(e) => onValue(e.target.value)} showCount autoResize />;
}

// A comment's text with each mention of someone in people in bold, so it reads as a mention without color.
function Mentions({ text, people }: { text: string; people: readonly MentionOption[] }) {
  const out: React.ReactNode[] = [];
  let at = 0;
  for (const p of mentionsIn(text, people)) {
    const i = text.indexOf('@' + p.label, at);
    if (i < 0) continue;
    if (i > at) out.push(text.slice(at, i));
    out.push(<strong key={i} className="font-semibold">{'@' + p.label}</strong>);
    at = i + 1 + p.label.length;
  }
  out.push(text.slice(at));
  return <>{out}</>;
}

const thenable = (v: unknown): v is PromiseLike<unknown> => v != null && typeof (v as PromiseLike<unknown>).then === 'function';
const settle = (out: void | PromiseLike<unknown>, done: () => void, failed: () => void) => { if (thenable(out)) out.then(done, failed); else done(); };

/** Comments with who and when, a reply box with a character count, and edit and delete with undo for your own. */
export function CommentThread({ comments, onReply, onEdit, onDelete, people, maxLength = 1000, headingLevel = 2, labels }: CommentThreadProps) {
  const l = { ...english, ...labels };
  const id = React.useId();
  const [hidden, setHidden] = React.useState<ReadonlySet<string>>(new Set());
  const [editing, setEditing] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState('');
  const [reply, setReply] = React.useState('');
  const [error, setError] = React.useState(false);
  const [editError, setEditError] = React.useState(false);
  // A send that failed (the network, not the words): said once, shown under its form until the next try.
  const [failed, setFailed] = React.useState<'post' | 'save' | null>(null);
  const heading = React.useRef<HTMLHeadingElement | null>(null);
  const shown = comments.filter((c) => !hidden.has(c.id));
  const [busy, setBusy] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  // After the render a change makes: the box, button or comment it names is in the page by then.
  const focus = (find: () => HTMLElement | null | undefined) => { window.requestAnimationFrame(() => find()?.focus()); };
  const byId = (elementId: string) => () => document.getElementById(elementId);
  const article = (cid: string) => byId(`${id}${cid}-comment`);

  const post = (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (!reply.trim()) { setError(true); focus(byId(`${id}-reply`)); return; }
    setError(false); setFailed(null);
    const body = reply.trim(), out = onReply(body, { mentions: people ? mentionsIn(body, people) : [] });
    setBusy(thenable(out));
    settle(out, () => { setReply(''); announce(l.posted); }, () => { setFailed('post'); announce(l.postFailed); });
    if (thenable(out)) out.then(() => setBusy(false), () => setBusy(false));
  };
  const startEdit = (c: ThreadComment) => { setEditing(c.id); setDraft(c.body); setEditError(false); setFailed(null); focus(byId(`${id}${c.id}-edit`)); };
  const stopEdit = (cid: string) => { setEditing(null); setEditError(false); setFailed(null); focus(byId(`${id}${cid}-edit-button`)); };
  const save = (c: ThreadComment) => (e: React.FormEvent) => {
    e.preventDefault();
    if (!onEdit || saving) return;
    if (!draft.trim()) { setEditError(true); focus(byId(`${id}${c.id}-edit`)); return; }
    setFailed(null);
    // Busy until the save settles, as posting is: a second click doesn't send it twice.
    const body = draft.trim(), out = onEdit(c.id, body, { mentions: people ? mentionsIn(body, people) : [] });
    setSaving(thenable(out));
    settle(out, () => { stopEdit(c.id); announce(l.saved); }, () => { setFailed('save'); announce(l.saveFailed); });
    if (thenable(out)) out.then(() => setSaving(false), () => setSaving(false));
  };
  const remove = (c: ThreadComment) => {
    const at = shown.indexOf(c), next = shown[at + 1] || shown[at - 1];
    setHidden((h) => new Set(h).add(c.id));
    if (next) focus(article(next.id)); else focus(() => heading.current);
    toast.undo({
      title: l.deleted,
      commit: () => onDelete?.(c.id),
      onUndo: () => { setHidden((h) => { const n = new Set(h); n.delete(c.id); return n; }); focus(article(c.id)); },
    });
  };

  return (
    <section aria-labelledby={id} className="flex flex-col gap-4">
      <Heading level={headingLevel} id={id} ref={heading} tabIndex={-1} className="outline-none">{l.title}</Heading>
      {shown.length === 0 ? <p className="text-sm text-text-muted">{l.noComments}</p> : (
        <ol role="list" className="m-0 flex list-none flex-col gap-4 p-0">
          {shown.map((c) => (
            <li key={c.id}>
              <article aria-labelledby={`${id}${c.id}-who`} id={`${id}${c.id}-comment`} tabIndex={-1} className="flex gap-3 rounded-md">
                <Avatar size="sm" name={c.author.name} src={c.author.avatar} alt="" />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <p id={`${id}${c.id}-who`} className="text-sm">
                    <strong className="font-semibold">{c.author.name}</strong>{' '}
                    <span className="text-text-muted"><RelativeTime date={c.date} />{c.edited && <>, {l.edited}</>}</span>
                  </p>
                  {editing === c.id ? (
                    <form onSubmit={save(c)} className="flex flex-col gap-2">
                      <Field label={l.editBox} id={`${id}${c.id}-edit`} error={editError ? l.editEmpty : undefined}>
                        <Box people={people} value={draft} onValue={(v) => { setDraft(v); if (editError && v.trim()) setEditError(false); }} maxLength={maxLength}
                          // Escape cancels the edit, unless it's closing the mention list (aria-controls is there while that's open).
                          onKeyDown={(e) => { if (e.key === 'Escape' && !isComposing(e) && !e.currentTarget.hasAttribute('aria-controls')) { e.preventDefault(); stopEdit(c.id); } }} />
                      </Field>
                      <div className="flex gap-2">
                        <Button type="submit" size="sm" loading={saving}>{l.save}</Button>
                        <Button variant="ghost" size="sm" onClick={() => stopEdit(c.id)}>{l.cancel}</Button>
                      </div>
                      {failed === 'save' && <p className="text-sm text-danger-text">{l.saveFailed}</p>}
                    </form>
                  ) : <p className="whitespace-pre-wrap wrap-break-word">{people ? <Mentions text={c.body} people={people} /> : c.body}</p>}
                  {c.mine && editing !== c.id && (onEdit || onDelete) && (
                    <div className="flex gap-2">
                      {onEdit && <Button variant="ghost" size="sm" id={`${id}${c.id}-edit-button`} onClick={() => startEdit(c)}>{l.edit}</Button>}
                      {onDelete && <Button variant="ghost" size="sm" onClick={() => remove(c)}>{l.delete}</Button>}
                    </div>
                  )}
                </div>
              </article>
            </li>
          ))}
        </ol>
      )}
      <form onSubmit={post} noValidate className="flex flex-col gap-2">
        <Field label={l.reply} id={`${id}-reply`} hint={people ? l.replyHint(maxLength) + ' ' + l.mentionHint : l.replyHint(maxLength)} error={error ? l.empty : undefined}>
          <Box people={people} value={reply} onValue={(v) => { setReply(v); if (error && v.trim()) setError(false); }} maxLength={maxLength} rows={3} />
        </Field>
        <Button type="submit" className="self-start" loading={busy}>{l.post}</Button>
        {failed === 'post' && <p className="text-sm text-danger-text">{l.postFailed}</p>}
      </form>
    </section>
  );
}
