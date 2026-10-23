"use client";
import * as React from "react";
import { cn, domId, omit } from "../../internal/cn";
import { Button } from "../Button/Button";
import { IconButton } from "../IconButton/IconButton";
import { Icon } from "../Icon/Icon";
import { component } from "../../internal/component";
import { formatFileSize } from "./formatFileSize";

export { formatFileSize };

export type FileRejection = { file: File; reason: 'type' | 'size' | 'count'; message: string };
export interface FileUploadProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue' | 'title'> {
  /** The chosen files (controlled). Use with onFilesChange. */
  files?: File[];
  /** Called with the new list when files are added or removed. */
  onFilesChange?: (files: File[]) => void;
  /** Called with the files that weren't added and why. They're also listed under the drop area. */
  onReject?: (rejections: FileRejection[]) => void;
  /** File types to allow, as for <input accept>: "image/*,.pdf". */
  accept?: string;
  /** Allows several files. Default: false (a new file replaces the old one). */
  multiple?: boolean;
  /** The largest file allowed, in bytes. */
  maxSize?: number;
  /** The most files allowed, with multiple. */
  maxFiles?: number;
  disabled?: boolean;
  /** Submits the files with a form, through the native file input. */
  name?: string;
  /** The drop area's title. Default: "Drag files here" ("Drag a file here" without multiple). */
  title?: React.ReactNode;
  /** The button's text. Default: "Choose files" ("Choose a file"). */
  buttonLabel?: string;
  /** A muted line, such as "PNG or JPG, up to 5 MB". */
  hint?: React.ReactNode;
  /** The remove buttons' names, given the file name. Default: (name) => `Remove ${name}`. */
  removeLabel?: (name: string) => string;
}

const OWN = { files: 1, onFilesChange: 1, onReject: 1, accept: 1, multiple: 1, maxSize: 1, maxFiles: 1, disabled: 1, name: 1, title: 1, buttonLabel: 1, hint: 1, removeLabel: 1, className: 1, id: 1 } as const;

function accepts(file: File, accept?: string) {
  if (!accept) return true;
  const name = file.name.toLowerCase(), type = (file.type || "").toLowerCase();
  return accept.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean).some((a) =>
    a.startsWith(".") ? name.endsWith(a) : a.endsWith("/*") ? type.startsWith(a.slice(0, -1)) : type === a);
}
const iconFor = (f: File) => /^image\//.test(f.type) ? "image" : f.type === "application/pdf" ? "picture_as_pdf" : /^video\//.test(f.type) ? "movie" : /^audio\//.test(f.type) ? "audio_file" : /zip|compressed|tar/.test(f.type) ? "folder_zip" : "draft";
const same = (a: File, b: File) => a.name === b.name && a.size === b.size && a.type === b.type;   // the same file picked again

/* FileUpload: a drop area with a button to choose files, and the chosen files listed under it with their size
   and a remove button. accept, maxSize and maxFiles are checked on the way in; files that don't fit are listed
   in a danger message (role="alert") and passed to onReject. A native file input does the choosing (so name
   submits the files with a form), and files dropped in are put into it too. Uploading is up to you: read the
   files from onFilesChange. */
