"use client";
import * as React from "react";
import { cn, isInvalid, omit, oneOf, SIZES } from "../../internal/cn";
import { Icon } from "../Icon/Icon";
import { asIcon } from "../Icon/asIcon";
import type { InputProps } from "../Input/Input";
import { component } from "../../internal/component";
import { gridPlaces, roundTo } from "../../internal/step";
import { useSerupa } from "../../internal/provider";

export interface NumberInputProps extends Omit<InputProps, "type" | "value" | "defaultValue" | "rightIcon" | "min" | "max" | "step"> {
  /** The number (controlled), or null when the field is empty. Use with onValueChange. */
  value?: number | null;
  /** The number at first (uncontrolled). */
  defaultValue?: number | null;
  /** Called with the new number, or null when emptied: as people type (numbers within min..max), on blur (clamped), and from the arrow keys and buttons. */
  onValueChange?: (value: number | null) => void;
  /** The smallest allowed number. The field snaps to it when it loses focus. */
  min?: number;
  /** The largest allowed number. */
  max?: number;
  /** How much the arrow keys and buttons change it. Default: 1. Its decimals set how many the value keeps (step 0.25: two). */
  step?: number;
  /** How many steps PageUp, PageDown and Shift with an arrow move. Default: 10. */
  largeStep?: number;
  /** Shows the − and + buttons at the end. Default: true. */
  steppers?: boolean;
  /** The buttons' names. Default: "Decrease" and "Increase". */
  decrementLabel?: string;
  incrementLabel?: string;
}

/* NumberInput: a field for a number, with − and + buttons at the end. role="spinbutton" with aria-valuenow,
   min and max. ArrowUp and ArrowDown change it by step, PageUp, PageDown and Shift+arrows by largeStep steps,
   Home and End go to min and max. People can type freely; on blur the text is parsed, clamped to min..max and
   rounded to the step's decimals. It uses Input's box and tokens: className and style go to the box; ref and
   every other prop to the <input> (type="text" with inputMode="decimal", so mobile keyboards show digits). */
