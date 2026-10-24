"use client";
import * as React from "react";
import { cn, domId, omit } from "../../internal/cn";
import { Icon } from "../Icon/Icon";
import { named } from "../../internal/component";
import * as icons from "../../material/builtin";

export interface FieldProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  /** The label: a <label> linked to the control, or with group, the fieldset's <legend>. */
  label?: React.ReactNode;
  /** Help text under the label, before the control (text-muted); added to the control's aria-describedby. */
  hint?: React.ReactNode;
  /** An error message under the control (danger-text, with an icon); makes the control invalid and is added to its aria-describedby. */
  error?: React.ReactNode;
  /** A * after the label (hidden from screen readers) and aria-required on the control. Add the control's own required for the browser's check. */
  required?: boolean;
  /** "(optional)" after the label, or your own words. Ignored with required. */
  optional?: boolean | string;
  /** Disables the control (with group, every control in the fieldset) and dims the label and hint. */
  disabled?: boolean;
  /** A <fieldset> with a <legend> for a set of checkboxes or radios; the hint and error describe the fieldset. */
  group?: boolean;
  /** The control's id; by default the control's own id, or a generated one. */
  id?: string;
  /** One control (Input, Textarea, Select or any element), or with group, the set. */
  children?: React.ReactNode;
}

/* Field: a label, an optional hint and an error message around one form control. It gives the control an id
   (unless it has one), links the label to it, adds the hint and error to its aria-describedby, and passes
   invalid (with error), aria-required (with required) and disabled. group renders a <fieldset> with a <legend>
   instead, for a set of checkboxes or radios, and puts the hint and error on the fieldset. */
/** The props Field reads from and hands to its control (a component like Input, or a DOM element). */
type ControlProps = { id?: string; invalid?: boolean; disabled?: boolean; "aria-describedby"?: string; "aria-required"?: boolean | "true" | "false"; "aria-invalid"?: boolean };

const OWN = { label: 1, hint: 1, error: 1, required: 1, optional: 1, disabled: 1, group: 1, id: 1, children: 1, className: 1 } as const;

/** A label, an optional hint and an error message around one form control, wired up for screen readers. className and other attributes go to the outer element. */
export const Field = /* @__PURE__ */ named("Field", function Field(props: FieldProps): React.ReactElement {
  const rest = omit(props, OWN);
  const base = domId("dk-f", React.useId());
  const child = React.Children.count(props.children) === 1 && React.isValidElement(props.children) ? (props.children as React.ReactElement<ControlProps>) : null;
  const controlId = props.id || (child && child.props.id) || base + "-control";
  const hasError = props.error != null && props.error !== false && props.error !== "";
  const hintId = props.hint ? base + "-hint" : null, errorId = hasError ? base + "-error" : null;
  const group = !!props.group;
  const labelKids = [props.label,
    props.required ? <span className="dk-field__required" aria-hidden key="req">*</span> : null,
    !props.required && props.optional ? <span className="dk-field__optional" key="opt">{typeof props.optional === "string" ? props.optional : "(optional)"}</span> : null];
  const label = props.label == null ? null : group
    ? React.createElement("legend", { className: "dk-field__label", key: "label" }, ...labelKids)
    : React.createElement("label", { className: "dk-field__label", htmlFor: controlId, key: "label" }, ...labelKids);
  const hint = props.hint ? <div className="dk-field__hint" id={hintId as string} key="hint">{props.hint}</div> : null;
  const error = hasError ? <div className="dk-field__error" key="error"><Icon icon={icons.Error} className="dk-field__error-icon" /><span id={errorId as string}>{props.error}</span></div> : null;
  const described = cn(hintId, errorId);
  const pass = function (el: React.ReactNode, isControl: boolean) {   // the props Field hands a control: components get invalid, DOM elements aria-invalid
    if (!React.isValidElement(el)) return el;
    const p = el.props as ControlProps;
    const add: ControlProps = {}, dom = typeof el.type === "string";
    if (isControl) {
      if (!p.id) add.id = controlId;
      if (described) add["aria-describedby"] = cn(p["aria-describedby"], described);
      if (props.required && p["aria-required"] == null) add["aria-required"] = true;
    }
    if (hasError) { if (dom) add["aria-invalid"] = true; else add.invalid = true; }
    if (props.disabled && !group) add.disabled = true;
    return React.cloneElement(el, add);
  };
  const cls = cn("dk-field", group && "dk-field--group", hasError && "dk-field--invalid", props.disabled && "dk-field--disabled", props.className);
  if (group) {
    return (
      <fieldset {...rest} className={cls} disabled={props.disabled || undefined} aria-describedby={described || undefined} data-component="field">
        {label}
        {hint}
        <div className="dk-field__control" key="control">{React.Children.map(props.children, function (c) { return pass(c, false); })}</div>
        {error}
      </fieldset>
    );
  }
  return (
    <div {...rest} className={cls} data-component="field">
      {label}
      {hint}
      <div className="dk-field__control" key="control">{child ? pass(child, true) : props.children}</div>
      {error}
    </div>
  );
});
