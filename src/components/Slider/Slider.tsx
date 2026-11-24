'use client';
import * as React from 'react';
import { useControllable } from '../../internal/controllable';
import { useControlSize } from '../../internal/controlSize';
import { cn, isInvalid, omit, useIsoLayoutEffect, useLatest } from '../../internal/cn';
import { useServerStyles } from '../../internal/serverStyles';
import { named } from '../../internal/component';
import { useFormReset } from '../../internal/useFormReset';
import { useFieldsetDisabled } from '../../internal/useFieldsetDisabled';
import { snap as snapToGrid } from '../../internal/step';
import { useFieldLabel } from '../../internal/fieldLabel';
import { FieldContext, useFieldControl } from '../../internal/field';
import { delegateFocus, useAutoFocus } from '../../internal/focus';
import { useLocale, useSettings } from '../../internal/provider';
import { displayNumber } from '../../internal/numbers';
import { NAME_HOW, useNameCheck } from '../../internal/nameCheck';
import { NumberInput } from '../NumberInput/NumberInput';
import { en as words } from './labels';
import { isRtl } from '../../internal/position';
import { isComposing } from '../../internal/ime';

export type SliderValue = number | [number, number];
/** A mark on a Slider's track: a value, and optional text shown under it. */
export interface SliderMark { value: number; label?: React.ReactNode }
/** V is a number for one thumb or [low, high] for a range, inferred from value, defaultValue or the callbacks. */
export interface SliderProps<V extends SliderValue = SliderValue> extends Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  /** The value (controlled): a number, or [low, high] for a range with two thumbs. Use with onValueChange. */
  value?: V | undefined;
  /** The value at first (uncontrolled). Default: min. */
  defaultValue?: V | undefined;
  /** Called with the new value as it moves (dragging, keys). */
  onValueChange?: ((value: V) => void) | undefined;
  /** Called once when a drag or key press that changed the value ends: for saving or fetching. */
  onValueCommit?: ((value: V) => void) | undefined;
  /** Default: 0. */
  min?: number | undefined;
  /** Default: 100. */
  max?: number | undefined;
  /** The smallest change. Default: 1. */
  step?: number | undefined;
  /** How many steps PageUp, PageDown and Shift with an arrow move. Default: 10. */
  largeStep?: number | undefined;
  /** 'sm' (4px track, 16px thumb), 'md' (6px, 20px, default) or 'lg' (8px, 24px), to sit in a form of lg fields. */
  size?: 'sm' | 'md' | 'lg' | undefined;
  /** Turns the thumbs off, as a disabled native control. */
  disabled?: boolean | undefined;
  /** Turns a value into the words read out (aria-valuetext), such as "$40". Default: the number (shown by showValue in the locale's digits). */
  formatValue?: ((value: number) => string) | undefined;
  /** A range's thumb names. Default: the sliderMinimum and sliderMaximum labels ("Minimum", "Maximum"). A single thumb is named by aria-label or aria-labelledby. */
  thumbLabels?: [string, string] | undefined;
  /** Submits the value with a form: the thumb's range input takes it, or a range's two with the same name. */
  name?: string | undefined;
  /** The id of a form to submit and reset with, when it isn't inside one, as the form attribute of an input. */
  form?: string | undefined;
  /** A danger fill and thumb ring, and aria-invalid on the thumbs. Say what's wrong in text next to it (Field's error does). */
  invalid?: boolean | undefined;
  /** Focusable and read out, but keys and presses don't change it; the value is still submitted. */
  readOnly?: boolean | undefined;
  /** Accepted so Field's required doesn't reach the DOM. A slider always has a value, so it has no effect. */
  required?: boolean | undefined;
  /** Ticks on the track: true for every step (every largeStep steps past 100 ticks), or a list of values with optional text under each. Visual only; the thumb's value is what's read out. */
  marks?: boolean | SliderMark[] | undefined;
  /** Shows the value (formatValue's text) over a thumb while it's focused, dragged or hovered. Visual only, as aria-valuetext already says it. */
  showValue?: boolean | undefined;
  /** A number field beside each thumb, kept in step with it, for typing an exact value: after the track for one
      thumb, at either end for a range (the low one first). A typed number past the other thumb, min or max waits
      for Enter or leaving the field, which brings it back inside. */
  inputs?: boolean | undefined;
  /** A single thumb's fill runs from this value to the thumb, not from min: 0 for a -10 to +10 balance or offset,
      so the fill shows how far and which way from the middle. Ignored for a range. Default: min. */
  origin?: number | undefined;
  /** 'horizontal' (default) or 'vertical': the track runs bottom to top, min at the bottom, as a volume or level
      control in a narrow column. Up and Right raise it in either direction of text. Its length is --slider-length. */
  orientation?: 'horizontal' | 'vertical' | undefined;
}

