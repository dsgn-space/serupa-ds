import type * as React from 'react';
import { addDays, startOfWeek } from './dates';
import { isRtl } from './position';

/** What a key asks of a grid of cells (the days of a month, or months, quarters or years). Left and Right are read
    for the writing direction, so in right to left ArrowLeft is "next". */
export type GridKey = 'previous' | 'next' | 'up' | 'down' | 'rowStart' | 'rowEnd' | 'pageUp' | 'pageDown' | 'pick';

/** The grid key a keydown is, or undefined for a key the grid leaves alone. The caller checks Alt, Ctrl, ⌘ and IME
    composition first, since what each grid does with them differs. */
export const gridKey = (e: React.KeyboardEvent<Element>): GridKey | undefined => {
  switch (e.key) {
    case 'ArrowLeft': return isRtl(e.currentTarget) ? 'next' : 'previous';
    case 'ArrowRight': return isRtl(e.currentTarget) ? 'previous' : 'next';
    case 'ArrowUp': return 'up';
    case 'ArrowDown': return 'down';
    case 'Home': return 'rowStart';
    case 'End': return 'rowEnd';
    case 'PageUp': return 'pageUp';
    case 'PageDown': return 'pageDown';
    case 'Enter': case ' ': return 'pick';
    default: return undefined;
  }
};

/** The cell a key moves focus to on a page of numbered cells, `cols` to a row and `count` to a page from `page`:
    the months of a year, its quarters, or twelve years. A page key goes a whole page. */
export const periodCell = (k: Exclude<GridKey, 'pick'>, focus: number, page: number, cols: number, count: number): number => {
  const rowStart = focus - ((focus - page) % cols);
  switch (k) {
    case 'previous': return focus - 1;
    case 'next': return focus + 1;
    case 'up': return focus - cols;
    case 'down': return focus + cols;
    case 'rowStart': return rowStart;
    case 'rowEnd': return Math.min(rowStart + cols - 1, page + count - 1);
    case 'pageUp': return focus - count;
    case 'pageDown': return focus + count;
  }
};

/** The day a key moves focus to in a month drawn a week to a row, starting on `weekStartsOn`. Null for a page key,
    since each calendar has its own page: a month, a year with Shift, or a week. */
export const dayCell = (k: Exclude<GridKey, 'pick'>, focus: Date, weekStartsOn: number): Date | null => {
  switch (k) {
    case 'previous': return addDays(focus, -1);
    case 'next': return addDays(focus, 1);
    case 'up': return addDays(focus, -7);
    case 'down': return addDays(focus, 7);
    case 'rowStart': return startOfWeek(focus, weekStartsOn);
    case 'rowEnd': return addDays(startOfWeek(focus, weekStartsOn), 6);
    default: return null;
  }
};
