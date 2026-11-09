import * as React from 'react';
import { cn } from './cn';

/** Loader's ring (its default variant) drawn on its own. Loader draws it, and so do the components that show it while
    they work, so they don't carry the whole Loader (its other variants, the delay and the announcement). */
export function RingArt(): React.ReactElement {
  return (
    <svg width="1em" height="1em" viewBox="0 0 24 24" aria-hidden focusable="false">
      {/* a quarter arc turning (700ms a turn): Loader.css; still and breathing under reduced motion */}
      <circle className="dk-loader__track" cx={12} cy={12} r={10} />
      <circle className="dk-loader__arc" cx={12} cy={12} r={10} pathLength={100} strokeDasharray="25 150" />
    </svg>
  );
}

/** The markup of `<Loader label="" delay={0} size={size} className={className} />`: a decorative ring, shown at once
    and not announced (the component around it says what is happening). Button and Badge draw it while they load. */
export function LoaderRing({ className, size = 'md' }: { className?: string; size?: 'sm' | 'md' }): React.ReactElement {
  return (
    <span data-component="loader" data-variant="ring" data-size={size} aria-hidden className={cn('dk-loader', 'dk-loader--ring', 'dk-loader--size-' + size, className)}>
      <span className="dk-loader__art"><RingArt /></span>
    </span>
  );
}