const OWN = { value: 1, defaultValue: 1, onValueChange: 1, onValueCommit: 1, min: 1, max: 1, step: 1, largeStep: 1, size: 1, disabled: 1, formatValue: 1, thumbLabels: 1, name: 1, form: 1, invalid: 1, readOnly: 1, required: 1, marks: 1, showValue: 1, inputs: 1, origin: 1, orientation: 1, 'aria-required': 1, 'aria-invalid': 1, 'aria-readonly': 1, autoFocus: 1, className: 1, 'aria-label': 1, 'aria-labelledby': 1, 'aria-describedby': 1, 'aria-errormessage': 1 } as const;

// The marks to draw: every step for true (every largeStep steps when that's over 100 ticks), or the listed values on the track.
function markList(marks: SliderProps['marks'], min: number, max: number, step: number, large: number): SliderMark[] {
  if (Array.isArray(marks)) return marks.filter((m) => m && isFinite(m.value) && m.value >= min && m.value <= max);
  if (marks !== true) return [];
  const every = (max - min) / step > 100 ? step * large : step, out: SliderMark[] = [];
  for (let i = 0, v = min; v <= max + every / 1e9 && i <= 1000; i++, v = min + i * every) out.push({ value: snapToGrid(v, min, max, step) });
  return out;
}

/* Slider: picks a number, or a range with two thumbs, by dragging along a track or with the keyboard. Each thumb
   is a native <input type="range"> (role slider) with its value, min, max and aria-valuetext. Arrows change it by step (Right and Up raise it;
   Left and Right swap in right-to-left pages), PageUp, PageDown and Shift+arrows by largeStep steps, Home and End
   go to the ends. A press anywhere on the track moves the nearest thumb there; range thumbs can't cross.
   onValueChange fires as it moves, onValueCommit once when a drag or key press that changed it ends. */
/** Picks a number, or a range with two thumbs, on a track. */
// The text a slider nudges inward to keep inside its box (GM2).
const FIT = '.srp-slider__mark-label > span, .srp-slider__value > span';

/** Mark labels too long for the room between their points wrap, between words. Each first gets the track up to halfway
 *  to its neighbours, less the gap between labels (one at an end also the room its nudge inward gives it), but never
 *  less than its longest word; where two still meet, the one with more to give wraps further. The slider then grows
 *  to hold the tallest one's lines. Labels with room keep their one line. */
