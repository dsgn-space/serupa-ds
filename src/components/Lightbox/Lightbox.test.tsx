import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { THEMES, contrast, css } from '../../../tools/test/vitest/helpers';
import { Lightbox, type LightboxItem } from './Lightbox';

const pic = (color: string, w = 80, h = 50) => 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="${w}" height="${h}" fill="${color}"/></svg>`);
const PHOTOS: LightboxItem[] = [
  { src: pic('red'), alt: 'A red square', caption: 'First' },
  { src: pic('green'), alt: 'A green square' },
  { src: pic('blue', 50, 80), alt: 'A blue tower', caption: 'Third' },
];
const dialog = () => document.querySelector('dialog') as HTMLDialogElement;
const title = () => document.getElementById(dialog().getAttribute('aria-labelledby') || '')?.textContent;
const described = () => document.getElementById(dialog().getAttribute('aria-describedby') || '')?.textContent;
const prev = () => page.getByRole('button', { name: 'Previous image' });
const next = () => page.getByRole('button', { name: 'Next image' });
const said = (text: string) => expect.poll(() => document.querySelector('[data-dk-announcer]')?.textContent || '', { timeout: 3000 }).toContain(text);

function Gallery(p: Partial<React.ComponentProps<typeof Lightbox>>) {
  const [open, setOpen] = React.useState(false);
  const [index, setIndex] = React.useState(0);
  return (
    <>
      {PHOTOS.map((x, i) => <button key={x.src} type="button" onClick={() => { setIndex(i); setOpen(true); }}>{'Open ' + x.alt}</button>)}
      <Lightbox items={PHOTOS} {...p} open={open} onOpenChange={setOpen} index={index} onIndexChange={(n) => { setIndex(n); p.onIndexChange?.(n); }} />
    </>
  );
}

describe('Lightbox', () => {
  test('a modal dialog titled with the picture\'s alt and described by where it is; ref, className and props reach it', async () => {
    const ref = React.createRef<HTMLDialogElement>();
    await render(<Lightbox id="x" ref={ref} className="extra" data-x="y" items={PHOTOS} defaultOpen defaultIndex={1} />);
    const d = dialog();
    expect([d.id, ref.current === d, d.classList.contains('extra'), d.dataset.x, d.open, title(), described()]).toEqual(['x', true, true, 'y', true, 'A green square', '2 of 3']);
    expect(d.querySelector('img')!.getAttribute('alt')).toBe('');   // the title names it; not read twice
    await expect.element(page.getByText('2 of 3', { exact: true }).last()).toBeVisible();
  });

  test('the arrows move through the pictures, say each one, and stop at the ends; the caption follows', async () => {
    const onIndexChange = vi.fn<(i: number) => void>();
    await render(<Lightbox items={PHOTOS} defaultOpen onIndexChange={onIndexChange} />);
    await expect.element(prev()).toBeDisabled();
    await expect.element(page.getByText('First')).toBeVisible();
    await userEvent.click(next());
    expect([title(), described(), onIndexChange.mock.calls[0]![0]]).toEqual(['A green square', '2 of 3', 1]);
    await said('A green square, 2 of 3');
    await userEvent.click(next());
    await expect.element(next()).toBeDisabled();
    await expect.element(page.getByText('Third')).toBeVisible();
    await userEvent.click(prev());
    expect(title()).toBe('A green square');
  });

  test('Right and Left arrow, Home and End move it; in right-to-left text the arrows swap', async () => {
    const { rerender } = await render(<Lightbox items={PHOTOS} defaultOpen />);
    await userEvent.keyboard('{ArrowRight}');
    expect(title()).toBe('A green square');
    await userEvent.keyboard('{End}');
    expect(title()).toBe('A blue tower');
    await userEvent.keyboard('{ArrowRight}');   // the end, without loop
    expect(title()).toBe('A blue tower');
    await userEvent.keyboard('{Home}');
    expect(title()).toBe('A red square');
    await userEvent.keyboard('{Alt>}{ArrowRight}{/Alt}');   // the browser's
    expect(title()).toBe('A red square');
    await rerender(<div dir="rtl"><Lightbox items={PHOTOS} defaultOpen /></div>);
    (next().element() as HTMLElement).focus();
    await userEvent.keyboard('{ArrowLeft}');   // forward in right-to-left text
    expect(title()).toBe('A green square');
    expect(next().element().querySelector('svg')).toBeTruthy();
  });

  test('the arrow that reaches the end turns off under focus, and focus goes to the other arrow, not out of the dialog', async () => {
    await render(<Lightbox items={PHOTOS} defaultOpen />);
    await userEvent.click(next());
    await userEvent.click(next());
    expect(title()).toBe('A blue tower');
    await expect.element(prev()).toHaveFocus();
    await userEvent.keyboard('{Enter}{Enter}');
    expect(title()).toBe('A red square');
    await expect.element(next()).toHaveFocus();
  });

  test('loop goes from the last picture to the first, and back', async () => {
    await render(<Lightbox items={PHOTOS} defaultOpen defaultIndex={2} loop />);
    await expect.element(next()).toBeEnabled();
    await userEvent.click(next());
    expect(title()).toBe('A red square');
    await userEvent.click(prev());
    expect(title()).toBe('A blue tower');
  });

  test('a sideways swipe with a finger moves it; a mouse drag and a mostly-upward swipe don\'t', async () => {
    await render(<Lightbox items={PHOTOS} defaultOpen />);
    const body = dialog().querySelector('[data-index]') as HTMLElement;
    const swipe = (type: string, x0: number, x1: number, y1 = 100) => {
      body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: type, isPrimary: true, clientX: x0, clientY: 100 }));
      body.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerType: type, isPrimary: true, clientX: x1, clientY: y1 }));
    };
    swipe('mouse', 300, 100);
    expect(title()).toBe('A red square');
    swipe('touch', 300, 280, 300);   // mostly down: a scroll, not a swipe
    expect(title()).toBe('A red square');
    swipe('touch', 300, 100);
    await expect.poll(title).toBe('A green square');
    swipe('touch', 100, 300);
    await expect.poll(title).toBe('A red square');
    body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'touch', isPrimary: true, clientX: 300, clientY: 100 }));
    body.dispatchEvent(new PointerEvent('pointercancel', { bubbles: true, pointerType: 'touch' }));
    body.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerType: 'touch', isPrimary: true, clientX: 50, clientY: 100 }));
    expect(title()).toBe('A red square');   // cancelled: the browser took it over
  });

  test('opened from a thumbnail at its picture, Escape closes it and focus goes back to that thumbnail', async () => {
    await render(<Gallery />);
    await userEvent.click(page.getByRole('button', { name: 'Open A blue tower' }));
    await expect.poll(() => dialog().open).toBe(true);
    expect(title()).toBe('A blue tower');
    await userEvent.keyboard('{Escape}');
    await expect.poll(() => dialog()?.open ?? false).toBe(false);
    expect(document.activeElement?.textContent).toBe('Open A blue tower');
  });

  test('one picture has no arrows and no count; one that fails shows the broken-image icon and the arrows still work', async () => {
    const { rerender } = await render(<Lightbox items={[PHOTOS[0]!]} defaultOpen />);
    expect([dialog().querySelectorAll('button').length, described()]).toEqual([1, undefined]);   // only the ×
    await rerender(<Lightbox items={[{ src: 'data:image/png;base64,broken', alt: 'A receipt' }, ...PHOTOS]} defaultOpen />);
    await expect.poll(() => dialog().querySelector('[data-state]')?.getAttribute('data-state')).toBe('error');
    expect(dialog().querySelector('[data-state] svg')).toBeTruthy();
    await userEvent.click(next());
    await expect.poll(() => dialog().querySelector('[data-state]')?.getAttribute('data-state')).toBe('loaded');
  });

  test('a picture takes its own shape once loaded, and the given width and height before that', async () => {
    await render(<Lightbox items={[{ src: pic('blue', 50, 80), alt: 'Tall', width: 50, height: 80 }]} defaultOpen />);
    const stage = dialog().querySelector<HTMLElement>('[data-state]')!;
    expect(stage.style.getPropertyValue('--dk-lightbox-ratio')).toBe('50 / 80');
    await expect.poll(() => stage.getAttribute('data-state')).toBe('loaded');
    const r = stage.getBoundingClientRect();
    expect(Math.round((r.width / r.height) * 100) / 100).toBeCloseTo(0.63, 1);
  });

  test('the caption and the count read 4.5:1 on the dialog in all six themes', async () => {
    await render(<Lightbox items={PHOTOS} defaultOpen />);
    const caption = page.getByText('First').element() as HTMLElement, count = page.getByText('1 of 3', { exact: true }).last().element() as HTMLElement;
    const still = document.createElement('style'); still.textContent = '* { transition: none !important; animation: none !important; }'; document.head.appendChild(still);
    for (const th of THEMES) {
      document.documentElement.setAttribute('data-theme', th);
      const bg = css(dialog().firstElementChild).backgroundColor;   // the Dialog's panel
      expect(contrast(css(caption).color, bg), th + ' caption').toBeGreaterThanOrEqual(4.5);
      expect(contrast(css(count).color, bg), th + ' count').toBeGreaterThanOrEqual(4.5);
    }
    document.documentElement.removeAttribute('data-theme');
    still.remove();
  });
});
