import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { expect, test } from 'vitest';
import { parts } from '../../tools/test/vitest/stories';

// Required and optional (docs/Forms.mdx): a form that marks its fields marks both kinds, so a field with neither leaves
// people guessing, and says once what the * means. Every block and pattern story is drawn; in each form that marks
// any field, every text field and every select still on its placeholder must say which it is: aria-required (the *),
// or "(optional)" in its label. A choice that starts with an answer (radios, a select with a default) can't be left
// empty and needs neither. A form that marks nothing (a search, a filter, sign-in, one field) is left alone.
const TEXT = 'input:not([type]), input[type="text"], input[type="email"], input[type="tel"], input[type="url"], input[type="number"], input[type="password"], textarea';
// A control that isn't an answer the form sends, with why: "<Pattern>/<its label>".
const NOT_AN_ANSWER: Record<string, string> = {
  'Timesheet/Add a project': 'picks a row to add to the table with the Add button beside it; the hours in the rows are what is sent',
};
const frame = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

for (const [name, list] of parts) {
  test(`${name}: a form that marks its fields marks every one, and says what * means`, async () => {
    const found: string[] = [];
    for (const [exportName, ui] of list) {
      const host = document.body.appendChild(document.createElement('div'));
      const root = createRoot(host);
      flushSync(() => root.render(ui));
      await frame();
      for (const form of host.querySelectorAll('form')) {
        const controls = [...form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(`${TEXT}, select`)]
          .filter((c) => !c.disabled && !c.hasAttribute('readonly') && c.getAttribute('role') !== 'combobox' && c.labels?.length && c.getClientRects().length);
        const label = (c: Element & { labels: NodeListOf<HTMLLabelElement> | null }) => [...(c.labels ?? [])].map((l) => l.textContent).join(' ');
        const isRequired = (c: Element) => c.getAttribute('aria-required') === 'true';
        const isOptional = (c: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement) => /\(optional\)/.test(label(c));
        if (!controls.some((c) => isRequired(c) || isOptional(c))) continue;
        for (const c of controls) {
          if ((c instanceof HTMLSelectElement && c.value !== '') || NOT_AN_ANSWER[`${name}/${label(c).trim()}`]) continue;
          if (!isRequired(c) && !isOptional(c)) found.push(`${exportName}: "${label(c).trim()}" is neither required nor optional`);
        }
        if (controls.some(isRequired) && !/marked \* (are required|need an answer)/.test(host.textContent || '')) found.push(`${exportName}: marks fields with * but never says what it means`);
      }
      root.unmount();
      host.remove();
    }
    expect([...new Set(found)]).toEqual([]);
  });
}
