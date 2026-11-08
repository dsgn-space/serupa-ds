'use client';
import * as React from 'react';
import { cn } from '../../internal/cn';
import { component } from '../../internal/component';

/** How a term sits beside its details. */
export type DescriptionListLayout = 'stacked' | 'inline' | 'split';

export interface DescriptionListProps extends React.HTMLAttributes<HTMLDListElement> {
  /** `inline` (default): the term in a column beside its details, stacked when the list is narrower than 480px.
   *  `stacked`: the term above its details. `split`: the term at the start and the details at the end of one row,
   *  wrapping under it when both don't fit (totals, settings, shortcuts). */
  layout?: DescriptionListLayout;
  /** A hairline between items. */
  dividers?: boolean;
  /** DescriptionItem children. */
  children?: React.ReactNode;
}

/** A list of terms and their details: a record's fields, an order's totals, a set of shortcuts. A `<dl>` whose items
 *  are DescriptionItem.
 *  @beta New: its API may still change in a minor release. Take this tag off once it has shipped with its bug bash done (CONTRIBUTING.md). */
export const DescriptionList = /* @__PURE__ */ component<HTMLDListElement, DescriptionListProps>('DescriptionList', function DescriptionList(props, ref) {
  const { className, layout = 'inline', dividers, ...rest } = props;
  return (
    <dl {...rest} ref={ref} data-component="description-list"
      className={cn('dk-description-list', `dk-description-list--${layout}`, dividers && 'dk-description-list--dividers', className)} />
  );
});

export interface DescriptionItemProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** The term: what the details describe ("Owner", "Subtotal"). */
  term: React.ReactNode;
  /** The details. Several values can go in one item; long ones wrap anywhere rather than widen the list. */
  children?: React.ReactNode;
  /** A stronger row, such as an order's total. */
  emphasis?: boolean;
}

/** One term and its details in a DescriptionList: a `<div>` holding a `<dt>` and a `<dd>`. */
export const DescriptionItem = /* @__PURE__ */ component<HTMLDivElement, DescriptionItemProps>('DescriptionItem', function DescriptionItem(props, ref) {
  const { className, term, children, emphasis, ...rest } = props;
  return (
    <div {...rest} ref={ref} className={cn('dk-description-list__item', emphasis && 'dk-description-list__item--emphasis', className)}>
      <dt className="dk-description-list__term">{term}</dt>
      <dd className="dk-description-list__details">{children}</dd>
    </div>
  );
});
