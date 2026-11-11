import * as React from 'react';
import { cn } from './cn';
import { announce, ensureAnnouncer } from './announce';
import { useShowAfter } from './showAfter';
import { spinnerDelay } from './timing';

/** The markup of a decorative `<Loader variant="skeleton" />` (label=""): placeholder shapes in Loader's classes, so
    they look, move and stand still (reduced motion, forced colors) exactly as Loader's do, without carrying the whole
    Loader. While `waiting` (the loader's delay), they keep their space and show nothing. */
export function SkeletonArt({ shape = 'text', lines = 1, waiting, className }: { shape?: 'text' | 'circle' | 'rect'; lines?: number; waiting?: boolean; className?: string }): React.ReactElement {
  const bones: React.ReactNode[] = [];
  if (shape === 'text') for (let i = 0; i < lines; i++) bones.push(<span className="dk-loader__line" key={i}><span className="dk-loader__bone" /></span>);
  else bones.push(<span className="dk-loader__bone" key="bone" />);
  return (
    <span data-component="loader" data-variant="skeleton" data-size="md" data-shape={shape} aria-hidden
      className={cn('dk-loader dk-loader--skeleton', 'dk-loader--shape-' + shape, 'dk-loader--size-md', waiting && 'dk-loader--waiting', className)}>
      {bones}
    </span>
  );
}

/** For a group of decorative skeletons standing in for rows: after the loader's delay (a quick load shows and says
    nothing), returns true and says `label` once, as a named Loader would. The rows' container carries aria-busy. */
export function useSkeletonShown(label: string): boolean {
  const shown = useShowAfter(true, spinnerDelay);
  const latest = React.useRef(label);
  React.useEffect(function () { latest.current = label; });   // every render: keeps the latest label
  React.useEffect(function () { ensureAnnouncer(); }, []);   // no cleanup: the region is shared
  React.useEffect(function () { if (shown && latest.current) announce(latest.current); }, [shown]);
  return shown;
}
