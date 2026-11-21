'use client';
import * as React from 'react';
import { cn, domId, omit, useMergedRef } from '../../internal/cn';
import { named } from '../../internal/component';
import { useSettings } from '../../internal/provider';
import { useFieldsetDisabled } from '../../internal/useFieldsetDisabled';
import { FieldContext, useFieldControl } from '../../internal/field';
import { useFieldLabel } from '../../internal/fieldLabel';
import { delegateFocus } from '../../internal/focus';
import { NAME_HOW, useNameCheck } from '../../internal/nameCheck';
import { useServerStyles } from '../../internal/serverStyles';
import * as icons from '../../material/builtin';
import { Icon } from '../Icon/Icon';
import { IconButton } from '../IconButton/IconButton';
import { Slider } from '../Slider/Slider';
import { en as words } from './labels';

/** The part of the picture to keep, in the picture's own pixels from its top left corner. */
export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ImageCropperProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** The picture's address: a URL, or an object URL of a file someone picked (URL.createObjectURL). A new src starts
   *  over, centered at the first zoom. */
  src: string;
  /** The crop's shape as width over height: 1 for a square or circle (default), 16 / 9 for a cover, 3 / 4 for a portrait. */
  aspect?: number | undefined;
  /** 'rect' (default), or 'round' for a profile photo: the picture outside a circle (an ellipse, with another aspect)
   *  is dimmed. The crop itself is still the rectangle around it, as a round avatar is drawn from a square picture. */
  shape?: 'rect' | 'round' | undefined;
  /** The zoom at first: 1 (default) is the whole width or height of the picture in the frame, 2 is half of it. */
  defaultZoom?: number | undefined;
  /** How far in it zooms. Default: 4. */
  maxZoom?: number | undefined;
  /** The crop (controlled), in the picture's own pixels: one onCropChange gave, or one saved before. The picture is
   *  moved and zoomed to show it (kept inside the picture and the zoom range). Use with onCropChange. */
  crop?: CropArea | null | undefined;
  /** The crop at first (uncontrolled), such as one saved before, in place of the centered one; a new src drops it. */
  defaultCrop?: CropArea | null | undefined;
  /** Called with the crop once the picture loads and after every move or zoom, in the picture's own whole pixels.
   *  Give it to cropImage for the cropped picture, or send it with the original for the server to crop. */
  onCropChange?: ((area: CropArea) => void) | undefined;
  /** For a picture from another site, so cropImage can read it: 'anonymous' asks it for CORS, as on an <img>. */
  crossOrigin?: '' | 'anonymous' | 'use-credentials' | undefined;
  /** Turns moving and zooming off. */
  disabled?: boolean | undefined;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

// The part of the picture the frame shows: at zoom 1 as much as the frame's shape takes (the picture covers the
// frame), 1/zoom of that further in, around the centre (cx, cy, as fractions of the picture), kept inside the picture.
function areaOf(nw: number, nh: number, aspect: number, zoom: number, cx: number, cy: number): CropArea {
  let w = nw, h = nw / aspect;
  if (h > nh) { h = nh; w = nh * aspect; }
  w /= zoom; h /= zoom;
  return { x: clamp(cx * nw - w / 2, 0, nw - w), y: clamp(cy * nh - h / 2, 0, nh - h), width: w, height: h };
}
// The zoom and centre that show `a`: the inverse of areaOf.
function viewOf(nw: number, nh: number, aspect: number, maxZoom: number, a: CropArea): { zoom: number; center: [number, number] } {
  const full = areaOf(nw, nh, aspect, 1, 0.5, 0.5);
  return { zoom: clamp(Math.round(full.width / Math.max(1, a.width) * 1000) / 1000, 1, maxZoom), center: [(a.x + a.width / 2) / nw, (a.y + a.height / 2) / nh] };
}
const whole = (a: CropArea): CropArea => ({ x: Math.round(a.x), y: Math.round(a.y), width: Math.round(a.width), height: Math.round(a.height) });

/** The part `area` of the picture at `src`, drawn on a canvas `width` pixels wide (default: the area's own width),
 *  as a Blob of `type` (default 'image/png'; 'image/jpeg' or 'image/webp' take `quality`, 0 to 1). Resolves to null
 *  on the server, or when the picture can't be loaded or read (another site's picture without CORS).
 *  @beta New with ImageCropper. */
