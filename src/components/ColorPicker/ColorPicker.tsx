"use client";
import * as React from "react";
import { cn, omit, setRef } from "../../internal/cn";
import { component } from "../../internal/component";
import { contrastRatio, normalizeHex } from "../../internal/color";
import { delegateFocus } from "../../internal/focus";
import { useFieldLabel } from "../../internal/fieldLabel";
import { useLocale, useSerupa } from "../../internal/provider";
import { Icon } from "../Icon/Icon";
import { Input } from "../Input/Input";
import * as icons from "../../material/builtin";

/** A swatch: its color as hex, and its name in words ("Ocean"), which is what screen readers say. */
export interface ColorSwatch { value: string; label: string }

export interface ColorPickerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  /** The colors to pick from: { value: "#1d4ed8", label: "Blue" }, or a hex string, named by its code. */
  swatches: ReadonlyArray<ColorSwatch | string>;
  /** The color, as #rrggbb (controlled). Use with onValueChange. null: none picked. */
  value?: string | null;
  /** The color at first (uncontrolled). */
  defaultValue?: string | null;
  /** Called with the new color, always lowercase #rrggbb. */
  onValueChange?: (value: string) => void;
  /** A hex field and the browser's color picker after the swatches, for any color. Default: true. */
  custom?: boolean;
  /** A color to check the picked one against (the background it goes on, or the text on it): shows the WCAG ratio. */
  contrastWith?: string;
  /** The ratio below which it warns. Default: 4.5 (text); 3 for large text and icons. */
  minContrast?: number;
  /** 'sm' (24px swatches) or 'md' (32px, default). */
  size?: 'sm' | 'md';
  disabled?: boolean;
  /** Submits the color with a form, in a hidden input. */
  name?: string;
}

const OWN = { "aria-label": 1, "aria-labelledby": 1, swatches: 1, value: 1, defaultValue: 1, onValueChange: 1, custom: 1, contrastWith: 1, minContrast: 1, size: 1, disabled: 1, name: 1, className: 1 } as const;
const swatchOf = (s: ColorSwatch | string): ColorSwatch => (typeof s === "string" ? { value: s, label: normalizeHex(s) || s } : s);
// The check on a swatch: white or black, whichever stands out more on it.
const ink = (hex: string) => ((contrastRatio(hex, "#ffffff") || 0) >= (contrastRatio(hex, "#000000") || 0) ? "#ffffff" : "#000000");

/* ColorPicker: a radio group of swatches (one Tab stop; the arrow keys, Home and End move and pick), then, with
   custom, a hex field and the browser's own color picker for any other color. With contrastWith it shows the WCAG
   contrast ratio between the picked color and that one, and warns below minContrast, in a polite live region.
   Colors go in and come out as lowercase #rrggbb. className and other props go to the outer <div>. */
