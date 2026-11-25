import * as React from 'react';
import { cn } from './cn';
import { announce, ensureAnnouncer } from './announce';
import { useShowAfter } from './showAfter';
import { spinnerDelay } from './timing';

/** The markup of a decorative `<Skeleton label="" />`: placeholder shapes in Skeleton's classes, so they look, move
    and stand still (reduced motion, forced colors) exactly as Skeleton's do, without carrying the component. While `waiting` (the loader's delay), they keep their space and show nothing. */
export function SkeletonArt({ shape = 'text', lines = 1, waiting, className }: { shape?: 'text' | 'circle' | 'rect'; lines?: number; waiting?: boolean; className?: string }): React.ReactElement {
  const bones: React.ReactNode[] = [];
  if (shape === 'text') for (let i = 0; i < lines; i++) bones.push(<span className="srp-skeleton__line" key={i}><span className="srp-skeleton__bone" /></span>);
  else bones.push(<span className="srp-skeleton__bone" key="bone" />);
  return (
    <span data-component="skeleton" data-size="md" data-shape={shape} aria-hidden
      className={cn('srp-skeleton', 'srp-skeleton--' + shape, 'srp-skeleton--size-md', waiting && 'srp-skeleton--waiting', className)}>
      {bones}
    </span>
  );
}

/** For a group of decorative skeletons standing in for rows: after the loader's delay (a quick load shows and says
    nothing), returns true and says `label` once, as a named Skeleton would. The rows' container carries aria-busy. */
export function useSkeletonShown(label: string): boolean {
  const shown = useShowAfter(true, spinnerDelay);
  const latest = React.useRef(label);
  React.useEffect(function () { latest.current = label; });   // every render: keeps the latest label
  React.useEffect(function () { ensureAnnouncer(); }, []);   // no cleanup: the region is shared
  React.useEffect(function () { if (shown && latest.current) announce(latest.current); }, [shown]);
  return shown;
}
