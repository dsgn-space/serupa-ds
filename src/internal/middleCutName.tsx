import * as React from 'react';
import { graphemes } from './graphemes';
import { middleCutAt } from './middleCut';
import { useIsoLayoutEffect } from './cn';
import { Tooltip } from '../components/Tooltip/Tooltip';

/* Shared by Attachment and FileUpload, so both cut a file's name the same way. Each passes its class names, all of
   them written out in its own file, where the build finds the styles it needs (dist/components.json). */
/* A file's name, cut in the middle when it doesn't fit, as Finder and Drive do: the start shrinks to an ellipsis and
   the last few characters and the extension stay, so "report-2025.pdf" and "report-2026.pdf" still look different.
   While it fits (and on the server) it is one run of text, so nothing in it is split; it's cut only once it overflows,
   on grapheme boundaries (graphemes.ts), so letters with their vowel signs, ZWJ emoji and accents stay whole.
   dir="auto" lays it out in the name's own direction. The parts are hidden from screen readers, which read the
   whole name once. Cut, it shows in full in a tooltip on hover and on keyboard focus: the focus of the link around it
   (Attachment's), or its own, since then it takes a tab stop of its own (as TruncatedText does). */
// A control around the name that takes focus itself: the name adds no tab stop of its own inside one.
const CONTROL = 'a[href], button, [role="button"], [role="link"], [tabindex="0"]';
export function MiddleCutName({ name, id, cls }: { name: string; id?: string | undefined; cls: { root: string; start: string; end: string; hidden: string } }) {
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
  const chars = cut ? graphemes(name) : [];
  const at = cut ? middleCutAt(name, chars) : 0;
  const [open, setOpen] = React.useState(false);
  const [inside, setInside] = React.useState(false);
  if (!cut && open) setOpen(false);
  useIsoLayoutEffect(() => {
    const control = el && el.parentElement ? el.parentElement.closest<HTMLElement>(CONTROL) : null;
    setInside(!!control);
    if (!control) return;
    const focus = () => { if (cut && control.matches(':focus-visible')) setOpen(true); };
    const blur = () => setOpen(false);
    control.addEventListener('focus', focus);
    control.addEventListener('blur', blur);
    return () => { control.removeEventListener('focus', focus); control.removeEventListener('blur', blur); };
  }, [el, cut]);
  return (
    <Tooltip visual content={name} open={open} onOpenChange={setOpen} disabled={!cut}>
      <span ref={setEl} className={cls.root} dir="auto" data-cut={cut ? '' : undefined} tabIndex={cut && !inside ? 0 : undefined}>
        {cut && at > 0 ? (
          <>
            <span className={cls.start} aria-hidden>{chars.slice(0, at).join('')}</span>
            <span className={cls.end} aria-hidden>{chars.slice(at).join('')}</span>
          </>
        ) : <span className={cls.start} aria-hidden>{name}</span>}
        <span className={cls.hidden} id={id}>{name}</span>
      </span>
    </Tooltip>
  );
}
