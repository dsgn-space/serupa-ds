import * as React from "react";
import { cn } from "../../internal/cn";
import { Button, type ButtonAsButtonProps, type ButtonAsLinkProps } from "../Button/Button";

type Without<T> = T extends unknown ? Omit<T, 'icon' | 'leftIcon' | 'rightIcon' | 'children' | 'aria-label'> : never;

interface IconButtonOwnProps {
  /** The icon: a custom or Material Symbols name ("more_vert") or any element. */
  icon: React.ReactNode;
  /** What the button does, for screen readers (its aria-label) and as a tooltip (title). Required: an icon alone has no name. */
  label: string;
  /** 'square' (default, the Button's corners) or 'round'. */
  shape?: 'square' | 'round';
  /** Leaves out the title tooltip, for when a Tooltip or visible text already shows the label. Default: false. */
  noTitle?: boolean;
}

export type IconButtonProps = Without<ButtonAsButtonProps> & IconButtonOwnProps | Without<ButtonAsLinkProps> & IconButtonOwnProps;

/* IconButton: a Button that shows only an icon, with a required label (its accessible name and a title tooltip).
   Variant defaults to "ghost"; shape "square" (default) or "round". Every other Button prop (size, destructive,
   loading, href, onClick, ref…) works the same. */
/** A Button that shows only an icon, with a required label for screen readers. Default variant: ghost. */
export const IconButton = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, IconButtonProps>(function IconButton(props, ref) {
  const { icon, label, shape, noTitle, className, ...rest } = props as IconButtonOwnProps & { className?: string; variant?: string; title?: string } & Record<string, any>;
  const round = shape === "round";
  const extra: Record<string, any> = { "aria-label": label, "data-shape": round ? "round" : "square" };
  if (!noTitle && rest.title == null) extra.title = label;
  return React.createElement(Button as any, Object.assign({ variant: "ghost" }, rest, extra, {
    ref: ref, icon: icon, className: cn("dk-icon-btn", round && "dk-icon-btn--round", className),
  }));
});
IconButton.displayName = "IconButton";
