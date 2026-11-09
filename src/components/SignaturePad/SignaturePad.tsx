'use client';
import * as React from 'react';
import { cn, domId, isInvalid, omit, setRef } from '../../internal/cn';
import { component } from '../../internal/component';
import { useSettings } from '../../internal/provider';
import { useFormReset } from '../../internal/useFormReset';
import { useFieldsetDisabled } from '../../internal/useFieldsetDisabled';
import { FieldContext, useFieldControl } from '../../internal/field';
import { useFieldLabel } from '../../internal/fieldLabel';
import { delegateFocus, useAutoFocus, useFocusHandover } from '../../internal/focus';
import { NAME_HOW, useNameCheck } from '../../internal/nameCheck';
import { Button } from '../Button/Button';
import { Input } from '../Input/Input';
import { SegmentedControl } from '../SegmentedControl/SegmentedControl';
import { en as words } from './labels';

/** How the signature was given: drawn with a pointer, or typed as a name. */
export type SignatureMethod = 'draw' | 'type';

/** A signature: how it was given, its picture as SVG markup, and the typed name (empty for a drawn one). */
export interface SignatureValue {
  method: SignatureMethod;
  /** The signature as a standalone SVG document, sized to the pad: the strokes, or the typed name as text. */
  svg: string;
  /** The typed name, trimmed: the signature itself with method "type", "" with "draw". */
  name: string;
}

/** What changed the signature. */
export interface SignatureChangeDetails {
  reason: 'draw' | 'undo' | 'clear' | 'type' | 'method' | 'reset';
}

export interface SignaturePadProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  /** The signature (controlled), or null for none: one onValueChange gave, or one saved before. A drawn one is read
   *  back from its SVG's paths, so give the SVG SignaturePad made. Use with onValueChange. */
  value?: SignatureValue | null | undefined;
  /** The signature at first (uncontrolled), such as one saved before; form.reset() goes back to it. */
  defaultValue?: SignatureValue | null | undefined;
  /** Called with the signature after each stroke, undo, clear, typed change or switch of method; null when it's empty. */
  onValueChange?: ((value: SignatureValue | null, details: SignatureChangeDetails) => void) | undefined;
  /** How it starts: drawing ("draw", the default) or typing a name ("type"). People can switch either way. */
  defaultMethod?: SignatureMethod | undefined;
  /** Sends the signature's SVG markup with a form, in a hidden input ("" while it's empty). */
  name?: string | undefined;
  /** The id of a form elsewhere on the page that the hidden input belongs to. */
  form?: string | undefined;
  /** Turns drawing, typing and every button off. */
  disabled?: boolean | undefined;
  /** Marks the signature invalid (aria-invalid on the group). Field sets it from its error. */
  invalid?: boolean | undefined;
}

type Point = readonly [number, number];
type Stroke = Point[];

const OWN = { value: 1, defaultValue: 1, onValueChange: 1, defaultMethod: 1, name: 1, form: 1, disabled: 1, invalid: 1, 'aria-invalid': 1, 'aria-required': 1, autoFocus: 1, className: 1 } as const;
const r1 = (n: number) => Math.round(n * 10) / 10;
const pathOf = (s: Stroke) => s.length === 1 ? `M${s[0][0]} ${s[0][1]}h0` : 'M' + s.map((p) => p[0] + ' ' + p[1]).join('L');
// The strokes back from an SVG this pad made: each <path d="M x yLx y…"> is one stroke ("h0" ends a dot).
const strokesOf = (svg: string): Stroke[] => [...svg.matchAll(/<path d="M([^"]+)"/g)].map((m) =>
  m[1].replace(/h0$/, '').split('L').map((p) => { const [x, y] = p.trim().split(/[\s,]+/).map(Number); return [x, y] as const; }).filter((p) => isFinite(p[0]) && isFinite(p[1])),
).filter((s) => s.length);
const xml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const SVG = (w: number, h: number, body: string) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`;
// The typed name as a signature, as the pad shows it: slanted serif, 30px, on the line.
const typedSvg = (name: string, w: number, h: number) => SVG(w, h, `<text x="16" y="${r1(h * 0.68)}" font-family="Georgia, 'Times New Roman', serif" font-style="italic" font-size="30" fill="#000">${xml(name)}</text>`);
const drawnSvg = (strokes: Stroke[], w: number, h: number) => SVG(w, h, `<g fill="none" stroke="#000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${strokes.map((s) => `<path d="${pathOf(s)}"/>`).join('')}</g>`);

/** A signature's SVG markup as a PNG image, drawn in the browser at `scale` times its size (default 2), for an app
 *  that stores or prints pictures. Resolves to null where there's no canvas (on the server).
 *  @beta New with SignaturePad. */
export function signatureToPng(svg: string, scale = 2): Promise<Blob | null> {
  if (typeof document === 'undefined') return Promise.resolve(null);
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = Math.max(1, Math.round(img.naturalWidth * scale));
      c.height = Math.max(1, Math.round(img.naturalHeight * scale));
      const g = c.getContext('2d');
      if (!g) { resolve(null); return; }
      g.drawImage(img, 0, 0, c.width, c.height);
      c.toBlob((b) => resolve(b), 'image/png');
    };
    img.onerror = () => resolve(null);
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  });
}

