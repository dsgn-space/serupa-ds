import * as React from 'react';
import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { useScrolls } from './useScrolls';

// A 200px box that scrolls once its content is wider: the content is one child, swapped for another (key), as a
// re-highlighted code block or a table rebuilt from new data is.
function Box({ wide, swap }: { wide: boolean; swap: number }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const scrolls = useScrolls(ref);
  return (
    <div ref={ref} data-testid="box" data-scrolls={String(scrolls)} style={{ width: 200, overflow: 'auto' }}>
      <div key={swap} style={{ width: wide ? 400 : 100, height: 20 }} />
    </div>
  );
}
const said = () => (document.querySelector('[data-testid=box]') as HTMLElement).dataset.scrolls;

describe('useScrolls', () => {
  test('takes a ref to the box, and knows it scrolls before the next frame', async () => {
    let atFrame: string | undefined;
    requestAnimationFrame(() => { atFrame = said(); });
    await render(<Box wide swap={0} />);
    await expect.poll(() => atFrame).toBeDefined();
    expect([atFrame, said()]).toEqual(['true', 'true']);
  });

  test('follows content that is replaced, not only content that resizes', async () => {
    const { rerender } = await render(<Box wide={false} swap={0} />);
    await expect.poll(said).toBe('false');
    await rerender(<Box wide swap={1} />);
    await expect.poll(said).toBe('true');
    await rerender(<Box wide={false} swap={2} />);
    await expect.poll(said).toBe('false');
  });
});
