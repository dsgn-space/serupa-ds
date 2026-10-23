import * as React from "react";
import { cn, domId, isInvalid, oneOf, SIZES, useIsoLayoutEffect } from "../../internal/cn";
import { compare, datePattern, day, formatDate, isoDate, isValid, parseDate } from "../../internal/dates";
import { cssLength, hideLayer, place, showLayer } from "../../internal/position";
import { Calendar } from "../Calendar/Calendar";
import { Icon } from "../Icon/Icon";
import { component } from "../../internal/component";

export interface DatePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'value' | 'defaultValue' | 'onChange' | 'min' | 'max'> {
  /** The chosen day (controlled), or null. Use with onValueChange. */
  value?: Date | null;
  /** The chosen day at first (uncontrolled). */
  defaultValue?: Date | null;
  /** Called with the new day, or null when the field is cleared. */
  onValueChange?: (value: Date | null) => void;
  /** The earliest and latest days that can be chosen. */
  min?: Date;
  max?: Date;
  /** Days that can't be chosen, such as weekends. */
  isDateDisabled?: (date: Date) => boolean;
  /** A BCP 47 locale for the typed format, names and first day of the week. Default: the browser's. */
  locale?: string;
  /** 0 Sunday … 6 Saturday. Default: the locale's. */
  weekStartsOn?: number;
  /** 'sm', 'md' (default) or 'lg', like Input. */
  size?: 'sm' | 'md' | 'lg';
  /** A danger border and aria-invalid, like Input. */
  invalid?: boolean;
  /** The calendar button's name. Default: "Choose date". */
  buttonLabel?: string;
}

/* DatePicker: a text field for a date with a calendar button. People type a date in the locale's numeric order
   (mm/dd/yyyy in en-US, dd.mm.yyyy in de-DE, or yyyy-mm-dd anywhere) or pick one in a Calendar in a popover
   dialog. Typed text is read on blur and on Enter: a date it can't read, or one outside min..max, puts back the
   last good value. The popover opens on the button (or Alt+ArrowDown in the field) with focus on the chosen day,
   and closes on a pick, Escape or a click outside, returning focus to the field. With name, a hidden input sends
   yyyy-mm-dd. ref goes to the text field. */
