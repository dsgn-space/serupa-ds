// Commands the component tests run in Node, on the Playwright page (vitest.config.ts lists them; helpers.ts types them).
import type { BrowserCommand } from 'vitest/node';

type Point = { x: number; y: number };

/** Press at `from`, move to `to` in `steps` moves and release: page coordinates of the test frame (clientX/Y).
 *  Playwright's real mouse, not userEvent.dragAndDrop, which in Firefox loses the moves after a pointer capture. */
export const pointerDrag: BrowserCommand<[from: Point, to: Point, steps?: number]> = async (ctx, from, to, steps = 5) => {
  if (ctx.provider.name !== 'playwright') throw new Error('pointerDrag needs the Playwright provider');
  const { page } = ctx as unknown as { page: import('playwright').Page };
  const frame = await (ctx as unknown as { frame: () => Promise<import('playwright').Frame> }).frame();
  const el = await frame.frameElement();
  const box = (await el.boundingBox())!, scale = box.width / (await el.evaluate((e) => (e as HTMLElement).clientWidth));
  const at = (p: Point) => [box.x + p.x * scale, box.y + p.y * scale] as const;
  await page.mouse.move(...at(from));
  await page.mouse.down();
  await page.mouse.move(...at(to), { steps });
  await page.mouse.up();
};