/** A number field with − and + buttons, arrow keys, min, max and step. */
export const NumberInput = /* @__PURE__ */ component<HTMLInputElement, NumberInputProps>("NumberInput", function NumberInput(props, ref) {
  const sds = useSerupa();
  const rest = omit(props, { size: 1, invalid: 1, leftIcon: 1, className: 1, style: 1, value: 1, defaultValue: 1, onValueChange: 1, min: 1, max: 1, step: 1, largeStep: 1, steppers: 1, decrementLabel: 1, incrementLabel: 1 } as const);
  const size = oneOf(SIZES, props.size, "md");
  const invalid = isInvalid(props.invalid, rest["aria-invalid"]);
  if (invalid) rest["aria-invalid"] = true;
  const step = Number(props.step) > 0 ? Number(props.step) : 1;
  const large = Number(props.largeStep) > 0 ? Number(props.largeStep) : 10;
  const min = props.min != null && isFinite(props.min) ? props.min : undefined;
  const max = props.max != null && isFinite(props.max) ? props.max : undefined;
  const places = gridPlaces(props.min != null && isFinite(props.min) ? props.min : undefined, step);
  const controlled = props.value !== undefined;
  const [ownValue, setOwnValue] = React.useState<number | null>(props.defaultValue ?? null);
  const value = controlled ? (props.value ?? null) : ownValue;
  const show = (v: number | null) => (v == null ? "" : String(v));
  const [text, setText] = React.useState(show(value));
  const focused = React.useRef(false);
  React.useEffect(() => { if (!focused.current) setText(show(value)); }, [value]);
  const el = React.useRef<HTMLInputElement | null>(null);
  const locked = !!rest.disabled || !!rest.readOnly;

  const fit = (v: number) => {
    let n = roundTo(v, places);
    if (min !== undefined && n < min) n = min;
    if (max !== undefined && n > max) n = max;
    return n;
  };
  const parse = (s: string): number | null | undefined => {   // undefined: not a number (yet)
    const t = s.trim().replace(/−/g, "-").replace(",", ".");
    if (t === "") return null;
    const n = Number(t);
    return t !== "-" && t !== "." && isFinite(n) ? n : undefined;
  };
  const commit = (v: number | null) => {
    if (!controlled) setOwnValue(v);
    if (v !== value && props.onValueChange) props.onValueChange(v);
  };
  const nudge = (by: number) => {
    if (locked) return;
    const base = parse(text);
    const from = typeof base === "number" ? base : (value ?? (min !== undefined && min > 0 ? min - step : max !== undefined && max < 0 ? max + step : 0));
    const next = fit(from + by * step);
    setText(show(next)); commit(next);
  };
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    const n = parse(e.target.value);   // a number out of range waits for blur, which clamps it
    if (n === null || (n !== undefined && (min === undefined || n >= min) && (max === undefined || n <= max))) commit(n);
    if (rest.onChange) rest.onChange(e);
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    focused.current = false;
    const n = parse(text);
    const v = n == null ? null : fit(n === undefined ? (value ?? 0) : n);
    const out = n === undefined ? value : v;
    setText(show(out)); commit(out);
    if (rest.onBlur) rest.onBlur(e);
  };
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (rest.onKeyDown) rest.onKeyDown(e);
    if (e.defaultPrevented) return;
    const k = e.key, big = e.shiftKey ? large : 1;
    if (k === "ArrowUp") nudge(big);
    else if (k === "ArrowDown") nudge(-big);
    else if (k === "PageUp") nudge(large);
    else if (k === "PageDown") nudge(-large);
    else if (k === "Home" && min !== undefined && !locked) { setText(show(min)); commit(min); }
    else if (k === "End" && max !== undefined && !locked) { setText(show(max)); commit(max); }
    else if (k === "Enter") { const n = parse(text); if (n != null) { const v = fit(n); setText(show(v)); commit(v); } return; }
    else return;
    e.preventDefault();
  };
  const current = parse(text);
  const now = typeof current === "number" ? current : value;
  const left = asIcon(props.leftIcon);
  const press = (by: number) => () => { nudge(by); if (el.current && document.activeElement !== el.current) el.current.focus({ preventScroll: true }); };
  return (
    <span className={cn("dk-input dk-number-input", "dk-input--size-" + size, invalid && "dk-input--invalid", rest.disabled && "dk-input--disabled", rest.readOnly && "dk-input--readonly", props.steppers !== false && "dk-number-input--steppers", props.className)}
      style={props.style} data-component="number-input" data-size={size}>
      {left != null && left !== false ? <span className="dk-input__icon dk-input__icon--left" aria-hidden>{left}</span> : null}
      <input {...rest} ref={(n) => { el.current = n; if (typeof ref === "function") ref(n); else if (ref) ref.current = n; }}
        type="text" inputMode={rest.inputMode || (places > 0 || (min !== undefined && min < 0) || min === undefined ? "decimal" : "numeric")}
        role="spinbutton" aria-valuenow={now ?? undefined} aria-valuemin={min} aria-valuemax={max}
        autoComplete={rest.autoComplete || "off"} className="dk-input__field" value={text}
        onChange={onChange} onBlur={onBlur} onKeyDown={onKeyDown} onFocus={(e) => { focused.current = true; if (rest.onFocus) rest.onFocus(e); }} />
      {props.steppers !== false ? (
        <span className="dk-number-input__steppers">
          <button type="button" tabIndex={-1} className="dk-number-input__step" aria-label={props.decrementLabel || sds.labels.decrease} aria-controls={rest.id}
            disabled={locked || (min !== undefined && now != null && now <= min)} onClick={press(-1)} onMouseDown={(e) => e.preventDefault()}>
            <Icon name="remove" />
          </button>
          <button type="button" tabIndex={-1} className="dk-number-input__step" aria-label={props.incrementLabel || sds.labels.increase} aria-controls={rest.id}
            disabled={locked || (max !== undefined && now != null && now >= max)} onClick={press(1)} onMouseDown={(e) => e.preventDefault()}>
            <Icon name="add" />
          </button>
        </span>
      ) : null}
    </span>
  );
});