function share(el: HTMLElement) {
  const labels = Array.from(el.querySelectorAll<HTMLElement>('.srp-slider__mark-label > span'));
  for (const p of labels) { p.removeAttribute('data-wrap'); p.style.removeProperty('--srp-slider-share'); }
  el.style.removeProperty('--srp-slider-labels-h');
  if (labels.length < 2) return;
  const box = el.getBoundingClientRect(), gap = parseFloat(getComputedStyle(labels[0]!.parentElement!).columnGap) || 0;
  const at = labels.map((p) => {
    const w = p.getBoundingClientRect().width;
    p.setAttribute('data-wrap', '');
    p.style.setProperty('--srp-slider-share', '0px');   // as narrow as it goes: its longest word
    const least = p.getBoundingClientRect().width;
    p.removeAttribute('data-wrap'); p.style.removeProperty('--srp-slider-share');
    return { p, c: p.parentElement!.getBoundingClientRect().left, w, least, cap: w };
  }).sort((a, b) => a.c - b.c);
  const n = at.length;
  at.forEach((x, i) => {
    const left = i === 0 ? x.c - box.left : (x.c - at[i - 1]!.c) / 2, right = i === n - 1 ? box.right - x.c : (at[i + 1]!.c - x.c) / 2;
    const room = i === 0 ? Math.min(left, right - gap / 2) + right - gap / 2 : i === n - 1 ? Math.min(right, left - gap / 2) + left - gap / 2 : 2 * Math.min(left, right) - gap;
    x.cap = Math.max(x.least, Math.min(x.w, room));
  });
  // Where it sits at a width: centered on its point, nudged inside the slider (as fit() does).
  const span = (x: typeof at[0], w: number) => { const l = Math.min(Math.max(x.c - w / 2, box.left), box.right - w); return [l, l + w] as const; };
  for (let i = 0, guard = 0; i < n - 1 && guard < 2000; guard++) {
    const a = at[i]!, b = at[i + 1]!;
    if (span(a, a.cap)[1] + gap <= span(b, b.cap)[0] + 0.5) { i++; continue; }
    const give = (x: typeof a) => x.cap - x.least;
    const x = give(a) >= give(b) ? a : b;
    if (give(x) <= 0) { i++; continue; }   // both at their longest word: nothing more to give
    x.cap = Math.max(x.least, x.cap - 1);
  }
  let wrapped = false;
  for (const x of at) if (x.cap < x.w - 0.5) { x.p.setAttribute('data-wrap', ''); x.p.style.setProperty('--srp-slider-share', Math.ceil(x.cap) + 'px'); wrapped = true; }
  if (wrapped) el.style.setProperty('--srp-slider-labels-h', Math.max(...labels.map((p) => p.getBoundingClientRect().height)) + 'px');
}

