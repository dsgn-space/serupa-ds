'use client';
import * as React from 'react';
import { cn, oneOf, omit, SIZES } from '../../internal/cn';
import { announce, ensureAnnouncer } from '../../internal/announce';
import { named } from '../../internal/component';
import { useSettings } from '../../internal/provider';
import { useShowAfter } from '../../internal/showAfter';
import { spinnerDelay } from '../../internal/timing';

export type SkeletonShape = 'text' | 'circle' | 'rect';
export interface SkeletonProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** 'text' (default): lines as tall as the size's text line, full width, the last of several shorter. 'circle': an
      avatar, the size's 24px by default. 'rect': an image or card, full width and 96px tall. Width and height follow
      utility classes (w-48, size-12, h-40, aspect-video). */
  shape?: SkeletonShape | undefined;
  /** With shape 'text': how many lines, 1 (default) to 20. */
  lines?: number | undefined;
  /** The text lines: sm text-xs, md text-sm (default), lg text-base. The circle: sm 16px, md 24px, lg 40px. */
  size?: 'sm' | 'md' | 'lg' | undefined;
  /** 'neutral' (default): the text color, so it fits any surface. 'inverse': white, for dark scrims and media. */
  tone?: 'neutral' | 'inverse' | undefined;
  /** Announced to screen readers when it appears, and its accessible name (role="progressbar"). Default: 'Loading'.
      Pass '' when something nearby already says it's loading (several skeletons on one screen: name one, or the
      region with aria-busy). */
  label?: string | undefined;
  /** Milliseconds to wait before showing, so fast requests don't flash it. Its shapes keep their space meanwhile.
      Default: 300. 0 shows it at once. */
  delay?: number | undefined;
  /** Whether it's loading. Keep it mounted and pass false when the content arrives: once shown, it stays at least
      500ms, so it never flashes, then renders nothing. Default: true. */
  loading?: boolean | undefined;
}

const SHAPES: readonly SkeletonShape[] = ['text', 'circle', 'rect'];
const TONES = ['neutral', 'inverse'] as const;
const OWN = { shape: 1, lines: 1, size: 1, tone: 1, label: 1, delay: 1, loading: 1, className: 1 } as const;

function SkeletonRender({ ref, ...props }: SkeletonProps & React.RefAttributes<HTMLSpanElement>) {
  const sds = useSettings();
  const rest = omit(props, OWN);
  const shape = oneOf(SHAPES, props.shape, 'text');
  const size = oneOf(SIZES, props.size, 'md');
  const tone = oneOf(TONES, props.tone, 'neutral');
  const label = props.label == null ? sds.labels.loading : String(props.label);
  const lines = Math.min(20, Math.max(1, Math.floor(Number(props.lines)) || 1));
  const delay = props.delay == null ? spinnerDelay : Math.max(0, Number(props.delay) || 0);
  const [wait] = React.useState(delay);   // the delay it mounted with: a later change doesn't restart the wait
  const loading = props.loading !== false;
  const shown = useShowAfter(loading, wait);
  React.useEffect(function () { ensureAnnouncer(); }, []);   // no cleanup: the region is shared
  // Announced once, when it shows, with the label it has then (a later label change isn't announced again).
  const latestLabel = React.useRef(label);
  React.useEffect(function () { latestLabel.current = label; });   // every render: keeps the latest label
  React.useEffect(function () { if (shown && latestLabel.current) announce(latestLabel.current); }, [shown]);

  if (!loading && !shown) return null;   // done, and shown long enough (or never shown)
  rest['data-component'] = 'skeleton';
  rest['data-shape'] = shape;
  rest['data-size'] = size;
  if (shown && label) {   // an indeterminate progress bar (no value), named by label
    rest.role = 'progressbar';
    rest['aria-label'] = label;
  } else rest['aria-hidden'] = true;
  // The shapes are drawn even while waiting, so the space they keep is the content's.
  const bones: React.ReactNode[] = [];
  if (shape === 'text') for (let i = 0; i < lines; i++) bones.push(<span className="srp-skeleton__line" key={i}><span className="srp-skeleton__bone" /></span>);
  else bones.push(<span className="srp-skeleton__bone" key="bone" />);
  return <span {...rest} ref={ref} className={cn('srp-skeleton', 'srp-skeleton--' + shape, 'srp-skeleton--size-' + size, tone === 'inverse' && 'srp-skeleton--inverse', !shown && 'srp-skeleton--waiting', props.className)}>{bones}</span>;
}

/* Skeleton: placeholder shapes where content is loading, so the page keeps its layout while it waits. Shapes:
   "text" (lines, the last of several shorter), "circle" (an avatar) and "rect" (an image or a card). Like Loader,
   it waits delay ms (300) before it shows, stays at least 500ms, and says label ("Loading") once. */
/** Placeholder shapes (lines, a circle, a rectangle) where content is loading, so the layout holds while it waits.
 *  @beta New: its API may still change in a minor release. Take this tag off once it has shipped with its bug bash done (CONTRIBUTING.md). */
export const Skeleton = /* @__PURE__ */ named('Skeleton', SkeletonRender);
