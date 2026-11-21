import * as React from 'react';
import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { Recipe, scaleAmount } from './Recipe';
import { SerupaProvider } from '../../internal/provider';
import { formatDuration } from '../../components/Duration/Duration';

// A time as the browser's own language writes it, which the second-language runs change.
const mins = (n: number, locale?: string) => formatDuration(n, locale, { unit: 'minute' });
// Shown, a number and its unit are held together with a no-break space.
const spaced = (t: string | null | undefined) => (t ?? '').replace(/\u00a0/g, ' ');

const active = () => document.activeElement as HTMLElement;
const norm = (t: string | null | undefined) => (t ?? '').replace(/[٠-٩]/g, (c) => String(c.charCodeAt(0) - 0x660)).replace(/٫/g, '.');
const ingredients = () => [...document.querySelectorAll('[aria-labelledby="recipe-ingredients"] li')].map((l) => norm(l.textContent));

// Recipe: the facts as a description list, ingredients that rescale and say so, and each ingredient and step a checkbox
// named by its text, a ticked one struck through and its step saying "done".
describe('Patterns/Recipe', () => {
  test('amounts for more or fewer people', () => {
    expect([scaleAmount(2, 4, 2), scaleAmount(1.5, 4, 6), scaleAmount(250, 4, 6), scaleAmount(1, 4, 3), scaleAmount(0.5, 4, 1)]).toEqual([1, 2.25, 375, 0.75, 0.25]);
  });

  test('one main and h1, the skip link first, the picture described, and the facts', async () => {
    const screen = await render(<Recipe />);
    await userEvent.tab();
    expect(active().getAttribute('href')).toBe('#main');
    expect([document.querySelectorAll('main').length, document.querySelector('h1')?.textContent]).toEqual([1, 'Red lentil soup']);
    expect(screen.getByRole('img', { name: /^A bowl of orange lentil soup/ }).elements()).toHaveLength(1);
    expect(spaced(document.querySelector('dl')?.textContent)).toBe(`Prep${mins(10)}Cook${mins(35)}Ready in${mins(45)}`);
    expect(document.querySelectorAll('[aria-labelledby="recipe-steps"] ol > li')).toHaveLength(4);
  });

  test('the times read in the page\'s language, as Indonesian writes them: "10 mnt", not "10 min"', async () => {
    await render(<SerupaProvider locale="id"><Recipe /></SerupaProvider>);
    expect([spaced(document.querySelector('dl')?.textContent), document.querySelector('dl time')?.getAttribute('datetime')]).toEqual([`Prep${mins(10, 'id')}Cook${mins(35, 'id')}Ready in${mins(45, 'id')}`, 'PT10M']);
  });

  test('Servings rescales every amount and says so', async () => {
    const screen = await render(<Recipe />);
    expect(ingredients()[4]).toBe('250 g red lentils, rinsed');
    await screen.getByRole('spinbutton', { name: /^Servings/ }).fill('6');
    await userEvent.tab();
    await expect.poll(() => ingredients()[4]).toBe('375 g red lentils, rinsed');
    expect(ingredients()[3]).toMatch(/^2[.,]25 tsp ground cumin/);
    expect(ingredients()[8]).toBe('Salt and pepper, to taste');
    await expect.poll(() => norm(document.body.textContent)).toContain('Amounts now for 6 people.');
  });

  test('ticking an ingredient or a step is named by its text, and a ticked step says done', async () => {
    const screen = await render(<Recipe />);
    const lentils = screen.getByRole('checkbox', { name: /red lentils, rinsed/ });
    await lentils.click();
    expect((lentils.element() as HTMLInputElement).checked).toBe(true);
    await lentils.click();
    expect((lentils.element() as HTMLInputElement).checked).toBe(false);
    const step = screen.getByRole('checkbox', { name: /^Add the garlic and cumin/ });
    await step.click();
    expect(norm(document.body.textContent)).toContain('1 of 4 steps done.');
    expect(norm(document.querySelectorAll('ol h3')[1]!.textContent)).toBe('Step 2, done');
    for (const n of [0, 2, 3]) await userEvent.click(document.querySelectorAll<HTMLInputElement>('ol input[type="checkbox"]')[n]!);
    expect(document.body.textContent).toContain('Every step done. Enjoy!');
    await step.click();
    expect(norm(document.querySelectorAll('ol h3')[1]!.textContent)).toBe('Step 2');
  });
});
