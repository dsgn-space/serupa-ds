# Chat

A conversation: messages in a log that stays at the newest one while the reader is there, day dividers, and a composer where Enter sends. Use it for support chats, comments in real time and AI assistants. `Chat` is the scrolling list, `ChatMessage` one message, `ChatDivider` a day line and `ChatComposer` the field under it.

```tsx
import { Chat, ChatMessage, ChatDivider, ChatComposer, Avatar, Attachment } from "serupa-ds";

<div style={{ display: "flex", flexDirection: "column", height: 480 }}>
  <Chat aria-label="Conversation with Support" style={{ flex: "auto" }}>
    <ChatDivider date={new Date()} />
    <ChatMessage author="Rina Kusuma" avatar={<Avatar size="sm" name="Rina Kusuma" />} time={new Date()}>
      Hi! How can I help you today?
    </ChatMessage>
    <ChatMessage own status="sending">My invoice shows the wrong address.</ChatMessage>
  </Chat>
  <ChatComposer onSend={(text) => send(text)} />
</div>
```

## When to use

- Two or more people, or a person and an assistant, writing back and forth, newest at the bottom.
- A thread of messages that grows while it's open, where people need to read back without losing their place.

## When not to use

- A list of notifications or events: use [NotificationCenter](../NotificationCenter/README.md) or a [Timeline](../Timeline/README.md).
- Comments under a page that don't arrive live: a [List](../List/README.md) of comments with a [Textarea](../Textarea/README.md) and a button reads better, top to bottom.
- One message to the person: use a [Toast](../Toast/README.md) or an [Alert](../Alert/README.md).

## Anatomy

Drawn from the `Statuses` story.

1. **Log** (`.dk-chat__log`): the scrolling list of messages.
2. **Divider** (`.dk-chat-divider`): the day the next messages were sent.
3. **Message** (`.dk-chat-message`): avatar, then author and time, the bubble, files and status.
4. **Bubble** (`.dk-chat-message__bubble`): what the message says; own messages are tinted and sit at the end.
5. **Status** (`.dk-chat-message__status`): "Sending…", or "Not sent" with "Try again".
6. **Composer** (`.dk-chat-composer`): the field, any actions, and Send (or Stop while a reply streams).

An assistant's reply (the `AgentReply` story) adds these parts:

- **Reasoning** (`.dk-chat-message__reasoning`): "Thought for 12 seconds", closed until the reader opens it.
- **Steps** (`.dk-chat-steps`): the tools it called, each in progress, done or failed.
- **Thinking** (`.dk-chat-message__thinking`): "Thinking…" with a shine, until the first words arrive.
- **Versions** (`.dk-chat-message__branches`): "2 / 3" between previous and next, under a regenerated reply.

An assistant also asks before it acts with a `ChatApproval` card (`.dk-chat-approval`, the `Approval` story), and names its sources with `ChatCitation` chips (`.dk-chat-citation`, the `Citations` story).

While the reader is further up and new messages arrive, a "3 new messages" button (`.dk-chat__jump`) sits at the bottom of the log; it scrolls down and focuses the log.

## Usage

- Give `Chat` a height (a flex child, or `style={{ height }}`): it scrolls inside it. Name it with `aria-label` ("Conversation with Support").
- Give every message and divider a stable `key`, oldest first. Chat tells a message added at the end from earlier ones added at the start by their keys.
- Add new messages at the end. When the reader is at the bottom, the conversation follows them; when they've scrolled up, it stays put and offers "N new messages".
- Earlier messages: set `hasOlder` and load them in `onLoadOlder`, with `loadingOlder` while they come. Put them at the start: the message the reader was on stays where it was.
- A `ChatDivider` with a `date` says "Today" and "Yesterday" by the visitor's clock and moves on at their midnight. A server-rendered page shows the date until it hydrates, because the server's day can differ from the visitor's.
- In a row of messages from the same person, set `hideAuthor` on the second and later ones. The name is still read out.
- Own messages: `own`, with `status="sending"` until the server confirms and `status="failed"` plus `onRetry` when it doesn't.
- Files: pass [Attachment](../Attachment/README.md) elements to `attachments`, on a message or on the composer.
- A streaming reply: grow the last message's text, with `streaming` on it, and `streaming` plus `onStop` on the composer. Take both off when it's done.

### An assistant's reply

