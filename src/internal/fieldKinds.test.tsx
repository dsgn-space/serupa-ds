import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { expect, test } from 'vitest';
import { parts, storiesToRun } from '../../tools/test/vitest/stories';

// A field's name and what it asks for agree (Input's README: "Use the right type and autoComplete so phones show
// the right keyboard and browsers can fill it in"). Stories are what people copy, so one that labels a field
// "Email" but leaves it a text field, or types a Company field as an email, teaches the wrong keyboard, autofill
// and autocapitalize. Found: Field's Optional story typed "Company" as email; Input's stories labelled "Email" were
// text fields; Input's masked card number and expiry had no autofill.
// module state: a fixed table of field names and what each should ask for, never written to.
const KINDS: Array<[RegExp, { type?: string; autoComplete?: string }]> = [
  [/\be-?mail\b/i, { type: 'email' }],
  [/\b(phone|mobile)\b/i, { type: 'tel' }],
  [/\b(website|url)\b/i, { type: 'url' }],
  [/\b(company|business name|organi[sz]ation)\b/i, { type: 'text' }],
  [/(?<!gift )\bcard number\b/i, { autoComplete: 'cc-number' }],
  [/\b(expiry|expiration) date\b/i, { autoComplete: 'cc-exp' }],
  [/\b(security code|cvc|cvv)\b/i, { autoComplete: 'cc-csc' }],
];

const nameOf = (el: HTMLInputElement): string => el.getAttribute('aria-label')
  || (el.getAttribute('aria-labelledby') || '').split(' ').map((id) => document.getElementById(id)?.textContent || '').join(' ').trim()
  || el.labels?.[0]?.textContent || '';

for (const [name, list] of [...storiesToRun(), ...parts]) {
  test(`${name}: each field's type and autofill match its name`, () => {
    const found: string[] = [];
    for (const [exportName, ui] of list) {
      const host = document.body.appendChild(document.createElement('div'));
      const root = createRoot(host);
      try { flushSync(() => root.render(ui)); } catch { root.unmount(); host.remove(); continue; }
      for (const el of host.querySelectorAll<HTMLInputElement>('input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([type=search]):not([role=combobox]):not([role=spinbutton])')) {
        const label = nameOf(el).replace(/\s+/g, ' ').trim();
        // a typed confirmation ("To confirm, type Website redesign") asks for the words, whatever they are
        if (/^to confirm\b/i.test(label)) continue;
        for (const [re, want] of KINDS) {
          if (!re.test(label)) continue;
          // the token list's last word is the field's kind ("shipping postal-code"); a password's reveal makes it text
          const auto = (el.getAttribute('autocomplete') || '').split(' ').at(-1);
          if (want.type && el.type !== want.type && el.type !== 'password') found.push(`${exportName}: "${label}" is type="${el.type}", not "${want.type}"`);
          if (want.autoComplete && auto !== want.autoComplete) found.push(`${exportName}: "${label}" has autoComplete="${auto}", not "${want.autoComplete}"`);
          break;
        }
      }
      root.unmount();
      host.remove();
    }
    expect(found).toEqual([]);
  });
}
