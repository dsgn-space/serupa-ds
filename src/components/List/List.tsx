'use client';
import * as React from 'react';
import { cn, oneOf, omit } from '../../internal/cn';
import { config } from '../../internal/config';
import type { IconSource } from '../Icon/Icon';
import { asIcon } from '../Icon/asIcon';
import { component } from '../../internal/component';
import { Loader } from '../Loader/Loader';

export interface ListProps extends React.HTMLAttributes<HTMLUListElement> {
  /** ListItems. */
  children?: React.ReactNode | undefined;
  /** 'plain' (default) or 'card': inside a bordered, rounded frame. */
  variant?: 'plain' | 'card' | undefined;
  /** Lines between items. Default: true. */
  divided?: boolean | undefined;
  /** 'ul' (default) or 'ol' when the order matters. */
  as?: 'ul' | 'ol' | undefined;
  /** Its rows are loading (or reloading): sets aria-busy on the list. Pair it with ListLoadingItems. Default: false. */
  busy?: boolean | undefined;
}

export interface ListItemProps extends Omit<React.LiHTMLAttributes<HTMLLIElement>, 'title' | 'onClick'> {
  /** The item's main line. */
  title: React.ReactNode;
  /** A second, muted line. */
  description?: React.ReactNode | undefined;
  /** Before the text: an Avatar, an icon name or an image. */
  leading?: IconSource | undefined;
  /** After the text: meta (a date, a Badge) or actions (an IconButton, a Menu). Stays outside the link or button. */
  trailing?: React.ReactNode | undefined;
  /** Makes the item's main area a link. */
  href?: string | undefined;
  /** Makes the item's main area a button (when there's no href). */
  onClick?: ((event: React.MouseEvent<HTMLElement>) => void) | undefined;
  /** What renders the link: your router's link component. Default: the link set with configure({ link }), else 'a'. Its props go in linkProps. */
  as?: React.ElementType | undefined;
  /** Extra props for the link or button (to for a router link, target, aria-*). */
  linkProps?: Record<string, unknown> | undefined;
  /** Shaded with a primary bar at its start, and aria-current="true" (or aria-pressed for a button). For the current page in a nav list, also pass linkProps={{ "aria-current": "page" }}, which wins. Default: false. */
  selected?: boolean | undefined;
  /** Dims a link or button item and stops it. Default: false. */
  disabled?: boolean | undefined;
}

/* List: rows of related things (people, files, settings), each a title with an optional description, leading
   avatar or icon and trailing meta or actions. A row can be a link or a button; trailing actions stay outside
   it so controls are never nested. className and every other prop go to the <ul>. */
/** Rows of related things: title, description, leading avatar or icon, trailing meta or actions; rows can be links. */
export const List = /* @__PURE__ */ component<HTMLUListElement, ListProps>('List', function List(props, ref) {
  const rest = omit(props, { variant: 1, divided: 1, as: 1, busy: 1, className: 1 });
  const variant = oneOf(['plain', 'card'] as const, props.variant, 'plain');
  // role="list": Safari drops list semantics from a <ul>/<ol> styled list-style: none, so VoiceOver stops saying "list, 6 items" (FU1).
  return React.createElement(oneOf(['ul', 'ol'] as const, props.as, 'ul'), Object.assign(rest, {
    ref: ref, 'data-component': 'list', role: rest.role ?? 'list', 'aria-busy': rest['aria-busy'] ?? (props.busy || undefined),
    className: cn('dk-list', variant === 'card' && 'dk-list--card', props.divided !== false && 'dk-list--divided', props.className),
  }));
});

