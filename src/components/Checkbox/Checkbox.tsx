import * as React from "react";
import { cn, domId, isInvalid, oneOf, omit, setRef, SIZES, useIsoLayoutEffect } from "../../internal/cn";
import { Icon } from "../Icon/Icon";

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  /** 'sm' (14px box, text-xs), 'md' (16px, text-sm, default) or 'lg' (20px, text-base). */
  size?: 'sm' | 'md' | 'lg';
  /** The label, next to the box; a click on it toggles the box. Without one, give the checkbox an aria-label. */
  children?: React.ReactNode;
  /** A second, muted line under the label, linked to the checkbox with aria-describedby. */
  description?: React.ReactNode;
  /** The "some" state, such as a select-all box when only some rows are picked: a dash, announced as mixed. Set it from your state; a click clears it natively. */
  indeterminate?: boolean;
  /** A danger border (while unchecked) and focus ring, and aria-invalid. */
  invalid?: boolean;
}

/* Checkbox: a native checkbox and its label. size "sm", "md" (default) or "lg"; children (the label);
   description (a second, muted line, linked with aria-describedby); indeterminate (the "some" state of a
   select-all box, drawn as a dash and announced as mixed); invalid. Renders <label class="dk-checkbox"> around the
   box and the text, so a click anywhere on it toggles: className and style go to the label, every other prop
   (checked, defaultChecked, onChange, name, value, disabled, required, aria-*…) and ref to the <input>. */
const OWN = { size: 1, invalid: 1, indeterminate: 1, description: 1, children: 1, className: 1, style: 1, type: 1 } as const;

/** A native checkbox with its label (ref, checked, onChange and every input attribute go to the <input>); className and style go to the <label> around it. */
export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(props, ref) {
  const rest = omit(props, OWN);
  const size = oneOf(SIZES, props.size, "md");
  const invalid = isInvalid(props.invalid, rest["aria-invalid"]);
  if (invalid) rest["aria-invalid"] = true;
  const mixed = !!props.indeterminate;
  const own = React.useRef<HTMLInputElement | null>(null);
  const setRefs = React.useCallback(function (node: HTMLInputElement | null) {
    own.current = node;
    setRef(ref, node);
  }, [ref]);
  useIsoLayoutEffect(function () { if (own.current) own.current.indeterminate = mixed; });   // every render: a click clears it natively
  const base = domId("dk-cb", React.useId()), labelId = base + "-label", descId = base + "-desc";
  const hasLabel = props.children != null && props.children !== false && props.children !== "";
  const hasDesc = props.description != null && props.description !== false && props.description !== "";
  if (hasDesc) rest["aria-describedby"] = cn(rest["aria-describedby"], descId);
  // the description sits inside the <label> (so it's clickable too); naming by the label text alone keeps it out of the name
  if (hasDesc && hasLabel && rest["aria-label"] == null && rest["aria-labelledby"] == null) rest["aria-labelledby"] = labelId;
  return (
    <label className={cn("dk-checkbox", "dk-checkbox--size-" + size, invalid && "dk-checkbox--invalid", rest.disabled && "dk-checkbox--disabled", !hasLabel && !hasDesc && "dk-checkbox--bare", props.className)} style={props.style} data-component="checkbox" data-size={size}>
      <span className="dk-checkbox__control" key="control">
        <input {...rest} ref={setRefs} type="checkbox" className="dk-checkbox__input" key="input" />
        <span className="dk-checkbox__icon" aria-hidden key="icon"><Icon name={mixed ? "remove" : "check"} /></span>
      </span>
      {hasLabel || hasDesc ? <span className="dk-checkbox__text" key="text">
        {hasLabel ? <span className="dk-checkbox__label" id={labelId} key="label">{props.children}</span> : null}
        {hasDesc ? <span className="dk-checkbox__description" id={descId} key="desc">{props.description}</span> : null}
      </span> : null}
    </label>
  );
});
Checkbox.displayName = "Checkbox";
