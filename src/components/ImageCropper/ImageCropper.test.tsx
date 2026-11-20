import * as React from 'react';
import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { THEMES, contrast, css, drag } from '../../../tools/test/vitest/helpers';
import { Field } from '../Field/Field';
import { ImageCropper, cropImage, type CropArea } from './ImageCropper';

const el = (id: string) => document.getElementById(id) as HTMLElement;
// A 900 × 600 picture (3:2), and a 300 × 900 one (1:3).
const pic = (w: number, h: number, fill = '#3b82f6') => 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="${w}" height="${h}" fill="${fill}"/></svg>`);
const WIDE = pic(900, 600), TALL = pic(300, 900, '#f59e0b');
const frame = () => document.querySelector('[data-component=image-cropper] > div') as HTMLElement;
const last = (calls: CropArea[]) => calls[calls.length - 1];
const loaded = async (calls: CropArea[], n = 1) => { await expect.poll(() => calls.length).toBeGreaterThanOrEqual(n); };

describe('ImageCropper', () => {
  test('a group named by aria-label holding a focusable "Crop area" application described by how to use it, and a "Zoom" slider between Zoom out and Zoom in; ref, className and other props reach the root', async () => {
    const ref = React.createRef<HTMLDivElement>();
    const calls: CropArea[] = [];
    await render(<ImageCropper id="x" ref={ref} src={WIDE} aria-label="Profile photo" className="extra" data-x="y" onCropChange={(a) => calls.push(a)} />);
    await loaded(calls);
    const e = el('x');
    await expect.element(page.getByRole('group', { name: 'Profile photo' })).toBeInTheDocument();
    const f = page.getByRole('application', { name: 'Crop area' }).element() as HTMLElement;
    const how = document.getElementById(f.getAttribute('aria-describedby')!)!;
    expect([ref.current === e, e.className, e.dataset.x, e.dataset.component, f.tabIndex, how.textContent, css(f).touchAction])
      .toEqual([true, 'dk-image-cropper extra', 'y', 'image-cropper', 0, 'Drag the picture or use the arrow keys to move it, and plus or minus to zoom.', 'none']);
    await expect.element(page.getByRole('slider', { name: 'Zoom' })).toHaveAttribute('aria-valuetext', '100%');
    await expect.element(page.getByRole('button', { name: 'Zoom out' })).toBeDisabled();
    await expect.element(page.getByRole('button', { name: 'Zoom in' })).toBeEnabled();
  });

  test('focus() on the root, as an error summary\'s link or a form library does, moves focus to the crop area', async () => {
    const ref = React.createRef<HTMLDivElement>();
    const calls: CropArea[] = [];
    await render(<ImageCropper ref={ref} src={WIDE} aria-label="Profile photo" onCropChange={(a) => calls.push(a)} />);
    await loaded(calls);
    ref.current!.focus();
    expect(document.activeElement).toBe(frame());
  });

  test('once loaded it says the crop in the picture\'s own pixels: the largest of its shape, centred; aspect and defaultZoom shape it', async () => {
    const a: CropArea[] = [], b: CropArea[] = [], c: CropArea[] = [], d: CropArea[] = [];
    await render(<>
      <ImageCropper aria-label="Square" src={WIDE} onCropChange={(v) => a.push(v)} />
      <ImageCropper aria-label="Cover" src={WIDE} aspect={16 / 9} onCropChange={(v) => b.push(v)} />
      <ImageCropper aria-label="Zoomed" src={WIDE} defaultZoom={2} onCropChange={(v) => c.push(v)} />
      <ImageCropper aria-label="Tall" src={TALL} aspect={3 / 4} onCropChange={(v) => d.push(v)} />
    </>);
    await loaded(a); await loaded(b); await loaded(c); await loaded(d);
    expect([a, b, c, d]).toEqual([
      [{ x: 150, y: 0, width: 600, height: 600 }],
      [{ x: 0, y: 47, width: 900, height: 506 }],
      [{ x: 300, y: 150, width: 300, height: 300 }],
      [{ x: 0, y: 250, width: 300, height: 400 }],
    ]);
  });

  test('the picture covers the frame exactly: the crop\'s part of it fills the frame edge to edge', async () => {
    const calls: CropArea[] = [];
    await render(<div style={{ width: 300 }}><ImageCropper aria-label="Photo" src={WIDE} defaultZoom={2} onCropChange={(a) => calls.push(a)} /></div>);
    await loaded(calls);
    const f = frame().getBoundingClientRect(), i = frame().querySelector('img')!.getBoundingClientRect();
    // zoom 2: the crop is 300 of 900 wide, so the picture is 3 frames wide, starting one frame to the left
    expect([Math.round(f.width), Math.round(f.height), Math.round(i.width), Math.round(i.height), Math.round(i.left - f.left), Math.round(i.top - f.top)])
      .toEqual([300, 300, 900, 600, -300, -150]);
  });

  test('arrow keys move the picture the way they point, a tenth of the frame (Shift, half), never past its edge; + and − zoom around the middle', async () => {
    const calls: CropArea[] = [];
    await render(<ImageCropper aria-label="Photo" src={WIDE} onCropChange={(a) => calls.push(a)} />);
    await loaded(calls);
    frame().focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(last(calls)).toEqual({ x: 90, y: 0, width: 600, height: 600 });
    await userEvent.keyboard('{Shift>}{ArrowLeft}{/Shift}');
    expect(last(calls)).toEqual({ x: 300, y: 0, width: 600, height: 600 });
    await userEvent.keyboard('{ArrowUp}');
    expect(last(calls)).toEqual({ x: 300, y: 0, width: 600, height: 600 });
    await userEvent.keyboard('{Shift>}{ArrowRight}{ArrowRight}{ArrowRight}{/Shift}');
    expect(last(calls)).toEqual({ x: 0, y: 0, width: 600, height: 600 });
    await userEvent.keyboard('+');
    expect(last(calls)).toEqual({ x: 27, y: 27, width: 545, height: 545 });
    await expect.element(page.getByRole('slider', { name: 'Zoom' })).toHaveAttribute('aria-valuetext', '110%');
    await userEvent.keyboard('-');
    expect(last(calls)).toEqual({ x: 0, y: 0, width: 600, height: 600 });
  });

  test('Zoom in and Zoom out step a tenth; each turns off at its end; the slider zooms too', async () => {
    const calls: CropArea[] = [];
    await render(<ImageCropper aria-label="Photo" src={WIDE} maxZoom={1.2} onCropChange={(a) => calls.push(a)} />);
    await loaded(calls);
    await page.getByRole('button', { name: 'Zoom in' }).click();
    expect(last(calls)!.width).toBe(545);
    await page.getByRole('button', { name: 'Zoom in' }).click();
    expect(last(calls)!.width).toBe(500);
    await expect.element(page.getByRole('button', { name: 'Zoom in' })).toBeDisabled();
    await page.getByRole('button', { name: 'Zoom out' }).click();
    expect(last(calls)!.width).toBe(545);
    (page.getByRole('slider', { name: 'Zoom' }).element() as HTMLElement).focus();
    await userEvent.keyboard('{Home}');
    expect(last(calls)).toEqual({ x: 150, y: 0, width: 600, height: 600 });
    await expect.element(page.getByRole('button', { name: 'Zoom out' })).toBeDisabled();
  });

  test('dragging moves the picture with the pointer, shows the thirds while it moves, and takes focus', async () => {
    const calls: CropArea[] = [];
    await render(<div style={{ width: 300 }}><ImageCropper aria-label="Photo" src={WIDE} onCropChange={(a) => calls.push(a)} /></div>);
    await loaded(calls);
    const f = frame();
    // 50px left on a 300px frame showing 600px of picture: 100px of picture
    await drag(f, { x: 150, y: 150 }, { x: 100, y: 150 });
    expect([last(calls), document.activeElement === f, f.hasAttribute('data-dragging')]).toEqual([{ x: 250, y: 0, width: 600, height: 600 }, true, false]);
    const grid = f.lastElementChild as HTMLElement;
    f.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 7, clientX: 10, clientY: 10, button: 0, pointerType: 'touch' }));
    await expect.poll(() => f.hasAttribute('data-dragging')).toBe(true);
    await expect.poll(() => Number(css(grid).opacity)).toBeGreaterThan(0.5);
    f.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 7, pointerType: 'touch' }));
    await expect.poll(() => f.hasAttribute('data-dragging')).toBe(false);
  });

  test('moving without dragging: a tap brings the spot tapped to the middle', async () => {
    const calls: CropArea[] = [];
    await render(<div style={{ width: 300 }}><ImageCropper aria-label="Photo" src={WIDE} defaultZoom={2} onCropChange={(a) => calls.push(a)} /></div>);
    await loaded(calls);
    // showing 300 × 300 from (300, 150): a tap at (75, 225) of the 300px frame is the picture's (375, 375)
    await drag(frame(), { x: 75, y: 225 }, { x: 75, y: 225 });
    expect(last(calls)).toEqual({ x: 225, y: 225, width: 300, height: 300 });
  });

  test('two fingers pinch to zoom, and one left after carries on moving', async () => {
    const calls: CropArea[] = [];
    await render(<div style={{ width: 300 }}><ImageCropper aria-label="Photo" src={WIDE} onCropChange={(a) => calls.push(a)} /></div>);
    await loaded(calls);
    const f = frame(), r = f.getBoundingClientRect();
    const at = (type: string, id: number, x: number) => f.dispatchEvent(new PointerEvent(type, { bubbles: true, pointerId: id, pointerType: 'touch', clientX: r.left + x, clientY: r.top + 150 }));
    at('pointerdown', 1, 125); at('pointerdown', 2, 175);
    at('pointermove', 2, 225);   // 50px apart to 100px: twice the zoom, around their middle
    await expect.poll(() => last(calls)!.width).toBe(300);
    at('pointerup', 2, 225);
    const before = last(calls)!.x;
    at('pointermove', 1, 75);   // the finger left drags: 50px left of a 300px frame showing 300px is 50px of picture
    await expect.poll(() => last(calls)!.x).toBe(Math.min(600, before + 50));
    at('pointerup', 1, 75);
  });

  test('a pinch on a trackpad (Ctrl with the wheel) zooms and keeps the page still; a plain wheel leaves it alone', async () => {
    const calls: CropArea[] = [];
    await render(<ImageCropper aria-label="Photo" src={WIDE} onCropChange={(a) => calls.push(a)} />);
    await loaded(calls);
    const f = frame(), r = f.getBoundingClientRect();
    const plain = new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY: -100, clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 });
    f.dispatchEvent(plain);
    expect([calls.length, plain.defaultPrevented]).toEqual([1, false]);
    const pinch = new WheelEvent('wheel', { bubbles: true, cancelable: true, ctrlKey: true, deltaY: -100, clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 });
    f.dispatchEvent(pinch);
    await expect.poll(() => calls.length).toBe(2);
    expect([pinch.defaultPrevented, last(calls)!.width]).toEqual([true, Math.round(600 / Math.E)]);
  });

  test('defaultCrop starts from a saved crop; crop (controlled) shows the app\'s, and a move the app doesn\'t take goes back', async () => {
    const a: CropArea[] = [], b: CropArea[] = [];
    const saved = { x: 300, y: 150, width: 300, height: 300 };
    await render(<>
      <ImageCropper aria-label="Saved" src={WIDE} defaultCrop={saved} onCropChange={(v) => a.push(v)} />
      <ImageCropper aria-label="Held" src={WIDE} crop={saved} onCropChange={(v) => b.push(v)} />
    </>);
    await loaded(a); await loaded(b);
    expect([a[0], b[0]]).toEqual([saved, saved]);
    await expect.element(page.getByRole('group', { name: 'Saved' }).getByRole('slider', { name: 'Zoom' })).toHaveAttribute('aria-valuetext', '200%');
    const held = page.getByRole('group', { name: 'Held' }).getByRole('application', { name: 'Crop area' }).element() as HTMLElement;
    held.focus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(last(b)).toEqual({ x: 330, y: 150, width: 300, height: 300 });
    // the app kept its crop, so the picture stays where crop says
    const img = held.querySelector('img')!;
    expect([img.style.left, img.style.top]).toEqual(['-100%', '-50%']);
  });

  test('a new src starts over, centred, and says its crop', async () => {
    const calls: CropArea[] = [];
    const screen = await render(<ImageCropper aria-label="Photo" src={WIDE} onCropChange={(a) => calls.push(a)} />);
    await loaded(calls);
    frame().focus();
    await userEvent.keyboard('+');
    await screen.rerender(<ImageCropper aria-label="Photo" src={TALL} onCropChange={(a) => calls.push(a)} />);
    await expect.poll(() => last(calls)).toEqual({ x: 0, y: 300, width: 300, height: 300 });
    await expect.element(page.getByRole('slider', { name: 'Zoom' })).toHaveAttribute('aria-valuetext', '100%');
  });

  test('a picture that can\'t be loaded says so in the frame; moving is off and the zoom row goes', async () => {
    await render(<ImageCropper aria-label="Photo" src="data:image/png;base64,broken" />);
    await expect.element(page.getByText('The picture couldn’t be loaded.')).toBeVisible();
    await expect.element(page.getByRole('slider', { name: 'Zoom' })).not.toBeInTheDocument();
    expect([frame().tabIndex, frame().getAttribute('role'), frame().dataset.state]).toEqual([-1, null, 'error']);
  });

  test('disabled: no Tab stop, keys and drags do nothing, the zoom row is off', async () => {
    const calls: CropArea[] = [];
    await render(<div style={{ width: 300 }}><ImageCropper aria-label="Photo" src={WIDE} disabled onCropChange={(a) => calls.push(a)} /></div>);
    await loaded(calls);
    const f = frame();
    f.focus();
    await userEvent.keyboard('{ArrowRight}+');
    await drag(f, { x: 150, y: 150 }, { x: 50, y: 150 });
    expect([calls.length, f.tabIndex, f.getAttribute('role')]).toEqual([1, -1, null]);
    await expect.element(page.getByRole('button', { name: 'Zoom in' })).toBeDisabled();
  });

  test('crossOrigin reaches the picture, so cropImage can read another site\'s', async () => {
    await render(<>
      <ImageCropper aria-label="A" src={WIDE} crossOrigin="anonymous" />
      <ImageCropper aria-label="B" src={WIDE} crossOrigin="use-credentials" />
      <ImageCropper aria-label="C" src={WIDE} crossOrigin="" />
    </>);
    expect([...document.querySelectorAll('img')].map((i) => i.getAttribute('crossorigin'))).toEqual(['anonymous', 'use-credentials', '']);
  });

  test('in a Field, the label names the group', async () => {
    await render(<Field label="Profile photo" hint="Shown round."><ImageCropper src={WIDE} /></Field>);
    await expect.element(page.getByRole('group', { name: 'Profile photo' })).toBeInTheDocument();
  });

  test('round: the picture outside the circle is dimmed with the overlay, and the circle is ringed', async () => {
    const calls: CropArea[] = [];
    await render(<ImageCropper aria-label="Photo" src={WIDE} shape="round" onCropChange={(a) => calls.push(a)} />);
    await loaded(calls);
    const mask = frame().querySelector('img')!.nextElementSibling as HTMLElement;
    expect([css(mask).borderTopLeftRadius !== '0px', css(mask).boxShadow !== 'none', css(mask).outlineStyle]).toEqual([true, true, 'solid']);
  });

  test('cropImage draws the area at the width asked for; null for a picture it can\'t load', async () => {
    const c = document.createElement('canvas');
    c.width = 200; c.height = 100;
    const g = c.getContext('2d')!;
    g.fillStyle = '#ff0000'; g.fillRect(0, 0, 100, 100);
    g.fillStyle = '#0000ff'; g.fillRect(100, 0, 100, 100);
    const blob = await cropImage(c.toDataURL(), { x: 100, y: 0, width: 100, height: 100 }, { width: 50, type: 'image/png' });
    const bmp = await createImageBitmap(blob!);
    const o = new OffscreenCanvas(bmp.width, bmp.height).getContext('2d')!;
    o.drawImage(bmp, 0, 0);
    expect([blob!.type, bmp.width, bmp.height, [...o.getImageData(25, 25, 1, 1).data]]).toEqual(['image/png', 50, 50, [0, 0, 255, 255]]);
    expect(await cropImage('data:image/png;base64,broken', { x: 0, y: 0, width: 1, height: 1 })).toBe(null);
  });

  test('the failure text reads 4.5:1 on the frame in every theme', async () => {
    await render(<ImageCropper aria-label="Photo" src="data:image/png;base64,broken" />);
    await expect.element(page.getByText('The picture couldn’t be loaded.')).toBeVisible();
    const t = page.getByText('The picture couldn’t be loaded.').element() as HTMLElement;
    for (const th of THEMES) {
      document.documentElement.setAttribute('data-theme', th);
      expect(contrast(css(t).color, css(frame()).backgroundColor), th).toBeGreaterThanOrEqual(4.5);
    }
  });
});