/** A date field: type a date or pick one from a calendar popover. */
export const DatePicker = /* @__PURE__ */ component<HTMLInputElement, DatePickerProps>("DatePicker", function DatePicker(props, ref) {
  const { value: _v, defaultValue: _d, onValueChange, min, max, isDateDisabled, locale, weekStartsOn, size: _s, invalid: _i, buttonLabel, className, style, name, placeholder, disabled, readOnly, onBlur, onKeyDown, ...rest } = props;
  const size = oneOf(SIZES, props.size, "md");
  const invalid = isInvalid(props.invalid, rest["aria-invalid"]);
  const controlled = props.value !== undefined;
  const [own, setOwn] = React.useState<Date | null>(isValid(props.defaultValue) ? day(props.defaultValue) : null);
  const value = controlled ? (isValid(props.value) ? day(props.value) : null) : own;
  const [text, setText] = React.useState(value ? formatDate(value, locale) : "");
  const [open, setOpen] = React.useState(false);
  const id = domId("dk-dp", React.useId());
  const field = React.useRef<HTMLInputElement | null>(null);
  const button = React.useRef<HTMLButtonElement | null>(null);
  const box = React.useRef<HTMLSpanElement | null>(null);
  const panel = React.useRef<HTMLDivElement | null>(null);
  const shown = React.useRef(value ? value.getTime() : null);
  // A new value from outside rewrites the text.
  if ((value ? value.getTime() : null) !== shown.current) { shown.current = value ? value.getTime() : null; const t = value ? formatDate(value, locale) : ""; if (t !== text) setText(t); }

  const allowed = (d: Date) => !(min && compare(d, min) < 0) && !(max && compare(d, max) > 0) && !(isDateDisabled && isDateDisabled(d));
  const commit = (d: Date | null) => {
    shown.current = d ? d.getTime() : null;
    setText(d ? formatDate(d, locale) : "");
    if ((d ? d.getTime() : null) === (value ? value.getTime() : null)) return;
    if (!controlled) setOwn(d);
    if (onValueChange) onValueChange(d);
  };
  const read = () => {
    if (text.trim() === "") return commit(null);
    const d = parseDate(text, locale);
    commit(d && allowed(d) ? d : value);
  };
  const close = (focusField: boolean) => { setOpen(false); if (focusField && field.current) field.current.focus(); };

  useIsoLayoutEffect(() => {
    const p = panel.current, anchor = box.current;
    if (!p) return;
    if (!open || !anchor) { hideLayer(p); return; }
    showLayer(p);
    const update = () => {
      const r = place(anchor.getBoundingClientRect(), { width: p.offsetWidth, height: p.offsetHeight }, "bottom-start", cssLength(p, "--dk-dp-offset"), "bottom");
      p.style.left = r.x + "px"; p.style.top = r.y + "px"; p.dataset.side = r.side;
    };
    update();
    const ro = typeof ResizeObserver === "function" ? new ResizeObserver(update) : null;
    if (ro) { ro.observe(p); ro.observe(anchor); }
    window.addEventListener("scroll", update, true); window.addEventListener("resize", update);
    return () => { if (ro) ro.disconnect(); window.removeEventListener("scroll", update, true); window.removeEventListener("resize", update); };
  }, [open]);
  React.useEffect(() => {
    if (!open) return;
    const down = (e: PointerEvent) => {
      const t = e.target as Node;
      if ((panel.current && panel.current.contains(t)) || (button.current && button.current.contains(t))) return;
      close(false);
    };
    document.addEventListener("pointerdown", down, true);
    return () => document.removeEventListener("pointerdown", down, true);
  }, [open]);

  const typed = parseDate(text, locale);
  const off = !!disabled || !!readOnly;
  return (
    <span ref={box} className={cn("dk-input", "dk-input--size-" + size, "dk-date-picker", invalid && "dk-input--invalid", disabled && "dk-input--disabled", readOnly && "dk-input--readonly", className)} style={style} data-component="date-picker" data-size={size}>
      <input {...rest} ref={(n) => { field.current = n; if (typeof ref === "function") ref(n); else if (ref) ref.current = n; }}
        type="text" inputMode="numeric" autoComplete="off" className="dk-input__field" value={text} disabled={disabled} readOnly={readOnly}
        placeholder={placeholder != null ? placeholder : datePattern(locale)} aria-invalid={invalid || undefined}
        onChange={(e) => setText(e.target.value)}
        onBlur={(e) => { read(); if (onBlur) onBlur(e); }}
        onKeyDown={(e) => {
          if (onKeyDown) onKeyDown(e);
          if (e.defaultPrevented) return;
          if (e.key === "Enter") read();
          else if (e.key === "ArrowDown" && e.altKey && !off) { e.preventDefault(); read(); setOpen(true); }
        }} />
      <button ref={button} type="button" className="dk-date-picker__button" aria-label={buttonLabel || "Choose date"} aria-haspopup="dialog" aria-expanded={open} aria-controls={open ? id : undefined}
        disabled={off} onClick={() => { if (!open) read(); setOpen(!open); }}>
        <Icon name="calendar_today" />
      </button>
      {name ? <input type="hidden" name={name} value={value ? isoDate(value) : ""} disabled={disabled} /> : null}
      <div ref={panel} id={id} role="dialog" aria-label={buttonLabel || "Choose date"} {...{ popover: "manual" }} hidden={!open || undefined} className="dk-date-picker__popup"
        onKeyDown={(e) => { if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); close(true); } }}>
        {open ? <Calendar value={value} defaultMonth={(typed && allowed(typed) ? typed : null) || value || undefined} min={min} max={max} isDateDisabled={isDateDisabled} locale={locale} weekStartsOn={weekStartsOn} autoFocus
          onValueChange={(d) => { commit(d); close(true); }} /> : null}
      </div>
    </span>
  );
});
