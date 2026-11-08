import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { THEMES, contrast, css } from '../../../tools/test/vitest/helpers';
import { Tour, type TourStep } from './Tour';

const el = (id: string) => document.getElementById(id) as HTMLElement;
const steps: TourStep[] = [
  { target: '#a', title: 'First', content: 'About a' },
  { target: '#b', title: 'Second', content: 'About b', placement: 'top' },
  { target: '#c', title: 'Third', content: 'About c', placement: 'right-start' },
];
function Page(props: Partial<React.ComponentProps<typeof Tour>>) {
  return (
    <div style={{ padding: 120 }}>
      <button id="opener">Opener</button>
      <button id="a">A</button> <button id="b">B</button> <button id="c">C</button>
      <Tour id="t" steps={steps} {...props} />
    </div>
  );
}
const button = (name: string) => [...el('t').querySelectorAll('button')].find((b) => b.textContent === name || b.getAttribute('aria-label') === name) as HTMLButtonElement;

describe('Tour', () => {
  test('renders a <div>; ref, className and other props reach it', async () => {
    const ref = React.createRef<HTMLDivElement>();
    await render(<Page defaultOpen ref={ref} className="extra" data-x="y" />);
    const e = el('t');
    expect([e.tagName, ref.current === e, e.className, e.dataset.x, e.dataset.component]).toEqual(['DIV', true, 'dk-tour extra', 'y', 'tour']);
  });

  test('a dialog named by its title and described by its text; nothing shows when closed or with no steps', async () => {
    const { rerender } = await render(<Page />);
    expect(el('t').hidden).toBe(true);
    expect(el('t').textContent).toBe('');
    await rerender(<Page open />);
    const e = el('t');
    expect([e.hidden, e.getAttribute('role'), document.getElementById(e.getAttribute('aria-labelledby')!)!.textContent, document.getElementById(e.getAttribute('aria-describedby')!)!.textContent]).toEqual([false, 'dialog', 'First', 'About a']);
    expect(e.querySelector('h2')!.textContent).toBe('First');
    await rerender(<Page open steps={[]} />);
    expect(document.getElementById('t')).toBe(null);
  });

  test('headingLevel sets the title\'s heading', async () => {
    await render(<Page open headingLevel={3} />);
    expect(el('t').querySelector('h3')!.textContent).toBe('First');
  });

  test('the step\'s element gets the ring, and the panel sits beside it', async () => {
    await render(<Page open />);
    expect(el('a').hasAttribute('data-tour-target')).toBe(true);
    expect(css(el('a')).outlineStyle).toBe('solid');
    const a = el('a').getBoundingClientRect(), p = el('t').getBoundingClientRect();
    expect(p.top).toBeGreaterThanOrEqual(a.bottom);
    expect(el('t').classList.contains('dk-tour--center')).toBe(false);
  });

  test('Next, Back and Done walk the steps; the ring moves, onStepChange and onFinish are called', async () => {
    const onStepChange = vi.fn<(step: number) => void>(), onFinish = vi.fn(), onOpenChange = vi.fn();
    await render(<Page defaultOpen onStepChange={onStepChange} onFinish={onFinish} onOpenChange={onOpenChange} />);
    expect(button('Back')).toBe(undefined);
    await expect.element(page.getByText('Step 1 of 3')).toBeVisible();
    await userEvent.click(button('Next'));
    expect([el('t').querySelector('h2')!.textContent, el('a').hasAttribute('data-tour-target'), el('b').hasAttribute('data-tour-target')]).toEqual(['Second', false, true]);
    await userEvent.click(button('Back'));
    expect(el('t').querySelector('h2')!.textContent).toBe('First');
    await userEvent.click(button('Next'));
    await userEvent.click(button('Next'));
    expect(button('Next')).toBe(undefined);
    await userEvent.click(button('Done'));
    expect(onStepChange.mock.calls.map((c) => c[0])).toEqual([1, 0, 1, 2]);
    expect(onFinish).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false, { reason: 'close' });
    expect([el('t').hidden, el('c').hasAttribute('data-tour-target')]).toEqual([true, false]);
  });

  test('focus: each step\'s panel takes it, and it goes back to where it was when the tour ends', async () => {
    function Opened() {
      const [open, setOpen] = React.useState(false);
      return <><button id="go" onClick={() => setOpen(true)}>Go</button><Page open={open} onOpenChange={setOpen} /></>;
    }
    await render(<Opened />);
    await userEvent.click(el('go'));
    expect(document.activeElement).toBe(el('t'));
    await userEvent.click(button('Next'));
    expect(document.activeElement).toBe(el('t'));
    await userEvent.keyboard('{Escape}');
    expect(el('t').hidden).toBe(true);
    expect(document.activeElement).toBe(el('go'));
  });

  test('inside a shadow root, a selector finds its target there, and focus goes back to the button that opened it', async () => {
    function Opened() {
      const [open, setOpen] = React.useState(false);
      return <><button id="sgo" onClick={() => setOpen(true)}>Go</button><Page open={open} onOpenChange={setOpen} /></>;
    }
    const host = document.createElement('div');
    document.body.append(host);
    const inner = document.createElement('div');
    host.attachShadow({ mode: 'open' }).append(inner);
    try {
      await render(<Opened />, { container: inner });
      const root = host.shadowRoot!, tour = root.getElementById('t')!;
      await userEvent.click(root.getElementById('sgo')!);
      expect(root.activeElement).toBe(tour);
      expect(root.getElementById('a')!.hasAttribute('data-tour-target')).toBe(true);
      await userEvent.keyboard('{Escape}');
      expect(tour.hidden).toBe(true);
      expect(root.activeElement?.id).toBe('sgo');
    } finally { host.remove(); }
  });

  test('keyboard: Tab moves between the close button, Back and Next; Enter and Space press them', async () => {
    const onStepChange = vi.fn<(step: number) => void>();
    await render(<Page defaultOpen defaultStep={1} onStepChange={onStepChange} />);
    expect(document.activeElement).toBe(el('t'));
    await userEvent.tab();
    expect(document.activeElement).toBe(button('Close'));
    await userEvent.tab();
    expect(document.activeElement).toBe(button('Back'));
    await userEvent.tab();
    expect(document.activeElement).toBe(button('Next'));
    await userEvent.tab({ shift: true });
    expect(document.activeElement).toBe(button('Back'));
    await userEvent.keyboard('{Enter}');
    expect(onStepChange).toHaveBeenLastCalledWith(0);
    el('t').focus();
    await userEvent.tab();
    await userEvent.tab();
    expect(document.activeElement).toBe(button('Next'));
    await userEvent.keyboard(' ');
    expect(onStepChange).toHaveBeenLastCalledWith(1);
  });

  test('keyboard: Tab goes round the panel, never on to the page under it', async () => {
    await render(<Page defaultOpen defaultStep={1} />);
    await userEvent.tab({ shift: true });
    expect(document.activeElement).toBe(button('Next'));
    await userEvent.tab();
    expect(document.activeElement).toBe(button('Close'));
    await userEvent.tab({ shift: true });
    expect(document.activeElement).toBe(button('Next'));
    await userEvent.tab({ shift: true });
    expect(document.activeElement).toBe(button('Back'));
  });

  test('opened again, an uncontrolled tour starts over at defaultStep', async () => {
    function Reopen() {
      const [open, setOpen] = React.useState(true);
      return <><button id="again" onClick={() => setOpen(true)}>Take the tour</button><Page open={open} onOpenChange={setOpen} defaultStep={1} /></>;
    }
    await render(<Reopen />);
    expect(el('t').querySelector('h2')!.textContent).toBe('Second');
    await userEvent.click(button('Next'));
    expect(el('t').querySelector('h2')!.textContent).toBe('Third');
    await userEvent.click(button('Close'));
    expect(el('t').hidden).toBe(true);
    await userEvent.click(el('again'));
    expect([el('t').hidden, el('t').querySelector('h2')!.textContent, el('b').hasAttribute('data-tour-target')]).toEqual([false, 'Second', true]);
  });

  test('Escape and the close button end it, with their reasons; a press outside doesn\'t', async () => {
    const onOpenChange = vi.fn();
    await render(<Page defaultOpen onOpenChange={onOpenChange} />);
    await userEvent.click(el('opener'));
    expect(el('t').hidden).toBe(false);
    el('t').focus();
    await userEvent.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenLastCalledWith(false, { reason: 'escape' });
    expect(el('t').hidden).toBe(true);
  });

  test('the close button is named Close and ends it', async () => {
    const onOpenChange = vi.fn();
    await render(<Page open onOpenChange={onOpenChange} />);
    await userEvent.click(button('Close'));
    expect(onOpenChange).toHaveBeenCalledWith(false, { reason: 'close' });
  });

  test('a controlled step shows the step it is given', async () => {
    const { rerender } = await render(<Page open step={2} />);
    expect(el('t').querySelector('h2')!.textContent).toBe('Third');
    await userEvent.click(button('Back'));
    expect(el('t').querySelector('h2')!.textContent).toBe('Third');
    await rerender(<Page open step={0} />);
    expect(el('t').querySelector('h2')!.textContent).toBe('First');
  });

  test('a step with no target (or one not on the page) sits in the middle of the screen', async () => {
    await render(<Page open steps={[{ title: 'Welcome' }, { target: '#missing', title: 'Gone' }]} />);
    const p = el('t').getBoundingClientRect();
    expect(el('t').classList.contains('dk-tour--center')).toBe(true);
    expect(Math.abs(p.left + p.width / 2 - innerWidth / 2)).toBeLessThan(2);
    expect(el('t').getAttribute('aria-describedby')).toBe(null);
    await userEvent.click(button('Next'));
    expect(el('t').classList.contains('dk-tour--center')).toBe(true);
  });

  test('a target can be a ref or an element', async () => {
    function Refs() {
      const r = React.useRef<HTMLButtonElement>(null);
      return <><button ref={r} id="r">R</button><Tour id="t" open steps={[{ target: r, title: 'Ref' }]} /></>;
    }
    await render(<Refs />);
    expect(el('r').hasAttribute('data-tour-target')).toBe(true);
  });

  test('its text reads 4.5:1 on its background in all six themes', async () => {
    await render(<Page open />);
    const count = page.getByText('Step 1 of 3').element() as HTMLElement;
    for (const th of THEMES) {
      document.documentElement.setAttribute('data-theme', th);
      expect(contrast(css(el('t')).color, css(el('t')).backgroundColor), th).toBeGreaterThanOrEqual(4.5);
      expect(contrast(css(count).color, css(el('t')).backgroundColor), th + ' count').toBeGreaterThanOrEqual(4.5);
    }
  });
});
