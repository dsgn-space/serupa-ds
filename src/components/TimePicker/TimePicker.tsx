import * as React from "react";
import { cn, domId, isInvalid, oneOf, SIZES } from "../../internal/cn";
import { formatTime, parseTime, toHHmm, toMinutes, uses12h } from "../../internal/times";
import { useAnchoredLayer } from "../../internal/useAnchoredLayer";
import { Icon } from "../Icon/Icon";

export interface TimePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'value' | 'defaultValue' | 'onChange' | 'min' | 'max' | 'step'> {
  /** The chosen time as "HH:mm" (24-hour, controlled), or null. Use with onValueChange. */
  value?: string | null;
  /** The chosen time at first (uncontrolled). */
  defaultValue?: string | null;
  /** Called with the new time as "HH:mm", or null when the field is cleared. */
  onValueChange?: (value: string | null) => void;
  /** The earliest and latest times, as "HH:mm". */
  min?: string;
  max?: string;
  /** Minutes between the times in the list. Default: 30. Typed times don't have to fall on a step. */
  step?: number;
  /** A BCP 47 locale for how times are written. Default: the browser's. */
  locale?: string;
  /** 12-hour (AM/PM) or 24-hour. Default: the locale's. */
  hour12?: boolean;
  /** 'sm', 'md' (default) or 'lg', like Input. */
  size?: 'sm' | 'md' | 'lg';
  invalid?: boolean;
  /** The list's name, and the button's. Default: "Choose time". */
  listLabel?: string;
}

/* TimePicker: a field for a time of day with a list of times. People type a time ("2:30 pm", "14:30", "1430",
   "2p") or pick one from a list every step minutes (default 30) between min and max; the field is an ARIA
   combobox and the list a listbox. ArrowDown or the clock button opens the list at the chosen (or nearest) time;
   arrows, Home, End, PageUp and PageDown move, Enter picks, Escape closes. Typed text is read on blur and Enter;
   text that isn't a time, or one outside min..max, puts back the last good value. Values are "HH:mm", the form
   <input type="time"> uses; with name a hidden input sends it. */
