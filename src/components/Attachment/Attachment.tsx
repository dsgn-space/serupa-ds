'use client';
import * as React from 'react';
import { cn, domId, omit, setRef } from '../../internal/cn';
import { component } from '../../internal/component';
import { useLocale, useSettings } from '../../internal/provider';
import { Button } from '../Button/Button';
import { IconButton } from '../IconButton/IconButton';
import { Icon } from '../Icon/Icon';
import { Progress } from '../Progress/Progress';
import { formatFileSize } from '../FileUpload/formatFileSize';
import * as icons from '../../material/builtin';
import { attachmentKind, type AttachmentKind } from './attachmentKind';
import { en as ownWords } from './labels';
import { en as fileWords } from '../FileUpload/labels';
import { en as boundary } from '../ErrorBoundary/labels';
import { graphemes } from '../../internal/graphemes';

// Its own words, FileUpload's "Upload failed" for a failed one and ErrorBoundary's "Try again" for its retry button.
const words = /* @__PURE__ */ Object.assign({}, boundary, fileWords, ownWords);

export { attachmentKind };
export type { AttachmentKind };

export interface AttachmentProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** The file's name, with its extension: "Invoice March 2026.pdf". A long one is cut in the middle, so the extension and the last characters stay. */
  name: string;
  /** The file's size in bytes, shown in the locale's units ("1.5 MB", "1,5 MB" in id-ID). Leave it out when you don't know it. */
  bytes?: number | undefined;
  /** The file's MIME type, which picks its icon and kind before the extension does: "application/pdf". */
  type?: string | undefined;
  /** The kind of file, when neither the type nor the extension tells: its icon and the word before the size. Default: from type and name (attachmentKind). */
  kind?: AttachmentKind | undefined;
  /** Makes the name a link that opens or downloads the file. */
  href?: string | undefined;
  /** With href, downloads the file in place of opening it, as the link's download attribute: true, or the name to save it under. */
  download?: boolean | string | undefined;
  /** While the file uploads, how far along, from 0 to 100, as a bar under the name; null when you can't tell (the bar moves on its own). Leave it out once it's done. */
  progress?: number | null | undefined;
  /** The upload failed: a danger outline and this message under the name; true shows "Upload failed". */
  error?: React.ReactNode | boolean | undefined;
  /** Called by the "Try again" button, shown only with error. */
  onRetry?: (() => void) | undefined;
  /** Called by the remove button. Without it, there is no remove button. */
  onRemove?: (() => void) | undefined;
  /** The remove button's name, given the file name. Default: (name) => `Remove ${name}`. */
  removeLabel?: ((name: string) => string) | undefined;
  /** Turns the link, the remove and the retry buttons off. Default: false. */
  disabled?: boolean | undefined;
}

const OWN = { name: 1, bytes: 1, type: 1, kind: 1, href: 1, download: 1, progress: 1, error: 1, onRetry: 1, onRemove: 1, removeLabel: 1, disabled: 1, className: 1 } as const;

const ICONS = {
  pdf: icons.PictureAsPdf, image: icons.Image, sheet: icons.TableChart, doc: icons.Description, slides: icons.Slideshow,
  archive: icons.FolderZip, code: icons.Code, audio: icons.AudioFile, video: icons.Movie, other: icons.Draft,
} as const;
const WORD = {
  pdf: 'attachmentPdf', image: 'attachmentImage', sheet: 'attachmentSheet', doc: 'attachmentDoc', slides: 'attachmentSlides',
  archive: 'attachmentArchive', code: 'attachmentCode', audio: 'attachmentAudio', video: 'attachmentVideo', other: 'attachmentOther',
} as const;

// Scripts whose letters join to the next one: a cut between two of them would show both in their unjoined forms.
const JOINS = /[\p{Script=Arabic}\p{Script=Syriac}\p{Script=Nko}\p{Script=Mongolian}\p{Script=Mandaic}\p{Script=Adlam}\p{Script=Hanifi_Rohingya}]/u;
const LETTER = /[\p{L}\p{M}]/u;

/** Where a name's end part starts, counted in characters people see (graphemes): the last 6 before the extension
 *  (up to 10 of it) stay; in a joining script the cut moves back to the start of the word it would split. */
function nameCut(chars: string[], ext: number): number {
  let at = Math.max(0, chars.length - Math.min(chars.length, Math.min(ext, 10) + 6));
  if (at > 0 && JOINS.test(chars[at - 1]) && JOINS.test(chars[at])) {
    while (at > 0 && LETTER.test(chars[at - 1])) at--;
  }
  return at;
}

/* A file's name, cut in the middle when it doesn't fit, as Finder and Drive do: the start shrinks to an ellipsis and
   the last few characters and the extension stay, so "report-2025.pdf" and "report-2026.pdf" still look different.
   While it fits (and on the server) it is one run of text, so nothing in it is split; it's cut only once it overflows,
   on grapheme boundaries (graphemes.ts), so letters with their vowel signs, ZWJ emoji and accents stay whole.
   dir="auto" lays it out in the name's own direction. The parts are hidden from screen readers, which read the
   whole name once, and title shows it in full on hover. */
