import * as React from 'react';
import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { Stepper } from './Stepper';
import { useSteps } from './useSteps';
import type { UseSteps } from './useSteps';

const el = (id: string) => document.getElementById(id) as HTMLElement;
const STEPS = [{ title: 'Account' }, { title: 'Profile' }, { title: 'Review' }];

let api: UseSteps;
function Form(props: { validate?: (i: number) => boolean | Promise<boolean>; onComplete?: () => void; defaultStep?: number }) {
  const s = useSteps({ steps: STEPS, ...props });
  api = s;
  return (
    <form onSubmit={(e) => { e.preventDefault(); void s.next(); }}>
      <Stepper id="stepper" {...s.stepperProps} />
      {STEPS.map((step, i) => (
        <section key={i} data-testid={'p' + i} {...s.panelProps(i)}>
          <h2 {...s.headingProps(i)}>{step.title}</h2>
          <input aria-label={'field ' + i} id={'f' + i} />
        </section>
      ))}
      <button type="button" id="back" onClick={s.back} disabled={s.isFirst}>Back</button>
      <button type="submit" id="next">{s.isLast ? 'Finish' : 'Next'}</button>
    </form>
  );
}
const shown = () => STEPS.map((_, i) => !(document.querySelector(`[data-testid=p${i}]`) as HTMLElement).hidden);
const current = () => el('stepper').querySelector('[aria-current="step"]')?.textContent ?? '';

describe('useSteps', () => {
  test('one step shown, the others rendered and hidden; each panel named by its heading; focus stays put on the first render', async () => {
    await render(<Form />);
    expect(shown()).toEqual([true, false, false]);
    const p1 = document.querySelector('[data-testid=p1]') as HTMLElement;
    expect(document.getElementById(p1.getAttribute('aria-labelledby')!)!.textContent).toBe('Profile');
    expect(current()).toContain('Account');
    expect(document.activeElement).toBe(document.body);
  });

  test('Next moves on and focus goes to the new step\'s heading; Back keeps what was typed (3.3.7)', async () => {
    await render(<Form />);
    await userEvent.type(el('f0'), 'dewi@example.com');
    await userEvent.click(el('next'));
    await expect.poll(shown).toEqual([false, true, false]);
    expect([document.activeElement!.textContent, current()]).toEqual(['Profile', expect.stringContaining('Profile')]);
    await userEvent.click(el('back'));
    await expect.poll(shown).toEqual([true, false, false]);
    expect([(el('f0') as HTMLInputElement).value, document.activeElement!.textContent]).toEqual(['dewi@example.com', 'Account']);
  });

  test('a step that fails its check stays, marked with an error in the Stepper; passing clears the mark', async () => {
    let ok = false;
    await render(<Form validate={(i) => i !== 0 || ok} />);
    expect(await api.next()).toBe(false);
    expect(shown()).toEqual([true, false, false]);
    await expect.poll(() => el('stepper').textContent).toContain('has an error');
    ok = true;
    expect(await api.next()).toBe(true);
    await expect.poll(shown).toEqual([false, true, false]);
    expect(el('stepper').textContent).not.toContain('has an error');
  });

  test('an async check: a second Next while it runs does nothing, so one press of Enter and a click make one move', async () => {
    let calls = 0;
    let release: (v: boolean) => void = () => {};
    await render(<Form validate={() => { calls++; return new Promise<boolean>((r) => { release = r; }); }} />);
    const a = api.next(), b = api.next();
    expect(await b).toBe(false);
    release(true);
    expect(await a).toBe(true);
    await expect.poll(shown).toEqual([false, true, false]);
    expect(calls).toBe(1);
  });

  test('goTo forward checks every step in between and stops at the first that fails; a click on a finished step goes back without a check', async () => {
    const checked: number[] = [];
    await render(<Form validate={(i) => { checked.push(i); return i !== 1; }} />);
    expect(await api.goTo(2)).toBe(false);
    await expect.poll(shown).toEqual([false, true, false]);
    expect(checked).toEqual([0, 1]);
    await userEvent.click(el('stepper').querySelector('button')!);
    await expect.poll(shown).toEqual([true, false, false]);
    expect(checked).toEqual([0, 1]);
  });

  test('Next on the last step checks it, then calls onComplete; defaultStep starts there; Back on the first does nothing', async () => {
    const done: string[] = [];
    await render(<Form defaultStep={2} validate={() => true} onComplete={() => done.push('submit')} />);
    expect([shown(), api.isLast, el('next').textContent]).toEqual([[false, false, true], true, 'Finish']);
    await userEvent.click(el('next'));
    await expect.poll(() => done).toEqual(['submit']);
    await api.goTo(0);
    await expect.poll(() => api.isFirst).toBe(true);
    api.back();
    expect(await api.goTo(0)).toBe(false);
    expect(shown()).toEqual([true, false, false]);
  });
});
