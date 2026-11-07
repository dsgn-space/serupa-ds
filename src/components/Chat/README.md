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
5. **Status** (`.dk-chat-message__status`): "Sending…", or "Not sent" with Retry.
6. **Composer** (`.dk-chat-composer`): the field, any actions, and Send (or Stop while a reply streams).

While the reader is further up and new messages arrive, a "3 new messages" button (`.dk-chat__jump`) sits at the bottom of the log; it scrolls down and focuses the log.

## Usage

- Give `Chat` a height (a flex child, or `style={{ height }}`): it scrolls inside it. Name it with `aria-label` ("Conversation with Support").
- Give every message and divider a stable `key`, oldest first. Chat tells a message added at the end from earlier ones added at the start by their keys.
- Add new messages at the end. When the reader is at the bottom, the conversation follows them; when they've scrolled up, it stays put and offers "N new messages".
- Earlier messages: set `hasOlder` and load them in `onLoadOlder`, with `loadingOlder` while they come. Put them at the start: the message the reader was on stays where it was.
- In a row of messages from the same person, set `hideAuthor` on the second and later ones. The name is still read out.
- Own messages: `own`, with `status="sending"` until the server confirms and `status="failed"` plus `onRetry` when it doesn't.
- Files: pass [Attachment](../Attachment/README.md) elements to `attachments`, on a message or on the composer.
- A streaming reply: grow the last message's text, with `streaming` on it, and `streaming` plus `onStop` on the composer. Take both off when it's done.

## Behavior

- Opens at the newest message. A message that grows (a streamed reply, a picture that loads) keeps the conversation at the bottom when the reader was there.
- The jump button scrolls to the newest message and moves focus to the conversation, so the next arrow key reads on from there.
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

### ChatDivider

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `date` | `Date \| number \| string` | | "Today", "Yesterday", or the date in the locale's words. |
| `children` | `ReactNode` | | Your own words in place of the date. |

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
| `--chat-bubble-radius` | `rounded-xl` | A bubble's corners (12px). |
| `--chat-padding` | `spacing-4` | Space around the conversation and the composer (16px). |
| `--chat-gap` | `spacing-3` | Space between messages (12px). |
| `--chat-bubble-padding-x` | `spacing-3` | Space at a bubble's sides (12px). |
| `--chat-bubble-padding-y` | `spacing-2` | Space above and below a bubble's text (8px). |
<!-- token-table:end -->
