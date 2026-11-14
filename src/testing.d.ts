/** Serupa's themes, in the order the docs show them: a light and a dark one for each brand color. */
export type SerupaTheme = 'blue-light' | 'blue-dark' | 'red-light' | 'red-dark' | 'orange-light' | 'orange-dark' | 'amber-light' | 'amber-dark' | 'yellow-light' | 'yellow-dark' | 'lime-light' | 'lime-dark' | 'green-light' | 'green-dark' | 'emerald-light' | 'emerald-dark' | 'teal-light' | 'teal-dark' | 'cyan-light' | 'cyan-dark' | 'sky-light' | 'sky-dark' | 'indigo-light' | 'indigo-dark' | 'violet-light' | 'violet-dark' | 'purple-light' | 'purple-dark' | 'fuchsia-light' | 'fuchsia-dark' | 'pink-light' | 'pink-dark' | 'rose-light' | 'rose-dark';
export declare const THEMES: readonly SerupaTheme[];

/** What forEachTheme needs from a page: Playwright's Page fits, and so does anything with the same evaluate(). */
export interface ThemedPage {
  evaluate<R, A>(fn: (arg: A) => R | Promise<R>, arg: A): Promise<R>;
  /** Used when it's there, so prefers-color-scheme matches each theme. */
  emulateMedia?(options: { colorScheme: 'light' | 'dark' | null }): Promise<void>;
}

export interface ForEachThemeOptions {
  /** Only these themes, in this order. Default: every theme; name the ones your app uses. */
  themes?: readonly SerupaTheme[];
  /** Turn off transitions, animations and the text caret while it runs. Default: true. */
  still?: boolean;
}

/** Draws the page in each theme in turn (data-theme on <html>, the matching color scheme, fonts loaded, transitions
 *  off) and calls fn with the theme's name, for a screenshot. Puts the page back as it was afterwards, even when fn
 *  throws.
 *  @example await forEachTheme(page, (theme) => expect(page).toHaveScreenshot(`home-${theme}.png`)); */
export declare function forEachTheme(page: ThemedPage, fn: (theme: SerupaTheme) => unknown, options?: ForEachThemeOptions): Promise<void>;

/** What the testers act through: @testing-library/user-event's userEvent.setup(), or vitest/browser's userEvent. */
export interface TesterUser {
  click(element: Element): Promise<unknown>;
  keyboard(text: string): Promise<unknown>;
  /** Needed only to type into a combobox. */
  type?(element: Element, text: string): Promise<unknown>;
}

export interface TesterOptions {
  user: TesterUser;
  /** How long to wait for a widget to open, close or change, in ms. Default: 1000. */
  timeout?: number;
}

/** Picks an element: by its accessible name or the text of one of its parts (a string, exact, or a RegExp), by its
 *  index in the list, or the element itself. */
export type TesterMatch = string | RegExp | number | Element;

export interface ComboboxTester {
  input(): HTMLInputElement;
  isOpen(): boolean;
  listbox(): HTMLElement | null;
  /** The options now in the list (a long list draws only those near the scroll position). */
  options(): HTMLElement[];
  selected(): HTMLElement[];
  /** The option the keyboard is on (aria-activedescendant), or null. */
  active(): HTMLElement | null;
  value(): string;
  open(): Promise<void>;
  type(text: string): Promise<void>;
  /** Opens the list and chooses an option, by pointer (default) or with the arrow keys and Enter. An option the list
   *  hasn't drawn yet is found by typing its text first. */
  choose(match: TesterMatch, options?: { by?: 'pointer' | 'keyboard' }): Promise<void>;
  close(): Promise<void>;
}

export interface MenuTester {
  trigger(): HTMLElement;
  isOpen(): boolean;
  menu(): HTMLElement | null;
  /** The open menu's own items, not its submenus'. */
  items(): HTMLElement[];
  open(): Promise<void>;
  /** Opens the menu and chooses an item; for one in a submenu, the path: ['Share', 'Email']. */
  choose(path: TesterMatch | TesterMatch[]): Promise<void>;
  close(): Promise<void>;
}

export interface TabsTester {
  tablist(): HTMLElement;
  tabs(): HTMLElement[];
  selected(): HTMLElement | null;
  /** The selected tab's panel, or null. */
  panel(): HTMLElement | null;
  select(match: TesterMatch): Promise<void>;
}

export type TesterSort = 'ascending' | 'descending' | 'none';

export interface TableTester {
  table(): HTMLTableElement;
  /** The header cells of the last header row. */
  columns(): HTMLTableCellElement[];
  rows(): HTMLTableRowElement[];
  /** A row by index, or by the text of one of its cells. */
  row(match: TesterMatch): HTMLTableRowElement;
  /** A row's cell in a column (by the header's name, or index). */
  cell(row: TesterMatch, column: TesterMatch): HTMLTableCellElement | null;
  sortDirection(column: TesterMatch): TesterSort;
  /** Presses the column's sort button until it's sorted that way. Default: 'ascending'. */
  sort(column: TesterMatch, direction?: TesterSort): Promise<void>;
  /** The rows whose select checkbox is checked. */
  selectedRows(): HTMLTableRowElement[];
  /** Checks (default) or unchecks a row's select checkbox. */
  selectRow(row: TesterMatch, selected?: boolean): Promise<void>;
  /** Checks (default) or unchecks the header's select-all checkbox. */
  selectAll(selected?: boolean): Promise<void>;
}

export interface CalendarTester {
  grid(): HTMLElement | null;
  /** The days shown, as YYYY-MM-DD. */
  days(): string[];
  /** The selected days, as YYYY-MM-DD. */
  selected(): string[];
  /** Moves to the date's month from the keyboard and presses its day. */
  pick(date: Date | string): Promise<void>;
}

export interface DatePickerTester {
  input(): HTMLInputElement;
  button(): HTMLButtonElement;
  isOpen(): boolean;
  dialog(): HTMLElement | null;
  value(): string;
  open(): Promise<void>;
  /** Opens the calendar and picks the date. */
  pick(date: Date | string): Promise<void>;
  close(): Promise<void>;
}

/** Drives a Combobox (any ARIA combobox): its field, or an element holding one.
 *  @example await combobox(screen.getByRole('combobox', { name: 'Country' }), { user }).choose('Canada'); */
export declare function combobox(target: Element, options: TesterOptions): ComboboxTester;
/** Drives a Menu from the button that opens it.
 *  @example await menu(screen.getByRole('button', { name: 'More' }), { user }).choose(['Share', 'Email']); */
export declare function menu(trigger: Element, options: TesterOptions): MenuTester;
/** Drives Tabs: the tablist, or an element holding it.
 *  @example await tabs(container, { user }).select('Billing'); */
export declare function tabs(target: Element, options: TesterOptions): TabsTester;
/** Drives a Table: sort, select rows, read cells.
 *  @example await table(screen.getByRole('table'), { user }).sort('Amount', 'descending'); */
export declare function table(target: Element, options: TesterOptions): TableTester;
/** Drives a Calendar or RangeCalendar: the element holding its grid.
 *  @example await calendar(container, { user }).pick('2026-12-24'); */
export declare function calendar(target: Element, options: TesterOptions): CalendarTester;
/** Drives a DatePicker: its field, or the element holding it.
 *  @example await datePicker(screen.getByLabelText('Due date'), { user }).pick(new Date(2026, 11, 24)); */
export declare function datePicker(target: Element, options: TesterOptions): DatePickerTester;