function FileName({ name, id }: { name: string; id: string }) {
  const [el, setEl] = React.useState<HTMLSpanElement | null>(null);
  const [cut, setCut] = React.useState(false);
  React.useEffect(() => {
    if (!el || typeof ResizeObserver === 'undefined') return;
    const check = () => {
      const part = el.firstElementChild;
      // Whole: cut once it overflows. Cut: the start part still shrinks while the name doesn't fit; once it shows in
      // full, the whole name fits again.
      if (part instanceof HTMLElement) setCut(part.scrollWidth > part.clientWidth + 1);
    };
    const ro = new ResizeObserver(check);
    ro.observe(el);
    if (el.parentElement) ro.observe(el.parentElement);
    check();
    return () => ro.disconnect();
  }, [el, name, cut]);
  const chars = cut ? graphemes(name) : [], dot = name.lastIndexOf('.');
  const at = cut ? nameCut(chars, dot > 0 ? graphemes(name.slice(dot)).length : 0) : 0;
  return (
    <span ref={setEl} className="dk-attachment__name-text" dir="auto" title={name}>
      {cut && at > 0 ? (
        <>
          <span className="dk-attachment__name-start" aria-hidden>{chars.slice(0, at).join('')}</span>
          <span className="dk-attachment__name-end" aria-hidden>{chars.slice(at).join('')}</span>
        </>
      ) : <span className="dk-attachment__name-start" aria-hidden>{name}</span>}
      <span className="dk-visually-hidden" id={id}>{name}</span>
    </span>
  );
}

/* Attachment: a file as one compact row: an icon for its kind, the name (a link with href), its kind and size in
   muted text, an upload bar while progress is set, a danger message with error, and a remove button with onRemove.
   It says nothing by itself as the upload moves: the app that uploads says when one finishes or fails. */
/** A file as a compact item: its type icon, name, kind and size, with upload progress, an error and a remove button.
 *  @beta New: its API may still change in a minor release. Take this tag off once it has shipped with its bug bash done (CONTRIBUTING.md). */
export const Attachment = /* @__PURE__ */ component<HTMLDivElement, AttachmentProps>('Attachment', function Attachment(props, ref) {
  const sds = useSettings(words), locale = useLocale(), L = sds.labels;
  const rest = omit(props, OWN);
  const base = domId('dk-at', React.useId());
  const kind = props.kind || attachmentKind(props.name, props.type);
  const disabled = !!props.disabled;
  const failed = props.error != null && props.error !== false && props.error !== '';
  const uploading = props.progress !== undefined && !failed;
  const size = props.bytes != null ? formatFileSize(props.bytes, locale) : '';
  const value = typeof props.progress === 'number' && isFinite(props.progress) ? Math.min(100, Math.max(0, props.progress)) : null;
  const name = <FileName name={props.name} id={base + '-name'} />;
  const removeLabel = props.removeLabel || ((n: string) => L.remove + ' ' + n);
  return (
    <div {...rest} ref={(n) => setRef(ref, n)} className={cn('dk-attachment', failed && 'dk-attachment--error', uploading && 'dk-attachment--uploading', disabled && 'dk-attachment--disabled', props.className)} data-component="attachment" data-kind={kind}>
      <Icon icon={ICONS[kind]} className="dk-attachment__icon" />
      <span className="dk-attachment__body">
        {props.href && !disabled ? (
          <a className="dk-attachment__name" href={props.href} download={props.download === true ? '' : props.download || undefined} aria-describedby={cn(base + '-meta', failed && base + '-error')}>{name}</a>
        ) : <span className="dk-attachment__name">{name}</span>}
        <span className="dk-attachment__meta" id={base + '-meta'} dir="auto">
          <span className="dk-attachment__kind">{L[WORD[kind]]}</span>
          {size ? <span className="dk-attachment__size">{size}</span> : null}
        </span>
        {uploading ? <Progress className="dk-attachment__progress" size="sm" value={value} aria-labelledby={base + '-name'} /> : null}
        {failed ? <span className="dk-attachment__error" id={base + '-error'}><Icon icon={icons.Error} />{props.error === true ? L.fileError : props.error}</span> : null}
      </span>
      {failed && props.onRetry ? (
        <Button className="dk-attachment__retry" variant="ghost" size="sm" disabled={disabled} onClick={props.onRetry} aria-labelledby={base + '-retry ' + base + '-name'} aria-describedby={base + '-error'}>
          <span id={base + '-retry'}>{L.tryAgain}</span>
        </Button>
      ) : null}
      {props.onRemove ? <IconButton className="dk-attachment__remove" icon={icons.Close} label={removeLabel(props.name)} size="sm" variant="ghost" disabled={disabled} onClick={props.onRemove} /> : null}
    </div>
  );
});