- Before any words arrive, set `thinking` on the reply: it says "Thinking…" until its text comes, then the text takes its place.
- The model's reasoning goes in `reasoning`, with `reasoningTime` in seconds: the reader sees "Thought for 12 seconds" and opens it when they want the why. Leave the time out and it says "Reasoning".
- Tools it calls go in `steps`, in order, each `{ id, label, status, detail? }` with `status` `"running"`, `"done"` or `"failed"`. Give each a stable `id` and update its status as it ends. `ChatSteps` draws the same list on its own, outside a message.
- Before it acts (a refund, an email, a command), put a `ChatApproval` in the reply's `attachments`: what it will do in words as its children, more in `detail`, and `onApprove` and `onDeny`. Set `status` to `"approved"` or `"denied"` once the person answers: the card becomes a one-line record ("Approved: Reverse refund 2"), said to screen readers, with focus on it.
- Sources go in the text as `<ChatCitation href index={1} />`: a real link that shows its number and host ("1 docs.example.com"), or your own words as children. Wrap one in a [HoverCard](../HoverCard/README.md) for a preview of the page.
- A reply the person regenerated keeps its versions: pass `branch` (from 1), `branches` and `onBranchChange`, and show that version's text. "2 / 3" sits under it between previous and next.
- A model picker and how much context is used sit in the composer's `actions`: a small [Select](../Select/README.md) named "Model" and a small [Meter](../Meter/README.md) whose `formatValue` says it in words ("12,400 of 200,000 tokens used"). The `AgentReply` story shows both.

```tsx
<ChatMessage
  author="Assistant"
  reasoning={reasoningText}
  reasoningTime={12}
  steps={[
    { id: "search", label: "Searched the help centre", status: "done", detail: "3 articles" },
    { id: "order", label: "Looking up order 4417", status: "running" },
  ]}
  thinking={!replyText}
>
  {replyText}
</ChatMessage>
```

## Behavior

- Opens at the newest message. A message that grows (a streamed reply, a picture that loads) keeps the conversation at the bottom when the reader was there.
- The jump button scrolls to the newest message and moves focus to the conversation, so the next arrow key reads on from there.
- When "Load earlier messages" had focus and the load is done, focus moves to the conversation, which stays where the reader was. The button may be gone (nothing more to load) or above the messages that came in.
- Enter sends, Shift+Enter starts a new line, and Enter that confirms an input method's text (Japanese, Chinese, Korean) doesn't send. A field that's empty or only spaces sends nothing. Uncontrolled, the field empties after sending and keeps focus.
- While `streaming`, Send becomes Stop; the person can keep typing their next message, and Enter waits until it's done.
- The field grows from one line to `maxRows` (6), then scrolls.

## Accessibility

- **Role and name:** the conversation is a `log` named by `aria-label`, so screen readers read each new message politely as it's added. A streaming message is `aria-busy` until `streaming` comes off, so it's read once, whole, rather than word by word.
- **Keyboard:** the conversation is a focusable scrolling region (Tab, then arrows or Page Up and Page Down), with a visible focus ring. Tab moves on through its buttons and links, then the composer's field and buttons.
- **Who wrote it:** the author is read before each message, "You" for `own` ones, even with `hideAuthor`. The avatar is hidden from screen readers: the name says who it is.
- **Status:** "Sending…" and "Not sent" are words under the message, not only a colour; a failed message also has a danger outline.
- **Send:** an icon button named "Send" (and "Stop"); with nothing to send it's `aria-disabled` rather than removed from the Tab order.
- **Contrast:** message text reads 4.5:1 on both bubbles, and times, dividers and "Not sent" 4.5:1 on the page, in all six themes (`Chat.test.tsx`).
- **An assistant at work:** "Thinking…" is a progress bar with that name. Reasoning is a native disclosure (`details`), opened with Enter or Space. Each step says its state in words after its label ("Searched the help centre, Done"), not only by its icon. Steps are read with the reply when the log adds it; a step that changes later isn't announced, so say the outcome in the reply.
- **Approval and versions:** a pending `ChatApproval` is a group named by what it will do. The answer is said ("Approved: …"), and focus moves from the pressed button to the record, so it isn't lost. The version buttons are named "Previous response" and "Next response" inside a group named "Response 2 of 3"; a press says where it landed, and at either end the button stays focusable (`aria-disabled`). Each citation's name is its number and source.
- **What's still yours:** announcing a failure out loud if it matters right then (the log reads only additions), and moving focus after a send fails.

### Keyboard

| Key | Does |
| --- | --- |
| Tab | To the log, then through its buttons and links, then the composer |
| ↑ ↓, PageUp, PageDown, Home, End | Scroll the log while it has focus |
| Enter (in the composer) | Sends the message |
| Shift+Enter | A new line in the message |

## Props

### Chat

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `children` | `ReactNode` | | ChatMessage and ChatDivider elements, oldest first, each with a key. |
| `hasOlder` | `boolean` | `false` | Shows "Load earlier messages" at the top. |
| `onLoadOlder` | `() => void` | | Called by that button. |
| `loadingOlder` | `boolean` | `false` | The button says it's loading. |

`id`, `className`, `ref` and other props go to the outer `<div>`; `aria-label` and `aria-labelledby` name the log.

