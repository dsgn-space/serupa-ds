import * as React from 'react';
import { cn, omit } from '../../internal/cn';
import { named } from '../../internal/component';
import { warnOnce } from '../../internal/warn';

export interface DividerProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  /** 'horizontal' (default) or 'vertical' (between items in a row: it takes the row's height). */
  orientation?: 'horizontal' | 'vertical' | undefined;
  /** Text in the middle of a horizontal line, such as "or". */
  label?: React.ReactNode | undefined;
  /** Leaves it out of the accessibility tree, when it's only decoration. Default: false. */
  decorative?: boolean | undefined;
  /** Over a photo or a colored panel: 'dark' draws the line and label in white for dark media, 'light' in black for
      light media, the same in every theme. */
  surface?: 'dark' | 'light' | undefined;
  /** @deprecated Use surface, the same values; removed in 18.0.0. Read when surface isn't given. */
  onMedia?: 'dark' | 'light' | undefined;
}

function DividerRender({ ref, ...props }: DividerProps & React.RefAttributes<HTMLElement>) {
  const rest = omit(props, { orientation: 1, label: 1, decorative: 1, surface: 1, onMedia: 1, className: 1 });
  const vertical = props.orientation === 'vertical';
  if (process.env.NODE_ENV !== 'production' && props.onMedia !== undefined) warnOnce('deprecated-prop', 'Divider: `onMedia` is deprecated and removed in 18.0.0. Use `surface`, the same values: a prop named on… reads as an event handler.', 'deprecated-prop:Divider:onMedia');
  const surface = props.surface ?? props.onMedia;
  const label = props.label != null && props.label !== false && props.label !== '' && !vertical ? props.label : null;
  const cls = cn('srp-divider', vertical && 'srp-divider--vertical', label != null && 'srp-divider--label', (surface === 'dark' || surface === 'light') && 'srp-divider--on-' + surface, props.className);
  const a11y: React.AriaAttributes & { role?: React.AriaRole; 'aria-label'?: string } = props.decorative ? { role: 'none', 'aria-hidden': true } : { role: 'separator', 'aria-orientation': vertical ? 'vertical' : undefined };
  // A separator's children are presentational, so screen readers skip a label inside one. A text label names the
  // separator instead; any other label stays plain text between two lines that are only drawn.
  if (label != null && !props.decorative) {
    if (typeof label === 'string' || typeof label === 'number') { if (rest['aria-label'] == null) a11y['aria-label'] = String(label); }
    else { delete a11y.role; }
  }
  if (label == null && !vertical) return <hr {...rest} {...a11y} ref={ref as React.Ref<HTMLHRElement>} className={cls} data-component="divider" role={props.decorative ? 'none' : undefined} />;
  return <div {...rest} {...a11y} ref={ref as React.Ref<HTMLDivElement>} className={cls} data-component="divider">{label != null ? <span className="srp-divider__label">{label}</span> : null}</div>;
}

/* Divider: a 1px line between content, horizontal (an <hr>) or vertical, with an optional label in the middle.
   It's a separator for screen readers unless decorative. className and every other prop go to the element. */
/** A line between content, horizontal or vertical, with an optional label such as "or". */
export const Divider = /* @__PURE__ */ named('Divider', DividerRender);
