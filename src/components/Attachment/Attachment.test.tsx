import * as React from 'react';
import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { THEMES, contrast, css } from '../../../tools/test/vitest/helpers';
import { SerupaProvider } from '../../internal/provider';
import { idLabels } from '../../internal/labels';
import { Attachment, attachmentKind } from './Attachment';

const root = (id: string) => document.getElementById(id) as HTMLElement;
// Parts found as people and screen readers meet them: the kind and size are the name's description (an id ending -meta),
// the message an id ending -error, the name the element titled with it, the icon the first one.
const part = (el: HTMLElement, which: 'meta' | 'error') => el.querySelector(`[id$="-${which}"]`) as HTMLElement;
const meta = (el: HTMLElement) => part(el, 'meta').textContent;
const nameParts = (el: HTMLElement) => [...el.querySelectorAll<HTMLElement>('[dir="auto"][title] > [aria-hidden]')];
const visible = (el: HTMLElement) => nameParts(el).map((x) => x.textContent).join('');

describe('Attachment', () => {
  test('a <div> with the name, kind and size; ref, className and other props reach it', async () => {
    const ref = React.createRef<HTMLDivElement>();
    await render(<SerupaProvider locale="en-US"><Attachment id="x" ref={ref} className="extra" data-x="y" name="Invoice.pdf" bytes={1_500_000} /></SerupaProvider>);
    const e = root('x');
    expect([e.tagName, ref.current === e, e.className, e.dataset.x, e.dataset.component, e.dataset.kind]).toEqual(['DIV', true, 'dk-attachment extra', 'y', 'attachment', 'pdf']);
    expect([visible(e), meta(e)]).toEqual(['Invoice.pdf', 'PDF1.5 MB']);
    // The name is read once: the two cut parts are hidden and a full copy is there for screen readers.
    expect(e.querySelector('[title] > :not([aria-hidden])')!.textContent).toBe('Invoice.pdf');
    expect(e.querySelector('[title]')!.getAttribute('title')).toBe('Invoice.pdf');
  });

  test('the kind comes from the type first, then the extension, else "File"; kind overrides both', () => {
    expect([
      attachmentKind('scan', 'application/pdf'), attachmentKind('a.bin', 'image/heic'), attachmentKind('Q3.XLSX'), attachmentKind('x', 'text/csv'),
      attachmentKind('notes.docx'), attachmentKind('deck.key'), attachmentKind('all.tar.gz'), attachmentKind('app.tsx'), attachmentKind('a', 'application/json; charset=utf-8'),
      attachmentKind('memo.m4a'), attachmentKind('clip.webm'), attachmentKind('README'), attachmentKind('.env'), attachmentKind('data.bin', 'application/octet-stream'),
    ]).toEqual(['pdf', 'image', 'sheet', 'sheet', 'doc', 'slides', 'archive', 'code', 'code', 'audio', 'video', 'other', 'other', 'other']);
  });

  test('kind sets the icon and word when the file says nothing', async () => {
    await render(<Attachment id="k" name="Floor plan" kind="image" />);
    expect([root('k').dataset.kind, meta(root('k')), root('k').querySelector('[data-icon]')!.getAttribute('data-icon')]).toEqual(['image', 'Image', 'image']);
  });

  test('without bytes there is no size, and no separator dot', async () => {
    await render(<Attachment id="n" name="backup.bin" />);
    expect([meta(root('n')), part(root('n'), 'meta').children.length]).toEqual(['File', 1]);
  });

  test('a long name keeps its extension and last characters, and doesn\'t widen its container', async () => {
    const long = 'Donaudampfschifffahrtsgesellschaftskapitänswitwenrentenversicherung-2026.pdf';
    await render(<div style={{ width: '200px' }}><Attachment id="l" name={long} onRemove={() => {}} /></div>);
    const e = root('l');
    await expect.poll(() => nameParts(e).length).toBe(2);
    expect(nameParts(e)[1].textContent).toBe('nversicherung-2026.pdf'.slice(-10));
    expect(e.getBoundingClientRect().width).toBeLessThanOrEqual(200);
    const start = nameParts(e)[0];
    expect(start.scrollWidth).toBeGreaterThan(start.clientWidth);
  });

  test('a name that fits is one run of text, and is cut again only when it stops fitting', async () => {
    await render(<div id="box" style={{ width: '420px' }}><Attachment id="w" name="Quarterly report final version.pdf" /></div>);
    const e = root('w');
    expect(nameParts(e).map((x) => x.textContent)).toEqual(['Quarterly report final version.pdf']);
    (document.getElementById('box') as HTMLElement).style.width = '160px';
    await expect.poll(() => nameParts(e).length).toBe(2);
    (document.getElementById('box') as HTMLElement).style.width = '420px';
    await expect.poll(() => nameParts(e).length).toBe(1);
  });

  // GR188: a Devanagari conjunct with its vowel sign, a ZWJ family emoji and a decomposed accent are each one character.
  const NAMES = ['राष्ट्रीय रिपोर्ट.pdf', '👨‍👩‍👧‍👦.png', 'Cafe\u0301 menu.pdf'];
  test('Devanagari, a ZWJ emoji and a decomposed accent show whole: one run while they fit', async () => {
    await render(<div style={{ width: '420px' }}>{NAMES.map((n, i) => <Attachment key={n} id={'g' + i} name={n} />)}</div>);
    NAMES.forEach((n, i) => expect(nameParts(root('g' + i)).map((x) => x.textContent)).toEqual([n]));
  });

  test('when they don\'t fit, the cut falls between characters people see; an Arabic name is cut before a word, not inside it', async () => {
    const all = [...NAMES.map((n) => 'Lampiran panjang sekali untuk rapat bulanan ' + n), 'تقرير المبيعات السنوي للربع الأخير.pdf'];
    await render(<div style={{ width: '120px' }}>{all.map((n, i) => <Attachment key={n} id={'c' + i} name={n} />)}</div>);
    const seg = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
    for (const [i, n] of all.entries()) {
      const e = root('c' + i);
      await expect.poll(() => nameParts(e).length).toBe(2);
      const [a, b] = nameParts(e).map((x) => x.textContent);
      expect(a + b).toBe(n);
      expect(Array.from(seg.segment(n), (x) => x.index)).toContain(a.length);
    }
    const [a] = nameParts(root('c3')).map((x) => x.textContent);
    expect(a.endsWith(' ')).toBe(true);
  });

  test('an emoji or a name in another script isn\'t split inside a character', async () => {
    await render(<><Attachment id="e" name="🎉🎉🎉🎉🎉🎉🎉🎉 Ulang tahun.jpg" /><Attachment id="ar" name="تقرير.pdf" /></>);
    expect(visible(root('e'))).toBe('🎉🎉🎉🎉🎉🎉🎉🎉 Ulang tahun.jpg');
    expect(root('ar').querySelector('[title]')!.getAttribute('dir')).toBe('auto');
  });

  test('the size follows the locale\'s digits and units, and the kind word the labels', async () => {
    await render(<SerupaProvider locale="id-ID" labels={idLabels}><Attachment id="i" name="Foto.jpg" bytes={1_500_000} /></SerupaProvider>);
    expect(meta(root('i'))).toBe('Gambar1,5 MB');
  });

  test('href makes the name a link named by the file and described by its kind and size; download passes through', async () => {
    await render(<SerupaProvider locale="en-US"><Attachment id="h" name="Q3.xlsx" bytes={88_000} href="/files/q3" download /></SerupaProvider>);
    const link = page.getByRole('link', { name: 'Q3.xlsx' });
    await expect.element(link).toHaveAttribute('href', '/files/q3');
    await expect.element(link).toHaveAttribute('download', '');
    await expect.element(link).toHaveAccessibleDescription('Spreadsheet 88 kB');
  });

  test('a link takes focus with Tab and shows the focus ring', async () => {
    await render(<><button>before</button><Attachment name="Q3.xlsx" href="#q3" /></>);
    await userEvent.click(page.getByRole('button', { name: 'before' }));
    await userEvent.tab();
    const link = page.getByRole('link', { name: 'Q3.xlsx' }).element() as HTMLElement;
    expect(document.activeElement).toBe(link);
    expect(css(link).outlineStyle).toBe('solid');
  });

  test('onRemove adds a "Remove <name>" button that calls it; removeLabel renames it', async () => {
    let removed = 0;
    await render(<><Attachment name="a.pdf" onRemove={() => removed++} /><Attachment name="b.pdf" onRemove={() => {}} removeLabel={(n) => `Delete ${n}`} /></>);
    await userEvent.click(page.getByRole('button', { name: 'Remove a.pdf' }));
    expect(removed).toBe(1);
    await expect.element(page.getByRole('button', { name: 'Delete b.pdf' })).toBeVisible();
  });

  test('without onRemove there is no button at all', async () => {
    await render(<Attachment id="nb" name="a.pdf" />);
    expect(root('nb').querySelectorAll('button')).toHaveLength(0);
  });

  test('progress shows a bar named by the file, with its value; null leaves the value out', async () => {
    await render(<><Attachment name="photo.jpg" progress={45} /><Attachment name="assets.zip" progress={null} /><Attachment name="x.png" progress={180} /></>);
    await expect.element(page.getByRole('progressbar', { name: 'photo.jpg' })).toHaveAttribute('aria-valuenow', '45');
    await expect.element(page.getByRole('progressbar', { name: 'assets.zip' })).not.toHaveAttribute('aria-valuenow');
    await expect.element(page.getByRole('progressbar', { name: 'x.png' })).toHaveAttribute('aria-valuenow', '100');
  });

  test('error: a danger outline and "Upload failed" (or its own message), no bar; "Try again" with onRetry, named with the file', async () => {
    let tries = 0;
    await render(<><Attachment id="f" name="Pitch.pptx" progress={50} error onRetry={() => tries++} /><Attachment id="g" name="Demo.mp4" error="Larger than 100 MB" /></>);
    expect([root('f').classList.contains('dk-attachment--error'), root('f').querySelector('[role=progressbar]'), part(root('f'), 'error').textContent.replace(/^error/, '')])
      .toEqual([true, null, 'Upload failed']);
    const retry = page.getByRole('button', { name: 'Try again Pitch.pptx' });
    await expect.element(retry).toHaveAccessibleDescription(/Upload failed/);
    await userEvent.click(retry);
    expect(tries).toBe(1);
    expect([part(root('g'), 'error').textContent.replace(/^error/, ''), root('g').querySelectorAll('button').length]).toEqual(['Larger than 100 MB', 0]);
  });

  test('error={false} and error="" are not a failure', async () => {
    await render(<><Attachment id="e1" name="a.pdf" error={false} /><Attachment id="e2" name="a.pdf" error="" /></>);
    expect([root('e1').className, root('e2').className]).toEqual(['dk-attachment', 'dk-attachment']);
  });

  test('disabled: the name is plain text, and remove and retry are off', async () => {
    let calls = 0;
    await render(<Attachment id="d" name="a.pdf" href="#a" error onRetry={() => calls++} onRemove={() => calls++} disabled />);
    expect([root('d').querySelector('a'), [...root('d').querySelectorAll('button')].map((b) => b.disabled)]).toEqual([null, [true, true]]);
    expect(calls).toBe(0);
  });

  test('its name, kind, size, link and error read 4.5:1, and its outline and icon 3:1, in all six themes', async () => {
    await render(<><Attachment id="c" name="a.pdf" bytes={10} /><Attachment id="cl" name="a.pdf" href="#a" /><Attachment id="ce" name="a.pdf" error /></>);
    for (const th of THEMES) {
      document.documentElement.setAttribute('data-theme', th);
      const bg = css(root('c')).backgroundColor, page = css(document.body).backgroundColor;
      expect(contrast(css(root('c')).color, bg), th + ' name').toBeGreaterThanOrEqual(4.5);
      expect(contrast(css(part(root('c'), 'meta')).color, bg), th + ' meta').toBeGreaterThanOrEqual(4.5);
      expect(contrast(css(root('cl').querySelector('a')).color, bg), th + ' link').toBeGreaterThanOrEqual(4.5);
      expect(contrast(css(part(root('ce'), 'error')).color, bg), th + ' error').toBeGreaterThanOrEqual(4.5);
      expect(contrast(css(root('c').querySelector('[data-icon]')).color, bg), th + ' icon').toBeGreaterThanOrEqual(3);
      expect(contrast(css(root('ce')).borderTopColor, page), th + ' error outline').toBeGreaterThanOrEqual(3);
    }
    document.documentElement.removeAttribute('data-theme');
  });
});
