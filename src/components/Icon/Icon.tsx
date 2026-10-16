import * as React from "react";
import { cn } from "../../internal/cn";
import { ICONS, hasIcon, type CustomIconName } from "../../icons";

/** A custom icon's name, or any Material Symbols name ('add', 'arrow_forward'…). Custom names autocomplete. */
export type IconName = CustomIconName | (string & {});

export interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** One of your custom icons (Diki.customIcons), or a Material Symbols name such as 'add', 'delete', 'arrow_forward' (Rounded style, filled). A custom icon with the same name wins. */
  name: IconName;
  /** Size in px (number) or any CSS length. Default: 24px, or the button's icon size inside a Button. */
  size?: number | string;
}

/* Icon: one of your custom icons when the name is one, otherwise Material Symbols Rounded, filled
   (font in fonts/). Both are sized by font-size and drawn in the text color. */
/** An icon: one of your custom SVG icons, or Material Symbols Rounded (filled). Sized by font-size, drawn in the text color. Decorative by default (aria-hidden); pass aria-label to make it meaningful. */
export const Icon = React.forwardRef<HTMLSpanElement, IconProps>(function Icon(props, ref) {
  const rest: Record<string, any> = {};
  for (const k in props) if (k !== "name" && k !== "size" && k !== "className" && k !== "style") rest[k] = (props as any)[k];
  const labelled = rest["aria-label"] || rest["aria-labelledby"];
  if (!labelled) rest["aria-hidden"] = true; else rest.role = "img";
  const style: React.CSSProperties = Object.assign({}, props.style);
  if (props.size != null) style.fontSize = typeof props.size === "number" ? props.size + "px" : props.size;
  if (hasIcon(props.name)) {
    rest["data-icon"] = props.name;
    return (
      <span {...rest} ref={ref} className={cn("dk-icon dk-icon--custom", props.className)} style={style}>
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden focusable="false" dangerouslySetInnerHTML={{ __html: ICONS[props.name] }} />
      </span>
    );
  }
  return <span {...rest} ref={ref} className={cn("dk-icon", props.className)} style={style} translate="no">{props.name}</span>;
});
Icon.displayName = "Icon";

/** An icon name becomes an <Icon>; elements pass through. */
export function asIcon(node: React.ReactNode): React.ReactNode {
  return typeof node === "string" ? <Icon name={node} /> : node;
}