/** One row in a List. */
export const ListItem = /* @__PURE__ */ component<HTMLLIElement, ListItemProps>('ListItem', function ListItem(props, ref) {
  const rest = omit(props, { title: 1, description: 1, leading: 1, trailing: 1, href: 1, onClick: 1, as: 1, linkProps: 1, selected: 1, disabled: 1, className: 1 });
  const lead = asIcon(props.leading as React.ReactNode);
  const body = <>
    {lead != null && lead !== false ? <span className={cn('dk-list__leading', typeof props.leading === 'string' && 'dk-list__leading--icon')}>{lead}</span> : null}
    <span className="dk-list__text">
      <span className="dk-list__title">{props.title}</span>
      {props.description != null ? <span className="dk-list__description">{props.description}</span> : null}
    </span>
  </>;
  const lp = Object.assign({}, props.linkProps);
  let main: React.ReactNode;
  if (props.href != null || props.as) {
    const attrs: Record<string, unknown> = Object.assign(lp, { className: cn('dk-list__main', lp.className), 'aria-current': lp['aria-current'] !== undefined ? lp['aria-current'] : props.selected ? 'true' : undefined });
    // Disabled, it's a plain <a> without an address: a router link would still draw its href from to (or a similar
    // prop), which a middle or Ctrl click opens. Only the names, data and look of linkProps stay (L8E67).
    const keep = (k: string) => /^(aria-|data-)/.test(k) || k === 'id' || k === 'title' || k === 'style' || k === 'className' || k === 'lang' || k === 'dir';
    if (props.disabled) {
      for (const k of Object.keys(attrs)) if (!keep(k)) delete attrs[k];
      Object.assign(attrs, { 'aria-disabled': true, tabIndex: -1, onClick: (e: React.MouseEvent) => e.preventDefault() });
    }
    else { attrs.href = props.href; if (props.onClick) attrs.onClick = props.onClick; }
    main = React.createElement(props.disabled ? 'a' : props.as || config.link, attrs, body);
  } else if (props.onClick) {
    main = <button type="button" {...lp} className={cn('dk-list__main', lp.className)} onClick={props.onClick} disabled={props.disabled} aria-pressed={props.selected === undefined ? undefined : !!props.selected}>{body}</button>;
  } else {
    main = <div className="dk-list__main dk-list__main--static">{body}</div>;
  }
  const interactive = props.href != null || !!props.as || !!props.onClick;
  return (
    <li {...rest} ref={ref} className={cn('dk-list__item', interactive && 'dk-list__item--interactive', props.selected && 'dk-list__item--selected', props.disabled && 'dk-list__item--disabled', props.className)}>
      {main}
      {props.trailing != null ? <span className="dk-list__trailing">{props.trailing}</span> : null}
    </li>
  );
});

export interface ListLoadingItemsProps {
  /** How many placeholder rows: about as many as will load, up to a screenful. Default: 3. */
  rows?: number | undefined;
  /** The rows will have a description: each placeholder gets a second, shorter line. Default: false. */
  description?: boolean | undefined;
  /** What the rows will start with: an icon (20px), or an Avatar of that size ('md' is 40px). Default: nothing. */
  leading?: 'icon' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | undefined;
  /** Said once as the rows appear ("Loading people"), after the loader's delay. Default: "Loading" (labels.loading). */
  label?: string | undefined;
}

const LEADS = ['icon', 'xs', 'sm', 'md', 'lg', 'xl'] as const;

/* ListLoadingItems: placeholder rows inside a List, built from the rows' own parts (padding, gap, text lines, a
   circle the size of the leading icon or Avatar), so each is as tall as the row that replaces it and nothing moves.
   Only the first placeholder has a name, so a screen reader hears "Loading" once. */
/** Placeholder rows (skeletons) the height of real ListItems, while a List's rows load. Put it inside the List and set its busy. */
export function ListLoadingItems(props: ListLoadingItemsProps): React.ReactElement {
  const rows = Math.min(50, Math.max(1, Math.floor(Number(props.rows)) || 3));
  const lead = props.leading == null ? null : oneOf(LEADS, props.leading, 'md');
  const out: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) out.push(
    <li key={r} className="dk-list__item dk-list__loading">
      <div className="dk-list__main dk-list__main--static">
        {lead ? <span className={'dk-list__leading dk-list__leading--' + lead}><Loader variant="skeleton" shape="circle" label="" /></span> : null}
        <span className="dk-list__text"><Loader variant="skeleton" lines={props.description ? 2 : 1} label={r === 0 ? props.label : ''} /></span>
      </div>
    </li>,
  );
  return <>{out}</>;
}
