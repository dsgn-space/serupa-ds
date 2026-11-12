# Attachment

A file shown as one compact row: an icon for its kind, the name, the kind and size, and, while it uploads, a bar. A failed upload shows why, with a retry button, and `onRemove` adds a remove button. Use it for files in a message, a comment, a record or a form.

**Also called:** file, download link.

```tsx
import { Attachment } from "serupa-ds";

<Attachment name="Invoice March 2026.pdf" bytes={1_482_000} href="/files/invoice-march.pdf" />

<Attachment name="Site photo.jpg" bytes={3_400_000} progress={45} onRemove={() => cancel(file)} />

<Attachment name="Pitch.pptx" error="Larger than 100 MB" onRemove={() => remove(file)} />
```

## When to use

- Files attached to a message, a comment, a ticket or a record, which people open or download.
- Files a person is adding, while they upload, with a way to remove each one.

## When not to use

- Choosing files: [FileUpload](../FileUpload/README.md) has the drop area, the checks and the native input that submits with a form.
- A picture people should see: show it with [Image](../Image/README.md), with the file name as its caption.
- A list of many files with columns (owner, modified date): use a [Table](../Table/README.md).

## Anatomy

Drawn from the `Upload` story.

1. **Icon** (`.dk-attachment__icon`): the kind of file, by shape. It's decorative: the kind is also written out.
2. **Name** (`.dk-attachment__name`): the file name, a link with `href`; a long one is cut in the middle so its ending stays.
3. **Kind and size** (`.dk-attachment__meta`): "PDF · 1.5 MB", in the locale's digits and units.
4. **Bar** (`.dk-attachment__progress`): the upload, while `progress` is set.
5. **Message** (`.dk-attachment__error`): why the upload failed.
6. **Try again** (`.dk-attachment__retry`): starts the upload again, after an error with `onRetry`.
7. **Remove** (`.dk-attachment__remove`): takes the file away, with `onRemove`.

## Usage

- Pass `type` when you have it (a `File`'s `type`, or the server's content type): it picks the icon before the extension does. `kind` overrides both, for a file whose name says nothing ("scan-0042").
- `bytes` is shown in steps of 1000, as phones and macOS count: 1,482,000 is "1.5 MB". Leave it out when you don't know the size.
- While uploading, set `progress` from 0 to 100, or `null` when you can't tell. Take it away when the upload is done.
- A failed upload: set `error` to what went wrong ("Larger than 100 MB"), or `true` for "Upload failed". Pass `onRetry` only when trying again can work.
- Put several in a `<ul role="list">` with one per `<li>`, in a wrapping row or a column. Each grows to its content, up to 320px (`--attachment-max-width`), and never wider than its container.
- `attachmentKind(name, type)` returns the kind on its own, for a filter or your own icon. It runs in a Server Component too.

```tsx
<ul role="list" className="flex flex-wrap gap-2">
  {files.map((f) => (
    <li key={f.id}>
      <Attachment name={f.name} bytes={f.size} type={f.type} href={f.url} onRemove={() => remove(f)} />
    </li>
  ))}
</ul>
```

## Behavior

- A long name is cut in the middle, as Finder and Drive do: "Laporan keuangan tri…2026 final.xlsx". The last few characters and the extension stay, so files that differ only by year or version still look different. Hover shows the full name, and it's laid out in its own direction.
- The remove button calls `onRemove`; removing the file is yours. Move focus somewhere sensible afterwards, such as the next file's remove button, since the button goes away with the file.
- `disabled` turns off the link and both buttons; the name and size stay readable.

## Accessibility

- **Role and name:** a plain container, with no role of its own; put it in a list item when there are several. The name is read once, whole, even when it's cut on screen. A linked name is a link named by the file and described by its kind and size ("Q3.xlsx, link, Spreadsheet 88 kB").
- **Keyboard:** Tab reaches the link, "Try again" and the remove button, in that order. The link shows the focus ring.
- **Progress:** the bar is a `progressbar` named by the file, with its value; with `null` it has no value, so it's read as busy.
- **Error:** "Try again" is named with the file ("Try again Pitch.pptx") and described by the message. The message is shown, not announced: say a failure out loud from the code that uploads, with `announce()` or a [Toast](../Toast/README.md).
- **Remove:** named "Remove Invoice.pdf", so several remove buttons in a row are told apart (WCAG 2.4.6). `removeLabel` changes the words.
- **Colour:** the kind is in the icon's shape and in words, and a failure in words, never in colour alone (WCAG 1.4.1).
- **Contrast:** the name, kind, size, link and message read 4.5:1, and the icon and the failed outline 3:1, in all six themes (`Attachment.test.tsx`).
- **What's still yours:** announcing when an upload finishes or fails, and where focus goes after a remove.

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `name` | `string` | | Required. The file name with its extension. |
| `bytes` | `number` | | The size in bytes, shown in the locale's units. |
| `type` | `string` | | The MIME type; picks the icon and kind before the extension. |
| `kind` | `'pdf' \| 'image' \| 'sheet' \| 'doc' \| 'slides' \| 'archive' \| 'code' \| 'audio' \| 'video' \| 'other'` | from `type` and `name` | Overrides the icon and the word. |
| `href` | `string` | | Makes the name a link. |
| `download` | `boolean \| string` | | With `href`, the link's `download` attribute. |
| `progress` | `number \| null` | | 0 to 100 while uploading; `null` when unknown. |
| `error` | `ReactNode \| boolean` | | A failed upload's message; `true` says "Upload failed". |
| `onRetry` | `() => void` | | Adds "Try again" to a failed upload. |
| `onRemove` | `() => void` | | Adds the remove button. |
| `removeLabel` | `(name: string) => string` | `` `Remove ${name}` `` | The remove button's name. |
| `disabled` | `boolean` | `false` | Turns the link and buttons off. |
| `id` | `string` | | Goes to the root `<div>`. |

`className`, `ref` and other props go to the `<div>`.

## Component tokens

Each is an optional override: set it on the page, a container or one Attachment. The list lives in `src/components/Attachment/attachment.tokens.json` (also in `design-tokens/components/`).

<!-- token-table:start (made from attachment.tokens.json by npm run tokens: edit the descriptions there) -->
| Token | Default | Use |
| --- | --- | --- |
| `--attachment-bg` | `surface` | The background. |
| `--attachment-text` | `text` | The file name (4.5:1 on bg). |
| `--attachment-muted` | `text-muted` | The kind and size (4.5:1 on bg). |
| `--attachment-icon` | `text-muted` | The kind icon (3:1 on bg). |
| `--attachment-link` | `primary` | A linked name (4.5:1 on bg). |
| `--attachment-link-hover` | `primary-hover` | A linked name under the pointer. |
| `--attachment-border` | `border` | The outline. |
| `--attachment-border-error` | `danger` | The outline of a failed upload (3:1 on the page). |
| `--attachment-error` | `danger-text` | A failed upload's message (4.5:1 on bg). |
| `--attachment-focus-ring` | `focus-ring` | The ring around a focused link. |
| `--attachment-radius` | `radius-control` | The corners (6px). |
| `--attachment-padding` | `spacing-2` | Space inside (8px). |
| `--attachment-padding-start` | `spacing-3` | Space before the icon (12px). |
| `--attachment-gap` | `spacing-2` | Space between the icon, the name and the buttons (8px). |
| `--attachment-max-width` | `spacing-80` | The widest it grows (320px); a narrower container makes it narrower. |
<!-- token-table:end -->