/** A drop area and a button for choosing files, with the chosen files listed under it. */
export const FileUpload = /* @__PURE__ */ component<HTMLDivElement, FileUploadProps>("FileUpload", function FileUpload(props, ref) {
  const rest = omit(props, OWN);
  const base = domId("dk-fu", React.useId());
  const inputId = props.id || base + "-input";
  const input = React.useRef<HTMLInputElement | null>(null);
  const chooser = React.useRef<HTMLButtonElement | null>(null);
  const controlled = props.files !== undefined;
  const [own, setOwn] = React.useState<File[]>([]);
  const files = controlled ? props.files! : own;
  const [rejected, setRejected] = React.useState<FileRejection[]>([]);
  const [over, setOver] = React.useState(false);
  const depth = React.useRef(0);
  const multiple = !!props.multiple, disabled = !!props.disabled;
  const removeLabel = props.removeLabel || ((n: string) => "Remove " + n);

  const set = (next: File[]) => { if (!controlled) setOwn(next); if (props.onFilesChange) props.onFilesChange(next); };
  const add = (list: FileList | File[] | null) => {
    if (!list || disabled) return;
    const incoming = Array.from(list), ok: File[] = [], bad: FileRejection[] = [];
    const limit = props.maxSize != null ? formatFileSize(props.maxSize) : "";
    for (const f of incoming) {
      if (!accepts(f, props.accept)) bad.push({ file: f, reason: "type", message: `${f.name}: this type of file isn't accepted.` });
      else if (props.maxSize != null && f.size > props.maxSize) bad.push({ file: f, reason: "size", message: `${f.name} is larger than ${limit}.` });
      else ok.push(f);
    }
    let next: File[];
    if (!multiple) next = ok.length ? [ok[0]] : files;
    else {
      next = files.slice();
      for (const f of ok) {
        if (next.some((g) => same(f, g))) continue;
        if (props.maxFiles != null && next.length >= props.maxFiles) { bad.push({ file: f, reason: "count", message: `${f.name} wasn't added: up to ${props.maxFiles} ${props.maxFiles === 1 ? "file" : "files"}.` }); continue; }
        next.push(f);
      }
    }
    if (!multiple && ok.length > 1) for (const f of ok.slice(1)) bad.push({ file: f, reason: "count", message: `${f.name} wasn't added: one file only.` });
    setRejected(bad);
    if (bad.length && props.onReject) props.onReject(bad);
    if (next !== files) set(next);
  };
  const remove = (f: File) => { set(files.filter((g) => g !== f)); setRejected([]); if (chooser.current) chooser.current.focus(); };   // the row and its button are gone

  // Keep the native input's files in step with the list, so a form sends what's shown.
  React.useEffect(() => {
    const i = input.current;
    if (!i || typeof DataTransfer === "undefined") return;
    try { const dt = new DataTransfer(); files.forEach((f) => dt.items.add(f)); i.files = dt.files; } catch { /* older browsers: the input keeps what was picked */ }
  }, [files]);

  const drag = {
    onDragEnter: (e: React.DragEvent) => { if (disabled) return; e.preventDefault(); depth.current++; setOver(true); },
    onDragOver: (e: React.DragEvent) => { if (disabled) return; e.preventDefault(); e.dataTransfer.dropEffect = "copy"; },
    onDragLeave: () => { if (disabled) return; depth.current = Math.max(0, depth.current - 1); if (!depth.current) setOver(false); },
    onDrop: (e: React.DragEvent) => { if (disabled) return; e.preventDefault(); depth.current = 0; setOver(false); add(e.dataTransfer.files); },
  };
  const hasHint = props.hint != null && props.hint !== "";
  return (
    <div {...rest} ref={ref} className={cn("dk-file-upload", disabled && "dk-file-upload--disabled", props.className)} data-component="file-upload">
      <div className={cn("dk-file-upload__zone", over && "dk-file-upload__zone--over")} data-dragging={over ? "" : undefined} aria-disabled={disabled || undefined} {...drag}
        onClick={(e) => { if (!disabled && e.target === e.currentTarget && input.current) input.current.click(); }}>
        <Icon name="upload_file" className="dk-file-upload__icon" />
        <p className="dk-file-upload__title">{props.title ?? (multiple ? "Drag files here" : "Drag a file here")}</p>
        <Button ref={chooser} variant="outline" size="sm" disabled={disabled} onClick={() => input.current && input.current.click()} aria-describedby={hasHint ? base + "-hint" : undefined}>
          {props.buttonLabel || (multiple ? "Choose files" : "Choose a file")}
        </Button>
        {hasHint ? <p className="dk-file-upload__hint" id={base + "-hint"}>{props.hint}</p> : null}
        <input ref={input} id={inputId} type="file" className="dk-file-upload__input" tabIndex={-1} aria-hidden name={props.name} accept={props.accept} multiple={multiple} disabled={disabled}
          onChange={(e) => { add(e.target.files); }} />
      </div>
      {rejected.length ? (
        <div className="dk-file-upload__errors" role="alert">
          {rejected.map((r, i) => <p key={i} className="dk-file-upload__error"><Icon name="error" />{r.message}</p>)}
        </div>
      ) : null}
      {files.length ? (
        <ul className="dk-file-upload__list" aria-label={multiple ? "Chosen files" : "Chosen file"}>
          {files.map((f, i) => (
            <li key={f.name + f.size + f.lastModified + i} className="dk-file-upload__item">
              <Icon name={iconFor(f)} className="dk-file-upload__file-icon" />
              <span className="dk-file-upload__file">
                <span className="dk-file-upload__name">{f.name}</span>
                <span className="dk-file-upload__size">{formatFileSize(f.size)}</span>
              </span>
              <IconButton icon="close" label={removeLabel(f.name)} size="sm" disabled={disabled} onClick={() => remove(f)} />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
});
