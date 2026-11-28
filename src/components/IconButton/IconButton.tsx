import * as React from 'react';
import { warnOnce } from '../../internal/warn';
import type { IconSource } from '../Icon/Icon';
import { cn } from '../../internal/cn';
import { ButtonBase, type ButtonAsButtonProps, type ButtonAsLinkProps } from '../Button/Button';
import { named } from '../../internal/component';
import { Tooltip } from '../Tooltip/Tooltip';

type Without<T> = T extends unknown ? Omit<T, 'icon' | 'startIcon' | 'endIcon' | 'children' | 'aria-label'> : never;

interface IconButtonOwnProps {
  /** The icon: a custom or Material Symbols name ("more_vert") or any element. */
  icon: IconSource;
  /** What the button does: its name for screen readers (aria-label), and a Tooltip on hover and keyboard focus. Required: an icon alone has no name. */
  label: string;
  /** 'square' (default, the Button's corners) or 'circle', as Avatar and Skeleton name it. 'round' is the old name for
   *  'circle': it still works, with a warning in development, until the next major release. */
  shape?: 'square' | 'circle' | 'round' | undefined;
  /** Leaves out the tooltip, for when visible text next to it already shows the label. A Tooltip of your own around it (aria-describedby or aria-labelledby) replaces it by itself. Default: false. */
  hideTitle?: boolean | undefined;
}

export type IconButtonProps = Without<ButtonAsButtonProps> & IconButtonOwnProps | Without<ButtonAsLinkProps> & IconButtonOwnProps;

// Named, so the type declarations print it as written: a bare union's members come out in whichever order the
// compiler met them, and index.d.ts then differs from one build to the next (tools/test/reproducible.mjs).
type IconButtonElement = HTMLButtonElement | HTMLAnchorElement;

function IconButtonRender({ ref, ...props }: IconButtonProps & React.RefAttributes<IconButtonElement>) {
  const { icon, label, shape, hideTitle, className, ...rest } = props;
  const round = shape === 'circle' || shape === 'round';
  if (process.env.NODE_ENV !== 'production' && shape === 'round') warnOnce('shape-round', 'IconButton: shape="round" is now shape="circle", the name Avatar and Skeleton use. "round" goes in the next major release.', 'shape-round:IconButton');
  // The label shows in a Tooltip on hover and on keyboard focus, which a native title never does. None when a Tooltip
  // of yours (or anything else) already describes or names it, with hideTitle, or with a title of your own.
  const own = hideTitle || rest.title != null || rest['aria-describedby'] != null || rest['aria-labelledby'] != null;
  // aria-label isn't in the props, but from JavaScript (or a spread) it's taken as label, as Button takes it.
  const name = label || (rest as { 'aria-label'?: string })['aria-label'];
  const button = <ButtonBase variant="ghost" {...rest} aria-label={name} data-shape={round ? 'round' : 'square'}
    ref={ref} icon={icon} className={cn('srp-icon-btn', round && 'srp-icon-btn--round', className)} />;
  // role="label": the tooltip says the button's name, so it isn't read a second time as a description.
  return own || !name ? button : <Tooltip content={name} role="label" disabled={!!rest.disabled}>{button}</Tooltip>;
}

/* IconButton: a Button that shows only an icon, with a required label (its accessible name and a title tooltip).
   Variant defaults to "ghost"; shape "square" (default) or "circle". Every other Button prop (size, destructive,
   loading, href, onClick, ref…) works the same. */
/** A Button that shows only an icon, with a required label for screen readers. Default variant: ghost. */
export const IconButton = /* @__PURE__ */ named('IconButton', IconButtonRender);
