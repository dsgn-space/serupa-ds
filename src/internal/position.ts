// Places a floating element (a tooltip, popover or menu) next to its anchor, inside the viewport: it flips to
// the other side when there's no room, and slides along the side to stay on screen. Fixed coordinates, so it
// isn't clipped by scrolling or overflow: hidden ancestors (and in the top layer when shown as a popover).

export type Side = 'top' | 'bottom' | 'left' | 'right';
export type Align = 'start' | 'center' | 'end';
export type Placement = Side | `${Side}-${'start' | 'end'}`;

const OPPOSITE: Record<Side, Side> = { top: "bottom", bottom: "top", left: "right", right: "left" };

/** Splits "bottom-start" into its side and alignment. Unknown values become the fallback. */
export function parsePlacement(p: string | undefined, fallback: Placement): [Side, Align] {
  const m = /^(top|bottom|left|right)(?:-(start|end))?$/.exec(p || "") || /^(top|bottom|left|right)(?:-(start|end))?$/.exec(fallback)!;
  return [m[1] as Side, (m[2] as Align) || "center"];
}

/** Where to put the floating element (left, top in viewport px) and the side it ended up on. */
export function place(anchor: DOMRect, floating: { width: number; height: number }, placement: string | undefined, offset: number, fallback: Placement = "top", margin = 8): { x: number; y: number; side: Side } {
  const vw = document.documentElement.clientWidth, vh = document.documentElement.clientHeight;
  let [side, align] = parsePlacement(placement, fallback);
  const rtl = getComputedStyle(document.documentElement).direction === "rtl";
  const room = (s: Side) => s === "top" ? anchor.top - offset - floating.height >= margin
    : s === "bottom" ? anchor.bottom + offset + floating.height <= vh - margin
    : s === "left" ? anchor.left - offset - floating.width >= margin
    : anchor.right + offset + floating.width <= vw - margin;
  if (!room(side) && room(OPPOSITE[side])) side = OPPOSITE[side];
  let x: number, y: number;
  if (side === "top" || side === "bottom") {
    y = side === "top" ? anchor.top - offset - floating.height : anchor.bottom + offset;
    const start = rtl ? anchor.right - floating.width : anchor.left, end = rtl ? anchor.left : anchor.right - floating.width;
    x = align === "start" ? start : align === "end" ? end : anchor.left + (anchor.width - floating.width) / 2;
    x = Math.min(Math.max(x, margin), Math.max(margin, vw - margin - floating.width));
  } else {
    x = side === "left" ? anchor.left - offset - floating.width : anchor.right + offset;
    y = align === "start" ? anchor.top : align === "end" ? anchor.bottom - floating.height : anchor.top + (anchor.height - floating.height) / 2;
    y = Math.min(Math.max(y, margin), Math.max(margin, vh - margin - floating.height));
  }
  return { x: Math.round(x), y: Math.round(y), side };
}

/** Shows an element in the top layer when the browser supports popover="manual", so nothing can cover or clip it. */
export function showLayer(el: HTMLElement | null): void {
  if (!el) return;
  const any = el as any;
  if (typeof any.showPopover === "function" && el.hasAttribute("popover")) { try { if (!el.matches(":popover-open")) any.showPopover(); } catch { /* not connected yet */ } }
}
export function hideLayer(el: HTMLElement | null): void {
  if (!el) return;
  const any = el as any;
  if (typeof any.hidePopover === "function" && el.hasAttribute("popover")) { try { if (el.matches(":popover-open")) any.hidePopover(); } catch { /* already gone */ } }
}

/** A CSS length from a custom property ("0.375rem", "6px") in px. */
export function cssLength(el: Element, prop: string): number {
  const v = getComputedStyle(el).getPropertyValue(prop).trim(), n = parseFloat(v);
  if (isNaN(n)) return 0;
  if (/rem$/.test(v)) return n * (parseFloat(getComputedStyle(document.documentElement).fontSize) || 16);
  if (/em$/.test(v)) return n * (parseFloat(getComputedStyle(el).fontSize) || 16);
  return n;
}
