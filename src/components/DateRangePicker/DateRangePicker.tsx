import * as React from "react";
import { cn, domId, isInvalid, oneOf, SIZES } from "../../internal/cn";
import { addMonths, compare, datePattern, day, formatDate, isoDate, isValid, parseDate, sameDay, startOfMonth } from "../../internal/dates";
import { useAnchoredLayer } from "../../internal/useAnchoredLayer";
import { Calendar } from "../Calendar/Calendar";
import { Icon } from "../Icon/Icon";
import { component } from "../../internal/component";

/** A range of days; either end can be empty while it's being chosen. */
export interface DateRange { start: Date | null; end: Date | null }

export interface DateRangePickerProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'defaultValue' | 'onChange'> {
  /** The chosen range (controlled). Use with onValueChange. */
  value?: DateRange;
  /** The chosen range at first (uncontrolled). */
  defaultValue?: DateRange;
  /** Called with the new range whenever either end changes. */
  onValueChange?: (value: DateRange) => void;
  /** The earliest and latest days that can be chosen. */
  min?: Date;
  max?: Date;
  /** Days that can't be the start or end, such as holidays. They can sit inside a range. */
  isDateDisabled?: (date: Date) => boolean;
  /** A BCP 47 locale for the typed format, names and first day of the week. Default: the browser's. */
  locale?: string;
  /** 0 Sunday … 6 Saturday. Default: the locale's. */
  weekStartsOn?: number;
  /** 'sm', 'md' (default) or 'lg', like Input. */
  size?: 'sm' | 'md' | 'lg';
  invalid?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  /** The start field's id, so a Field or <label htmlFor> focuses it. */
  id?: string;
  /** Names for the two fields. Default: "Start date" and "End date". */
  startLabel?: string;
  endLabel?: string;
  /** Form names: hidden inputs send each end as yyyy-mm-dd. */
  startName?: string;
  endName?: string;
  /** The calendar button's name. Default: "Choose dates". */
  buttonLabel?: string;
  /** Months shown side by side in the popup: 1 or 2 (default). */
  months?: 1 | 2;
}

const norm = (r: DateRange | undefined): DateRange => ({ start: r && isValid(r.start) ? day(r.start) : null, end: r && isValid(r.end) ? day(r.end) : null });
const key = (d: Date | null) => (d ? d.getTime() : null);

/* DateRangePicker: two date fields (start – end) in one box with a calendar button, for a stay, a report period
   or a filter. People type either end in the locale's order (or yyyy-mm-dd), or pick both in a popup with two
   months side by side: the first pick is the start, the second the end (a day before the start moves the start
   instead), and the days between preview under the pointer. Typed text is read on blur and Enter; text that
   can't be used puts back the last good day, and a start after the end clears the end. The popup opens on the
   button or Alt+ArrowDown, and closes when the range is complete, on Escape or a click outside. */
