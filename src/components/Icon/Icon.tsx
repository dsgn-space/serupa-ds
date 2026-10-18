import * as React from "react";
import { cn, omit } from "../../internal/cn";
import { warnOnce } from "../../internal/warn";
import { ICONS, hasIcon, getIcon, isIconData, type CustomIconName } from "../../icons";
import type { CommonIconName } from "../../material/common";
import type { IconData } from "../../material/types";

/** A custom icon's name, one of the everyday Material Symbols, or any name you registered with registerIcons. */
export type IconName = CustomIconName | CommonIconName | (string & {});

/** What icon props (Button's leftIcon, IconButton's icon…) take: an icon name, an icon from serupa-ds/icons
 * (`leftIcon={Add}`), or any element. */
export type IconSource = IconName | IconData | React.ReactNode;

export interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** A custom icon's name, or a Material Symbols name that works by name: the everyday set (Foundations/Icons) or
   * one you registered with registerIcons. A custom icon with the same name wins. Give `name` or `icon`. */
  name?: IconName;
  /** A Material Symbols icon imported from serupa-ds/icons: `icon={ArrowForward}`. Give `name` or `icon`. */
  icon?: IconData;
  /** Size in px (number) or any CSS length. Default: 24px, or the button's icon size inside a Button. */
  size?: number | string;
}

/* Icon: an inline SVG in a 1em box, drawn in the text color. Material Symbols Rounded, filled (src/material), or
   one of your custom icons (tools/icons/build.py). */
/** An icon: Material Symbols Rounded (filled) or one of your custom SVG icons. Sized by font-size, drawn in the text color. Decorative by default (aria-hidden); pass aria-label to make it meaningful. */
export const Icon = React.forwardRef<HTMLSpanElement, IconProps>(function Icon(props, ref) {
  const rest = omit(props, { name: 1, icon: 1, size: 1, className: 1, style: 1 } as const);
  const labelled = rest["aria-label"] || rest["aria-labelledby"];
  if (!labelled) rest["aria-hidden"] = true; else rest.role = "img";
  const style: React.CSSProperties = Object.assign({}, props.style);
  if (props.size != null) style.fontSize = typeof props.size === "number" ? props.size + "px" : props.size;
  const name = props.icon ? props.icon.name : props.name;
  if (name != null) rest["data-icon"] = name;
  if (!props.icon && hasIcon(props.name)) {
    return (
      <span {...rest} ref={ref} className={cn("dk-icon dk-icon--custom", props.className)} style={style}>
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden focusable="false" dangerouslySetInnerHTML={{ __html: ICONS[props.name] }} />
      </span>
    );
  }
  const data = props.icon || (props.name != null ? getIcon(props.name) : undefined);
  if (!data) warnOnce("icon:" + name, `Icon: "${name}" isn't an everyday icon or a registered one. Import it from serupa-ds/icons (icon={…}) or call registerIcons() once.`);
  return (
    <span {...rest} ref={ref} className={cn("dk-icon", props.className)} style={style}>
      {data && <svg viewBox="0 -960 960 960" fill="currentColor" aria-hidden focusable="false"><path d={data.d} /></svg>}
    </span>
  );
});
Icon.displayName = "Icon";

/** An icon name or an icon from serupa-ds/icons becomes an <Icon>; elements pass through. */
export function asIcon(node: React.ReactNode | IconData): React.ReactNode {
  if (typeof node === "string") return <Icon name={node} />;
  if (isIconData(node)) return <Icon icon={node} />;
  return node as React.ReactNode;
}
