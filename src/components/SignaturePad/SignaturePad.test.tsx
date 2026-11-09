import * as React from 'react';
import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { THEMES, contrast, css, drag } from '../../../tools/test/vitest/helpers';
import { Field } from '../Field/Field';
import { idLabels } from '../../internal/labels';
import { SerupaProvider } from '../../internal/provider';
import { SignaturePad, signatureToPng, type SignatureChangeDetails, type SignatureValue } from './SignaturePad';

const el = (id: string) => document.getElementById(id) as HTMLElement;
const area = (root: Element) => root.querySelector('svg[role=img]') as SVGSVGElement;
const paths = (root: Element) => root.querySelectorAll('svg[role=img] path').length;
type Call = [SignatureValue | null, SignatureChangeDetails];

describe('SignaturePad', () => {
  test('a group named by aria-label and described by its how-to text; a "Signature method" switch on Draw; an empty drawing box named as empty; Undo and Clear off; ref, className and other props reach the root', async () => {
    const ref = React.createRef<HTMLDivElement>();
    await render(<SignaturePad id="x" ref={ref} aria-label="Signature" className="extra" data-x="y" />);
    const e = el('x');
    await expect.element(page.getByRole('group', { name: 'Signature' })).toBeInTheDocument();
    const how = document.getElementById(e.getAttribute('aria-describedby')!.split(' ')[0])!;
    expect([ref.current === e, e.className, e.dataset.x, e.dataset.component, how.textContent]).toEqual([true, 'dk-signature-pad extra', 'y', 'signature-pad', 'Draw your signature with a mouse, pen or finger, or choose Type to type your name.']);
    await expect.element(page.getByRole('radiogroup', { name: 'Signature method' })).toBeInTheDocument();
    await expect.element(page.getByRole('radio', { name: 'Draw' })).toBeChecked();
    await expect.element(page.getByRole('img', { name: 'Signature area, empty' })).toBeInTheDocument();
    await expect.element(page.getByRole('button', { name: 'Undo' })).toBeDisabled();
    await expect.element(page.getByRole('button', { name: 'Clear' })).toBeDisabled();
    // the drawing box isn't a Tab stop: nothing in it works by keyboard, and Type is the way
    expect([area(e).hasAttribute('tabindex'), css(area(e)).touchAction]).toEqual([false, 'none']);
  });

  test('drawing: each stroke is a path, named "Signature drawn"; onValueChange gets method "draw", the SVG and an empty name; Undo takes the last stroke, Clear the rest, and focus goes back to the switch', async () => {
    const calls: Call[] = [];
    await render(<SignaturePad id="d" aria-label="Signature" onValueChange={(v, d) => calls.push([v, d])} />);
    const root = el('d');
    await drag(area(root), { x: 20, y: 100 }, { x: 140, y: 60 });
    await drag(area(root), { x: 160, y: 100 }, { x: 260, y: 90 });
    expect(paths(root)).toBe(2);
    await expect.element(page.getByRole('img', { name: 'Signature drawn' })).toBeInTheDocument();
    const [v, d] = calls[calls.length - 1];
    expect([v!.method, v!.name, d.reason, (v!.svg.match(/<path /g) || []).length, v!.svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg"')]).toEqual(['draw', '', 'draw', 2, true]);
    await page.getByRole('button', { name: 'Undo' }).click();
    expect([paths(root), calls[calls.length - 1][1].reason, (calls[calls.length - 1][0]!.svg.match(/<path /g) || []).length]).toEqual([1, 'undo', 1]);
    await page.getByRole('button', { name: 'Clear' }).click();
    expect([paths(root), calls[calls.length - 1]]).toEqual([0, [null, { reason: 'clear' }]]);
    await expect.poll(() => document.activeElement?.getAttribute('role')).toBe('radio');
  });

  test('typing: the arrow key picks Type, the "Full name" field is the signature; the value carries the trimmed name and an SVG with it as text, escaped', async () => {
    const calls: Call[] = [];
    await render(<SignaturePad id="t" aria-label="Signature" onValueChange={(v, d) => calls.push([v, d])} />);
    await userEvent.keyboard('{Tab}');
    expect(document.activeElement?.getAttribute('role')).toBe('radio');
    await userEvent.keyboard('{ArrowRight}');
    expect(calls[calls.length - 1]).toEqual([null, { reason: 'method' }]);
    await expect.element(page.getByRole('radio', { name: 'Type' })).toBeChecked();
    await userEvent.type(page.getByRole('textbox', { name: 'Full name' }), '  Dewi & Sari ');
    const [v, d] = calls[calls.length - 1];
    expect([v!.method, v!.name, d.reason, />Dewi &amp; Sari<\/text><\/svg>$/.test(v!.svg)]).toEqual(['type', 'Dewi & Sari', 'type', true]);
    expect(el('t').querySelector('text')!.textContent).toBe('Dewi & Sari');
  });

  test('a drawing and a typed name are kept apart: switching back to Draw gives the strokes again', async () => {
    const calls: Call[] = [];
    await render(<SignaturePad id="k" aria-label="Signature" onValueChange={(v, d) => calls.push([v, d])} />);
    await drag(area(el('k')), { x: 20, y: 100 }, { x: 140, y: 60 });
    await page.getByRole('radio', { name: 'Type' }).click();
    await userEvent.type(page.getByRole('textbox', { name: 'Full name' }), 'Dewi');
    await page.getByRole('radio', { name: 'Draw' }).click();
    expect([paths(el('k')), calls[calls.length - 1][0]!.method]).toEqual([1, 'draw']);
  });

  test('form: the hidden input sends the SVG under its name ("" while empty) and form.reset() empties it', async () => {
    await render(<form id="f"><SignaturePad id="s" aria-label="Signature" name="signature" /></form>);
    const form = el('f') as HTMLFormElement;
    expect(new FormData(form).get('signature')).toBe('');
    await drag(area(el('s')), { x: 20, y: 100 }, { x: 140, y: 60 });
    expect(new FormData(form).get('signature') as string).toMatch(/^<svg [^>]*><g [^>]*><path d="M[^"]+"\/><\/g><\/svg>$/);
    form.reset();
    await expect.poll(() => [paths(el('s')), new FormData(form).get('signature')]).toEqual([0, '']);
  });

  test('in a Field: the label names the group, the hint and error describe it, and it is marked invalid', async () => {
    await render(<Field label="Sign here" hint="Draw or type." error="Please sign."><SignaturePad id="fs" /></Field>);
    const g = el('fs');
    await expect.element(page.getByRole('group', { name: 'Sign here' })).toBeInTheDocument();
    const said = g.getAttribute('aria-describedby')!.split(' ').map((id) => document.getElementById(id)!.textContent).join(' | ');
    expect([said.includes('Draw or type.'), said.includes('Please sign.'), g.querySelector('[role=radiogroup]')!.getAttribute('aria-invalid')]).toEqual([true, true, 'true']);
    // the switch inside keeps its own name, not the Field's
    await expect.element(page.getByRole('radiogroup', { name: 'Signature method' })).toBeInTheDocument();
  });

  test('disabled: a drag draws nothing, the switch and buttons are off; ref.current.focus() and autoFocus land on the switch', async () => {
    const ref = React.createRef<HTMLDivElement>();
    await render(<><SignaturePad id="off" aria-label="Off" disabled /><SignaturePad id="on" aria-label="On" ref={ref} /></>);
    await drag(area(el('off')), { x: 20, y: 100 }, { x: 140, y: 60 });
    expect([paths(el('off')), el('off').querySelector<HTMLButtonElement>('[role=radio]')!.disabled]).toEqual([0, true]);
    ref.current!.focus();
    expect(el('on').contains(document.activeElement) && document.activeElement!.getAttribute('role')).toBe('radio');
  });

  test('signing without dragging: a tap on Type, then the name field, signs with one pointer and the keyboard alone (WCAG 2.5.7)', async () => {
    const calls: Call[] = [];
    await render(<SignaturePad id="np" aria-label="Signature" onValueChange={(v, d) => calls.push([v, d])} />);
    await page.getByRole('radio', { name: 'Type' }).click();
    await page.getByRole('textbox', { name: 'Full name' }).click();
    await userEvent.keyboard('Dewi');
    expect([calls[calls.length - 1][0]!.method, calls[calls.length - 1][0]!.name]).toEqual(['type', 'Dewi']);
  });

  test('defaultValue shows a saved signature, drawn or typed, and form.reset() goes back to it', async () => {
    const drawn: SignatureValue = { method: 'draw', name: '', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="160" viewBox="0 0 300 160"><g><path d="M20 100L140 60"/><path d="M160 100h0"/></g></svg>' };
    await render(<form id="dvf"><SignaturePad id="dv" aria-label="Drawn" name="sig" defaultValue={drawn} /><SignaturePad id="dt" aria-label="Typed" defaultValue={{ method: 'type', name: 'Dewi', svg: '' }} /></form>);
    expect([...el('dv').querySelectorAll('svg[role=img] path')].map((p) => p.getAttribute('d'))).toEqual(['M20 100L140 60', 'M160 100h0']);
    await expect.element(page.getByRole('radio', { name: 'Type' }).nth(1)).toBeChecked();
    await expect.element(page.getByRole('textbox', { name: 'Full name' })).toHaveValue('Dewi');
    await page.getByRole('button', { name: 'Clear' }).click();
    expect(paths(el('dv'))).toBe(0);
    (el('dvf') as HTMLFormElement).reset();
    await expect.poll(() => paths(el('dv'))).toBe(2);
  });

  test('value controls it: a stroke the app does not take goes away, and a value set by the app is shown', async () => {
    function Controlled() {
      const [v, setV] = React.useState<SignatureValue | null>(null);
      return <><SignaturePad id="cv" aria-label="Signature" value={v} onValueChange={() => {}} />
        <button type="button" onClick={() => setV({ method: 'type', name: 'Sari', svg: '' })}>Fill</button></>;
    }
    await render(<Controlled />);
    await drag(area(el('cv')), { x: 20, y: 100 }, { x: 140, y: 60 });
    await expect.poll(() => paths(el('cv'))).toBe(0);
    await page.getByRole('button', { name: 'Fill' }).click();
    await expect.element(page.getByRole('textbox', { name: 'Full name' })).toHaveValue('Sari');
  });

  test('in Indonesian under id-ID labels', async () => {
    await render(<SerupaProvider locale="id-ID" labels={idLabels}><SignaturePad id="i" aria-label="Tanda tangan" /></SerupaProvider>);
    await expect.element(page.getByRole('radiogroup', { name: 'Cara tanda tangan' })).toBeInTheDocument();
    await expect.element(page.getByRole('radio', { name: 'Ketik' })).toBeInTheDocument();
    await expect.element(page.getByRole('button', { name: 'Urungkan' })).toBeInTheDocument();
  });

  test('signatureToPng makes a PNG of the SVG at twice its size', async () => {
    const png = await signatureToPng('<svg xmlns="http://www.w3.org/2000/svg" width="60" height="20" viewBox="0 0 60 20"><path d="M2 10L58 10" stroke="#000"/></svg>');
    const bmp = await createImageBitmap(png!);
    expect([png!.type, bmp.width, bmp.height]).toEqual(['image/png', 120, 40]);
  });

  test('on the surface, the how-to text and the ink read 4.5:1, and the box outline and the line 3:1, in all six themes', async () => {
    await render(<SignaturePad id="c" aria-label="Signature" />);
    const root = el('c'), box = root.querySelector('.dk-signature-pad__box')!, line = root.querySelector('.dk-signature-pad__line')!, ink = root.querySelector('.dk-signature-pad__strokes')!;
    for (const th of THEMES) {
      document.documentElement.setAttribute('data-theme', th);
      const bg = css(box).backgroundColor;
      expect(contrast(css(root.querySelector('p')).color, bg), th + ' hint').toBeGreaterThanOrEqual(4.5);
      expect(contrast(css(box).borderTopColor, bg), th + ' outline').toBeGreaterThanOrEqual(3);
      expect(contrast(css(line).borderBottomColor, bg), th + ' line').toBeGreaterThanOrEqual(3);
      expect(contrast(css(ink).stroke, bg), th + ' ink').toBeGreaterThanOrEqual(4.5);
    }
    document.documentElement.removeAttribute('data-theme');
  });
});
