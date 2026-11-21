import * as React from 'react';
import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { Pagination } from '../components/Pagination/Pagination';
import { labels, locale, pseudo } from '../labels/pseudo';
import { DEFAULT_LABELS } from './labels';
import { SerupaProvider } from './provider';

describe('pseudo-locale', () => {
  test('accents every letter, grows the text at least 40% and marks both ends', () => {
    expect(pseudo('Save')).toBe('⟦Šááṽéé⟧');
    expect(pseudo('PDF')).toBe('⟦ÞÐƑ ~~⟧');
    for (const t of ['Close', 'Next page', 'Items per page']) expect(pseudo(t).length - 2).toBeGreaterThanOrEqual(t.length * 1.4);
    expect(pseudo('')).toBe('');
    expect(pseudo('3 × 4')).toBe('⟦3 × 4 ~~⟧');
  });

  test('a function label keeps the names and counts it is given, and still words the values it names', () => {
    expect(labels.fileRemoved('Report.pdf')).toContain('Report.pdf');
    expect(labels.itemsOf('21', '30', '1,245')).toMatch(/^⟦21–30 ööƒ 1,245/);
    expect(labels.chartKind('line')).not.toContain('line');
    expect(labels.invalidValue({ reason: 'valueMissing', type: 'text', length: 0, minLength: 0, maxLength: 0, min: '', max: '', step: '', title: '' })).toBe(DEFAULT_LABELS.invalidValue({ reason: 'valueMissing', type: 'text', length: 0, minLength: 0, maxLength: 0, min: '', max: '', step: '', title: '' }));
  });

  test('the components say the pseudo words under the provider, with English dates and numbers (en-XA)', async () => {
    await render(<SerupaProvider locale={locale} labels={labels}><Pagination count={3} defaultPage={2} /></SerupaProvider>);
    expect(document.querySelector('nav')?.getAttribute('aria-label')).toBe(pseudo('Pagination'));
    expect([...document.querySelectorAll('nav button')].at(-1)?.getAttribute('aria-label')).toBe(pseudo('Next page'));
  });
});