export function cropImage(src: string, area: CropArea, options: { width?: number; type?: string; quality?: number; crossOrigin?: '' | 'anonymous' | 'use-credentials' } = {}): Promise<Blob | null> {
  if (typeof document === 'undefined') return Promise.resolve(null);
  return new Promise((resolve) => {
    const img = new Image();
    if (options.crossOrigin !== undefined) img.crossOrigin = options.crossOrigin;
    img.onload = () => {
      const w = Math.max(1, Math.round(options.width || area.width)), h = Math.max(1, Math.round(w * area.height / area.width));
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      const g = c.getContext('2d');
      if (!g) { resolve(null); return; }
      g.imageSmoothingQuality = 'high';
      g.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, w, h);
      try { c.toBlob((b) => resolve(b), options.type || 'image/png', options.quality); } catch { resolve(null); }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

const OWN = { src: 1, crop: 1, defaultCrop: 1, aspect: 1, shape: 1, defaultZoom: 1, maxZoom: 1, onCropChange: 1, crossOrigin: 1, disabled: 1, className: 1, style: 1 } as const;
const STEP = 0.1;   // zoom by a key or a button
const TAP = 4;      // px a press may wander and still be a tap
type Gesture = { x: number; y: number; cx: number; cy: number; moved: boolean };

/* ImageCropper: a frame of a fixed shape with the picture behind it. People move the picture, not the frame: drag it
   (mouse, pen or a finger; the page doesn't scroll under it), tap a spot to bring it to the middle, or focus the frame and use the arrow keys (a tenth of
   the frame, Shift for half). They zoom with the slider under it, its − and + buttons, + and − on the frame, a
   trackpad pinch (Ctrl with the wheel) or two fingers. The picture always covers the frame, so the crop never has an
   empty edge. A round shape dims the picture outside a circle. Nothing is cropped here: onCropChange gives the area
   in the picture's own pixels, and cropImage draws it (2.5.7: every drag has a key and a button). The frame is an
   application: its arrow keys are its own (they move the picture), so a screen reader passes them through rather
   than reading on; its name and description say what they do. Until the picture loads, when it can't, or disabled,
   it's a plain box: nothing in it works, and the failure text is read where it is. */
function ImageCropperRender({ ref, ...given }: ImageCropperProps & React.RefAttributes<HTMLDivElement>) {
  const props = useFieldControl(given);
  const nameRef = useNameCheck('ImageCropper', NAME_HOW.group);
  const fieldLabel = useFieldLabel(props.id);
  const rest = omit(props, OWN);
  const L = useSettings(words).labels;
  const base = domId('srp-crop', React.useId());
  const root = React.useRef<HTMLDivElement | null>(null);
  const frame = React.useRef<HTMLDivElement | null>(null);
  const disabled = useFieldsetDisabled(root) || !!props.disabled;
  const aspect = props.aspect && props.aspect > 0 && isFinite(props.aspect) ? props.aspect : 1;
  const maxZoom = Math.max(1, props.maxZoom || 4);
  const first = clamp(props.defaultZoom || 1, 1, maxZoom);
  const [nat, setNat] = React.useState<[number, number] | null>(null);
  const [failed, setFailed] = React.useState(false);
  const [ownZoom, setZoom] = React.useState(first);
  const [ownCenter, setCenter] = React.useState<[number, number]>([0.5, 0.5]);
  const [shown, setShown] = React.useState(props.src);
  if (shown !== props.src) { setShown(props.src); setNat(null); setFailed(false); setZoom(first); setCenter([0.5, 0.5]); }
  // Controlled, the view follows crop; otherwise it's this cropper's own.
  const ctl = nat && props.crop ? viewOf(nat[0], nat[1], aspect, maxZoom, props.crop) : null;
  const zoom = ctl ? ctl.zoom : ownZoom, center = ctl ? ctl.center : ownCenter;
  const area = nat ? areaOf(nat[0], nat[1], aspect, zoom, center[0], center[1]) : null;

  // Moves to zoom z around (cx, cy), and says the new crop.
  // (Zoom is kept to a thousandth, so ten steps of 0.1 come back to exactly 1.)
  const go = (n: [number, number], z: number, cx: number, cy: number) => {
    const zz = clamp(Math.round(z * 1000) / 1000, 1, maxZoom);
    const a = areaOf(n[0], n[1], aspect, zz, cx, cy);
    const c: [number, number] = [(a.x + a.width / 2) / n[0], (a.y + a.height / 2) / n[1]];
    setZoom(zz); setCenter(c);
    if (props.onCropChange) props.onCropChange(whole(a));
  };
  // Zooms to z keeping the picture's point under (fx, fy) of the frame where it is: the frame's middle for keys and
  // the slider, the pointer for a pinch.
  const zoomTo = (z: number, fx = 0.5, fy = 0.5) => {
    if (!nat || !area) return;
    const px = area.x + fx * area.width, py = area.y + fy * area.height;
    const b = areaOf(nat[0], nat[1], aspect, clamp(z, 1, maxZoom), 0.5, 0.5);
    go(nat, z, (px - fx * b.width + b.width / 2) / nat[0], (py - fy * b.height + b.height / 2) / nat[1]);
  };
  // The src whose size is known, so a load event after the ref saw it loaded doesn't say the crop twice.
  const read = React.useRef<string | null>(null);
  const firstSrc = React.useRef(props.src);
  const loaded = (i: HTMLImageElement) => {
    if (read.current === props.src) return;
    read.current = props.src;
    if (!i.naturalWidth || !i.naturalHeight) { setFailed(true); return; }
    const n: [number, number] = [i.naturalWidth, i.naturalHeight];
    setNat(n); setFailed(false);
    // The first view: the crop given (controlled, or defaultCrop while it's still the first src), or centered.
    const at = props.crop || (props.src === firstSrc.current ? props.defaultCrop : null);
    if (at) { const v = viewOf(n[0], n[1], aspect, maxZoom, at); go(n, v.zoom, v.center[0], v.center[1]); } else go(n, first, 0.5, 0.5);
  };
  // A picture that loaded before hydration fires no load event for React: read it as it's attached.
  const imgRef = (i: HTMLImageElement | null) => { if (i && i.complete && i.naturalWidth) loaded(i); };

  const live = !disabled && !!area, off = disabled;
  const pointers = React.useRef(new Map<number, { x: number; y: number }>());
  const start = React.useRef<Gesture | null>(null);
  const pinch = React.useRef<{ d: number; z: number } | null>(null);
  const [dragging, setDragging] = React.useState(false);
  const spread = () => { const [p, q] = [...pointers.current.values()]; return p && q ? Math.hypot(p.x - q.x, p.y - q.y) : 0; };
  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!live || (e.pointerType === 'mouse' && e.button !== 0)) return;
    e.preventDefault();
    e.currentTarget.focus({ preventScroll: true });
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* a synthetic pointer has no capture */ }
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    start.current = { x: e.clientX, y: e.clientY, cx: center[0], cy: center[1], moved: pointers.current.size > 1 };
    pinch.current = pointers.current.size === 2 ? { d: spread(), z: zoom } : null;
    setDragging(true);
  };
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = start.current;
    if (!s || !nat || !area || !pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const b = e.currentTarget.getBoundingClientRect();
    if (pinch.current && pinch.current.d) {
      const ps = [...pointers.current.values()], mx = ps.reduce((t, p) => t + p.x, 0) / ps.length, my = ps.reduce((t, p) => t + p.y, 0) / ps.length;
      zoomTo(pinch.current.z * spread() / pinch.current.d, (mx - b.left) / b.width, (my - b.top) / b.height);
      return;
    }
    if (!s.moved && Math.hypot(e.clientX - s.x, e.clientY - s.y) < TAP) return;
    s.moved = true;
    // A pixel of pointer is area.width / frame width of the picture's own pixels; the picture follows the pointer.
    go(nat, zoom, s.cx - (e.clientX - s.x) * area.width / b.width / nat[0], s.cy - (e.clientY - s.y) * area.height / b.height / nat[1]);
  };
  const onUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = start.current;
    // A tap that didn't move brings the spot tapped to the middle: moving the picture with one press, not a drag (2.5.7).
    if (e.type === 'pointerup' && s && !s.moved && pointers.current.size === 1 && nat && area) {
      const b = e.currentTarget.getBoundingClientRect();
      go(nat, zoom, (area.x + (e.clientX - b.left) / b.width * area.width) / nat[0], (area.y + (e.clientY - b.top) / b.height * area.height) / nat[1]);
    }
    pointers.current.delete(e.pointerId);
    pinch.current = null;
    const left = [...pointers.current.values()][0];
    // One finger left after a pinch carries on moving from where it is.
    start.current = left ? { x: left.x, y: left.y, cx: center[0], cy: center[1], moved: true } : null;
    if (!left) setDragging(false);
  };
  const onKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!live || !nat || !area || e.altKey || e.ctrlKey || e.metaKey) return;
    const k = e.key, f = e.shiftKey ? 0.5 : 0.1;
    const dx = k === 'ArrowLeft' ? -1 : k === 'ArrowRight' ? 1 : 0, dy = k === 'ArrowUp' ? -1 : k === 'ArrowDown' ? 1 : 0;
    if (dx || dy) {
      e.preventDefault();
      // The picture moves the way the arrow points, as it does under a drag: the crop goes the other way.
      go(nat, zoom, center[0] - dx * f * area.width / nat[0], center[1] - dy * f * area.height / nat[1]);
    } else if (k === '+' || k === '=') { e.preventDefault(); zoomTo(zoom + STEP); }
    else if (k === '-' || k === '_') { e.preventDefault(); zoomTo(zoom - STEP); }
  };
  // A trackpad pinch arrives as the wheel with Ctrl: zoom there rather than the page. A plain wheel scrolls the page.
  // every render: the listener reads this render's zoom and crop (React's own onWheel is passive, so it can't stop the page zooming).
  React.useEffect(() => {
    const f = frame.current;
    if (!f || !live) return;
    const wheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      const b = f.getBoundingClientRect();
      zoomTo(zoom * Math.exp(-e.deltaY / 100), (e.clientX - b.left) / b.width, (e.clientY - b.top) / b.height);
    };
    f.addEventListener('wheel', wheel, { passive: false });
    return () => f.removeEventListener('wheel', wheel);
  });

  const pct = (n: number) => n * 100 + '%';
  const imgStyle: React.CSSProperties | undefined = nat && area ? {
    width: pct(nat[0] / area.width), height: pct(nat[1] / area.height), left: pct(-area.x / area.width), top: pct(-area.y / area.height),
  } : undefined;
  const labelledBy = props['aria-labelledby'] || (props['aria-label'] ? undefined : fieldLabel);
  // Under a strict CSP the server's style attributes (the frame's shape, the picture's place) are ignored until set again.
  const restyle = useServerStyles<HTMLDivElement>();
  const mergedRef = useMergedRef(ref, (n) => { root.current = n; delegateFocus(n, () => frame.current); nameRef(n); restyle(n); });
  const percent = (z: number) => Math.round(z * 100) + '%';
  return (
    <div {...rest} ref={mergedRef} role="group" aria-labelledby={labelledBy}
      className={cn('srp-image-cropper', disabled && 'srp-image-cropper--disabled', props.className)} data-component="image-cropper"
      style={{ ...props.style, '--srp-image-cropper-aspect': String(aspect) } as React.CSSProperties}>
      <FieldContext.Provider value={null}>
        <div ref={frame} className="srp-image-cropper__frame" data-shape={props.shape === 'round' ? 'round' : 'rect'}
          data-state={failed ? 'error' : area ? 'ready' : 'loading'} data-dragging={dragging || undefined}
          tabIndex={live ? 0 : undefined} role={live ? 'application' : undefined} aria-label={live ? L.cropArea : undefined} aria-describedby={live ? base + '-how' : undefined}
          onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} onKeyDown={onKey}>
          <img ref={imgRef} key={props.src} className="srp-image-cropper__img" src={props.src} alt="" draggable={false} crossOrigin={props.crossOrigin}
            style={imgStyle} onLoad={(e) => loaded(e.currentTarget)} onError={() => { read.current = props.src; setFailed(true); }} />
          {failed ? <span className="srp-image-cropper__fallback"><Icon icon={icons.BrokenImage} />{L.cropFailed}</span> : null}
          <span className="srp-image-cropper__mask" aria-hidden="true" />
          <span className="srp-image-cropper__grid" aria-hidden="true" />
        </div>
        <span id={base + '-how'} hidden>{L.cropHint}</span>
        {/* While the picture loads the zoom row is on but does nothing yet, so it doesn't flash from off to on; when
            the picture can't be loaded there's nothing to zoom, so the row goes rather than turning off. */}
        {failed ? null : <div className="srp-image-cropper__zoom">
          <IconButton icon={icons.Remove} label={L.cropZoomOut} size="sm" disabled={off || zoom <= 1} onClick={() => zoomTo(zoom - STEP)} />
          <Slider className="srp-image-cropper__slider" size="sm" aria-label={L.cropZoom} min={1} max={maxZoom} step={0.01} largeStep={10}
            value={zoom} disabled={off} formatValue={percent} onValueChange={(z) => zoomTo(z)} />
          <IconButton icon={icons.Add} label={L.cropZoomIn} size="sm" disabled={off || zoom >= maxZoom} onClick={() => zoomTo(zoom + STEP)} />
        </div>}
      </FieldContext.Provider>
    </div>
  );
}

/** A picture in a frame of a fixed shape, moved and zoomed to choose the part to keep, such as a profile photo.
 *  @beta New: its API may still change in a minor release. Take this tag off once it has shipped with its bug bash done (CONTRIBUTING.md). */
export const ImageCropper = /* @__PURE__ */ named('ImageCropper', ImageCropperRender);