/** A time field: type a time or pick one from a list. Values are "HH:mm". */
export const TimePicker = React.forwardRef<HTMLInputElement, TimePickerProps>(function TimePicker(props, ref) {
  const { value: _v, defaultValue: _d, onValueChange, min, max, step: _st, locale, hour12: _h, size: _s, invalid: _i, listLabel, className, style, name, placeholder, disabled, readOnly, onBlur, onKeyDown, ...rest } = props;
  const size = oneOf(SIZES, props.size, "md");
  const invalid = isInvalid(props, rest as Record<string, any>);
  const h12 = props.hour12 ?? uses12h(locale);
  const step = props.step && props.step > 0 ? Math.round(props.step) : 30;
  const lo = toMinutes(min) ?? 0, hi = toMinutes(max) ?? 24 * 60 - 1;
  const controlled = props.value !== undefined;
  const [own, setOwn] = React.useState<number | null>(toMinutes(props.defaultValue));
  const value = controlled ? toMinutes(props.value) : own;
  const fmt = (n: number | null) => (n == null ? "" : formatTime(n, locale, h12));
  const [text, setText] = React.useState(fmt(value));
  const shown = React.useRef(value);
  if (value !== shown.current) { shown.current = value; if (fmt(value) !== text) setText(fmt(value)); }
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(0);
  const id = domId("dk-tp", React.useId());
  const box = React.useRef<HTMLSpanElement | null>(null);
  const field = React.useRef<HTMLInputElement | null>(null);
  const list = React.useRef<HTMLUListElement | null>(null);

  const times = React.useMemo(() => { const out: number[] = []; for (let n = Math.ceil(lo / step) * step; n <= hi; n += step) out.push(n); return out; }, [lo, hi, step]);
  const nearest = (n: number | null) => {
    if (n == null || !times.length) return 0;
    let best = 0;
    times.forEach((x, i) => { if (Math.abs(x - n) < Math.abs(times[best] - n)) best = i; });
    return best;
  };
  const commit = (n: number | null) => {
    shown.current = n;
    setText(fmt(n));
    if (n === value) return;
    if (!controlled) setOwn(n);
    if (onValueChange) onValueChange(n == null ? null : toHHmm(n));
  };
  const read = () => {
    if (text.trim() === "") return commit(null);
    const n = parseTime(text);
    commit(n != null && n >= lo && n <= hi ? n : value);
  };
  const show = () => { if (disabled || readOnly || !times.length) return; const n = parseTime(text); setActive(nearest(n != null ? n : value)); setOpen(true); };
  useAnchoredLayer(open, list, box, { placement: "bottom-start", offsetVar: "--dk-tp-offset", onOutside: () => setOpen(false), inside: box });
  // Keep the active time in view.
  React.useEffect(() => {
    if (!open || !list.current) return;
    const o = list.current.children[active] as HTMLElement | undefined;
    if (o) { const l = list.current; if (o.offsetTop < l.scrollTop) l.scrollTop = o.offsetTop; else if (o.offsetTop + o.offsetHeight > l.scrollTop + l.clientHeight) l.scrollTop = o.offsetTop + o.offsetHeight - l.clientHeight; }
  }, [open, active]);
  // On open, the active time sits near the top.
  React.useEffect(() => {
    if (!open || !list.current) return;
    const o = list.current.children[active] as HTMLElement | undefined;
    if (o) list.current.scrollTop = Math.max(0, o.offsetTop - o.offsetHeight);
  }, [open]);

  const pick = (n: number) => { commit(n); setOpen(false); if (field.current) field.current.focus(); };
  const keys = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (onKeyDown) onKeyDown(e);
    if (e.defaultPrevented) return;
    const last = times.length - 1, page = 4;
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); show(); }
      else if (e.key === "Enter") read();
      return;
    }
    switch (e.key) {
      case "ArrowDown": e.preventDefault(); setActive(Math.min(last, active + 1)); break;
      case "ArrowUp": e.preventDefault(); setActive(Math.max(0, active - 1)); break;
      case "PageDown": e.preventDefault(); setActive(Math.min(last, active + page)); break;
      case "PageUp": e.preventDefault(); setActive(Math.max(0, active - page)); break;
      case "Home": if (e.altKey || e.ctrlKey) { e.preventDefault(); setActive(0); } break;
      case "End": if (e.altKey || e.ctrlKey) { e.preventDefault(); setActive(last); } break;
      case "Enter": e.preventDefault(); pick(times[active]); break;
      case "Escape": e.preventDefault(); e.stopPropagation(); setOpen(false); break;
      case "Tab": setOpen(false); break;
    }
  };
  const label = listLabel || "Choose time";
  return (
    <span ref={box} className={cn("dk-input", "dk-input--size-" + size, "dk-time-picker", invalid && "dk-input--invalid", disabled && "dk-input--disabled", readOnly && "dk-input--readonly", className)} style={style} data-component="time-picker" data-size={size}>
      <input {...rest} ref={(n) => { field.current = n; if (typeof ref === "function") ref(n); else if (ref) ref.current = n; }}
        type="text" role="combobox" autoComplete="off" className="dk-input__field" value={text} disabled={disabled} readOnly={readOnly}
        placeholder={placeholder != null ? placeholder : h12 ? "hh:mm am" : "hh:mm"} aria-invalid={invalid || undefined}
        aria-expanded={open} aria-controls={id} aria-autocomplete="none" aria-haspopup="listbox" aria-activedescendant={open ? `${id}-${active}` : undefined}
        onChange={(e) => setText(e.target.value)} onBlur={(e) => { read(); if (onBlur) onBlur(e); }} onKeyDown={keys} />
      <button type="button" tabIndex={-1} className="dk-time-picker__button" aria-label={label} aria-controls={id} aria-expanded={open} disabled={!!disabled || !!readOnly}
        onClick={() => { if (open) setOpen(false); else { read(); show(); } if (field.current) field.current.focus(); }}>
        <Icon name="schedule" />
      </button>
      {name ? <input type="hidden" name={name} value={value == null ? "" : toHHmm(value)} disabled={disabled} /> : null}
      <ul ref={list} id={id} role="listbox" aria-label={label} {...{ popover: "manual" }} hidden={!open || undefined} className="dk-time-picker__list">
        {open ? times.map((n, i) => (
          <li key={n} id={`${id}-${i}`} role="option" aria-selected={n === value} data-value={toHHmm(n)}
            className={cn("dk-time-picker__option", i === active && "dk-time-picker__option--active", n === value && "dk-time-picker__option--selected")}
            onMouseDown={(e) => e.preventDefault()} onMouseMove={() => { if (i !== active) setActive(i); }} onClick={() => pick(n)}>
            <span className="dk-time-picker__time">{fmt(n)}</span>
            {n === value ? <Icon name="check" className="dk-time-picker__check" /> : null}
          </li>
        )) : null}
      </ul>
    </span>
  );
});
TimePicker.displayName = "TimePicker";
