'use client';
import * as React from 'react';
import { cn, oneOf, omit, SIZES } from '../../internal/cn';
import { announce, ensureAnnouncer } from '../../internal/announce';
import { named } from '../../internal/component';
import { useSettings } from '../../internal/provider';
import { useShowAfter } from '../../internal/showAfter';
import { RingArt } from '../../internal/loaderRing';
import { spinnerDelay } from '../../internal/timing';

export type LoaderVariant = 'ring' | 'dots' | 'text';
export type LoaderTone = 'neutral' | 'primary' | 'muted' | 'inverse';
export interface LoaderProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** 'ring' (default): an arc that grows and shrinks as it turns on a faint track. 'dots': three pulsing dots, softer, for chat-like or inline waits. 'text': the label's words with a shine sweeping through them. For placeholder shapes where the content will be, use `<Skeleton>`. */
  variant?: LoaderVariant | undefined;
  /** sm 16px (inline, small controls), md 24px (default: cards, panels, lists), lg 40px (a page or empty area). The text variant's words: text-xs, text-sm, text-base. */
  size?: 'sm' | 'md' | 'lg' | undefined;
  /** 'neutral' (default): the text color, so it fits any surface. 'primary' or 'muted' color the ring or dots with those aliases (the text variant stays in the text color). 'inverse': white in every theme, for dark scrims, overlays and media. */
  tone?: LoaderTone | undefined;
  /** Announced to screen readers when the loader appears, and its accessible name (role="progressbar"); the words the text variant shows. Default: 'Loading'. Pass '' when something nearby already announces it (the loader is then decorative). */
  label?: string | undefined;
  /** Milliseconds to wait before showing, so fast requests don't flash a loader. Its space is kept meanwhile. Default: 300. 0 shows it at once. */
  delay?: number | undefined;
  /** Whether it's loading. Keep the Loader mounted and pass false when the work ends: once shown, it stays at least 500ms, so it never flashes, then renders nothing. Default: true. */
  loading?: boolean | undefined;
}

/* Loader: shows that something is loading when you can't say how far along it is.
   variant "ring" (an arc that grows and shrinks as it turns on a faint track), "dots" (three pulsing dots) or "text"
   (the label's words, with a shine sweeping through them); sizes sm, md, lg (16, 24, 40px drawings; text-xs, text-sm,
   text-base words); tone "neutral" (the text color), "primary", "muted" (the ring or dots) or "inverse" (white, for
   dark scrims and media). By default it waits delay ms (300) before it appears, so fast requests don't flash it, then
   stays at least 500ms (loading={false} ends it), and announces label ("Loading") to screen readers; label="" makes it
   decorative, for when something nearby already says it's loading. */
const VARIANTS: readonly LoaderVariant[] = ['ring', 'dots', 'text'];
const TONES: readonly LoaderTone[] = ['neutral', 'primary', 'muted', 'inverse'];
// shape, lines, pattern and glow went with the skeleton and pixel variants in 19.0.0: still kept off the <span>, so an
// old call site draws a ring rather than unknown attributes.
const OWN = { variant: 1, size: 1, tone: 1, label: 1, delay: 1, loading: 1, className: 1, shape: 1, lines: 1, pattern: 1, glow: 1 } as const;

function LoaderRender({ ref, ...props }: LoaderProps & React.RefAttributes<HTMLSpanElement>) {
  const sds = useSettings();
  const rest = omit(props, OWN);
  const variant = oneOf(VARIANTS, props.variant, 'ring');
  const size = oneOf(SIZES, props.size, 'md');
  const tone = oneOf(TONES, props.tone, 'neutral');
  const label = props.label == null ? sds.labels.loading : String(props.label);
  const isText = variant === 'text';
  const words = label || sds.labels.loading;   // the text variant always shows words; label="" only makes it decorative
  const delay = props.delay == null ? spinnerDelay : Math.max(0, Number(props.delay) || 0);
  const [wait] = React.useState(delay);   // the delay it mounted with: a later change doesn't restart the wait
  const loading = props.loading !== false;
  const shown = useShowAfter(loading, wait);
  React.useEffect(function () { ensureAnnouncer(); }, []);   // no cleanup: the region is shared
  // Announced once, when it shows, with the label it has then (a later label change isn't announced again).
  const latestLabel = React.useRef(label);
  React.useEffect(function () { latestLabel.current = label; });   // every render: keeps the latest label
  React.useEffect(function () { if (shown && latestLabel.current) announce(latestLabel.current); }, [shown]);

  rest['data-component'] = 'loader';
  rest['data-variant'] = variant;
  rest['data-size'] = size;
  if (shown && label) {   // an indeterminate progress bar (no value), named by label
    rest.role = 'progressbar';
    rest['aria-label'] = label;
  } else rest['aria-hidden'] = true;
  const drawing = !shown || isText ? null : variant === 'dots'
    ? <svg width="1em" height="1em" viewBox="0 0 24 24" aria-hidden focusable="false">
        <circle className="srp-loader__dot" cx={4} cy={12} r={2.5} />
        <circle className="srp-loader__dot" cx={12} cy={12} r={2.5} />
        <circle className="srp-loader__dot" cx={20} cy={12} r={2.5} />
      </svg>
    : <RingArt />;
  // The visible label repeats the accessible name, so it's hidden from assistive tech (no double reading).
  // The glint holds a full-color copy of the words in its ::after (from data-words, so the text isn't read twice).
  const text = isText ? <span className="srp-loader__label" aria-hidden key="label">{words}<span className="srp-loader__glint" data-words={words} /></span> : null;
  const cls = cn('srp-loader', 'srp-loader--' + variant, 'srp-loader--size-' + size, tone !== 'neutral' && 'srp-loader--' + tone, !shown && 'srp-loader--waiting', props.className);
  if (!loading && !shown) return null;   // done, and shown long enough (or never shown)
  return (
    <span {...rest} ref={ref} className={cls}>
      {isText ? null : <span className="srp-loader__art" key="art">{drawing}</span>}
      {text}
    </span>
  );
}

/** Shows that something is loading when you can't say how far along it is. Mark the area that's loading with aria-busy while it shows. */
export const Loader = /* @__PURE__ */ named('Loader', LoaderRender);
