import * as React from "react";
import { cn, oneOf } from "../../internal/cn";
import { Button, type ButtonAsButtonProps } from "../Button/Button";

export interface ToggleButtonProps extends Omit<ButtonAsButtonProps, "variant" | "destructive" | "loading" | "loadingText"> {
  /** Whether it's on (controlled). Use with onPressedChange. */
  pressed?: boolean;
  /** Whether it starts on (uncontrolled). Default: false. */
  defaultPressed?: boolean;
  /** Called with the new state when it's pressed. */
  onPressedChange?: (pressed: boolean) => void;
  /** 'outline' (default) or 'ghost' (for toolbars). */
  variant?: 'outline' | 'ghost';
}

/* ToggleButton: a Button that stays on or off (aria-pressed), for a setting that applies right away: bold,
   mute, show grid. On, it's primary-subtle with primary text. Every Button prop but variant, destructive and
   loading goes through. */
/** A Button that turns something on and off, with aria-pressed: bold, mute, show grid. */
export const ToggleButton = React.forwardRef<HTMLButtonElement, ToggleButtonProps>(function ToggleButton(props, ref) {
  const { pressed, defaultPressed, onPressedChange, variant, className, onClick, ...rest } = props;
  const [own, setOwn] = React.useState(!!defaultPressed);
  const controlled = pressed !== undefined;
  const on = controlled ? !!pressed : own;
  const v = oneOf(["outline", "ghost"] as const, variant, "outline");
  return (
    <Button {...rest} ref={ref} variant={v} aria-pressed={on}
      className={cn("dk-toggle-button", on && "dk-toggle-button--pressed", className)}
      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
        if (onClick) onClick(e);
        if (e.defaultPrevented) return;
        if (!controlled) setOwn(!on);
        if (onPressedChange) onPressedChange(!on);
      }} />
  );
});
ToggleButton.displayName = "ToggleButton";
