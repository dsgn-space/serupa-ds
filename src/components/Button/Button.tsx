import * as React from "react";
import { cn, type DataAttributes, omit, oneOf, SIZES } from "../../internal/cn";
import { config } from "../../internal/config";
import { announce, ensureAnnouncer } from "../../internal/announce";
import { block, both, chain, pressKey, releaseKey, ripple } from "../../internal/interactions";
import { warnOnce } from "../../internal/warn";
import { asIcon, type IconSource } from "../Icon/Icon";
import { Loader } from "../Loader/Loader";

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg';

/** What every Button takes, as a <button> or as a link. */
interface ButtonOwnProps {
  /** Visual style. Default: 'primary' (solid brand color). */
  variant?: ButtonVariant;
  /** Danger colors on any variant, for deleting or irreversible actions. Default: false. */
  destructive?: boolean;
  /** Height: sm 24px, md 32px, lg 44px (the control-height tokens). Default: 'md'. */
  size?: ButtonSize;
  /** Icon before the label: an icon name (custom or Material Symbols, "add") or any element. */
  leftIcon?: IconSource;
  /** Icon after the label: an icon name (custom or Material Symbols, "arrow_forward") or any element. */
  rightIcon?: IconSource;
  /** Icon-only button: an icon name (custom or Material Symbols) or element, in a square at the size's height. Ignores children, leftIcon and rightIcon; needs an aria-label. */
  icon?: IconSource;
  /** Shows a centered Loader (ring) and blocks clicks, keys and Enter-key form submission while an action runs, so a request can't be sent twice. Keeps size, colors and keyboard focus; sets aria-busy, aria-disabled and data-loading. Default: false. */
  loading?: boolean;
  /** Announced to screen readers (polite status region) when loading starts. Default: 'Loading'. Pass '' to stay silent. */
  loadingText?: string;
}

/** A Button without href: a native <button>. */
export interface ButtonAsButtonProps extends ButtonOwnProps, Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  href?: undefined;
  /** 'button' (default, never submits by accident), 'submit' or 'reset'. */
  type?: 'button' | 'submit' | 'reset';
  /** Opens, closes or toggles a [popover] element by id (native HTML; React 18's own types don't list it yet). */
  popoverTarget?: string;
  popoverTargetAction?: 'show' | 'hide' | 'toggle';
  /** Invoker commands: the id of the element to act on, and the action ('show-modal', 'close', 'request-close', 'show-popover', 'hide-popover', 'toggle-popover', or a custom '--name'). */
  commandfor?: string;
  command?: string;
}

/** A Button with href: a link (<a>, or the component set with Serupa.configure({ link })), for navigation. */
export interface ButtonAsLinkProps extends ButtonOwnProps, Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'type'> {
  /** Where the link goes. With target="_blank", rel defaults to "noopener noreferrer". */
  href: string;
  /** A link has no disabled state in HTML: a disabled link Button renders without href, with aria-disabled, and can't be focused or followed. */
  disabled?: boolean;
}

export type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps;

const VARIANTS: readonly ButtonVariant[] = ["primary", "secondary", "outline", "ghost", "link"];
const OWN = { variant: 1, size: 1, destructive: 1, className: 1, children: 1, leftIcon: 1, rightIcon: 1, icon: 1, loading: 1, loadingText: 1 } as const;

/** The button's class names, for styling any other element as a button. iconPosition adds the optical padding for one icon beside a label. */
export function buttonClass(opts?: { variant?: ButtonVariant; destructive?: boolean; size?: ButtonSize; iconOnly?: boolean; iconPosition?: 'left' | 'right'; className?: string }): string {
  opts = opts || {};
  const v = oneOf(VARIANTS, opts.variant, "primary");
  const s = oneOf(SIZES, opts.size, "md");
  const iconOnly = !!opts.iconOnly, pos = opts.iconPosition;
  return cn("dk-btn", "dk-btn--" + v, opts.destructive && "dk-btn--destructive", "dk-btn--size-" + s, iconOnly && "dk-btn--icon-only", !iconOnly && (pos === "left" || pos === "right") && "dk-btn--icon-" + pos, opts.className);
}

function slot(source: IconSource, side: string): React.ReactNode {
  const node = asIcon(source);
  return node == null || node === false ? null : <span className={"dk-btn__icon dk-btn__icon--" + side} aria-hidden key={side}>{node}</span>;
}

