"use client";
import * as React from "react";
import { cn, oneOf, setRef } from "../../internal/cn";
import { Dialog } from "../Dialog/Dialog";
import { Icon } from "../Icon/Icon";
import { IconButton } from "../IconButton/IconButton";
import { component } from "../../internal/component";
import { useSerupa } from "../../internal/provider";
import * as icons from "../../material/builtin";

export type ImageRatio = 'auto' | 'square' | '4:3' | 'video' | number;

export interface ImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'alt' | 'src' | 'placeholder'> {
  /** The picture's address. */
  src: string;
  /** What the picture shows, for people who can't see it. Required: use "" only for a decorative picture. */
  alt: string;
  /** The frame's shape: 'auto' (the picture's own, default), 'square' (1:1), '4:3', 'video' (16:9) or a number (width / height). */
  ratio?: ImageRatio;
  /** How the picture fills a fixed ratio: 'cover' (fills and crops, default) or 'contain' (fits whole). */
  fit?: 'cover' | 'contain';
  /** Rounded corners (--image-radius). Default: true. */
  rounded?: boolean;
  /** What shows if the picture fails to load. Default: a muted broken-image icon. */
  fallback?: React.ReactNode;
  /** Makes it a button that opens the picture full size in a viewer. Default: false. */
  viewable?: boolean;
  /** A larger version for the viewer. Default: src. */
  fullSrc?: string;
  /** The view button's name. Default: "View image" plus the alt text. */
  viewLabel?: string;
  /** Shows a remove button in the corner; called when it's pressed. */
  onRemove?: () => void;
  /** The remove button's name. Default: "Remove image" plus the alt text. */
  removeLabel?: string;
  /** Props for the outer frame, such as style for its width. */
  frameProps?: React.HTMLAttributes<HTMLSpanElement>;
}

const RATIOS = ["auto", "square", "4:3", "video"] as const;

/* Image: a picture in a frame. ratio fixes the frame's shape (fit says whether the picture crops or fits), with
   rounded corners from --image-radius. It loads lazily by default; until it arrives the frame shows a muted
   placeholder, and if it fails, a fallback (a broken-image icon named by the alt text). viewable makes the
   picture a button that opens it full size in a Dialog (Escape, the × or the backdrop close it, focus comes
   back). onRemove adds a remove button in the corner. alt is required. ref, className and other img props go
   to the <img>; frameProps to the frame. */
/** A picture in a frame with a ratio, a loading placeholder and an error fallback; optionally opens full size or can be removed. */
export const Image = /* @__PURE__ */ component<HTMLImageElement, ImageProps>("Image", function Image(props, ref) {
  const sds = useSerupa();
  const { src, alt, ratio: _r, fit: _f, rounded, fallback, viewable, fullSrc, viewLabel, onRemove, removeLabel, frameProps, className, onLoad, onError, loading, ...rest } = props;
  const ratio = typeof props.ratio === "number" && props.ratio > 0 ? props.ratio : oneOf(RATIOS, props.ratio as string, "auto");
  const fit = oneOf(["cover", "contain"] as const, props.fit, "cover");
  const [state, setState] = React.useState<"loading" | "loaded" | "error">("loading");
  const [open, setOpen] = React.useState(false);
  const img = React.useRef<HTMLImageElement | null>(null);
  React.useEffect(() => { setState("loading"); }, [src]);
  // An image already in the cache can finish before React listens.
  React.useEffect(() => { const i = img.current; if (i && i.complete) setState(i.naturalWidth > 0 ? "loaded" : "error"); }, [src]);
  const named = (base: string) => (alt ? base + ": " + alt : base);
  const frameStyle = typeof ratio === "number" ? { ...(frameProps && frameProps.style), "--dk-image-ratio": String(ratio) } as React.CSSProperties : frameProps && frameProps.style;
  const picture = state === "error"
    ? <span className="dk-image__fallback" role={alt ? "img" : undefined} aria-label={alt || undefined} aria-hidden={alt ? undefined : true}>{fallback != null ? fallback : <Icon icon={icons.BrokenImage} />}</span>
    : <img {...rest} ref={(n) => { img.current = n; setRef(ref, n); }} src={src} alt={alt} loading={loading || "lazy"}
        className={cn("dk-image__img", className)} onLoad={(e) => { setState("loaded"); if (onLoad) onLoad(e); }} onError={(e) => { setState("error"); if (onError) onError(e); }} />;
  return (
    <span {...frameProps} style={frameStyle}
      className={cn("dk-image", "dk-image--ratio-" + (typeof ratio === "number" ? "custom" : ratio.replace(":", "-")), "dk-image--" + fit, rounded !== false && "dk-image--rounded", "dk-image--" + state, frameProps && frameProps.className)}
      data-component="image" data-state={state}>
      {viewable && state !== "error"
        ? <button type="button" className="dk-image__view" aria-label={viewLabel || named(sds.labels.viewImage)} aria-haspopup="dialog" onClick={() => setOpen(true)}>{picture}</button>
        : picture}
      {onRemove ? <IconButton className="dk-image__remove" icon={icons.Close} label={removeLabel || named(sds.labels.removeImage)} size="sm" variant="secondary" shape="round" noTitle onClick={onRemove} /> : null}
      {viewable ? (
        <Dialog open={open} onOpenChange={setOpen} size="lg" title={alt || undefined} aria-label={alt ? undefined : viewLabel || sds.labels.image} className="dk-image__viewer">
          {open ? <img src={fullSrc || src} alt={alt} className="dk-image__full" /> : null}
        </Dialog>
      ) : null}
    </span>
  );
});
