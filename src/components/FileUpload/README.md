# FileUpload

A drop area with a button for choosing files, and the chosen files listed under it with their size and a remove button. It checks file types, sizes and counts on the way in. Uploading is up to you: read the files from `onFilesChange`, or send them with a form through `name`.

```tsx
import { FileUpload } from "@diki/design-system";

<FileUpload accept="image/*" maxSize={5 * 1024 * 1024} hint="PNG or JPG, up to 5 MB" onFilesChange={setAvatar} />

<FileUpload multiple maxFiles={10} accept=".pdf,.docx" files={files} onFilesChange={setFiles}
  onReject={(r) => console.log(r)} />
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `files` | `File[]` | | Controlled. |
| `onFilesChange` | `(files: File[]) => void` | | When files are added or removed. |
| `onReject` | `(rejections) => void` | | Files that weren't added, each with `reason` (`'type'`, `'size'` or `'count'`) and a `message`. |
| `accept` | `string` | | As for `<input accept>`: MIME types, `image/*` or extensions. |
| `multiple` | `boolean` | `false` | Without it, a new file replaces the old one. |
| `maxSize` | `number` | | The largest file, in bytes. |
| `maxFiles` | `number` | | The most files, with `multiple`. |
| `disabled` | `boolean` | `false` | |
| `name` | `string` | | Sends the files with a form. |
| `id` | `string` | | Goes to the native input, so a `<label htmlFor>` or Field can point at it. |
| `title` | `ReactNode` | `'Drag files here'` or `'Drag a file here'` | |
| `buttonLabel` | `string` | `'Choose files'` or `'Choose a file'` | |
| `hint` | `ReactNode` | | A muted line such as "PNG or JPG, up to 5 MB". The button is described by it. |
| `removeLabel` | `(name) => string` | `` `Remove ${name}` `` | The remove buttons' names. |

`formatFileSize(bytes)` is exported too (`1.5 MB`). `className`, `ref` and other props go to the root `<div>`.

## Behavior

- The button opens the file picker; files can also be dropped on the area, which highlights while they're dragged over it.
- Files that don't fit are listed under the area in danger text and passed to `onReject`; the same file picked twice is skipped quietly.
- Removing a file moves focus to the Choose button, since the row is gone.
- The native input always holds the listed files, including dropped ones, so a form sends exactly what's shown.

## Accessibility

- The button is the keyboard and screen-reader way in; dragging is an extra. Messages about refused files are `role="alert"`, so they're announced.
- Text keeps 4.5:1 (also while dragging), and the icons and dashed outline 3:1, in all six themes (`tools/test/file-upload.mjs`).

## Component tokens

Each is an optional override: set it on the page, a container or one upload. The list lives in `src/components/FileUpload/file-upload.tokens.json` (also in `design-tokens/components/`).

| Token | Default | Use |
| --- | --- | --- |
| `--file-upload-zone-bg` | `surface-muted` | The drop area's background. |
| `--file-upload-zone-border` | `field-border` | The drop area's dashed outline (3:1 on the surface). |
| `--file-upload-zone-bg-active` | `primary-subtle` | The drop area while files are dragged over it. |
| `--file-upload-zone-border-active` | `primary` | Its outline then. |
| `--file-upload-icon` | `text-muted` | The upload icon and file icons (3:1). |
| `--file-upload-title-color` | `text` | The drop area's title and file names. |
| `--file-upload-hint-color` | `text-muted` | The hint and file sizes (4.5:1 on zone-bg and the surface). |
| `--file-upload-error-color` | `danger-text` | Messages about files that weren't added. |
| `--file-upload-item-bg` | `surface` | A file row's background. |
| `--file-upload-item-border` | `border` | A file row's outline. |
| `--file-upload-zone-radius` | `rounded-lg` | The drop area's corners (8px). |
| `--file-upload-item-radius` | `rounded-md` | A file row's corners (6px). |
| `--file-upload-zone-padding` | `spacing-6` | Space inside the drop area (24px). |
| `--file-upload-gap` | `spacing-2` | Space between the drop area's lines, and between file rows (8px). |
| `--file-upload-item-padding` | `spacing-2` | Space inside a file row (8px). |
