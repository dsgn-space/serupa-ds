'use client';
import * as React from 'react';
import { Breadcrumb, BreadcrumbItem } from '../../components/Breadcrumb/Breadcrumb';
import { Heading } from '../../components/Heading/Heading';
import { Button } from '../../components/Button/Button';
import { Menu, MenuItem } from '../../components/Menu/Menu';
import { Link } from '../../components/Link/Link';

/* Page header (BL1): the top of a page inside an app, built from the components only, for an app to copy.
   What it carries (WCAG 2.2):
   - 2.4.8 and 2.4.4: a Breadcrumb says where the page sits; its last item is the page itself (aria-current="page").
   - 1.3.1 and 2.4.6: the title is the page's one h1; the description is plain text under it, not a heading.
   - 2.4.3: actions come after the title in the reading and Tab order, the primary one first.
   - 1.4.10 reflow: on a phone the secondary actions move into a "More actions" Menu, so nothing is cut off or
     scrolls sideways at 320px; the primary action stays a button you can see.
   - 2.4.1 and 4.1.2: the section links are a nav landmark with its own name, and the current one says so
     (aria-current="page"), not by color alone: it's also bold and underlined. */

export interface PageHeaderAction {
  /** What the button says. */
  label: string;
  /** What it does. */
  onSelect?: () => void;
  /** Or where it goes. */
  href?: string;
}
export interface PageHeaderSection {
  label: string;
  href: string;
  /** The section this page is. */
  current?: boolean;
}
export interface PageHeaderProps {
  /** The way here, from the top: each with an href, except the page itself last. */
  breadcrumb?: { label: string; href?: string }[];
  /** The page's name: its h1. */
  title: string;
  /** A sentence on what the page is for. */
  description?: React.ReactNode;
  /** The one main action, always shown. */
  primary?: PageHeaderAction;
  /** Other actions: buttons beside the primary one, or a "More actions" menu on a phone. */
  secondary?: PageHeaderAction[];
  /** Links to the page's sections (Overview, Activity, Settings), as a named nav under the title. */
  sections?: PageHeaderSection[];
  /** The sections nav's name, for a screen reader's landmark list. Default: "Sections". */
  sectionsLabel?: string;
  /** The phone menu's name, in the page's language. Default: "More actions". */
  moreLabel?: string | undefined;
}

const button = (a: PageHeaderAction, variant: 'primary' | 'secondary') =>
  a.href ? <Button key={a.label} href={a.href} variant={variant}>{a.label}</Button> : <Button key={a.label} variant={variant} onClick={a.onSelect}>{a.label}</Button>;

/** The top of a page: where it is, what it's called, what it's for, and what you can do there. */
export function PageHeader({ breadcrumb, title, description, primary, secondary = [], sections, sectionsLabel = 'Sections', moreLabel = 'More actions' }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-border pb-4">
      {breadcrumb?.length ? (
        <Breadcrumb>
          {/* eslint-disable-next-line jsx-a11y-x/anchor-is-valid -- the last crumb is the current page: BreadcrumbItem renders it as text, not a link */}
          {breadcrumb.map((b, i) => <BreadcrumbItem key={b.label} href={i < breadcrumb.length - 1 ? b.href : undefined}>{b.label}</BreadcrumbItem>)}
        </Breadcrumb>
      ) : null}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <Heading level={1}>{title}</Heading>
          {description != null ? <p className="m-0 max-w-prose text-text-muted">{description}</p> : null}
        </div>
        {primary || secondary.length ? (
          <div className="flex flex-wrap items-center gap-2">
            {primary ? button(primary, 'primary') : null}
            {secondary.length ? (
              <>
                <div className="hidden flex-wrap gap-2 sm:flex">{secondary.map((a) => button(a, 'secondary'))}</div>
                <div className="sm:hidden">
                  <Menu placement="bottom-end" trigger={<Button variant="secondary" icon="more_horiz" aria-label={moreLabel} />}>
                    {secondary.map((a) => <MenuItem key={a.label} href={a.href} onSelect={a.onSelect}>{a.label}</MenuItem>)}
                  </Menu>
                </div>
              </>
            ) : null}
          </div>
        ) : null}
      </div>
      {sections?.length ? (
        <nav aria-label={sectionsLabel}>
          <ul className="m-0 flex list-none flex-wrap gap-x-6 gap-y-2 p-0">
            {sections.map((s) => (
              <li key={s.href}>
                <Link href={s.href} aria-current={s.current ? 'page' : undefined} className={s.current ? 'font-semibold' : 'no-underline'}>{s.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </div>
  );
}
