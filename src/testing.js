// @diki-stwn/serupa-ds/testing: for your app's own tests. Testers that drive Serupa's widgets as people do (further down), and
// screenshots of your pages in each of Serupa's themes: Serupa checks its components in every theme, and this lets
// your screens get the same check, with Playwright (or anything with a page.evaluate()).
//   import { test, expect } from "@playwright/test";
//   import { forEachTheme } from "@diki-stwn/serupa-ds/testing";
//   test("checkout", async ({ page }) => {
//     await page.goto("/checkout");
//     await forEachTheme(page, async (theme) => {
//       await expect(page).toHaveScreenshot(`checkout-${theme}.png`);
//     });
//   });
// For each theme it sets data-theme on <html> (which beats data-brand, data-mode and theme.js's choice), matches the
// emulated color scheme to it when the page can emulate one, turns off transitions, animations and the text caret so
// a picture doesn't catch a fade halfway, and waits for fonts and two frames. Afterwards the page is as it was.

/** Serupa's themes, a light and a dark one for each of its 17 brand colors, blue (the default) first. */
export const THEMES = Object.freeze(['blue-light', 'blue-dark', 'red-light', 'red-dark', 'orange-light', 'orange-dark', 'amber-light', 'amber-dark', 'yellow-light', 'yellow-dark', 'lime-light', 'lime-dark', 'green-light', 'green-dark', 'emerald-light', 'emerald-dark', 'teal-light', 'teal-dark', 'cyan-light', 'cyan-dark', 'sky-light', 'sky-dark', 'indigo-light', 'indigo-dark', 'violet-light', 'violet-dark', 'purple-light', 'purple-dark', 'fuchsia-light', 'fuchsia-dark', 'pink-light', 'pink-dark', 'rose-light', 'rose-dark']);

const STILL = '*,*::before,*::after{transition:none!important;animation:none!important;caret-color:transparent!important}';

/** Runs fn once per theme, with the page drawn in that theme. */
export async function forEachTheme(page, fn, options = {}) {
  const themes = options.themes || THEMES;
  const unknown = themes.filter((t) => !THEMES.includes(t));
  if (unknown.length) throw new Error(`@diki-stwn/serupa-ds/testing: no theme called ${unknown.join(', ')}. The themes are ${THEMES.join(', ')}.`);
  const still = options.still !== false;
  const emulate = typeof page.emulateMedia === 'function';
  // What to put back: the page's own data-theme (or none), and whether the style that stills it was added here.
  const before = await page.evaluate(([css, add]) => {
    const html = document.documentElement;
    let added = false;
    if (add && !document.getElementById('serupa-testing-still')) {
      const style = document.createElement('style');
      style.id = 'serupa-testing-still';
      style.textContent = css;
      document.head.appendChild(style);
      added = true;
    }
    return { theme: html.getAttribute('data-theme'), added };
  }, [STILL, still]);
  try {
    for (const theme of themes) {
      if (emulate) await page.emulateMedia({ colorScheme: theme.endsWith('-dark') ? 'dark' : 'light' });
      await page.evaluate(async (t) => {
        document.documentElement.setAttribute('data-theme', t);
        await document.fonts.ready;
        await new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(() => done())));
      }, theme);
      await fn(theme);
    }
  } finally {
    if (emulate) await page.emulateMedia({ colorScheme: null });
    await page.evaluate(({ theme, added }) => {
      const html = document.documentElement;
      if (theme === null) html.removeAttribute('data-theme'); else html.setAttribute('data-theme', theme);
      if (added) document.getElementById('serupa-testing-still')?.remove();
    }, before);
  }
}

// ---------------------------------------------------------------------------------------------------------------
// Testers: drive Serupa's complex widgets in your app's own tests the way people do, so each test doesn't have to
// re-learn a widget's keyboard model and markup. Each finds its parts by role, ARIA state and accessible name (never
// by a srp- class, which may change), acts through the user object you pass, and waits for the widget to settle.
//   import { userEvent } from '@testing-library/user-event';   // or: import { userEvent } from 'vitest/browser'
//   import { combobox, table } from '@diki-stwn/serupa-ds/testing';
//   const user = userEvent.setup();
//   await combobox(screen.getByRole('combobox', { name: 'Country' }), { user }).choose('Canada');
//   await table(screen.getByRole('table'), { user }).sort('Amount', 'descending');
// `user` is anything with user-event's click(element) and keyboard(text) (and type(element, text) for typing):
// @testing-library/user-event's userEvent.setup(), or vitest/browser's userEvent.
// A match picks an element by its accessible name or by the text of one of its parts (a string, exact; or a
// RegExp), by its index in the list (a number), or is the element itself.

