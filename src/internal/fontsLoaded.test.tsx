import { describe, expect, test } from 'vitest';
import { onFontsLoaded } from './fontsLoaded';

const fire = (type: string) => document.fonts.dispatchEvent(new Event(type));
const frames = (n: number) => new Promise<void>((done) => { const step = () => (n-- > 0 ? requestAnimationFrame(step) : done()); step(); });

describe('onFontsLoaded', () => {
  test('calls back on "loadingdone", and after "loading" once the fonts read as loaded (WebKit sends no "loadingdone"); not after it is turned off', async () => {
    let calls = 0;
    const off = onFontsLoaded(() => { calls++; });
    fire('loadingdone');
    const done = calls;
    fire('loading');
    await expect.poll(() => calls).toBe(done + 1);
    off();
    fire('loadingdone');
    fire('loading');
    await frames(3);
    expect([done, calls]).toEqual([1, 2]);
  });
});
