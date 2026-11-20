'use client';
import * as React from 'react';
import { cn } from '../../internal/cn';
import { ButtonBase, type ButtonAsButtonProps } from '../Button/Button';
import { Tooltip } from '../Tooltip/Tooltip';
import { Icon } from '../Icon/Icon';
import { named } from '../../internal/component';
import { writeText as write, writeTextLater as writeLater } from '../../internal/clipboard';
import { useSettings } from '../../internal/provider';
import { announce } from '../../internal/announce';
import * as icons from '../../material/builtin';
import { en as words } from './labels';
import { feedbackHold } from '../../internal/timing';

export interface CopyButtonProps extends Omit<ButtonAsButtonProps, 'value' | 'onCopy' | 'icon' | 'leftIcon' | 'rightIcon' | 'loading' | 'loadingLabel' | 'loadingText'> {
  /** What to copy: the text, or a function that returns it (or a promise of it) when the button is pressed. */
  value: string | (() => string | Promise<string>);
  /** The button's text. Default: "Copy" (labels.copy). */
  children?: React.ReactNode | undefined;
  /** What it shows and announces once it has copied. Default: "Copied" (labels.copied). */
  copiedLabel?: string | undefined;
  /** Shows only the icon, named by children (or "Copy") as its aria-label and tooltip. Default: false. */
  iconOnly?: boolean | undefined;
  /** How long it shows "Copied", in ms. Default: 2000. */
  timeout?: number | undefined;
  /** Called with the text once it's on the clipboard. */
  onCopy?: ((text: string) => void) | undefined;
  /** Called when the browser refuses (no permission, an insecure page). The button also announces labels.copyFailed. */
  onCopyError?: ((error: unknown) => void) | undefined;
}

function CopyButtonRender({ ref, ...props }: CopyButtonProps & React.RefAttributes<HTMLButtonElement>) {
  const sds = useSettings(words);
  const { value, children, copiedLabel, iconOnly, timeout, onCopy, onCopyError, className, variant, size, ...rest } = props;   // the rest is the Button's
  // What the last press did, shown for timeout ms: 'copied', or 'failed' (the browser refused).
  const [shown, setShown] = React.useState<'copied' | 'failed' | null>(null);
  const copied = shown === 'copied', failed = shown === 'failed';
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  React.useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const label = children == null || (children as unknown) === false ? sds.labels.copy : children;
  const done = copiedLabel || sds.labels.copied;
  const name = typeof label === 'string' ? label : sds.labels.copy;
  const show = (what: 'copied' | 'failed') => {
    setShown(what);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setShown(null), timeout ?? feedbackHold);
  };
  const onClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (props.onClick) props.onClick(e);
    if (e.defaultPrevented) return;
    try {
      // Nothing awaited before the write starts, so it's still inside the press.
      const got = typeof value === 'function' ? value() : value;
      let text: string;
      const at = e.currentTarget;
      if (typeof got === 'string') { text = got; await write(text, at); } else text = await writeLater(Promise.resolve(got), at);
      show('copied');
      announce(done);
      if (onCopy) onCopy(text);
    } catch (err) {
      // The last copy's "Copied" may still show: it's replaced, so the button doesn't say this one worked (L8E60). The
      // failure shows on the button as well as being said, so people who can see it aren't left guessing (copy-button guide).
      show('failed');
      announce(sds.labels.copyFailed, { assertive: true });
      if (onCopyError) onCopyError(err);
    }
  };
  // Both icons share one cell and cross-fade (KW18): the copy icon gives way to the check as one icon changing.
  const glyph = <span className="dk-copy-btn__icons">
    <Icon icon={icons.ContentCopy} className="dk-copy-btn__icon dk-copy-btn__icon--copy" />
    <Icon icon={icons.Check} className="dk-copy-btn__icon dk-copy-btn__icon--done" />
    <Icon icon={icons.Error} className="dk-copy-btn__icon dk-copy-btn__icon--failed" />
  </span>;
  const failedShort = sds.labels.copyFailedShort;
  const common = {
    ...rest, ref: ref as React.Ref<HTMLElement>, onClick, variant: variant || 'outline', size: size || 'sm',
    'data-copied': copied ? '' : undefined, 'data-failed': failed ? '' : undefined, className: cn('dk-copy-btn', copied && 'dk-copy-btn--copied', failed && 'dk-copy-btn--failed', className),
  };
  if (iconOnly) {
    // Its name shows in a Tooltip on hover and on keyboard focus, as IconButton's does: a title shows on hover only.
    // The tooltip names it, so it says "Copied" too while the check shows. None when you describe or name it yourself.
    const said = copied ? done : failed ? failedShort : name;
    const button = <ButtonBase {...common} icon={glyph} aria-label={said} />;
    const own = rest.title != null || rest['aria-describedby'] != null || rest['aria-labelledby'] != null;
    return own ? button : <Tooltip content={said} role="label">{button}</Tooltip>;
  }
  // Both labels sit in one grid cell, so the button keeps the wider one's width; only the current one is read out.
  return <ButtonBase {...common} leftIcon={glyph}>
    <span className="dk-copy-btn__labels">
      <span className={cn('dk-copy-btn__label', shown && 'dk-copy-btn__label--off')} aria-hidden={shown ? true : undefined}>{label}</span>
      <span className={cn('dk-copy-btn__label', !copied && 'dk-copy-btn__label--off')} aria-hidden={!copied || undefined}>{done}</span>
      {/* Only while it shows: a rare message, so the button's usual width stays that of "Copy" and "Copied". */}
      {failed ? <span className="dk-copy-btn__label">{failedShort}</span> : null}
    </span>
  </ButtonBase>;
}

/* CopyButton: a Button that copies value to the clipboard, then shows a check and "Copied" for timeout ms and
   says "Copied" to screen readers (politely). If the browser refuses, it says labels.copyFailed instead and calls
   onCopyError, and shows an error icon and labels.copyFailedShort for the same time. "Copy" and "Copied" take the
   same space, so the button doesn't change width as it copies. iconOnly shows just the icon.
   Variant defaults to "outline" and size to "sm"; every other Button prop and ref go to the <button>. */
/** A button that copies text to the clipboard, then shows "Copied" with a check and says so to screen readers. */
export const CopyButton = /* @__PURE__ */ named('CopyButton', CopyButtonRender);