const OPTIONS = { timeout: 1000 };

function need(user, what) {
  if (!user || typeof user.click !== 'function' || typeof user.keyboard !== 'function')
    throw new Error(`@diki-stwn/serupa-ds/testing: ${what} needs { user }: pass userEvent.setup() from @testing-library/user-event, or userEvent from vitest/browser.`);
  return user;
}

const squash = (s) => (s || '').replace(/\s+/g, ' ').trim();

/** The accessible name, as far as a test needs it: aria-labelledby, aria-label, a <label>, or the text. */
function nameOf(el) {
  const by = el.getAttribute('aria-labelledby');
  if (by) {
    const text = by.split(/\s+/).map((id) => el.ownerDocument.getElementById(id)).filter(Boolean).map((n) => n.textContent).join(' ');
    if (squash(text)) return squash(text);
  }
  const label = el.getAttribute('aria-label');
  if (squash(label)) return squash(label);
  if (el.labels && el.labels.length) return squash([...el.labels].map((l) => l.textContent).join(' '));
  return squash(el.textContent);
}

/** The texts a string can match: the name first, then each part with text of its own (an option's label beside its description). */
function textsOf(el) {
  const parts = [...el.querySelectorAll('*')].filter((n) => !n.children.length).map((n) => squash(n.textContent)).filter(Boolean);
  return [nameOf(el), ...parts];
}

function pick(list, match, what) {
  if (match instanceof Element) {
    if (list.includes(match)) return match;
    throw new Error(`@diki-stwn/serupa-ds/testing: that element isn't one of the ${what}.`);
  }
  let found;
  if (typeof match === 'number') found = list[match];
  else if (match instanceof RegExp) found = list.find((el) => textsOf(el).some((t) => match.test(t)));
  else found = list.find((el) => nameOf(el) === match) || list.find((el) => textsOf(el).includes(match));
  if (!found) throw new Error(`@diki-stwn/serupa-ds/testing: no ${what.replace(/s$/, '')} ${typeof match === 'number' ? 'at ' + match : JSON.stringify(String(match))}. The ${what} are: ${list.map(nameOf).map((n) => JSON.stringify(n)).join(', ') || 'none'}.`);
  return found;
}

/** Waits until check() returns something truthy, and returns it; throws with `what` after options.timeout ms. */
async function until(check, what, options) {
  const end = Date.now() + ((options && options.timeout) || OPTIONS.timeout);
  for (;;) {
    const got = check();
    if (got) return got;
    if (Date.now() > end) throw new Error(`@diki-stwn/serupa-ds/testing: timed out waiting for ${what}.`);
    await new Promise((done) => setTimeout(done, 16));
  }
}

const byId = (el, attr) => {
  const id = el.getAttribute(attr);
  return id ? el.ownerDocument.getElementById(id.split(/\s+/)[0]) : null;
};
const expanded = (el) => el.getAttribute('aria-expanded') === 'true';
const disabled = (el) => el.getAttribute('aria-disabled') === 'true' || el.disabled === true;
const own = (root, selector, holder) => [...root.querySelectorAll(selector)].filter((el) => el.parentElement && el.parentElement.closest(holder) === root.closest(holder));
const iso = (d) => (typeof d === 'string' ? d.slice(0, 10) : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);

