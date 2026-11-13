'use client';
import * as React from 'react';
import { cn, domId, isInvalid, omit, useMergedRef, useIsoLayoutEffect } from '../../internal/cn';
import { component } from '../../internal/component';
import { useLocale, useOwnLang, useSettings } from '../../internal/provider';
import { useFieldControl } from '../../internal/field';
import { useFormReset } from '../../internal/useFormReset';
import { useAnchoredLayer } from '../../internal/useAnchoredLayer';
import { useExit } from '../../internal/useExit';
import { useFocusHandover } from '../../internal/focus';
import { isComposing } from '../../internal/ime';
import { IconButton } from '../IconButton/IconButton';
import { Icon } from '../Icon/Icon';
import * as icons from '../../material/builtin';
import { en as words } from './labels';

/** What a PeriodPicker chooses: a month, a quarter or a year. */
export type PeriodUnit = 'month' | 'quarter' | 'year';

export interface PeriodPickerProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'value' | 'defaultValue' | 'onChange' | 'children' | 'type'> {
  /** What is chosen: 'month' (default), 'quarter' or 'year'. */
  unit?: PeriodUnit | undefined;
  /** The chosen period (controlled), or null: "2026-11" for a month, "2026-Q4" for a quarter, "2026" for a year. */
  value?: string | null | undefined;
  /** The chosen period at first (uncontrolled), written as value is. */
  defaultValue?: string | null | undefined;
  /** Called with the period people pick, and its first and last days (local midnight). */
  onValueChange?: ((value: string, range: { start: Date; end: Date }) => void) | undefined;
  /** The earliest period that can be chosen, written as value is. */
  min?: string | undefined;
  /** The latest period that can be chosen, written as value is. */
  max?: string | undefined;
  /** A BCP 47 locale for the month names and the digits. Default: the nearest SerupaProvider's locale, else the browser's. */
  locale?: string | undefined;
  /** Shown on the button with nothing chosen. Default: "Choose a month" (or quarter, or year). */
  placeholder?: string | undefined;
  /** 'sm', 'md' (default) or 'lg', at the control heights 24, 32 and 44px. */
  size?: 'sm' | 'md' | 'lg' | undefined;
  /** A danger outline, and aria-invalid. In a Field with an error, it's set for you. */
  invalid?: boolean | undefined;
  /** Shows the period without letting it change: focusable and read out (aria-readonly), and a form still sends it, unlike disabled. It doesn't open. */
  readOnly?: boolean | undefined;
  /** Submits the value ("2026-11", "2026-Q4" or "2026") with a form, under this name. */
  name?: string | undefined;
  /** Shows the popup open at first, without moving focus into it. Default: false. */
  defaultOpen?: boolean | undefined;
}

const PER: Record<PeriodUnit, number> = { month: 12, quarter: 4, year: 1 };
const COLS: Record<PeriodUnit, number> = { month: 3, quarter: 2, year: 3 };
// A period as one number, counted from year 0: a year times the periods in it, plus the one in the year (0-based).
/** "2026-11", "2026-Q4" or "2026" as a number for the unit, or null when it isn't written that way. */
export function periodIndex(s: string | null | undefined, unit: PeriodUnit): number | null {
  const m = typeof s === 'string' ? /^(\d{4})(?:-(Q?)(\d{1,2}))?$/.exec(s.trim()) : null;
  if (!m) return null;
  const y = Number(m[1]), i = m[3] ? +m[3] - 1 : -1;
  if (unit === 'year') return m[3] ? null : y;
  if (unit === 'quarter') return m[2] && i >= 0 && i < 4 ? y * 4 + i : null;
  return !m[2] && i >= 0 && i < 12 ? y * 12 + i : null;
}
/** A period's number written back as a value: "2026-11", "2026-Q4" or "2026". */
export function periodValue(n: number, unit: PeriodUnit): string {
  const per = PER[unit], y = Math.floor(n / per), i = n - y * per;
  return String(y).padStart(4, '0') + (unit === 'month' ? '-' + String(i + 1).padStart(2, '0') : unit === 'quarter' ? '-Q' + (i + 1) : '');
}
/** A period's first and last days, at local midnight. */
function rangeOf(n: number, unit: PeriodUnit) {
  const months = 12 / PER[unit], y = Math.floor(n / PER[unit]), m = (n - y * PER[unit]) * months;
  // setFullYear, so a year before 100 stays as written (new Date(26, 0) is 1926); day 0 is the month before's last day.
  const start = new Date(2000, 0, 1), end = new Date(2000, 0, 1);
  start.setFullYear(y, m, 1); end.setFullYear(y, m + months, 0);
  return { start, end };
}
// The first period on the page that holds n: its year for months and quarters, twelve years (2016 to 2027) for years.
const pageOf = (n: number, unit: PeriodUnit) => (unit === 'year' ? Math.floor(n / 12) * 12 : Math.floor(n / PER[unit]) * PER[unit]);
const pageSize = (unit: PeriodUnit) => (unit === 'year' ? 12 : PER[unit]);
// For useSyncExternalStore: false in the server render and in hydration, true after it and in a browser-only render.
const never = () => () => {}, yes = () => true, no = () => false;

