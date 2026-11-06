"use client";
import * as React from 'react';
import { Button } from '../../components/Button/Button';
import { Field } from '../../components/Field/Field';
import { SearchInput } from '../../components/SearchInput/SearchInput';
import { Select, type SelectOption } from '../../components/Select/Select';
import { TableActionBar } from '../../components/Table/Table';

/* Table toolbar (BL3): search, filters, a results count and bulk actions above a table, built from the components only,
   for an app to copy. What it carries (WCAG 2.2):
   - 1.3.1 / 2.4.6: the search and filters sit in a search landmark with its own name, and each control has a visible label.
   - 4.1.3 status messages: the results count is a status region, so "8 of 24 projects" is read out when it changes,
     without moving focus.
   - 2.4.3 focus order / 2.4.11: "Clear filters" disappears once pressed, so focus goes to the search field rather than
     being lost on the page.
   - Bulk actions use TableActionBar ("3 selected", the actions, Clear selection), which says the count and moves focus
     to the table's "Select all" when the selection is cleared. It has to come just before the table, so the table is
     this block's child.
   - 1.4.10 reflow: the controls stack on a phone; the table scrolls in its own frame. */

export interface TableFilter {
  /** The filter's visible label: "Status". */
  label: string;
  /** The picked value. '' means no filter: the first option. */
  value: string;
  /** The choices. Start with { value: '', label: 'All' }, the one that means no filter. */
  options: SelectOption[];
  onChange: (value: string) => void;
}

export interface TableToolbarProps {
  /** What the table lists: "projects". Names the search landmark ("Search and filter projects"). */
  noun: string;
  /** The search text. */
  query: string;
  onQueryChange: (query: string) => void;
  /** The filters beside the search field. */
  filters?: TableFilter[] | undefined;
  /** The results count, formatted and in words: "8 of 24 projects". Read out when it changes. */
  results: string;
  /** Called by "Clear filters": empty the search and set every filter back to ''. It's shown while any is set. */
  onClearFilters: () => void;
  /** How many rows are selected. The bulk actions show while it's more than 0. Default: 0. */
  selectedCount?: number | undefined;
  /** Clears the selection. */
  onClearSelection?: (() => void) | undefined;
  /** The actions for the selected rows: small Buttons such as Export or Archive. */
  bulkActions?: React.ReactNode;
  /** Its words, in the page's language. Each one left out stays English. */
  labels?: Partial<TableToolbarLabels> | undefined;
  /** The table. */
  children: React.ReactNode;
}

/** The words TableToolbar says. Pass your own for a page in another language. */
export interface TableToolbarLabels {
  /** The search landmark's name, from noun: "Search and filter projects". */
  landmark: (noun: string) => string;
  /** The search field's visible label: "Search". */
  search: string;
  /** The button that empties the search and filters: "Clear filters". */
  clearFilters: string;
}
const EN: TableToolbarLabels = {
  landmark: (noun) => `Search and filter ${noun}`,
  search: 'Search',
  clearFilters: 'Clear filters',
};

export function TableToolbar({ noun, query, onQueryChange, filters = [], results, onClearFilters, selectedCount = 0, onClearSelection, bulkActions, labels, children }: TableToolbarProps) {
  const w = { ...EN, ...labels };
  const search = React.useRef<HTMLInputElement | null>(null);
  const filtered = query !== '' || filters.some((f) => f.value !== '');
  const clear = () => {
    onClearFilters();
    search.current?.focus();   // the button goes away, so focus would be lost with it
  };
  return (
    <div className="flex flex-col gap-3">
      <form role="search" aria-label={w.landmark(noun)} onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <Field label={w.search} className="sm:flex-1">
          <SearchInput ref={search} value={query} onChange={(e) => onQueryChange(e.target.value)} />
        </Field>
        {filters.map((f) => (
          <Field key={f.label} label={f.label}>
            <Select value={f.value} options={f.options} onChange={(e) => f.onChange(e.target.value)} />
          </Field>
        ))}
        {filtered ? <Button type="button" variant="ghost" onClick={clear}>{w.clearFilters}</Button> : null}
      </form>
      <p role="status" className="m-0 text-sm text-text-muted">{results}</p>
      <TableActionBar count={selectedCount} onClear={onClearSelection}>{bulkActions}</TableActionBar>
      {children}
    </div>
  );
}