/** A Combobox (or any ARIA combobox): its field, or an element holding one. */
export function combobox(target, { user, ...options } = {}) {
  need(user, 'combobox()');
  const input = target.matches('[role="combobox"]') ? target : target.querySelector('[role="combobox"]');
  if (!input) throw new Error('@diki-stwn/serupa-ds/testing: combobox() needs a role="combobox" field, or an element holding one.');
  const listbox = () => byId(input, 'aria-controls');
  const t = {
    input: () => input,
    isOpen: () => expanded(input) && !!listbox(),
    listbox,
    /** The options now in the list (a long list renders only those near the scroll position). */
    options: () => { const l = listbox(); return l ? [...l.querySelectorAll('[role="option"]')] : []; },
    selected: () => t.options().filter((o) => o.getAttribute('aria-selected') === 'true'),
    /** The option the keyboard is on (aria-activedescendant), or null. */
    active: () => byId(input, 'aria-activedescendant'),
    value: () => input.value,
    async open() {
      if (t.isOpen()) return;
      input.focus();
      await user.keyboard('{ArrowDown}');
      await until(t.isOpen, 'the combobox to open', options);
    },
    async type(text) {
      if (typeof user.type !== 'function') throw new Error('@diki-stwn/serupa-ds/testing: typing needs a user with type(element, text).');
      await user.type(input, text);
    },
    /** Opens the list and chooses an option: by pointer (default), or with the arrow keys and Enter. An option the
        list hasn't drawn yet (a long list draws only those in view) is found by typing its text first. */
    async choose(match, { by = 'pointer' } = {}) {
      await t.open();
      const find = () => { try { return pick(t.options(), match, 'options'); } catch { return null; } };
      let option = find();
      if (!option) {
        // Not drawn yet: type its text to bring it into the list. Anything but a string can't be typed.
        if (typeof match !== 'string') pick(t.options(), match, 'options');
        await t.type(match);
        option = await until(find, `an option ${JSON.stringify(match)}`, options);
      }
      if (disabled(option)) throw new Error(`@diki-stwn/serupa-ds/testing: the option ${JSON.stringify(nameOf(option))} is disabled.`);
      if (by === 'keyboard') {
        input.focus();
        for (let i = 0; t.active() !== option; i++) {
          if (i > t.options().length + 1) throw new Error(`@diki-stwn/serupa-ds/testing: the arrow keys never reached ${JSON.stringify(nameOf(option))}.`);
          await user.keyboard('{ArrowDown}');
        }
        await user.keyboard('{Enter}');
      } else await user.click(option);
    },
    async close() {
      if (!t.isOpen()) return;
      input.focus();
      await user.keyboard('{Escape}');
      await until(() => !t.isOpen(), 'the combobox to close', options);
    },
  };
  return t;
}

/** A Menu: the button that opens it (aria-haspopup="menu"). */
export function menu(trigger, { user, ...options } = {}) {
  need(user, 'menu()');
  if (trigger.getAttribute('aria-haspopup') !== 'menu') throw new Error('@diki-stwn/serupa-ds/testing: menu() needs the button that opens the menu (aria-haspopup="menu").');
  const panel = () => (expanded(trigger) ? byId(trigger, 'aria-controls') : null);
  const itemsOf = (p) => own(p, '[role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"]', '[role="menu"]');
  const t = {
    trigger: () => trigger,
    isOpen: () => !!panel(),
    menu: panel,
    /** The open menu's own items (not those of its submenus). */
    items: () => { const p = panel(); return p ? itemsOf(p) : []; },
    async open() {
      if (t.isOpen()) return;
      await user.click(trigger);
      await until(t.isOpen, 'the menu to open', options);
    },
    /** Opens the menu and chooses an item. For an item in a submenu, give the path: ['Share', 'Email']. */
    async choose(path) {
      await t.open();
      const steps = Array.isArray(path) ? path : [path];
      let p = panel();
      for (let i = 0; i < steps.length; i++) {
        const item = pick(itemsOf(p), steps[i], 'menu items');
        if (disabled(item)) throw new Error(`@diki-stwn/serupa-ds/testing: the menu item ${JSON.stringify(nameOf(item))} is disabled.`);
        if (i === steps.length - 1) { await user.click(item); break; }
        if (item.getAttribute('aria-haspopup') !== 'menu') throw new Error(`@diki-stwn/serupa-ds/testing: ${JSON.stringify(nameOf(item))} doesn't open a submenu.`);
        item.focus();
        await user.keyboard('{ArrowRight}');
        p = await until(() => (expanded(item) ? byId(item, 'aria-controls') : null), `the submenu of ${JSON.stringify(nameOf(item))}`, options);
      }
    },
    async close() {
      const p = panel();
      if (!p) return;
      (p.contains(document.activeElement) ? document.activeElement : p).focus();
      await user.keyboard('{Escape}');
      await until(() => !t.isOpen(), 'the menu to close', options);
    },
  };
  return t;
}