/* PeriodPicker: a button (role="combobox", so a Field's label, error and required reach it) that opens a dialog with
   a grid of 12 months, 4 quarters or 12 years, paged by year (by twelve years for years). The grid follows the ARIA
   date grid pattern, as Calendar does: one Tab stop on the periods, arrows move one or a row, Home and End to the
   row's ends, PageUp and PageDown a page, Enter or Space picks and closes it, Escape closes it without a change,
   focus going back to the button. Periods outside min..max are aria-disabled; keys stop at them. */
/** A month, a quarter or a year, picked from a grid in a popup: for reports, billing periods and dashboards.
 *  @beta New: its API may still change in a minor release. Take this tag off once it has shipped with its bug bash done (CONTRIBUTING.md). */
export const PeriodPicker = /* @__PURE__ */ component<HTMLButtonElement, PeriodPickerProps>('PeriodPicker', function PeriodPicker(props, ref) {
  props = useFieldControl(props);
  const sds = useSettings(words), L = sds.labels;
  const rest = omit(props, { unit: 1, value: 1, defaultValue: 1, onValueChange: 1, min: 1, max: 1, locale: 1, placeholder: 1, size: 1, invalid: 1, readOnly: 1, name: 1, defaultOpen: 1, className: 1, style: 1, form: 1, disabled: 1 } as const);
  const unit: PeriodUnit = props.unit === 'quarter' || props.unit === 'year' ? props.unit : 'month';
  const locale = useLocale(props.locale), lang = useOwnLang(props.locale);
  const base = domId('dk-pp', React.useId());
  const size = props.size === 'sm' || props.size === 'lg' ? props.size : 'md';
  const invalid = isInvalid(props.invalid, props['aria-invalid']);
  const disabled = !!props.disabled, readOnly = !!props.readOnly;
  const controlled = props.value !== undefined;
  const [own, setOwn] = React.useState<number | null>(() => periodIndex(props.defaultValue, unit));
  const value = controlled ? periodIndex(props.value, unit) : own;
  const min = periodIndex(props.min, unit), max = periodIndex(props.max, unit);
  const off = (n: number) => (min != null && n < min) || (max != null && n > max);
  const clamp = (n: number) => (min != null && n < min ? min : max != null && n > max ? max : n);

  const hydrated = React.useSyncExternalStore(never, yes, no);
  const now = new Date(), current = now.getFullYear() * PER[unit] + Math.floor(now.getMonth() / (12 / PER[unit]));
  const [open, setOpenState] = React.useState(() => !!props.defaultOpen && !props.disabled && !props.readOnly);
  // The period in focus, kept within min..max when they change while the popup is open.
  const [held, setFocus] = React.useState<number>(() => clamp(value ?? current));
  const focus = clamp(held);
  const page = pageOf(focus, unit), count = pageSize(unit), cols = COLS[unit];

  const button = React.useRef<HTMLButtonElement | null>(null);
  const panel = React.useRef<HTMLDivElement | null>(null);
  const grid = React.useRef<HTMLTableElement | null>(null);
  const hidden = React.useRef<HTMLInputElement | null>(null);
  const prevNav = React.useRef<HTMLButtonElement | null>(null), nextNav = React.useRef<HTMLButtonElement | null>(null);
  const wantFocus = React.useRef(false);
  const handover = useFocusHandover();

  // The words: "November 2026", "Q4 2026", "2026", in the locale's names and digits.
  const fmt = React.useMemo(() => ({
    year: new Intl.DateTimeFormat(locale, { year: 'numeric' }),
    short: new Intl.DateTimeFormat(locale, { month: 'short' }),
    long: new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }),
  }), [locale]);
  const yearText = (y: number) => { const d = new Date(2000, 6, 1); d.setFullYear(y); return fmt.year.format(d); };
  const name = (n: number) => {
    const { start } = rangeOf(n, unit), y = Math.floor(n / PER[unit]);
    return unit === 'month' ? fmt.long.format(start) : unit === 'quarter' ? L.periodQuarter(n - y * 4 + 1, yearText(y)) : yearText(y);
  };
  const cellText = (n: number) => {
    const y = Math.floor(n / PER[unit]);
    return unit === 'month' ? fmt.short.format(rangeOf(n, unit).start) : unit === 'quarter' ? L.periodQuarter(n - y * 4 + 1) : yearText(y);
  };
  const title = unit === 'year' ? yearText(page) + '–' + yearText(page + 11) : yearText(page / PER[unit]);

  const close = (toButton: boolean) => { setOpenState(false); if (toButton && button.current) button.current.focus(); };
  const show = () => {
    if (disabled || readOnly) return;
    setFocus(clamp(value ?? current)); wantFocus.current = true; setOpenState(true);
  };
  const pick = (n: number) => {
    if (off(n)) return;
    if (!controlled) setOwn(n);
    if (n !== value && props.onValueChange) props.onValueChange(periodValue(n, unit), rangeOf(n, unit));
    close(true);
  };
  const move = (n: number) => { setFocus(clamp(n)); wantFocus.current = true; };
  // Escape anywhere in the popup closes it without a change, and focus goes back to the button.
  const escape = (e: React.KeyboardEvent) => { if (e.key === 'Escape' && !isComposing(e)) { e.preventDefault(); e.stopPropagation(); close(true); } };
  const onKeyDown = (e: React.KeyboardEvent<HTMLTableElement>) => {
    if (e.key === 'Escape') return escape(e);
    if (e.altKey || e.ctrlKey || e.metaKey || isComposing(e)) return;
    const rtl = getComputedStyle(e.currentTarget).direction === 'rtl', at = focus - page, rowStart = focus - (at % cols);
    switch (e.key) {
      case 'ArrowLeft': move(focus + (rtl ? 1 : -1)); break;
      case 'ArrowRight': move(focus + (rtl ? -1 : 1)); break;
      case 'ArrowUp': move(focus - cols); break;
      case 'ArrowDown': move(focus + cols); break;
      case 'Home': move(rowStart); break;
      case 'End': move(Math.min(rowStart + cols - 1, page + count - 1)); break;
      case 'PageUp': move(focus - count); break;
      case 'PageDown': move(focus + count); break;
      case 'Enter': case ' ': pick(focus); break;
      default: return;
    }
    e.preventDefault();
  };
  useFormReset(hidden, () => { if (!controlled) setOwn(periodIndex(props.defaultValue, unit)); setOpenState(false); }, props.form);
  const exit = useExit(open, panel);
  useAnchoredLayer(open, panel, button, { placement: 'bottom-start', offsetVar: '--dk-pp-offset', onOutside: () => close(false), onFocusOutside: () => close(false), inside: button });

  // Opening or a key asks for focus, and the period's button is there only after the render (and after
  // useAnchoredLayer has shown the popup: a hidden popover can't take focus).
  // every render: the render that holds the asked-for button can't be known ahead; on the rest this returns at once.
  useIsoLayoutEffect(() => {
    if (!open || !wantFocus.current || !grid.current) return;
    wantFocus.current = false;
    const b = grid.current.querySelector<HTMLElement>('[tabindex="0"]');
    if (b) b.focus();
  });
  const placeholder = props.placeholder ?? L.periodPlaceholder(unit);
  const cells: number[] = [];
  for (let i = 0; i < count; i++) cells.push(page + i);
  const rows: number[][] = [];
  for (let i = 0; i < cells.length; i += cols) rows.push(cells.slice(i, i + cols));
  const mergedRef = useMergedRef(ref, (n) => { button.current = n; });
  return (
    <div className={cn('dk-period-picker', 'dk-period-picker--size-' + size, invalid && 'dk-period-picker--invalid', disabled && 'dk-period-picker--disabled', readOnly && 'dk-period-picker--readonly', props.className)} style={props.style} data-component="period-picker" data-state={open ? 'open' : 'closed'} data-unit={unit}>
      <button {...rest} ref={mergedRef} type="button" role="combobox" className="dk-period-picker__button" lang={rest.lang ?? lang}
        aria-haspopup="dialog" aria-expanded={open} aria-controls={open ? base + '-panel' : undefined} aria-invalid={invalid || undefined} aria-readonly={readOnly || undefined} disabled={disabled}
        onClick={(e) => { if (rest.onClick) rest.onClick(e); if (!e.defaultPrevented) { if (open) close(false); else show(); } }}
        onKeyDown={(e) => { if (rest.onKeyDown) rest.onKeyDown(e); if (!e.defaultPrevented && !open && (e.key === 'ArrowDown' || e.key === 'ArrowUp') && !isComposing(e)) { e.preventDefault(); show(); } }}>
        <span className={cn('dk-period-picker__value', value == null && 'dk-period-picker__value--empty')}>{value == null ? placeholder : name(value)}</span>
        <Icon icon={icons.CalendarToday} className="dk-period-picker__icon" />
      </button>
      <input ref={hidden} type="hidden" name={props.name} form={props.form} value={value == null ? '' : periodValue(value, unit)} disabled={disabled || !props.name} />
      <div ref={panel} id={base + '-panel'} role="dialog" aria-label={L.periodPlaceholder(unit)} lang={lang}
        {...{ popover: 'manual' }} hidden={!open || undefined} inert={!open || undefined} data-instant={exit.instant ? '' : undefined} className="dk-period-picker__panel">
        {open || exit.leaving ? <>
          <div className="dk-period-picker__header">
            <IconButton ref={prevNav} icon={icons.ChevronLeft} className="dk-period-picker__nav" label={L.periodPrevious(unit)} size="sm" variant="ghost" hideTitle onKeyDown={escape}
              disabled={min != null && page - 1 < min} onClick={(e) => { handover(e.currentTarget, () => nextNav.current); setFocus(clamp(focus - count)); }} />
            <h2 className="dk-period-picker__title" id={base + '-title'} aria-live="polite">{title}</h2>
            <IconButton ref={nextNav} icon={icons.ChevronRight} className="dk-period-picker__nav" label={L.periodNext(unit)} size="sm" variant="ghost" hideTitle onKeyDown={escape}
              disabled={max != null && page + count > max} onClick={(e) => { handover(e.currentTarget, () => prevNav.current); setFocus(clamp(focus + count)); }} />
          </div>
          <table ref={grid} role="grid" className="dk-period-picker__grid" aria-labelledby={base + '-title'} onKeyDown={onKeyDown}>
            <tbody>
              {rows.map((row) => (
                <tr key={row[0]}>
                  {row.map((n) => {
                    const sel = n === value, no = off(n), here = hydrated && n === current;
                    return (
                      <td key={n} role="gridcell" aria-selected={sel}>
                        <button type="button" tabIndex={n === focus ? 0 : -1} aria-disabled={no || undefined} aria-current={here ? 'date' : undefined}
                          className={cn('dk-period-picker__period', sel && 'dk-period-picker__period--selected', here && 'dk-period-picker__period--current', no && 'dk-period-picker__period--disabled')}
                          data-value={periodValue(n, unit)} onClick={() => pick(n)} onFocus={() => { if (n !== focus) setFocus(n); }}>
                          {/* "Jan" shown, "January 2025" read: the name holds the year the page shows once, over the grid. */}
                          <span aria-hidden>{cellText(n)}</span><span className="dk-visually-hidden">{name(n)}</span>
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </> : null}
      </div>
    </div>
  );
});
