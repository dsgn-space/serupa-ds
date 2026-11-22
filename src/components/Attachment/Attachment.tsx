'use client';
import * as React from 'react';
import { cn, domId, omit } from '../../internal/cn';
import { named } from '../../internal/component';
import { useLocale, useSettings } from '../../internal/provider';
import { Button } from '../Button/Button';
import { IconButton } from '../IconButton/IconButton';
import { Icon } from '../Icon/Icon';
import { Progress } from '../Progress/Progress';
import { formatFileSize } from '../../internal/formatFileSize';
import * as icons from '../../material/builtin';
import { attachmentKind, type AttachmentKind } from '../../internal/fileKind';
import { KIND_ICONS } from '../../internal/fileKindIcon';
import { en as ownWords } from './labels';
import { en as fileWords } from '../FileUpload/labels';
import { en as boundary } from '../ErrorBoundary/labels';
import { en as progressWords } from '../Progress/labels';
import { MiddleCutName } from '../../internal/middleCutName';

// Its own words, FileUpload's "Couldn’t upload" for a failed one, ErrorBoundary's "Try again" for its retry button and
// Progress's "Complete" for one that's done.
const words = /* @__PURE__ */ Object.assign(Object.assign({}, boundary, progressWords), fileWords, ownWords);

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
  /** Shown in place of the kind's icon, such as a small picture of an image file. Keep it 40px or under. */
  thumbnail?: React.ReactNode | undefined;
  /** The upload finished: "Complete" with a check after the size. Default: false. */
  done?: boolean | undefined;
  /** The upload failed: a danger outline and this message under the name; true shows "Couldn’t upload". */
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

const OWN = { name: 1, bytes: 1, type: 1, kind: 1, href: 1, download: 1, progress: 1, thumbnail: 1, done: 1, error: 1, onRetry: 1, onRemove: 1, removeLabel: 1, disabled: 1, className: 1 } as const;

const ICONS = KIND_ICONS;
const WORD = {
  pdf: 'attachmentPdf', image: 'attachmentImage', sheet: 'attachmentSheet', doc: 'attachmentDoc', slides: 'attachmentSlides',
  archive: 'attachmentArchive', code: 'attachmentCode', audio: 'attachmentAudio', video: 'attachmentVideo', other: 'attachmentOther',
} as const;

const NAME = { root: 'srp-attachment__name-text', start: 'srp-attachment__name-start', end: 'srp-attachment__name-end', hidden: 'srp-visually-hidden' };

function AttachmentRender({ ref, ...props }: AttachmentProps & React.RefAttributes<HTMLDivElement>) {
  const sds = useSettings(words), locale = useLocale(), L = sds.labels;
  const rest = omit(props, OWN);
  const base = domId('srp-at', React.useId());
  const kind = props.kind || attachmentKind(props.name, props.type);
  const disabled = !!props.disabled;
  const failed = props.error != null && props.error !== false && props.error !== '';
  const uploading = props.progress !== undefined && !failed;
  const size = props.bytes != null ? formatFileSize(props.bytes, locale) : '';
  const value = typeof props.progress === 'number' && isFinite(props.progress) ? Math.min(100, Math.max(0, props.progress)) : null;
  const name = <MiddleCutName name={props.name} id={base + '-name'} cls={NAME} />;
  const removeLabel = props.removeLabel || ((n: string) => L.remove + ' ' + n);
  return (
    <div {...rest} ref={ref} className={cn('srp-attachment', failed && 'srp-attachment--error', uploading && 'srp-attachment--uploading', disabled && 'srp-attachment--disabled', props.className)} data-component="attachment" data-kind={kind}>
      {props.thumbnail != null ? <span className="srp-attachment__thumbnail">{props.thumbnail}</span> : <Icon icon={ICONS[kind]} className="srp-attachment__icon" />}
      <span className="srp-attachment__body">
        {props.href && !disabled ? (
          <a className="srp-attachment__name" href={props.href} download={props.download === true ? '' : props.download || undefined} aria-describedby={cn(base + '-meta', failed && base + '-error')}>{name}</a>
        ) : <span className="srp-attachment__name">{name}</span>}
        <span className="srp-attachment__meta" id={base + '-meta'} dir="auto">
          <span className="srp-attachment__kind">{L[WORD[kind]]}</span>
          {size ? <span className="srp-attachment__size">{size}</span> : null}
          {props.done && !failed && !uploading ? <span className="srp-attachment__done"><Icon icon={icons.CheckCircle} />{L.progressComplete('')}</span> : null}
        </span>
        {uploading ? <Progress className="srp-attachment__progress" size="sm" value={value} aria-labelledby={base + '-name'} /> : null}
        {failed ? <span className="srp-attachment__error" id={base + '-error'}><Icon icon={icons.Error} />{props.error === true ? L.fileError : props.error}</span> : null}
      </span>
      {failed && props.onRetry ? (
        <Button className="srp-attachment__retry" variant="ghost" size="sm" disabled={disabled} onClick={props.onRetry} aria-labelledby={base + '-retry ' + base + '-name'} aria-describedby={base + '-error'}>
          <span id={base + '-retry'}>{L.tryAgain}</span>
        </Button>
      ) : null}
      {props.onRemove ? <IconButton className="srp-attachment__remove" icon={icons.Close} label={removeLabel(props.name)} size="sm" variant="ghost" disabled={disabled} onClick={props.onRemove} /> : null}
    </div>
  );
}

/* Attachment: a file as one compact row: an icon for its kind, the name (a link with href), its kind and size in
   muted text, an upload bar while progress is set, a danger message with error, and a remove button with onRemove.
   It says nothing by itself as the upload moves: the app that uploads says when one finishes or fails. */
/** A file as a compact item: its type icon, name, kind and size, with upload progress, an error and a remove button.
 *  @beta New: its API may still change in a minor release. Take this tag off once it has shipped with its bug bash done (CONTRIBUTING.md). */
export const Attachment = /* @__PURE__ */ named('Attachment', AttachmentRender);
