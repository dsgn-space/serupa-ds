import * as React from 'react';
import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';

// state-layer (docs/foundations.md, Interactivity): the system's hover, pressed and dragged states on a surface the
// app colors itself. The element's text color is laid over its background at opacity-state-*, under its content.
const layer = (el: Element) => getComputedStyle(el, '::before');

describe('state-layer', () => {
  test('a tile in a color serupa does not know tints with its own text color on hover and while dragged, and not when disabled', async () => {
    await render(<div>
      <button type="button" className="state-layer" style={{ background: 'rgb(255, 230, 200)', color: 'rgb(90, 40, 0)', padding: '24px' }}>Orders</button>
      <button type="button" className="state-layer" data-state="dragging" style={{ color: 'rgb(90, 40, 0)' }}>Moving</button>
      <button type="button" className="state-layer" disabled style={{ color: 'rgb(90, 40, 0)' }}>Off</button>
    </div>);
    const [tile, moving, off] = [...document.querySelectorAll('button')];
    expect(layer(tile!).opacity).toBe('0');
    expect(layer(tile!).backgroundColor).toBe('rgb(90, 40, 0)');
    // Under the content: the label stays on top, and the pointer still reaches the button itself.
    expect(Number(layer(tile!).zIndex)).toBeLessThan(0);
    expect(layer(tile!).pointerEvents).toBe('none');
    await userEvent.hover(tile!);
    await expect.poll(() => layer(tile!).opacity).toBe('0.08');
    expect(layer(moving!).opacity).toBe('0.16');
    await userEvent.hover(off!);
    expect(layer(off!).opacity).toBe('0');
  });
});
