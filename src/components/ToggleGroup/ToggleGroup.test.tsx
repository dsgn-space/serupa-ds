import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { ToggleGroup } from './ToggleGroup';
import { ToggleButton } from '../ToggleButton/ToggleButton';
import { withMotion } from '../../../tools/test/vitest/helpers';

const el = (id: string) => document.getElementById(id) as HTMLElement;
const pressed = () => [...document.querySelectorAll<HTMLButtonElement>('button[aria-pressed]')].map((b) => b.getAttribute('aria-pressed') === 'true' ? b.value : '').filter(Boolean).join();
const btn = (name: string) => page.getByRole('button', { name });

function Align(props: Partial<React.ComponentProps<typeof ToggleGroup>>) {
  return (
    <ToggleGroup id="g" aria-label="Text alignment" {...props}>
      <ToggleButton value="left" aria-label="Left" icon="format_align_left" />
      <ToggleButton value="center" aria-label="Center" icon="format_align_center" />
      <ToggleButton value="right" aria-label="Right" icon="format_align_right" />
    </ToggleGroup>
  );
}

describe('ToggleGroup', () => {
  test('a role="group" laid out like an attached ButtonGroup; ref, className and other props reach it', async () => {
    const ref = React.createRef<HTMLDivElement>();
    await render(<Align ref={ref} className="extra" data-x="y" />);
    const e = el('g');
    expect([e.getAttribute('role'), e.getAttribute('aria-label'), ref.current === e, e.dataset.x, e.dataset.component, e.dataset.type, e.dataset.orientation]).toEqual(['group', 'Text alignment', true, 'y', 'toggle-group', 'single', 'horizontal']);
    expect(e.className).toBe('srp-button-group srp-button-group--attached srp-toggle-group extra');
    const [a, b] = [...e.querySelectorAll('button')].map((x) => x.getBoundingClientRect());
    expect(Math.round(b!.left - a!.right)).toBe(-1);   // attached: the borders overlap into one line
  });

  test('the line an on toggle shares with a hovered neighbour is the on one\'s, in a row, a column and right to left; a focused one comes above both', async () => {
    const top = (b: HTMLElement, n: HTMLElement) => {
      // The 1px the two share: inside b, on the side facing n.
      const r = b.getBoundingClientRect(), o = n.getBoundingClientRect();
      const x = o.left >= r.right - 1 ? r.right - 0.5 : o.right <= r.left + 1 ? r.left + 0.5 : r.left + r.width / 2;
      const y = o.top >= r.bottom - 1 ? r.bottom - 0.5 : r.top + r.height / 2;
      return document.elementFromPoint(x, y)?.closest('button');
    };
    for (const [props, dir] of [[{}, 'ltr'], [{ orientation: 'vertical' as const }, 'ltr'], [{}, 'rtl']] as const) {
      const s = await render(<div dir={dir}><Align defaultValue={['left']} {...props} /></div>);
      const [left, center] = [btn('Left').element(), btn('Center').element()] as HTMLElement[];
      await userEvent.hover(center!);
      expect([dir, props, top(left!, center!)]).toEqual([dir, props, left]);
      center!.focus({ focusVisible: true });
      await userEvent.keyboard('{Shift>}{Tab}{/Shift}{Tab}');
      await expect.poll(() => center!.matches(':focus-visible')).toBe(true);
      expect([dir, props, top(left!, center!)]).toEqual([dir, props, center]);
      await userEvent.unhover(center!);
      await s.unmount();
    }
  });

  test('choosing another toggle: the shared line turns the newly on one\'s color at once, never gray for a moment (the fill still fades)', async () => {
    await render(<Align defaultValue={['center']} />);
    const left = btn('Left').element() as HTMLElement;
    await withMotion(async () => {
      await userEvent.click(left);
      await new Promise((r) => requestAnimationFrame(() => r(null)));
      const now = getComputedStyle(left).borderRightColor;
      await new Promise((r) => setTimeout(r, 500));
      expect(now).toBe(getComputedStyle(left).borderRightColor);
    });
  });

  test('single: pressing one turns the others off, pressing it again turns it off; onValueChange hears each', async () => {
    const onValueChange = vi.fn();
    await render(<Align defaultValue={['left']} onValueChange={onValueChange} />);
    expect(pressed()).toBe('left');
    await btn('Center').click();
    expect([pressed(), onValueChange.mock.calls.at(-1)![0]]).toEqual(['center', ['center']]);
    await btn('Center').click();
    expect([pressed(), onValueChange.mock.calls.at(-1)![0]]).toEqual(['', []]);
  });

  test('single and required: the one that\'s on stays on', async () => {
    const onValueChange = vi.fn();
    await render(<Align defaultValue={['left']} required onValueChange={onValueChange} />);
    await btn('Left').click();
    expect([pressed(), onValueChange.mock.calls.length]).toEqual(['left', 0]);
    await btn('Right').click();
    expect(pressed()).toBe('right');
  });

  test('multiple: each turns on and off by itself, and the group reports them together', async () => {
    const onValueChange = vi.fn();
    await render(<Align selectionMode="multiple" defaultValue={['left']} onValueChange={onValueChange} />);
    expect(el('g').dataset.type).toBe('multiple');
    await btn('Right').click();
    expect([pressed(), onValueChange.mock.calls.at(-1)![0]]).toEqual(['left,right', ['left', 'right']]);
    await btn('Left').click();
    expect(pressed()).toBe('right');
  });

  test('controlled: the buttons follow value, and change only when the parent passes a new one', async () => {
    function Controlled() {
      const [v, setV] = React.useState<string[]>(['center']);
      return <><Align value={v} onValueChange={setV} /><output id="out">{v.join()}</output></>;
    }
    await render(<Controlled />);
    await btn('Right').click();
    expect([pressed(), el('out').textContent]).toEqual(['right', 'right']);
  });

  test('controlled without a handler: pressing changes nothing', async () => {
    await render(<Align value={['center']} />);
    await btn('Left').click();
    expect(pressed()).toBe('center');
  });

  test('size, variant and disabled reach buttons that don\'t set their own; a button\'s own onPressedChange still runs', async () => {
    const own = vi.fn();
    await render(
      <ToggleGroup id="g" aria-label="View" size="sm" variant="ghost" selectionMode="multiple">
        <ToggleButton value="day" onPressedChange={own}>Day</ToggleButton>
        <ToggleButton value="week" size="lg" variant="outline">Week</ToggleButton>
        <span id="note">plain</span>
      </ToggleGroup>,
    );
    const [day, week] = [...el('g').querySelectorAll('button')];
    expect([day!.dataset.size, day!.dataset.variant, week!.dataset.size, week!.dataset.variant, el('note').textContent]).toEqual(['sm', 'ghost', 'lg', 'outline', 'plain']);
    await userEvent.click(day!);
    expect([own.mock.calls.at(-1)![0], pressed()]).toEqual([true, 'day']);
    await render(<Align id="g2" disabled />);
    expect([...el('g2').querySelectorAll('button')].every((b) => b.disabled)).toBe(true);
  });

  test('vertical and not attached: a column, and buttons apart', async () => {
    await render(<Align orientation="vertical" attached={false} />);
    const e = el('g');
    expect([e.dataset.orientation, e.className]).toEqual(['vertical', 'srp-button-group srp-button-group--vertical srp-toggle-group']);
    const [a, b] = [...e.querySelectorAll('button')].map((x) => x.getBoundingClientRect());
    expect(b!.top - a!.bottom).toBeGreaterThan(0);
  });
});

describe('ToggleGroup at 320px (GP1)', () => {
  test('an attached row that doesn\'t fit wraps as separate toggles, in a block, flex or grid parent, and joins again with room', async () => {
    const row = (id: string) => <ToggleGroup id={id} aria-label="Show"><ToggleButton value="all">Everything</ToggleButton><ToggleButton value="mine">Assigned to me</ToggleButton><ToggleButton value="made">Created by me</ToggleButton></ToggleGroup>;
    await render(<div id="gp1" style={{ width: '288px' }}>
      <div>{row('gp1-b')}</div>
      <div style={{ display: 'flex' }}>{row('gp1-f')}</div>
      <div style={{ display: 'grid' }}>{row('gp1-g')}</div>
    </div>);
    for (const id of ['gp1-b', 'gp1-f', 'gp1-g']) await expect.poll(() => id + ':' + document.getElementById(id)!.dataset.wrapped).toBe(id + ':true');
    expect([document.getElementById('gp1')!.scrollWidth, document.getElementById('gp1-b')!.classList.contains('srp-button-group--attached')]).toEqual([288, false]);
    document.getElementById('gp1')!.style.width = '600px';
    await expect.poll(() => document.getElementById('gp1-b')!.dataset.wrapped).toBeUndefined();
  });
});