/** Two date fields for a start and end, with a two-month calendar popup to pick the range. */
export const DateRangePicker = /* @__PURE__ */ component<HTMLSpanElement, DateRangePickerProps>("DateRangePicker", function DateRangePicker(props, ref) {
  const { value: _v, defaultValue: _d, onValueChange, min, max, isDateDisabled, locale, weekStartsOn, size: _s, invalid: _i, disabled, readOnly, id, startLabel, endLabel, startName, endName, buttonLabel, months: _m, className, ...rest } = props;
  const size = oneOf(SIZES, props.size, "md");
  const invalid = isInvalid(props.invalid, rest["aria-invalid"]);
  const describedBy = rest["aria-describedby"], required = rest["aria-required"];
  delete rest["aria-describedby"]; delete rest["aria-required"];
  const controlled = props.value !== undefined;
  const [own, setOwn] = React.useState<DateRange>(norm(props.defaultValue));
  const value = controlled ? norm(props.value) : own;
  const fmt = (d: Date | null) => (d ? formatDate(d, locale) : "");
  const [text, setText] = React.useState({ start: fmt(value.start), end: fmt(value.end) });
  const shown = React.useRef({ start: key(value.start), end: key(value.end) });
  if (key(value.start) !== shown.current.start || key(value.end) !== shown.current.end) {
    shown.current = { start: key(value.start), end: key(value.end) };
    const t = { start: fmt(value.start), end: fmt(value.end) };
    if (t.start !== text.start || t.end !== text.end) setText(t);
  }
  const [open, setOpen] = React.useState(false);
  const [picking, setPicking] = React.useState<"start" | "end">("start");
  const [hover, setHover] = React.useState<Date | null>(null);
  const [base, setBase] = React.useState(() => startOfMonth(value.start || new Date()));
  const popId = domId("dk-drp", React.useId());
  const box = React.useRef<HTMLSpanElement | null>(null);
  const startField = React.useRef<HTMLInputElement | null>(null);
  const button = React.useRef<HTMLButtonElement | null>(null);
  const panel = React.useRef<HTMLDivElement | null>(null);
  const two = props.months !== 1;

  const allowed = (d: Date) => !(min && compare(d, min) < 0) && !(max && compare(d, max) > 0) && !(isDateDisabled && isDateDisabled(d));
  const commit = (r: DateRange) => {
    shown.current = { start: key(r.start), end: key(r.end) };
    setText({ start: fmt(r.start), end: fmt(r.end) });
    if (key(r.start) === key(value.start) && key(r.end) === key(value.end)) return;
    if (!controlled) setOwn(r);
    if (onValueChange) onValueChange(r);
  };
  const read = (which: "start" | "end") => {
    const raw = text[which].trim();
    let d: Date | null = raw === "" ? null : parseDate(raw, locale);
    if (raw !== "" && !(d && allowed(d))) d = value[which];
    const r = { ...value, [which]: d };
    if (r.start && r.end && compare(r.start, r.end) > 0) { if (which === "start") r.end = null; else r.end = value.end; }
    commit(r);
  };
  const close = (focus: boolean) => { setOpen(false); setHover(null); if (focus && startField.current) startField.current.focus(); };
  const show = () => {
    const typed = parseDate(text.start, locale);
    setBase(startOfMonth((typed && allowed(typed) ? typed : null) || value.start || new Date()));
    setPicking(value.start && !value.end ? "end" : "start");
    setOpen(true);
  };
  useAnchoredLayer(open, panel, box, { placement: "bottom-start", offsetVar: "--dk-drp-offset", onOutside: () => close(false), inside: button });

  const pick = (d: Date) => {
    if (picking === "start" || !value.start || compare(d, value.start) < 0) { commit({ start: d, end: null }); setPicking("end"); return; }
    commit({ start: value.start, end: d });
    close(true);
  };
  const to = picking === "end" && value.start && !value.end && hover && compare(hover, value.start) > 0 ? hover : value.end;
  const dayClass = (d: Date) => {
    const s = value.start;
    if (!s || !to) return undefined;
    if (compare(d, s) > 0 && compare(d, to) < 0) return "dk-calendar__day--in-range";
    return undefined;
  };
  const isSel = (d: Date) => sameDay(d, value.start) || sameDay(d, value.end);
  const off = !!disabled || !!readOnly;
  const field = (which: "start" | "end") => (
    <input type="text" inputMode="numeric" autoComplete="off" className="dk-input__field dk-date-range-picker__field"
      ref={which === "start" ? startField : undefined} id={which === "start" ? id : undefined}
      aria-label={which === "start" ? startLabel || "Start date" : endLabel || "End date"} aria-describedby={describedBy} aria-required={required} aria-invalid={invalid || undefined}
      value={text[which]} placeholder={datePattern(locale)} disabled={disabled} readOnly={readOnly}
      onChange={(e) => setText({ ...text, [which]: e.target.value })} onBlur={() => read(which)}
      onKeyDown={(e) => {
        if (e.key === "Enter") read(which);
        else if (e.key === "ArrowDown" && e.altKey && !off) { e.preventDefault(); read(which); show(); }
      }} />
  );
  const cal = (m: Date, first: boolean) => (
    <Calendar month={m} onMonthChange={(n) => setBase(first ? n : addMonths(n, -1))} value={first ? value.start : value.end}
      min={min} max={max} isDateDisabled={isDateDisabled} locale={locale} weekStartsOn={weekStartsOn} autoFocus={first} hideOutside={two}
      isDateSelected={isSel} dayClassName={dayClass} onDayHover={setHover} onValueChange={pick} />
  );
  return (
    <span {...rest} ref={(n) => { box.current = n; if (typeof ref === "function") ref(n); else if (ref) ref.current = n; }} role="group"
      className={cn("dk-input", "dk-input--size-" + size, "dk-date-range-picker", invalid && "dk-input--invalid", disabled && "dk-input--disabled", readOnly && "dk-input--readonly", className)}
      data-component="date-range-picker" data-size={size}>
      {field("start")}
      <span className="dk-date-range-picker__dash" aria-hidden>–</span>
      {field("end")}
      <button ref={button} type="button" className="dk-date-picker__button dk-date-range-picker__button" aria-label={buttonLabel || "Choose dates"} aria-haspopup="dialog" aria-expanded={open} aria-controls={open ? popId : undefined}
        disabled={off} onClick={() => { if (open) close(false); else { read("start"); show(); } }}>
        <Icon name="date_range" />
      </button>
      {startName ? <input type="hidden" name={startName} value={value.start ? isoDate(value.start) : ""} disabled={disabled} /> : null}
      {endName ? <input type="hidden" name={endName} value={value.end ? isoDate(value.end) : ""} disabled={disabled} /> : null}
      <div ref={panel} id={popId} role="dialog" aria-label={buttonLabel || "Choose dates"} {...{ popover: "manual" }} hidden={!open || undefined} className="dk-date-picker__popup dk-date-range-picker__popup"
        onKeyDown={(e) => { if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); close(true); } }}
        onMouseLeave={() => setHover(null)}>
        {open ? <>
          <div className="dk-date-range-picker__months">{cal(base, true)}{two ? cal(addMonths(base, 1), false) : null}</div>
          <p className="dk-date-range-picker__status" aria-live="polite">{picking === "start" ? "Choose the start date" : "Choose the end date"}</p>
        </> : null}
      </div>
    </span>
  );
});
