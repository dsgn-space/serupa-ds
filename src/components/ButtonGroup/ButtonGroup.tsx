import * as React from "react";
import { cn, oneOf, omit } from "../../internal/cn";

export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Buttons, IconButtons or ToggleButtons. */
  children?: React.ReactNode;
  /** Joins them into one control: shared borders, outer corners only. Default: true. */
  attached?: boolean;
  /** 'horizontal' (default) or 'vertical'. */
  orientation?: 'horizontal' | 'vertical';
  /** What the group is for ("Text formatting"), for screen readers. */
  "aria-label"?: string;
}

/* ButtonGroup: related buttons side by side (or stacked) in a role="group": attached into one control, or
   spaced apart. Size and variant stay on each button. className and every other prop go to the wrapper. */
/** Related buttons in a row or a column, joined into one control or spaced apart. */
export const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(function ButtonGroup(props, ref) {
  const rest = omit(props, { attached: 1, orientation: 1, className: 1 });
  const vertical = oneOf(["horizontal", "vertical"] as const, props.orientation, "horizontal") === "vertical";
  return <div role="group" {...rest} ref={ref} data-component="button-group" data-orientation={vertical ? "vertical" : "horizontal"}
    className={cn("dk-button-group", vertical && "dk-button-group--vertical", props.attached !== false && "dk-button-group--attached", props.className)} />;
});
ButtonGroup.displayName = "ButtonGroup";