function SliderRender({ ref, ...props }: SliderProps & React.RefAttributes<HTMLDivElement>) {
  const nameRef = useNameCheck('Slider', NAME_HOW.field);   // warns when it has no accessible name
  // A surrounding Field's id, hint, error, required and disabled, at any depth: a Slider in a row with its unit
  // after it (<div><Slider /><span>dB</span></div>) was left unnamed, undescribed and enabled (L8E84).
  props = useFieldControl(props);
  const restyle = useServerStyles(ref);
  const rest = omit(props, OWN);
  const sds = useSettings(words), locale = useLocale();
  const min = isFinite(Number(props.min)) && props.min != null ? Number(props.min) : 0;
  const maxIn = isFinite(Number(props.max)) && props.max != null ? Number(props.max) : 100;
  const max = maxIn > min ? maxIn : min + 1;
  const step = Number(props.step) > 0 && Number.isFinite(Number(props.step)) ? Number(props.step) : 1;
  const large = Number(props.largeStep) > 0 ? Number(props.largeStep) : 10;
  const snap = (v: number) => snapToGrid(v, min, max, step);
  const [raw, setOwn, controlled] = useControllable<SliderValue>(props.value, props.defaultValue ?? min, 'Slider', 'value');
  const isRange = Array.isArray(raw);
  const vals: number[] = isRange ? [snap(raw[0]), snap(raw[1])].sort((a, b) => a - b) : [snap(raw)];
  const latestRef = useLatest(vals);
  const root = React.useRef<HTMLDivElement | null>(null);
  useFormReset(root, () => { if (!controlled) setOwn(props.defaultValue ?? min); }, props.form);
  const thumbs = React.useRef<(HTMLInputElement | null)[]>([]);
  const drag = React.useRef<number | null>(null);
  // A disabled <fieldset> around it disables it too, as it does native inputs.
  const inDisabledFieldset = useFieldsetDisabled(root);
  const sized = useControlSize(props.size);
  const size = (sized === 'sm' || sized === 'lg' ? sized : 'md');
  const disabled = !!props.disabled || inDisabledFieldset;
  const invalid = isInvalid(props.invalid, props['aria-invalid']);
  const readOnly = !!props.readOnly || props['aria-readonly'] === true || props['aria-readonly'] === 'true';
  const still = disabled || readOnly;   // nothing moves the value
  const pct = (v: number) => ((v - min) / (max - min)) * 100;
  // Vertical: the track is laid out top to bottom (writing-mode in Slider.css), so a point's place is counted from
  // the top, and min sits at the bottom.
  const vertical = props.orientation === 'vertical';
  const place = (p: number) => (vertical ? 100 - p : p);
  // A thumb's value: vs holds one value, or a range's two, so the fallback is never reached.
  const at = (vs: number[], i: number) => vs[i] ?? min;
  const out = (vs: number[]): SliderValue => (isRange ? [at(vs, 0), at(vs, 1)] : at(vs, 0));
  // Without formatValue, showValue writes the number in the locale's digits and marks, as Badge and Pagination do: "٤٠" in ar-EG (GR24).
  const text = (v: number) => (props.formatValue ? props.formatValue(v) : displayNumber(v, locale));
  // ref.current.focus() and autoFocus land on the first thumb, as they would on an <input type="range">.
  const liveRef = useLatest(disabled);
  const first = () => (liveRef.current ? null : thumbs.current[0]);
  useAutoFocus(props.autoFocus, first);

  const set = (i: number, v: number) => {
    const vs = latestRef.current.slice();
    let n = snap(v);
    if (isRange) n = i === 0 ? Math.min(n, at(vs, 1)) : Math.max(n, at(vs, 0));
    if (n === vs[i]) return vs;
    vs[i] = n;
    latestRef.current = vs;
    if (!controlled) setOwn(out(vs));
    if (props.onValueChange) props.onValueChange(out(vs));
    return vs;
  };
  const commit = () => { if (props.onValueCommit) props.onValueCommit(out(latestRef.current)); };
  // A change the range input makes itself: a screen reader's adjust gesture (VoiceOver's swipe up or down, TalkBack's
  // volume keys), which reach only a native range. It moves and commits as a key does; read-only, React puts it back.
  const onChange = (i: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (still) return;
    const before = latestRef.current[i];
    if (set(i, Number(e.currentTarget.value))[i] !== before) commit();
  };
  // The values a drag started from: a press on a thumb let go where it was, or a drag back to the start, changed
  // nothing and calls no onValueCommit, as a key at the end doesn't (L8E109).
  const from = React.useRef<number[]>([]);
  const fromPoint = (x: number, y: number) => {
    const r = root.current!.querySelector('.srp-slider__track')!.getBoundingClientRect();
    let share = r.width ? (x - r.left) / r.width : 0;
    if (vertical) share = r.height ? (r.bottom - y) / r.height : 0;
    else if (isRtl(root.current!)) share = 1 - share;
    return min + Math.min(1, Math.max(0, share)) * (max - min);
  };
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (rest.onPointerDown) rest.onPointerDown(e);
    if (disabled || e.button !== 0 || e.defaultPrevented || inField(e.target)) return;
    e.preventDefault();
    const v = fromPoint(e.clientX, e.clientY), vs = latestRef.current;
    let i = 0;
    if (isRange) { const d0 = Math.abs(v - at(vs, 0)), d1 = Math.abs(v - at(vs, 1)); i = d1 < d0 || (d1 === d0 && v > at(vs, 1)) ? 1 : 0; }
    // Read-only: a press focuses the nearest thumb, as it would a read-only input, and moves nothing.
    if (readOnly) { thumbs.current[i]?.focus({ preventScroll: true }); return; }
    drag.current = i; from.current = vs.slice();
    e.currentTarget.setPointerCapture(e.pointerId);
    set(i, v);
    const t = thumbs.current[i]; if (t) t.focus({ preventScroll: true });
  };
  // A press in a number field (inputs) is the field's: it places the caret, it doesn't move a thumb.
  const inField = (t: EventTarget) => t instanceof Element && !!t.closest('.srp-slider__input');
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => { if (rest.onPointerMove) rest.onPointerMove(e); if (drag.current != null) set(drag.current, fromPoint(e.clientX, e.clientY)); };
  const end = (e: React.PointerEvent<HTMLDivElement>) => { if (drag.current == null) return; drag.current = null; if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId); if (latestRef.current.some((v, k) => v !== from.current[k])) commit(); };
  // The browser took the press for a scroll of the page (touch-action: pan-y): the thumb goes back, and nothing commits.
  const cancel = (e: React.PointerEvent<HTMLDivElement>) => { if (rest.onPointerCancel) rest.onPointerCancel(e); const i = drag.current; if (i == null) return; drag.current = null; set(i, at(from.current, i)); };
  // Your onKeyDown runs first, on the root as the key goes down to the focused part (the capture phase), so its
  // currentTarget is the root its type names, and preventDefault() in it keeps the control's own handling of that key
  // from running.
  const onKeyDownCapture = (e: React.KeyboardEvent<HTMLDivElement>) => { if (rest.onKeyDownCapture) rest.onKeyDownCapture(e); if (rest.onKeyDown) rest.onKeyDown(e); };
  const onKeyDown = (i: number) => (e: React.KeyboardEvent<HTMLInputElement>) => {
    // With Alt, Ctrl or ⌘ the keys are the browser's or the system's (Alt+← goes back a page): leave them (L8E28).
    if (disabled || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    const rtl = !vertical && isRtl(e.currentTarget);
    const by = (e.shiftKey ? large : 1) * step, v = at(latestRef.current, i);
    let n: number;
    switch (e.key) {
      case 'ArrowUp': n = v + by; break;
      case 'ArrowDown': n = v - by; break;
      case 'ArrowRight': n = rtl ? v - by : v + by; break;
      case 'ArrowLeft': n = rtl ? v + by : v - by; break;
      case 'PageUp': n = v + large * step; break;
      case 'PageDown': n = v - large * step; break;
      case 'Home': n = isRange && i === 1 ? at(latestRef.current, 0) : min; break;
      case 'End': n = isRange && i === 0 ? at(latestRef.current, 1) : max; break;
      default: return;
    }
    // The range input's own step is turned off: the keys move by step and largeStep as written here, in either
    // direction of text. Read-only, they move nothing.
    e.preventDefault();
    if (readOnly) return;
    const before = latestRef.current[i];
    if (set(i, n)[i] !== before) commit();
  };

  // onFocus and onBlur fire when focus enters or leaves the slider, not when it moves between a range's two thumbs.
  const crossing = (e: React.FocusEvent<HTMLDivElement>) => !(e.relatedTarget instanceof Node && e.currentTarget.contains(e.relatedTarget));
  const onFocus = (e: React.FocusEvent<HTMLDivElement>) => { if (rest.onFocus && crossing(e)) rest.onFocus(e); };
  const onBlur = (e: React.FocusEvent<HTMLDivElement>) => { if (rest.onBlur && crossing(e)) rest.onBlur(e); };

  const names = props.thumbLabels || [sds.labels.sliderMinimum, sds.labels.sliderMaximum];
  // In a Field, its label names the slider (or a range's group) and its hint and error describe the thumb (or the group).
  const fieldLabel = useFieldLabel(props.id);
  const labelledBy = props['aria-labelledby'] ?? (props['aria-label'] ? undefined : fieldLabel);
  // With origin, a single thumb's fill runs between the origin (kept inside min and max) and the thumb, either way.
  const originAt = !isRange && props.origin != null && isFinite(props.origin) ? pct(Math.min(max, Math.max(min, props.origin))) : null;
  const thumbAt = pct(at(vals, vals.length - 1));
  const lo = isRange ? pct(at(vals, 0)) : originAt != null ? Math.min(originAt, thumbAt) : 0, hi = originAt != null ? Math.max(originAt, thumbAt) : thumbAt;
  const marks = markList(props.marks, min, max, step, large);
  const labelled = marks.some((m) => m.label != null && m.label !== false && m.label !== '');
  // The value chip and the mark labels center on their points, but one near an end would hang past the slider and
  // widen the page (a hidden chip too): each is nudged inward to stay inside the slider's box (GM2).
  const fit = React.useCallback((wrap = true) => {
    const el = root.current;
    if (!el || el.classList.contains('srp-slider--vertical')) return;   // vertical: the text sits beside the track, not past its ends
    const parts = Array.from(el.querySelectorAll<HTMLElement>(FIT));
    if (!parts.length) return;
    for (const p of parts) p.style.removeProperty('--srp-slider-nudge');
    if (wrap) share(el);
    const box = el.getBoundingClientRect();
    const by = parts.map((p) => { const r = p.getBoundingClientRect(); return r.width >= box.width ? 0 : Math.max(0, box.left - r.left) - Math.max(0, r.right - box.right); });
    parts.forEach((p, i) => { if (by[i]) p.style.setProperty('--srp-slider-nudge', by[i] + 'px'); });
  }, []);
  // Fitted again when the slider resizes, and when a label or the chip does on its own: a web font that loads after
  // the first fit makes the text wider or narrower while the slider keeps its size, and the old nudge would be wrong.
  // Each render picks up any new label (a new mark); one already watched isn't observed again, which would refit at once.
  const ro = React.useRef<[ResizeObserver, WeakSet<Element>]>(undefined);
  const watch = () => {
    const el = root.current;
    if (el && ro.current) for (const p of [el, ...el.querySelectorAll(FIT)]) if (!ro.current[1].has(p)) { ro.current[1].add(p); ro.current[0].observe(p); }
  };
  useIsoLayoutEffect(() => { fit(); watch(); });   // every render: the values, marks and their text may have moved them
  React.useEffect(() => {
    if (typeof ResizeObserver === 'undefined') return;
    // The nudges at once (they only translate); the wrapping a frame later, since it resizes the labels and the slider,
    // and resizing what's observed inside its own callback leaves the browser a loop it reports as an error.
    let later = 0;
    const o = new ResizeObserver(() => { fit(false); cancelAnimationFrame(later); later = requestAnimationFrame(() => fit()); });
    ro.current = [o, new WeakSet()];
    watch();
    return () => { o.disconnect(); cancelAnimationFrame(later); };
  }, [fit]);
  // inputs: a number field per thumb, named as its thumb is, between the other thumb (a range) or min and max. A
  // number typed inside them moves the thumb at once; onValueCommit runs when the field is left or Enter is pressed
  // after a change, as it does at the end of a drag.
  const typedFrom = React.useRef<number[] | null>(null);
  const fieldDone = () => { const f = typedFrom.current; if (f && latestRef.current.some((v, k) => v !== f[k])) { commit(); typedFrom.current = latestRef.current.slice(); } };
  // Out of a Field's reach (FieldContext null): the Field's id is the slider's, so a field taking it would repeat it,
  // and a range's two fields would share it. What the Field gives a thumb is passed as the thumb gets it.
  const field = (i: number) => (
    <FieldContext.Provider key={'field' + i} value={null}><NumberInput className="srp-slider__input" size={size} steppers={false}
      value={vals[i]} min={isRange && i === 1 ? vals[0] : min} max={isRange && i === 0 ? vals[1] : max} step={step} largeStep={large}
      disabled={disabled} readOnly={readOnly} invalid={invalid || undefined}
      aria-label={isRange ? names[i] : props['aria-label']} aria-labelledby={isRange ? undefined : labelledBy}
      aria-describedby={isRange ? undefined : props['aria-describedby']} aria-errormessage={invalid ? props['aria-errormessage'] : undefined}
      onFocus={() => { typedFrom.current = latestRef.current.slice(); }}
      onValueChange={(v) => { if (v != null) set(i, v); }}
      onKeyUp={(e) => { if (e.key === 'Enter' && !isComposing(e)) fieldDone(); }}
      onBlur={() => { fieldDone(); typedFrom.current = null; }} /></FieldContext.Provider>
  );
  return (
    <div {...rest} ref={(n) => { root.current = n; delegateFocus(n, first); restyle(n); }}
      role={isRange ? 'group' : rest.role} aria-label={isRange ? props['aria-label'] : undefined} aria-labelledby={isRange ? labelledBy : undefined}
      aria-describedby={isRange ? props['aria-describedby'] : undefined}
      className={cn('srp-slider', 'srp-slider--size-' + size, disabled && 'srp-slider--disabled', readOnly && 'srp-slider--readonly', invalid && 'srp-slider--invalid', labelled && 'srp-slider--mark-labels', props.inputs && 'srp-slider--inputs', vertical && 'srp-slider--vertical', props.className)}
      data-component="slider" data-size={size} data-orientation={vertical ? 'vertical' : undefined} data-disabled={disabled ? '' : undefined} data-readonly={readOnly ? '' : undefined} data-invalid={invalid ? '' : undefined}
      onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={end} onPointerCancel={cancel}
      onKeyDown={undefined} onKeyDownCapture={onKeyDownCapture} onFocus={onFocus} onBlur={onBlur}>
      {props.inputs && isRange ? field(0) : null}
      <div className="srp-slider__track">
        <div className="srp-slider__fill" style={{ insetInlineStart: (vertical ? 100 - hi : lo) + '%', inlineSize: hi - lo + '%' }} />
        {marks.map((m, i) => (
          <span key={i} className="srp-slider__mark" style={{ insetInlineStart: place(pct(m.value)) + '%' }} aria-hidden="true">
            {m.value > min && m.value < max ? <span className="srp-slider__tick" /> : null}
            {m.label != null && m.label !== false ? <span className="srp-slider__mark-label"><span>{m.label}</span></span> : null}
          </span>
        ))}
        {vals.map((v, i) => (
          // The thumb is drawn by the span; a native <input type="range"> over it, unseen, takes focus, carries the
          // value and the name, and is what screen readers adjust: their swipe and volume-key gestures work reliably
          // only on a native range. Presses go through it to the track, which places the thumb under the pointer.
          <span key={i} className="srp-slider__thumb" style={{ insetInlineStart: place(pct(v)) + '%' }}>
            <input ref={(n) => { thumbs.current[i] = n; if (!isRange) nameRef(n); }} className="srp-slider__range" type="range"
              value={v} min={isRange && i === 1 ? vals[0] : min} max={isRange && i === 0 ? vals[1] : max} step={step}
              name={props.name} form={props.form} disabled={disabled}
              aria-valuetext={props.formatValue ? text(v) : undefined} aria-orientation={vertical ? 'vertical' : 'horizontal'} aria-readonly={readOnly || undefined} aria-invalid={invalid || undefined}
              // The error goes where aria-invalid is: on the root <div> it pointed nowhere a screen reader looks (L8E87).
              aria-errormessage={invalid ? props['aria-errormessage'] : undefined}
              aria-label={isRange ? names[i] : props['aria-label']} aria-labelledby={isRange ? undefined : labelledBy}
              aria-describedby={isRange ? undefined : props['aria-describedby']}
              onKeyDown={onKeyDown(i)} onChange={onChange(i)} />
            {props.showValue ? <span className="srp-slider__value" aria-hidden="true"><span>{text(v)}</span></span> : null}
          </span>
        ))}
      </div>
      {props.inputs ? field(vals.length - 1) : null}
    </div>
  );
}

export const Slider = /* @__PURE__ */ named('Slider', SliderRender) as (<V extends SliderValue = SliderValue>(props: SliderProps<V> & React.RefAttributes<HTMLDivElement>) => React.ReactElement | null) & { displayName?: string };
