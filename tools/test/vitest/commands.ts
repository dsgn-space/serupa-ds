// Commands the component tests run in Node, on the Playwright page (vitest.config.ts lists them; helpers.ts types them).
// They drive Playwright's real mouse. userEvent.dragAndDrop lost the moves after a pointer capture in Firefox, and a
// userEvent.click with a delay can be over before a test sees the press.
import type { BrowserCommand, BrowserCommandContext } from 'vitest/node';
import type { CDPSession, FrameLocator, Page } from 'playwright';

type Point = { x: number; y: number };

const playwright = (ctx: BrowserCommandContext) => {
  if (ctx.provider.name !== 'playwright') throw new Error('these commands need the Playwright provider');
  return ctx as unknown as { page: Page; iframe: FrameLocator };
};
// A point relative to the top-left corner of the element `selector` finds in the test frame (it can lie outside
// it), in the page's coordinates: Playwright's box already takes in the frame's offset and scaling.
const onPage = async (ctx: BrowserCommandContext, selector: string, p: Point) => {
  const box = (await playwright(ctx).iframe.locator(selector).boundingBox())!;
  return [box.x + p.x, box.y + p.y] as const;
};

/** Press at `from`, move to `to` in `steps` moves and release. */
export const pointerDrag: BrowserCommand<[selector: string, from: Point, to: Point, steps?: number]> = async (ctx, selector, from, to, steps = 5) => {
  const { page } = playwright(ctx), [a, b] = [await onPage(ctx, selector, from), await onPage(ctx, selector, to)];
  await page.mouse.move(...a);
  await page.mouse.down();
  await page.mouse.move(...b, { steps });
  await page.mouse.up();
};

/** Move to a point and press the button; it stays down until pointerUp. */
export const pointerDown: BrowserCommand<[selector: string, at: Point]> = async (ctx, selector, at) => {
  const { page } = playwright(ctx);
  await page.mouse.move(...(await onPage(ctx, selector, at)));
  await page.mouse.down();
};

export const pointerUp: BrowserCommand<[]> = async (ctx) => { await playwright(ctx).page.mouse.up(); };

/** Turns forced colors (Windows high contrast) on or off for the page, as the browser itself applies them: system
 *  colors, and a backplate behind text. Chromium only; elsewhere it throws. */
export const forcedColors: BrowserCommand<[on: boolean]> = async (ctx, on) => {
  await playwright(ctx).page.emulateMedia({ forcedColors: on ? 'active' : 'none' });
};

/** Makes the page a touch screen, (pointer: coarse) and (hover: none), as on a phone, or back. Chromium only
 *  (DevTools touch emulation); elsewhere it throws. */
const touch = new WeakMap<Page, CDPSession>();
export const coarsePointer: BrowserCommand<[on: boolean]> = async (ctx, on) => {
  const { page } = playwright(ctx);
  // The session that turned it on turns it off: an override belongs to the session that set it.
  let cdp = touch.get(page);
  if (!cdp) { cdp = await page.context().newCDPSession(page); touch.set(page, cdp); }
  await cdp.send('Emulation.setTouchEmulationEnabled', on ? { enabled: true, maxTouchPoints: 5 } : { enabled: false });
};
/** Gives the page a phone's safe-area insets (env(safe-area-inset-*): a notch, a home bar), or takes them away with
 *  none. Chromium only (DevTools); elsewhere it throws. */
export const safeArea: BrowserCommand<[insets: { top: number; right: number; bottom: number; left: number } | null]> = async (ctx, insets) => {
  const { page } = playwright(ctx);
  let cdp = touch.get(page);
  if (!cdp) { cdp = await page.context().newCDPSession(page); touch.set(page, cdp); }
  await cdp.send('Emulation.setSafeAreaInsetsOverride' as 'Emulation.setTouchEmulationEnabled', { insets: insets ?? { top: 0, right: 0, bottom: 0, left: 0 } } as never);
};
/** Lays the page out as for printing (@media print) or back for the screen. */
export const printMedia: BrowserCommand<[on: boolean]> = async (ctx, on) => {
  await playwright(ctx).page.emulateMedia({ media: on ? 'print' : 'screen' });
};

/** The accessibility tree under `selector` as Playwright writes it (ariaSnapshot: roles, names, states, as YAML). */
export const ariaSnapshot: BrowserCommand<[selector: string]> = async (ctx, selector) => playwright(ctx).iframe.locator(selector).ariaSnapshot();

// The accessibility-tree baselines (E3) are Chromium's, in English: other engines and locales name and nest some
// things differently, so those runs leave them alone. SERUPA_UPDATE_ARIA=1 writes them instead of checking.
const ARIA = 'tools/test/baseline-aria';
/** "check", "update" (SERUPA_UPDATE_ARIA) or "off" (another engine or a locale run). */
export const ariaMode: BrowserCommand<[]> = async () =>
  (process.env.SERUPA_BROWSER && process.env.SERUPA_BROWSER !== 'chromium') || process.env.SERUPA_LOCALE ? 'off' : process.env.SERUPA_UPDATE_ARIA ? 'update' : 'check';
/** With SERUPA_BENCH set to a folder, adds a test's timings (name → ms) to <folder>/<suite>.jsonl for
 *  tools/test/bench.mjs, which keeps them from night to night (F9). Otherwise does nothing. */
export const recordBench: BrowserCommand<[suite: 'mount' | 'update' | 'inp', times: Record<string, number>]> = async (_ctx, suite, times) => {
  const dir = process.env.SERUPA_BENCH;
  if (!dir) return;
  const fs = await import('node:fs');
  fs.mkdirSync(dir, { recursive: true });
  // One line a call, so the test files that run side by side can't overwrite each other's.
  fs.appendFileSync(`${dir}/${suite}.jsonl`, JSON.stringify(times) + '\n');
};
/** Writes one component's accessibility-tree baseline, tools/test/baseline-aria/<name>.yml. */
export const writeAriaBaseline: BrowserCommand<[name: string, text: string]> = async (_ctx, name, text) => {
  const fs = await import('node:fs');
  fs.mkdirSync(ARIA, { recursive: true });
  fs.writeFileSync(`${ARIA}/${name}.yml`, text);
};
