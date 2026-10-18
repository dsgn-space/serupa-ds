import * as React from "react";
import { cn, isInvalid, omit, oneOf, SIZES } from "../../internal/cn";
import { asIcon } from "../Icon/Icon";

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** 'sm' (24px, text-xs), 'md' (32px, text-sm, default) or 'lg' (44px, text-base): the control heights, like Button. */
  size?: 'sm' | 'md' | 'lg';
  /** A danger border and focus ring, and aria-invalid. Say what's wrong in text next to it, linked with aria-describedby. */
  invalid?: boolean;
  /** A decorative icon inside the field, before the text: an icon name or an element. */
  leftIcon?: React.ReactNode;
  /** A decorative icon inside the field, after the text. */
  rightIcon?: React.ReactNode;
}

/* Input: a single-line text field. size "sm", "md" (default) or "lg" (24, 32, 44px: the control heights, like
   Button); invalid (a danger border and aria-invalid); leftIcon / rightIcon (decorative, inside the field).
   Renders <span class="dk-input"> around a native <input>: className and style go to the wrapper, every other
   prop (type, value, onChange, placeholder, disabled, readOnly, aria-*…) and ref to the <input>. */
/** A single-line text field: a native <input> (ref, value, onChange and every input attribute go to it) in a box that holds the icons; className and style go to the box. Label it with <label htmlFor> or aria-label. */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(props, ref) {
  const rest = omit(props, { size: 1, invalid: 1, leftIcon: 1, rightIcon: 1, className: 1, style: 1 } as const);
  const size = oneOf(SIZES, props.size, "md");
  const invalid = isInvalid(props.invalid, rest["aria-invalid"]);
  if (invalid) rest["aria-invalid"] = true;
  if (rest.type === undefined) rest.type = "text";
  const icon = function (node: React.ReactNode, side: string) {
    node = asIcon(node);
    return node == null || node === false ? null : <span className={"dk-input__icon dk-input__icon--" + side} aria-hidden key={side}>{node}</span>;
  };
  return (
    <span className={cn("dk-input", "dk-input--size-" + size, invalid && "dk-input--invalid", rest.disabled && "dk-input--disabled", rest.readOnly && "dk-input--readonly", props.className)} style={props.style} data-component="input" data-size={size}>
      {icon(props.leftIcon, "left")}
      <input {...rest} ref={ref} className="dk-input__field" key="field" />
      {icon(props.rightIcon, "right")}
    </span>
  );
});
Input.displayName = "Input";
