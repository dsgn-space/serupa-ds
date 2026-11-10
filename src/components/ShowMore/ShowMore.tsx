'use client';
import * as React from 'react';
import { cn, domId, omit, useIsoLayoutEffect } from '../../internal/cn';
import { component } from '../../internal/component';
import { useSettings } from '../../internal/provider';
import { Button } from '../Button/Button';
import { en as words } from './labels';

export interface ShowMoreProps extends React.HTMLAttributes<HTMLDivElement> {
  /** How many lines show while it's closed; the last is cut with an ellipsis. Default: 3. */
  lines?: number | undefined;
  /** Open (controlled): all of it shows. Use with onExpandedChange. */
  expanded?: boolean | undefined;
  /** Open at first (uncontrolled). Default: false. */
  defaultExpanded?: boolean | undefined;
  /** Called with the new open state when the button is pressed. */
  onExpandedChange?: ((expanded: boolean) => void) | undefined;
  /** The long text: a string, or paragraphs. */
  children?: React.ReactNode;
}

/* ShowMore: long text cut after a few lines, with a "Show more" button under it that shows the rest and becomes
   "Show less". The button appears only when the text is cut (measured, and again when its width changes), so short
   text shows as it is. The hidden lines stay in the page: screen readers read them and find-in-page finds them;
   the button is for the eye. */
const OWN = { lines: 1, expanded: 1, defaultExpanded: 1, onExpandedChange: 1, className: 1, children: 1 } as const;

/** Long text cut after a few lines, with a Show more button that shows the rest.
 *  @beta New: its API may still change in a minor release. Take this tag off once it has shipped with its bug bash done (CONTRIBUTING.md). */
export const ShowMore = /* @__PURE__ */ component<HTMLDivElement, ShowMoreProps>('ShowMore', function ShowMore(props, ref) {
  const rest = omit(props, OWN);
  const L = useSettings(words).labels;
  const base = domId('dk-sm', React.useId());
  const lines = Math.max(1, Math.floor(Number(props.lines)) || 3);
  const controlled = props.expanded !== undefined;
  const [own, setOwn] = React.useState(!!props.defaultExpanded);
  const open = controlled ? !!props.expanded : own;
  const content = React.useRef<HTMLDivElement | null>(null);
  const [cut, setCut] = React.useState(false);
  // Whether the closed text is cut: measured after each render while closed, and when its box changes size.
  useIsoLayoutEffect(() => {
    const n = content.current;
    if (!n || open) return;
    const measure = () => setCut(n.scrollHeight > n.clientHeight + 1);
    measure();
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    if (ro) ro.observe(n);
    return () => { if (ro) ro.disconnect(); };
  }, [open, lines, props.children]);
  const toggle = () => { if (!controlled) setOwn(!open); if (props.onExpandedChange) props.onExpandedChange(!open); };
  return (
    <div {...rest} ref={ref} className={cn('dk-show-more', props.className)} data-component="show-more" data-expanded={open ? '' : undefined}>
      <div id={base + '-text'} ref={content} className={cn('dk-show-more__text', !open && 'dk-show-more__text--cut')}
        style={open ? undefined : ({ '--dk-show-more-lines': lines } as React.CSSProperties)}>{props.children}</div>
      {open || cut ? (
        <Button variant="link" size="sm" className="dk-show-more__toggle" aria-expanded={open} aria-controls={base + '-text'} onClick={toggle}>
          {open ? L.showLess : L.showMore}
        </Button>
      ) : null}
    </div>
  );
});
