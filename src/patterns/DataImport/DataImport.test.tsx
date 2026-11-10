import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { DataImport, checkRows, guessMapping, mappingProblems, parseCsv } from './DataImport';

const active = () => document.activeElement as HTMLElement;
const select = (id: string) => document.getElementById(id) as HTMLSelectElement;
const CSV = 'Full name,E-mail,Mobile,Town\nAni,ani@example.com,0812,Bandung\nCitra,citra@example,,Surabaya\nDewi,dewi@example.com,,Yogyakarta\n';
const FILE = { name: 'customers.csv', text: CSV };

// Data import: a CSV file, its columns matched, every row checked and shown before anything is saved, then what
// happened in words; each step's heading takes focus, and every problem is listed with what to do.
describe('Patterns/Data import', () => {
  test('reading a CSV file: quoted cells with commas, quotes and line breaks; empty lines left out', () => {
    expect(parseCsv('﻿a,b\r\n"x, y","say ""hi"""\n\n"two\nlines",z')).toEqual([['a', 'b'], ['x, y', 'say "hi"'], ['two\nlines', 'z']]);
  });

  test('columns matched by their headings; a required field unmatched or a column used twice is a problem', () => {
    const m = guessMapping(['Full name', 'E-mail', 'Notes']);
    expect(m).toEqual({ name: 0, email: 1, phone: -1, city: -1 });
    expect(mappingProblems(m, ['Full name', 'E-mail', 'Notes'])).toEqual([]);
    expect(mappingProblems({ name: 0, email: -1, phone: 0, city: -1 }, ['Full name', 'E-mail']).map((e) => [e.field, e.message])).toEqual([
      ['import-email', 'Choose the column that holds each customer’s email'],
      ['import-phone', 'Choose another column for phone: “Full name” is already used for name'],
    ]);
  });

  test('each row checked: a missing name, an email that isn’t one, the same email twice; a known email updates', () => {
    const rows = checkRows([['Ani', 'ani@example.com'], ['', 'x@example'], ['Ani 2', 'ANI@example.com'], ['Budi', 'budi@example.com']], { name: 0, email: 1, phone: -1, city: -1 }, ['budi@example.com']);
    expect(rows.map((r) => [r.line, r.problems, r.update])).toEqual([
      [2, [], false], [3, ['No name', '“x@example” isn’t an email address'], false], [4, ['Same email as line 2'], false], [5, [], true],
    ]);
  });

  test('one main and one h1, the skip link first; Continue with no file lists the problem and focuses it', async () => {
    await render(<DataImport />);
    expect([document.querySelectorAll('main').length, document.querySelectorAll('h1').length]).toEqual([1, 1]);
    await userEvent.tab();
    expect(active().getAttribute('href')).toBe('#main');
    await userEvent.click(page.getByRole('button', { name: 'Continue' }));
    await expect.poll(() => active().textContent).toMatch(/There is a problem/);
    expect(page.getByRole('link', { name: 'Choose a CSV file to import' }).elements()).toHaveLength(1);
  });

  test('a file chosen goes on to matching, with the heading focused and the columns matched by their headings', async () => {
    await render(<DataImport />);
    await userEvent.upload(document.getElementById('import-file') as HTMLInputElement, [new File([CSV], 'customers.csv', { type: 'text/csv' })]);
    await userEvent.click(page.getByRole('button', { name: 'Continue' }));
    await expect.poll(() => active().textContent).toBe('Match columns');
    expect([select('import-name').value, select('import-email').value, select('import-phone').value, select('import-city').value]).toEqual(['0', '1', '2', '3']);
    expect(page.getByRole('navigation').element().textContent).toMatch(/Choose a file/);
  });

  test('a file with headings only says so', async () => {
    await render(<DataImport />);
    await userEvent.upload(document.getElementById('import-file') as HTMLInputElement, [new File(['Name,Email\n'], 'empty.csv', { type: 'text/csv' })]);
    await userEvent.click(page.getByRole('button', { name: 'Continue' }));
    await expect.poll(() => page.getByRole('link', { name: /empty\.csv has no rows/ }).elements().length).toBe(1);
  });

  test('matching: a field left out or a column used twice is listed; Back keeps the file, and the matches are kept', async () => {
    await render(<DataImport start="match" file={FILE} />);
    await userEvent.selectOptions(select('import-email'), 'Not in the file');
    await userEvent.selectOptions(select('import-city'), 'Full name');
    await userEvent.click(page.getByRole('button', { name: 'Check rows' }));
    await expect.poll(() => active().textContent).toMatch(/There are 2 problems/);
    await userEvent.click(page.getByRole('button', { name: 'Back' }));
    await userEvent.click(page.getByRole('button', { name: 'Continue' }));
    await expect.poll(() => active().textContent).toBe('Match columns');
    expect([select('import-email').value, select('import-city').value]).toEqual(['-1', '0']);
  });

  test('checking: rows with problems first, in words; importing them waits for "skip"; then what happened is listed', async () => {
    const onImport = vi.fn();
    await render(<DataImport start="check" file={FILE} existing={['ani@example.com']} onImport={onImport} />);
    expect(page.getByRole('main').element().textContent).toMatch(/2 rows are ready: 1 new customer and 1 update to customers you have\. 1 row has problems, listed first\. Nothing is saved until you import\./);
    const rows = page.getByRole('row').elements().slice(1).map((r) => [...r.querySelectorAll('td')].map((c) => c.textContent));
    expect(rows.map((r) => [r[0], r[1], r[2]])).toEqual([['3', 'Problem', '“citra@example” isn’t an email address'], ['2', 'Update', ''], ['4', 'New', '']]);
    await userEvent.click(page.getByRole('button', { name: 'Import 2 customers' }));
    await expect.poll(() => active().textContent).toMatch(/There is a problem/);
    expect(onImport).not.toHaveBeenCalled();
    await userEvent.click(page.getByRole('checkbox', { name: 'Skip the 1 row with problems' }));
    await userEvent.click(page.getByRole('button', { name: 'Import 2 customers' }));
    await expect.poll(() => active().textContent).toBe('Import finished');
    expect(onImport).toHaveBeenCalledWith([{ name: 'Ani', email: 'ani@example.com', phone: '0812', city: 'Bandung' }, { name: 'Dewi', email: 'dewi@example.com', phone: '', city: 'Yogyakarta' }]);
    expect(page.getByRole('listitem').elements().filter((l) => !l.closest('nav')).map((l) => l.textContent)).toEqual(['1 customer added', '1 customer updated', '1 row skipped, still in your file to fix']);
    await userEvent.click(page.getByRole('button', { name: 'Import another file' }));
    await expect.poll(() => active().textContent).toBe('Choose a file');
  });

  test('an import that fails says so, saves nothing, and Try again goes on', async () => {
    let fail = true;
    const onImport = vi.fn(() => (fail ? Promise.reject(new Error('503')) : Promise.resolve()));
    await render(<DataImport start="check" file={{ name: 'ok.csv', text: 'Name,Email\nAni,ani@example.com\n' }} onImport={onImport} />);
    await userEvent.click(page.getByRole('button', { name: 'Import 1 customer' }));
    await expect.element(page.getByText('Nothing was saved. Check your connection and try again.')).toBeVisible();
    fail = false;
    await userEvent.click(page.getByRole('button', { name: 'Try again' }));
    await expect.poll(() => active().textContent).toBe('Import finished');
    expect(onImport).toHaveBeenCalledTimes(2);
  });
});