/** Tabs: the element holding the tab list (or the tablist itself). Tabs nested in a panel are left to their own tester. */
export function tabs(target, { user, ...options } = {}) {
  need(user, 'tabs()');
  const list = target.matches('[role="tablist"]') ? target : target.querySelector('[role="tablist"]');
  if (!list) throw new Error('@diki-stwn/serupa-ds/testing: tabs() needs a role="tablist", or an element holding one.');
  const t = {
    tablist: () => list,
    tabs: () => own(list, '[role="tab"]', '[role="tablist"]'),
    selected: () => t.tabs().find((tab) => tab.getAttribute('aria-selected') === 'true') || null,
    /** The panel of the selected tab, or null. */
    panel: () => { const s = t.selected(); return s ? byId(s, 'aria-controls') : null; },
    async select(match) {
      const tab = pick(t.tabs(), match, 'tabs');
      if (disabled(tab)) throw new Error(`@diki-stwn/serupa-ds/testing: the tab ${JSON.stringify(nameOf(tab))} is disabled.`);
      await user.click(tab);
      await until(() => tab.getAttribute('aria-selected') === 'true', `the tab ${JSON.stringify(nameOf(tab))} to be selected`, options);
    },
  };
  return t;
}

/** A Table: sort a column, select rows, read cells. */
export function table(target, { user, ...options } = {}) {
  need(user, 'table()');
  const el = target.matches('table') ? target : target.querySelector('table');
  if (!el) throw new Error('@diki-stwn/serupa-ds/testing: table() needs a <table>, or an element holding one.');
  const box = (row) => row.querySelector('input[type="checkbox"]');
  const sortOf = (th) => th.getAttribute('aria-sort') || 'none';
  const t = {
    table: () => el,
    /** The header cells of the last header row. */
    columns: () => { const head = el.tHead && el.tHead.rows[el.tHead.rows.length - 1]; return head ? [...head.cells] : []; },
    rows: () => [...el.tBodies].flatMap((b) => [...b.rows]),
    /** A row by index, or by the text of one of its cells. */
    row(match) {
      if (typeof match === 'number' || match instanceof Element) return pick(t.rows(), match, 'rows');
      const found = t.rows().find((r) => [...r.cells].some((c) => (match instanceof RegExp ? textsOf(c).some((x) => match.test(x)) : textsOf(c).includes(match))));
      if (!found) throw new Error(`@diki-stwn/serupa-ds/testing: no row with a cell ${JSON.stringify(String(match))}.`);
      return found;
    },
    /** The cell of a row (match as for row()) in a column (by its header's name, or index). */
    cell(row, column) {
      const r = t.row(row);
      const index = typeof column === 'number' ? column : t.columns().indexOf(pick(t.columns(), column, 'columns'));
      return r.cells[index] || null;
    },
    sortDirection: (column) => sortOf(pick(t.columns(), column, 'columns')),
    /** Presses a column's sort button until the column is sorted that way (default 'ascending'). */
    async sort(column, direction = 'ascending') {
      for (let i = 0; i < 3; i++) {
        const th = pick(t.columns(), column, 'columns');
        if (sortOf(th) === direction) return;
        const button = th.querySelector('button');
        if (!button) throw new Error(`@diki-stwn/serupa-ds/testing: the column ${JSON.stringify(nameOf(th))} can't be sorted (no sort button).`);
        const before = sortOf(th);
        await user.click(button);
        await until(() => sortOf(pick(t.columns(), column, 'columns')) !== before, `the column ${JSON.stringify(nameOf(th))} to change its order`, options);
      }
      if (t.sortDirection(column) !== direction) throw new Error(`@diki-stwn/serupa-ds/testing: the column never sorted ${direction}.`);
    },
    /** The rows whose select checkbox is checked. */
    selectedRows: () => t.rows().filter((r) => { const b = box(r); return !!b && b.checked; }),
    /** Checks or unchecks a row's select checkbox (default: checks it). */
    async selectRow(match, selected = true) {
      const b = box(t.row(match));
      if (!b) throw new Error('@diki-stwn/serupa-ds/testing: that row has no select checkbox (TableSelectCell).');
      if (b.checked !== selected) await user.click(b);
      await until(() => b.checked === selected, 'the row checkbox to change', options);
    },
    /** Checks or unchecks the header's select-all checkbox (default: checks it). */
    async selectAll(selected = true) {
      const b = el.tHead && el.tHead.querySelector('input[type="checkbox"]');
      if (!b) throw new Error('@diki-stwn/serupa-ds/testing: the table has no select-all checkbox (TableSelectCell header).');
      // From "some selected" (indeterminate), one press may select all or clear all: press until it says what was asked.
      const done = () => b.checked === selected && !b.indeterminate;
      for (let i = 0; i < 2 && !done(); i++) {
        const before = `${b.checked} ${b.indeterminate}`;
        await user.click(b);
        await until(() => `${b.checked} ${b.indeterminate}` !== before, 'the select-all checkbox to change', options);
      }
      if (!done()) throw new Error('@diki-stwn/serupa-ds/testing: the select-all checkbox never reached that state.');
    },
  };
  return t;
}

