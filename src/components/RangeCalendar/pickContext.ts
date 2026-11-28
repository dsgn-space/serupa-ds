'use client';
import * as React from 'react';

/** What DateRangePicker asks of the RangeCalendar in its popup: the start is its value the moment it's picked (so its
 *  start field shows it), and Escape closes the popup rather than dropping the start. In a file of its own, so the
 *  picker can provide it without loading the calendar, which it loads only when the popup first opens (ADR-0027). */
export const RangePickContext = /* @__PURE__ */ React.createContext<{ onStart: (start: Date) => void } | null>(null);