/* SignaturePad: a signature, drawn or typed. The two methods are a SegmentedControl (Draw, Type) at the top. Draw is
   a box people draw in with a mouse, pen or finger (pointer events; the page doesn't scroll under a finger there),
   with a line to sign on, and Undo (the last stroke) and Clear under it. Type is a text field for the full name,
   shown in a handwriting face: the alternative that keyboard, switch and speech users need (WCAG 2.5.7 dragging
   movements, 2.1.1 keyboard), and that anyone may prefer. The drawing box isn't focusable: nothing in it works by
   keyboard, so the group's description points to Type. In a Field, the label names the group. The value is
   { method, svg, name }; signatureToPng turns the SVG into a PNG. */
/** A signature drawn with a pointer or typed as a name: the value is its SVG and the typed name.
 *  @beta New: its API may still change in a minor release. Take this tag off once it has shipped with its bug bash done (CONTRIBUTING.md). */
export const SignaturePad = /* @__PURE__ */ component<HTMLDivElement, SignaturePadProps>('SignaturePad', function SignaturePad(given, ref) {
  const props = useFieldControl(given);
  const nameRef = useNameCheck('SignaturePad', NAME_HOW.group);
  const fieldLabel = useFieldLabel(props.id);
  const rest = omit(props, OWN);
  const sds = useSettings(words), L = sds.labels;
  const base = domId('dk-sig', React.useId());
  const root = React.useRef<HTMLDivElement | null>(null);
  const area = React.useRef<SVGSVGElement | null>(null);
  const inDisabledFieldset = useFieldsetDisabled(root);
  const disabled = !!props.disabled || inDisabledFieldset;
  const invalid = isInvalid(props.invalid, props['aria-invalid']);
  const first: SignatureMethod = props.defaultMethod === 'type' ? 'type' : 'draw';
  const controlled = props.value !== undefined;
  const start = controlled ? props.value : props.defaultValue;
  const [method, setMethod] = React.useState<SignatureMethod>(start ? (start.method === 'type' ? 'type' : 'draw') : first);
  const [strokes, setStrokes] = React.useState<Stroke[]>(() => (start && start.method !== 'type' ? strokesOf(start.svg) : []));
  const [typed, setTyped] = React.useState(start && start.method === 'type' ? start.name : '');
  // Shows a given value: its method, and its strokes or name; null empties what's shown and keeps the method.
  const show = (v: SignatureValue | null | undefined, empty: SignatureMethod) => {
    live.current = null;
    if (!v) { setStrokes([]); setTyped(''); setMethod(empty); return; }
    const m: SignatureMethod = v.method === 'type' ? 'type' : 'draw';
    setMethod(m);
    if (m === 'type') setTyped(v.name); else setStrokes(strokesOf(v.svg));
  };
  const [size, setSize] = React.useState<[number, number]>([0, 0]);
  const live = React.useRef<Stroke | null>(null);
  const [, redraw] = React.useReducer((n: number) => n + 1, 0);
  const handover = useFocusHandover();

  const methodStop = () => root.current && root.current.querySelector<HTMLElement>('.dk-signature-pad__method [role=radio][tabindex="0"]');
  useAutoFocus(props.autoFocus, methodStop);

  const measure = () => { const b = area.current && area.current.getBoundingClientRect(); return b ? [Math.round(b.width), Math.round(b.height)] as [number, number] : size; };
  React.useLayoutEffect(() => { setSize(measure()); }, [method]); // eslint-disable-line react-hooks/exhaustive-deps

  const valueOf = (m: SignatureMethod, s: Stroke[], t: string, wh: [number, number]): SignatureValue | null => {
    const w = wh[0] || 600, h = wh[1] || 160, name = t.trim();
    if (m === 'type') return name ? { method: m, svg: typedSvg(name, w, h), name } : null;
    return s.length ? { method: m, svg: drawnSvg(s, w, h), name: '' } : null;
  };
  const value = valueOf(method, strokes, typed, size);
  const tell = (m: SignatureMethod, s: Stroke[], t: string, reason: SignatureChangeDetails['reason']) => {
    if (props.onValueChange) props.onValueChange(valueOf(m, s, t, measure()), { reason });
  };

  // Controlled: what's shown follows value, so a change the app doesn't take back goes away again.
  const want = controlled ? props.value ?? null : undefined;
  const wantKey = want === undefined ? '' : want ? (want.method === 'type' ? 't:' + want.name.trim() : 'd:' + JSON.stringify(strokesOf(want.svg))) : '-';
  const haveKey = !value ? '-' : value.method === 'type' ? 't:' + value.name : 'd:' + JSON.stringify(strokes);
  React.useLayoutEffect(() => {
    if (want !== undefined && !live.current && wantKey !== haveKey) show(want, method);
  });

  useFormReset(root, () => {
    if (controlled) return;   // the app's value stays; a controlled field's reset is the app's, as with a native one
    setStrokes([]); setTyped(''); show(props.defaultValue, first);
    if (props.onValueChange) props.onValueChange(props.defaultValue ? valueOf(props.defaultValue.method === 'type' ? 'type' : 'draw', props.defaultValue.method === 'type' ? [] : strokesOf(props.defaultValue.svg), props.defaultValue.name, measure()) : null, { reason: 'reset' });
  }, props.form);

  const at = (e: React.PointerEvent): Point => {
    const b = e.currentTarget.getBoundingClientRect();
    return [r1(Math.min(b.width, Math.max(0, e.clientX - b.left))), r1(Math.min(b.height, Math.max(0, e.clientY - b.top)))];
  };
  const onDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (disabled || (e.pointerType === 'mouse' && e.button !== 0)) return;
    e.preventDefault();
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* a synthetic pointer has no capture */ }
    live.current = [at(e)];
    redraw();
  };
  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const s = live.current;
    if (!s) return;
    const p = at(e), q = s[s.length - 1];
    if (Math.abs(p[0] - q[0]) + Math.abs(p[1] - q[1]) < 1) return;
    s.push(p);
    redraw();
  };
  const onUp = () => {
    const s = live.current;
    if (!s) return;
    live.current = null;
    const next = [...strokes, s];
    setSize(measure());
    setStrokes(next);
    tell('draw', next, typed, 'draw');
  };
  const undo = (e: React.MouseEvent<HTMLButtonElement>) => {
    const next = strokes.slice(0, -1);
    if (!next.length) handover(e.currentTarget, methodStop);
    setStrokes(next);
    tell('draw', next, typed, 'undo');
  };
  const clear = (e: React.MouseEvent<HTMLButtonElement>) => {
    handover(e.currentTarget, methodStop);
    setStrokes([]);
    tell('draw', [], typed, 'clear');
  };
  const pick = (m: string) => {
    const next: SignatureMethod = m === 'type' ? 'type' : 'draw';
    setMethod(next);
    tell(next, strokes, typed, 'method');
  };

  const shown = live.current ? [...strokes, live.current] : strokes;
  const empty = method === 'draw' ? !shown.length : !typed.trim();
  const labelledBy = props['aria-labelledby'] || (props['aria-label'] ? undefined : fieldLabel);
  const describedBy = cn(base + '-how', props['aria-describedby']);
  return (
    <div {...rest} ref={(n) => { root.current = n; delegateFocus(n, methodStop); setRef(ref, n); nameRef(n); }} role="group"
      aria-labelledby={labelledBy} aria-describedby={describedBy}
      className={cn('dk-signature-pad', disabled && 'dk-signature-pad--disabled', invalid && 'dk-signature-pad--invalid', props.className)} data-component="signature-pad">
      <FieldContext.Provider value={null}>
        <SegmentedControl className="dk-signature-pad__method" size="sm" aria-label={L.signatureMethod} disabled={disabled} invalid={invalid || undefined} value={method} onValueChange={pick}
          options={[{ value: 'draw', label: L.signatureDraw }, { value: 'type', label: L.signatureType }]} />
        <p className="dk-signature-pad__how" id={base + '-how'}>{method === 'draw' ? L.signatureDrawHint : L.signatureTypeHint}</p>
        {method === 'draw' ? (
          <>
            <div className="dk-signature-pad__box">
              <svg ref={area} className="dk-signature-pad__area" role="img" aria-label={empty ? L.signatureEmpty : L.signatureDrawn}
                onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} onLostPointerCapture={onUp}>
                <g className="dk-signature-pad__strokes">{shown.map((s, i) => <path key={i} d={pathOf(s)} />)}</g>
              </svg>
              <span className="dk-signature-pad__line" aria-hidden />
            </div>
            <div className="dk-signature-pad__actions">
              <Button variant="ghost" size="sm" disabled={disabled || !strokes.length} onClick={undo}>{L.signatureUndo}</Button>
              <Button variant="ghost" size="sm" disabled={disabled || !strokes.length} onClick={clear}>{L.signatureClear}</Button>
            </div>
          </>
        ) : (
          <>
            <label className="dk-signature-pad__label" htmlFor={base + '-name'}>{L.signatureName}</label>
            <Input id={base + '-name'} className="dk-signature-pad__input" autoComplete="name" spellCheck={false} disabled={disabled} invalid={invalid || undefined}
              value={typed} onChange={(e) => { setTyped(e.target.value); tell('type', strokes, e.target.value, 'type'); }} />
            <div className="dk-signature-pad__box" aria-hidden>
              <svg ref={area} className="dk-signature-pad__area dk-signature-pad__area--typed">
                {typed.trim() ? <text className="dk-signature-pad__typed" x="16" y="68%">{typed.trim()}</text> : null}
              </svg>
              <span className="dk-signature-pad__line" />
            </div>
          </>
        )}
      </FieldContext.Provider>
      {props.name ? <input type="hidden" name={props.name} form={props.form} value={value ? value.svg : ''} disabled={disabled} /> : null}
    </div>
  );
});
