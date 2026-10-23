import * as React from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { Menu, MenuItem } from '../components/Menu/Menu';
import { Popover } from '../components/Popover/Popover';
import { Tooltip } from '../components/Tooltip/Tooltip';

// Menu, Popover and Tooltip clone their trigger and add a ref; the trigger's own ref must still be set, on
// React 18 (element.ref) and React 19 (a prop, where reading element.ref warns).
describe('the trigger keeps its own ref', () => {
  afterEach(() => vi.restoreAllMocks());

  test.each([
    ['Tooltip', (r: React.Ref<HTMLButtonElement>) => <Tooltip content="Hint"><button ref={r}>T</button></Tooltip>],
    ['Popover', (r: React.Ref<HTMLButtonElement>) => <Popover trigger={<button ref={r}>P</button>}>Body</Popover>],
    ['Menu', (r: React.Ref<HTMLButtonElement>) => <Menu trigger={<button ref={r}>M</button>}><MenuItem>One</MenuItem></Menu>],
  ])('%s: object and function refs, with no React warning', async (_name, make) => {
    const error = vi.spyOn(console, 'error');
    const obj = React.createRef<HTMLButtonElement>();
    let fn: HTMLButtonElement | null = null;
    await render(<>{make(obj)}{make((n) => { fn = n; })}</>);
    expect(obj.current?.tagName).toBe('BUTTON');
    expect((fn as HTMLButtonElement | null)?.tagName).toBe('BUTTON');
    expect(error).not.toHaveBeenCalled();
  });
});