/* Button: a <button> for actions; with href, a link (<a>, or the configured link component) for navigation. */
/** Button without the overloads, for components built on it (IconButton, Fab) that pass either shape through. */
export const ButtonBase = React.forwardRef<HTMLElement, ButtonProps>(function Button(props, ref) {
  // Both shapes (button and link) are HTML attributes; which ones apply depends on href below.
  const rest: React.AllHTMLAttributes<HTMLElement> & DataAttributes = omit(props as ButtonOwnProps & React.AllHTMLAttributes<HTMLElement>, OWN);
  const isLink = rest.href != null;
  const iconOnly = props.icon != null;
  const pos = props.leftIcon != null && props.rightIcon == null ? "left" : props.rightIcon != null && props.leftIcon == null ? "right" : undefined;
  const variant = oneOf(VARIANTS, props.variant, "primary");
  const size = oneOf(SIZES, props.size, "md");
  let classes = buttonClass({ variant: variant, size: size, destructive: props.destructive, iconOnly: iconOnly, iconPosition: pos, className: props.className });
  if (iconOnly && !rest["aria-label"] && !rest["aria-labelledby"] && !rest.title) {
    warnOnce("icon-label", "Button: an icon-only button needs an aria-label.");
  }
  const loading = !!props.loading;
  const disabled = !!rest.disabled;
  const loadingText = props.loadingText == null ? "Loading" : props.loadingText;
  React.useEffect(function () { ensureAnnouncer(); }, []);   // no cleanup: the region is shared
  const wasLoading = React.useRef(false);
  React.useEffect(function () {
    if (loading && !wasLoading.current && loadingText) announce(loadingText);
    wasLoading.current = loading;
  }, [loading]);

  // Loading: the spinner sits in the center over the hidden content (label and icons), so the width stays the same.
  const spin = <Loader className="dk-btn__spinner" label="" delay={0} />;   // decorative: the button announces loadingText itself
  let content: React.ReactNode[] = iconOnly ? [slot(props.icon, "only")] : [
    slot(props.leftIcon, "left"),
    props.children == null || (props.children as unknown) === false ? null : <span className="dk-btn__label" key="label">{props.children}</span>,
    slot(props.rightIcon, "right")
  ];
  if (loading) content = content.concat([<span className="dk-btn__loader" aria-hidden key="loader">{spin}</span>]);
  if (variant !== "link") content = [<span className="dk-btn__ripples" aria-hidden key="ripples" />, ...content];

  // Micro-interactions: ripple on press, Enter shows the press like Space (your handlers run first)
  rest.onPointerDown = chain(rest.onPointerDown, ripple);
  rest.onKeyDown = chain(rest.onKeyDown, pressKey);
  rest.onKeyUp = both(rest.onKeyUp, releaseKey);
  rest.onBlur = both(rest.onBlur, releaseKey);

  // Hooks for tests, analytics and styling
  rest["data-component"] = "button";
  rest["data-variant"] = variant;
  rest["data-size"] = size;
  if (props.destructive) rest["data-destructive"] = "";
  if (iconOnly) rest["data-icon-only"] = "";
  if (disabled) rest["data-disabled"] = "";
  if (loading) {
    classes = cn(classes, "dk-btn--loading", "dk-btn--loading-cover");
    rest["aria-busy"] = true;
    rest["aria-disabled"] = true;   // stays focusable (focus isn't lost mid-request), but announced as unavailable
    rest["data-loading"] = "";
    rest.onClick = block;           // clicks, Space, Enter and Enter-key form submission do nothing
  }

  if (isLink) {
    // A link opening a new tab can't reach back into this page (rel="noopener"); pass rel to choose otherwise.
    if (rest.target === "_blank" && rest.rel == null) rest.rel = "noopener noreferrer";
    if (disabled) {
      // Links have no disabled state: drop href so it's no longer a link, can't be focused or followed,
      // and isn't listed among the page's links; role="link" + aria-disabled keep what it is.
      delete rest.href; delete rest.disabled;
      rest.role = "link";
      rest["aria-disabled"] = true;
      rest.onClick = block;          // and its handler doesn't run (screen readers and scripts can still click it)
    }
    delete rest.type;
    return React.createElement(disabled ? "a" : config.link, Object.assign({}, rest, { ref: ref, className: classes }), ...content);
  }
  if (rest.type === undefined) rest.type = "button";   // never submits a form by accident; pass type="submit" to submit
  return React.createElement("button", Object.assign({}, rest, { ref: ref, className: classes }), ...content);
});
ButtonBase.displayName = "Button";

/** A <button> for actions; pass href for navigation and it renders a link. Built-in micro-interactions: press, ripple and a loading cross-fade, plus an opt-in right-icon nudge (--button-icon-nudge); off under reduced motion. Colors, spacing, sizes, borders and motion can be overridden with the --button-* component tokens (button.tokens.json) on the page, a container or one button. */
export const Button = ButtonBase as unknown as {
  (props: ButtonAsButtonProps & React.RefAttributes<HTMLButtonElement>): React.ReactElement | null;
  (props: ButtonAsLinkProps & React.RefAttributes<HTMLAnchorElement>): React.ReactElement | null;
  displayName?: string;
};