/** Swatches to pick a color from, a hex field for any other, and a contrast check against a background. */
export const ColorPicker = /* @__PURE__ */ component<HTMLDivElement, ColorPickerProps>("ColorPicker", function ColorPicker(props, ref) {
  const rest = omit(props, OWN);
  const sds = useSerupa(), locale = useLocale();
  const swatches = (props.swatches || []).map(swatchOf).map((s) => ({ ...s, value: normalizeHex(s.value) || s.value }));
  const controlled = props.value !== undefined;
  const [own, setOwn] = React.useState<string | null>(normalizeHex(props.defaultValue || "") );
  const value = controlled ? normalizeHex(props.value || "") : own;
  const disabled = !!props.disabled, custom = props.custom !== false;
  const size = props.size === "sm" ? "sm" : "md";
  const [text, setText] = React.useState((value || "").replace("#", ""));
  const typing = React.useRef(false);
  React.useEffect(() => { if (!typing.current) setText((value || "").replace("#", "")); }, [value]);
  const root = React.useRef<HTMLDivElement | null>(null);
  // The group's name: aria-label or aria-labelledby, or a surrounding Field's label.
  const fieldLabel = useFieldLabel(props.id);
  const labelledBy = props["aria-labelledby"] ?? (props["aria-label"] ? undefined : fieldLabel);

  const choose = (hex: string, focus?: boolean) => {
    if (disabled) return;
    const v = normalizeHex(hex);
    if (!v) return;
    if (!controlled) setOwn(v);
    if (v !== value && props.onValueChange) props.onValueChange(v);
    if (focus && root.current) {
      const b = root.current.querySelector<HTMLButtonElement>(`.dk-color-picker__swatch[data-value="${v}"]`);
      if (b) b.focus();
    }
  };
  const picked = swatches.findIndex((s) => s.value === value);
  const tabStop = picked >= 0 ? picked : 0;
  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.defaultPrevented || !swatches.length) return;
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
    const i = swatches.findIndex((s) => s.value === e.currentTarget.dataset.value);
    let n: number;
    switch (e.key) {
      case "ArrowRight": n = i + (rtl ? -1 : 1); break;
      case "ArrowDown": n = i + 1; break;
      case "ArrowLeft": n = i + (rtl ? 1 : -1); break;
      case "ArrowUp": n = i - 1; break;
      case "Home": n = 0; break;
      case "End": n = swatches.length - 1; break;
      default: return;
    }
    e.preventDefault();
    choose(swatches[(n + swatches.length) % swatches.length].value, true);
  };

  const ratio = props.contrastWith && value ? contrastRatio(value, props.contrastWith) : null;
  const min = props.minContrast && props.minContrast > 1 ? props.minContrast : 4.5;
  // Rounded down, so 4.49 never shows as 4.5 and passes by eye.
  const fmt = (n: number) => new Intl.NumberFormat(locale, { maximumFractionDigits: 1, minimumFractionDigits: 1 }).format(Math.floor(n * 10) / 10);
  const low = ratio != null && ratio < min;
  return (
    <div {...rest} ref={(n) => { root.current = n; delegateFocus(n, () => n && n.querySelectorAll<HTMLButtonElement>(".dk-color-picker__swatch")[tabStop]); setRef(ref, n); }} className={cn("dk-color-picker", "dk-color-picker--size-" + size, disabled && "dk-color-picker--disabled", props.className)}
      data-component="color-picker" data-size={size}>
      <div role="radiogroup" className="dk-color-picker__swatches" aria-label={props["aria-label"]} aria-labelledby={labelledBy} aria-disabled={disabled || undefined}>
        {swatches.map((s, i) => {
          const on = s.value === value;
          return (
            <button key={s.value + i} type="button" role="radio" aria-checked={on} aria-label={s.label} title={s.label} data-value={s.value}
              className={cn("dk-color-picker__swatch", on && "dk-color-picker__swatch--checked")} style={{ "--dk-swatch": s.value, "--dk-swatch-ink": ink(s.value) } as React.CSSProperties}
              tabIndex={i === tabStop ? 0 : -1} disabled={disabled} onClick={() => choose(s.value)} onKeyDown={onKeyDown}>
              {on ? <Icon icon={icons.Check} className="dk-color-picker__check" /> : null}
            </button>
          );
        })}
      </div>
      {custom ? (
        <div className="dk-color-picker__custom">
          <input type="color" className="dk-color-picker__native" aria-label={sds.labels.customColor} value={value || "#000000"} disabled={disabled}
            onChange={(e) => choose(e.target.value)} />
          <Input size="sm" className="dk-color-picker__hex" aria-label={sds.labels.hexCode} value={text} disabled={disabled} maxLength={7} spellCheck={false} autoComplete="off"
            leftIcon={<span className="dk-color-picker__hash">#</span>} aria-invalid={text !== "" && !normalizeHex(text) ? true : undefined}
            onFocus={() => { typing.current = true; }}
            onChange={(e) => { const t = e.target.value.replace(/^#/, ""); setText(t); const v = normalizeHex(t); if (v && t.length === 6) choose(v); }}
            onBlur={() => { typing.current = false; const v = normalizeHex(text); if (v) choose(v); setText(((v || value) || "").replace("#", "")); }}
            onKeyDown={(e) => { if (e.key === "Enter") { const v = normalizeHex(text); if (v) { choose(v); setText(v.slice(1)); } } }} />
        </div>
      ) : null}
      {props.contrastWith ? (
        <div className={cn("dk-color-picker__contrast", low && "dk-color-picker__contrast--low")} aria-live="polite">
          {ratio != null ? <>{low ? <Icon icon={icons.Warning} className="dk-color-picker__warning" /> : null}<span>{sds.labels.contrast(fmt(ratio))}{low ? ", " + sds.labels.lowContrast(fmt(min)) : ""}</span></> : null}
        </div>
      ) : null}
      {props.name ? <input type="hidden" name={props.name} value={value || ""} disabled={disabled} /> : null}
    </div>
  );
});