/** A Calendar or RangeCalendar: the element holding its grid (role="grid"). */
export function calendar(target, { user, ...options } = {}) {
  need(user, 'calendar()');
  const grid = () => (target.matches('[role="grid"]') ? target : target.querySelector('[role="grid"]'));
  const day = (d) => { const g = grid(); return g ? g.querySelector(`button[data-date="${iso(d)}"]`) : null; };
  const t = {
    grid,
    /** The days shown (YYYY-MM-DD), the outside days included. */
    days: () => { const g = grid(); return g ? [...g.querySelectorAll('button[data-date]')].map((b) => b.getAttribute('data-date')) : []; },
    selected: () => { const g = grid(); return g ? [...g.querySelectorAll('[aria-selected="true"] button[data-date]')].map((b) => b.getAttribute('data-date')) : []; },
    /** Moves to the date's month with PageUp and PageDown (Shift for years) and presses its day. Takes a Date or YYYY-MM-DD. */
    async pick(date) {
      const want = iso(date);
      if (!grid()) throw new Error('@diki-stwn/serupa-ds/testing: calendar() found no role="grid".');
      // The day with tabindex 0 is where the keyboard is; PageUp and PageDown move it a month (with Shift, a year).
      const focused = () => grid() && grid().querySelector('button[data-date][tabindex="0"]');
      for (let i = 0; !day(want); i++) {
        const focus = focused();
        if (!focus || i > 40) throw new Error(`@diki-stwn/serupa-ds/testing: couldn't reach ${want} in the calendar.`);
        const at = focus.getAttribute('data-date');
        const months = (+want.slice(0, 4) - +at.slice(0, 4)) * 12 + (+want.slice(5, 7) - +at.slice(5, 7));
        const key = Math.abs(months) >= 12 ? (months > 0 ? '{Shift>}{PageDown}{/Shift}' : '{Shift>}{PageUp}{/Shift}') : months > 0 ? '{PageDown}' : '{PageUp}';
        focus.focus();
        await user.keyboard(key);
        await until(() => focused() && focused().getAttribute('data-date') !== at, 'the calendar to change month', options);
      }
      const button = day(want);
      if (disabled(button)) throw new Error(`@diki-stwn/serupa-ds/testing: ${want} can't be picked (it's disabled).`);
      await user.click(button);
    },
  };
  return t;
}

/** A DatePicker: its field, or the element holding it (data-component="date-picker"). */
export function datePicker(target, { user, ...options } = {}) {
  need(user, 'datePicker()');
  const root = target.closest('[data-component]') && target.matches('input') ? target.closest('[data-component]') : target;
  const button = root.querySelector('button[aria-haspopup="dialog"]');
  const input = root.matches('input') ? root : root.querySelector('input');
  if (!button || !input) throw new Error('@diki-stwn/serupa-ds/testing: datePicker() needs a DatePicker: its field, or the element holding it.');
  const dialog = () => (expanded(button) ? byId(button, 'aria-controls') : null);
  const t = {
    input: () => input,
    button: () => button,
    isOpen: () => !!dialog(),
    dialog,
    value: () => input.value,
    async open() {
      if (t.isOpen()) return;
      await user.click(button);
      await until(() => dialog() && dialog().querySelector('[role="grid"]'), 'the date picker to open', options);
    },
    /** Opens the calendar and picks the date (a Date or YYYY-MM-DD). */
    async pick(date) {
      await t.open();
      await calendar(dialog(), { user, ...options }).pick(date);
    },
    async close() {
      if (!t.isOpen()) return;
      (dialog().contains(document.activeElement) ? document.activeElement : button).focus();
      await user.keyboard('{Escape}');
      await until(() => !t.isOpen(), 'the date picker to close', options);
    },
  };
  return t;
}
