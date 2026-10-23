// Commands the component tests run in Node, on the Playwright page (vitest.config.ts lists them; helpers.ts types them).
import type { BrowserCommand } from 'vitest/node';
import type { FrameLocator, Page } from 'playwright';

type Point = { x: number; y: number };

/** Press at `from`, move to `to` in `steps` moves and release, with Playwright's real mouse: points relative to the
 *  top-left corner of the element `selector` finds in the test frame (they can lie outside it). Not
 *  userEvent.dragAndDrop, which in Firefox loses the moves after a pointer capture. */
export const pointerDrag: BrowserCommand<[selector: string, from: Point, to: Point, steps?: number]> = async (ctx, selector, from, to, steps = 5) => {
  if (ctx.provider.name !== 'playwright') throw new Error('pointerDrag needs the Playwright provider');
  const { page, iframe } = ctx as unknown as { page: Page; iframe: FrameLocator };
  const target = iframe.locator(selector);
  // Playwright places the pointer itself, through the frame and any scaling of it.
  const moveTo = (p: Point) => target.hover({ position: p, force: true });
  await moveTo(from);
  await page.mouse.down();
  for (let i = 1; i <= steps; i++) await moveTo({ x: from.x + (to.x - from.x) * i / steps, y: from.y + (to.y - from.y) * i / steps });
  await page.mouse.up();
};