### ChatMessage

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `children` | `ReactNode` | | The text; line breaks are kept. |
| `author` | `ReactNode` | | Who wrote it. |
| `avatar` | `ReactNode` | | A picture beside it, such as `<Avatar size="sm" />`. |
| `time` | `Date \| number \| string` | | When it was sent, as relative time. |
| `own` | `boolean` | `false` | The reader's own message. |
| `hideAuthor` | `boolean` | `false` | For later messages in a row from the same person. |
| `status` | `'sending' \| 'failed'` | | An own message on its way, or one that didn't go. |
| `onRetry` | `() => void` | | Adds Retry to a failed message. |
| `attachments` | `ReactNode` | | Attachment elements under the text. |
| `streaming` | `boolean` | `false` | The text is still arriving. |
| `thinking` | `boolean` | `false` | "Thinking…" while an assistant has no words yet; the text replaces it. |
| `reasoning` | `ReactNode` | | The assistant's reasoning, in a section closed until it's opened. |
| `reasoningTime` | `number` | | How long it thought, in seconds: "Thought for 12 seconds". |
| `steps` | `ChatStep[]` | | Tools it called on the way, above the text (see ChatSteps). |
| `branch` | `number` | | Which version of a regenerated reply shows, from 1. |
| `branches` | `number` | | How many versions there are; 2 or more shows the switcher. |
| `onBranchChange` | `(branch: number) => void` | | Called with the version to show. |

### ChatDivider

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `date` | `Date \| number \| string` | | "Today", "Yesterday", or the date in the locale's words. |
| `children` | `ReactNode` | | Your own words in place of the date. |

### ChatSteps

The steps an assistant takes on its way to a reply, as an ordered list. `ChatMessage` draws it from `steps`; use it alone outside a message.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `steps` | `ChatStep[]` | | Each `{ id, label, status, detail? }`; `status` is `"running"`, `"done"` or `"failed"`. |

### ChatApproval

An assistant asks before it acts. The children say what it will do and name the card.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `children` | `ReactNode` | | What it will do, in words. Kept as the record. |
| `detail` | `ReactNode` | | More about it, such as the command or what changes. |
| `status` | `'pending' \| 'approved' \| 'denied'` | `'pending'` | Answered, it becomes a one-line record. |
| `onApprove` / `onDeny` | `() => void` | | Called by Approve and Deny. |

### ChatCitation

A numbered source in a reply, as a link. Every other prop goes to the `a`.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `href` | `string` | | Where the source is. |
| `index` | `number` | | Its number in the reply, from 1. |
| `children` | `ReactNode` | the host | The source's name, in place of its host. |

### ChatComposer

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `value` / `defaultValue` | `string` | | The text, controlled or not. |
| `onValueChange` | `(value: string) => void` | | Called as the text changes. |
| `onSend` | `(text: string) => void` | | Called with the text on Send or Enter. |
| `streaming` | `boolean` | `false` | Send becomes Stop. |
| `onStop` | `() => void` | | Called by Stop. |
| `placeholder` | `string` | | The field's placeholder. |
| `disabled` | `boolean` | `false` | Turns the field and buttons off. |
| `attachments` | `ReactNode` | | Files about to be sent, above the field. |
| `actions` | `ReactNode` | | More buttons before Send. |
| `maxRows` | `number` | `6` | How far the field grows before it scrolls. |

`aria-label` renames the field ("Message"); `className`, `ref` and other props go to the `<form>`.

## Component tokens

Each is an optional override: set it on the page, a container or one Chat. The list lives in `src/components/Chat/chat.tokens.json` (also in `design-tokens/components/`).

<!-- token-table:start (made from chat.tokens.json by npm run tokens: edit the descriptions there) -->
| Token | Default | Use |
| --- | --- | --- |
| `--chat-text` | `text` | Message text and authors (4.5:1 on both bubbles). |
| `--chat-muted` | `text-muted` | Times, day dividers and "Sending…" (4.5:1 on the page). |
| `--chat-bubble-bg` | `surface-muted` | Others' message bubbles. |
| `--chat-own-bubble-bg` | `primary-subtle` | The reader's own message bubbles. |
| `--chat-failed-border` | `danger` | The outline of a message that didn't go. |
| `--chat-error` | `danger-text` | "Not sent" (4.5:1 on the page). |
| `--chat-divider` | `border` | The day divider's lines. |
| `--chat-focus-ring` | `focus-ring` | The ring around the focused conversation. |
| `--chat-step-done` | `success-text` | ChatSteps: a done step's check (3:1 on the surface). |
| `--chat-citation-bg` | `surface` | ChatCitation: a source chip's background, so it stands out on a bubble. |
| `--chat-bubble-radius` | `rounded-xl` | A bubble's corners (12px). |
| `--chat-padding` | `spacing-4` | Space around the conversation and the composer (16px). |
| `--chat-gap` | `spacing-3` | Space between messages (12px). |
| `--chat-bubble-padding-x` | `spacing-3` | Space at a bubble's sides (12px). |
| `--chat-bubble-padding-y` | `spacing-2` | Space above and below a bubble's text (8px). |
| `--chat-reasoning-indent` | `spacing-3` | ChatMessage: how far the reasoning text sits in from its rule. |
<!-- token-table:end -->
