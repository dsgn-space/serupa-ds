import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { THEMES, contrast, css } from '../../../tools/test/vitest/helpers';
import { Field } from '../Field/Field';
import { Dialog } from '../Dialog/Dialog';
import { MentionInput, mentionQuery, mentionsIn, type MentionOption } from './MentionInput';

const PEOPLE: MentionOption[] = [
  { id: 'ayu', label: 'Ayu Lestari', description: 'Design' },
  { id: 'budi', label: 'Budi Santoso' },
  { id: 'andre', label: 'André Wijaya' },
  { id: 'eka', label: 'Eka Putri', disabled: true },
];
const box = () => document.querySelector('textarea') as HTMLTextAreaElement;
const list = () => document.querySelector('[role="listbox"]') as HTMLElement;
// An option is its avatar, then its text: the name, and the description under it.
const label = (o: Element | null | undefined) => o?.lastElementChild?.firstElementChild?.textContent;
const names = () => [...document.querySelectorAll('[role="option"]')].map(label);
const activeOption = () => document.getElementById(box().getAttribute('aria-activedescendant') || '');
const active = () => label(activeOption());
const isOpen = () => !!list() && !list().closest('[hidden]');
const said = (text: string) => expect.poll(() => document.querySelector('[data-dk-announcer]')?.textContent || '', { timeout: 3000 }).toContain(text);

function Box(p: Partial<React.ComponentProps<typeof MentionInput>>) {
  const [v, setV] = React.useState(p.defaultValue || '');
  return <MentionInput aria-label="Comment" options={PEOPLE} {...p} defaultValue={undefined} value={v} onValueChange={(n) => { setV(n); p.onValueChange?.(n); }} />;
}

describe('MentionInput', () => {
  test('a textarea (ref, className and props reach it) that says it suggests a list; closed, nothing points to a list', async () => {
    const ref = React.createRef<HTMLTextAreaElement>();
    await render(<MentionInput id="x" ref={ref} className="extra" data-x="y" aria-label="Comment" options={PEOPLE} />);
    const t = box();
    expect([t.id, ref.current === t, t.dataset.x, t.getAttribute('aria-autocomplete'), t.getAttribute('aria-controls'), t.closest('[data-component="mention-input"]')!.classList.contains('extra')])
      .toEqual(['x', true, 'y', 'list', null, true]);
    expect(t.closest('[data-component="mention-input"]')!.getAttribute('data-state')).toBe('closed');
  });

  test('typing @ opens the list at the caret; letters narrow it, ignoring case and accents; names starting with them come first', async () => {
    await render(<Box />);
    await userEvent.click(box());
    await userEvent.keyboard('Hi @');
    await expect.poll(isOpen).toBe(true);
    expect([names(), box().getAttribute('aria-controls'), list().id]).toEqual([['Ayu Lestari', 'Budi Santoso', 'André Wijaya', 'Eka Putri'], list().id, list().id]);
    await userEvent.keyboard('an');
    expect(names()).toEqual(['André Wijaya', 'Budi Santoso']);   // "An" starts André; "Santoso" holds "an"
    await userEvent.keyboard('{Backspace}{Backspace}AND');
    expect(names()).toEqual(['André Wijaya']);
    const field = box().getBoundingClientRect(), pop = list().getBoundingClientRect();
    expect(pop.top).toBeGreaterThanOrEqual(field.top + parseFloat(getComputedStyle(box()).lineHeight));   // under the caret's (first) line
  });

  test('Down and Up move through the options, skipping one that can\'t be picked, and wrap; Enter puts "@Name " in and the caret after it', async () => {
    const onMention = vi.fn<(o: MentionOption) => void>();
    await render(<Box defaultValue="" onMention={onMention} />);
    await userEvent.click(box());
    await userEvent.keyboard('Ask @');
    expect(active()).toBe('Ayu Lestari');
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    expect(active()).toBe('André Wijaya');
    await userEvent.keyboard('{ArrowDown}');   // past Eka (disabled), back to the top
    expect(active()).toBe('Ayu Lestari');
    await userEvent.keyboard('{ArrowUp}');
    expect(active()).toBe('André Wijaya');
    await userEvent.keyboard('{Enter}');
    expect([box().value, box().selectionStart, isOpen(), onMention.mock.calls[0][0].id]).toEqual(['Ask @André Wijaya ', 18, false, 'andre']);
    await userEvent.keyboard('please');
    expect(box().value).toBe('Ask @André Wijaya please');
  });

  test('Tab and a click put a mention in too; a mention in the middle of the text keeps the rest and its space', async () => {
    await render(<Box defaultValue="" />);
    await userEvent.click(box());
    await userEvent.keyboard('@bu{Tab}');
    expect(box().value).toBe('@Budi Santoso ');
    expect(document.activeElement).toBe(box());   // Tab picked, it didn't move on
    await userEvent.keyboard('and @');
    await userEvent.click(page.getByRole('option', { name: /Ayu Lestari/ }));
    expect([box().value, document.activeElement === box()]).toEqual(['@Budi Santoso and @Ayu Lestari ', true]);
    // Back into the middle: "@Bu" typed over, then picked, leaves " and …" as it was.
    box().setSelectionRange(0, 13);
    await userEvent.keyboard('@Ay');
    await userEvent.keyboard('{Enter}');
    expect(box().value).toBe('@Ayu Lestari and @Ayu Lestari ');
  });

  test('Escape closes the list for that mention only, and doesn\'t close a dialog the field is in; the next @ opens it again', async () => {
    const onOpenChange = vi.fn();
    await render(<Dialog open onOpenChange={onOpenChange} title="Reply"><Box /></Dialog>);
    await userEvent.click(box());
    await userEvent.keyboard('@a');
    await expect.poll(isOpen).toBe(true);
    await userEvent.keyboard('{Escape}');
    expect(isOpen()).toBe(false);
    expect(onOpenChange).not.toHaveBeenCalled();
    await userEvent.keyboard('y');
    expect(isOpen()).toBe(false);   // still the one Escape closed
    await userEvent.keyboard(' @');
    await expect.poll(isOpen).toBe(true);
  });

  test('an email address, a space after @, or a new line doesn\'t open it; leaving the field closes it', async () => {
    await render(<><button type="button">Before</button><Box /></>);
    await userEvent.click(box());
    await userEvent.keyboard('ayu@example');
    expect(isOpen()).toBe(false);
    await userEvent.keyboard(' @ ');
    expect(isOpen()).toBe(false);
    await userEvent.keyboard('@a');
    await expect.poll(isOpen).toBe(true);
    await userEvent.keyboard('{Shift>}{Enter}{/Shift}');
    expect(isOpen()).toBe(false);
    await userEvent.keyboard('@a');
    await expect.poll(isOpen).toBe(true);
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}');   // Shift+Tab leaves; only Tab picks
    expect([isOpen(), document.activeElement?.textContent]).toEqual([false, 'Before']);
  });

  test('a click outside closes the list, and so does focus moving out without a key (a script, a screen reader)', async () => {
    await render(<><button type="button">Elsewhere</button><Box /></>);
    await userEvent.click(box());
    await userEvent.keyboard('@a');
    await expect.poll(isOpen).toBe(true);
    await userEvent.click(page.getByRole('button', { name: 'Elsewhere' }));
    await expect.poll(isOpen).toBe(false);
    await userEvent.click(box());
    await userEvent.keyboard(' @b');
    await expect.poll(isOpen).toBe(true);
    (page.getByRole('button', { name: 'Elsewhere' }).element() as HTMLElement).focus();
    await expect.poll(isOpen).toBe(false);
  });

  test('how many match is said after a pause, and "no results" when nothing does; onSearch gets the query, then null', async () => {
    const onSearch = vi.fn<(q: string | null) => void>();
    await render(<Box onSearch={onSearch} />);
    await userEvent.click(box());
    await userEvent.keyboard('@bud');
    await said('1 result');
    await userEvent.keyboard('zz');
    await said('No results');
    expect(list().closest('[popover]')!.textContent).toContain('No results. Try other words.');
    expect(onSearch.mock.calls.map((c) => c[0])).toEqual(['', 'b', 'bu', 'bud', 'budz', 'budzz']);
    await userEvent.keyboard('{Escape}');
    expect(onSearch).toHaveBeenLastCalledWith(null);
  });

  test('filter={false} shows the options as given (the app filters), up to maxOptions', async () => {
    const many = Array.from({ length: 12 }, (_, i) => ({ id: 'p' + i, label: 'Person ' + i }));
    await render(<Box options={many} filter={false} maxOptions={5} />);
    await userEvent.click(box());
    await userEvent.keyboard('@zzz');
    expect(names()).toEqual(['Person 0', 'Person 1', 'Person 2', 'Person 3', 'Person 4']);
  });

  test('uncontrolled, it keeps its own text; disabled and read-only fields don\'t open the list', async () => {
    const { rerender } = await render(<MentionInput aria-label="Comment" options={PEOPLE} defaultValue="Hi " />);
    await userEvent.click(box());
    await userEvent.keyboard('{End}@ay{Enter}');
    expect(box().value).toBe('Hi @Ayu Lestari ');
    await rerender(<MentionInput aria-label="Comment" options={PEOPLE} defaultValue="Hi " readOnly />);
    box().setSelectionRange(16, 16);
    box().dispatchEvent(new Event('select', { bubbles: true }));
    expect(isOpen()).toBe(false);
  });

  test('in a Field, the listbox is named by the Field\'s label, and the hint describes the field', async () => {
    await render(<Field label="Comment" hint="Type @ to mention someone."><MentionInput options={PEOPLE} /></Field>);
    await userEvent.click(box());
    await userEvent.keyboard('@');
    await expect.element(page.getByRole('listbox', { name: 'Comment' })).toBeVisible();
    await expect.element(page.getByRole('textbox', { name: 'Comment' })).toHaveAccessibleDescription('Type @ to mention someone.');
  });

  test('resize passes to the Textarea: "vertical" keeps the handle, "none" takes it off', async () => {
    const { rerender } = await render(<MentionInput aria-label="Comment" options={PEOPLE} resize="vertical" />);
    expect(getComputedStyle(box()).resize).toBe('vertical');
    await rerender(<MentionInput aria-label="Comment" options={PEOPLE} resize="none" />);
    expect(getComputedStyle(box()).resize).toBe('none');
  });

  test('mentionQuery finds the open mention at the caret; mentionsIn lists who a text mentions, in order, whole names only', () => {
    expect([mentionQuery('Hi @ay', 6), mentionQuery('(@ay', 4), mentionQuery('a@b', 3), mentionQuery('@ ', 2), mentionQuery('@a\nb', 4), mentionQuery('#ta', 3, '#')])
      .toEqual([{ start: 3, text: 'ay' }, { start: 1, text: 'ay' }, null, null, null, { start: 0, text: 'ta' }]);
    expect(mentionsIn('@Budi Santoso and @Ayu Lestari, not @Ayu Lestarix', PEOPLE).map((p) => p.id)).toEqual(['budi', 'ayu']);
    expect(mentionsIn('nobody', PEOPLE)).toEqual([]);
  });

  test('options, their second line and the active option read 4.5:1 on the list in all six themes', async () => {
    await render(<Box />);
    await userEvent.click(box());
    await userEvent.keyboard('@');
    await expect.poll(isOpen).toBe(true);
    const pop = list().closest('[popover]') as HTMLElement;
    const opt = document.querySelectorAll<HTMLElement>('[role="option"]')[1], act = activeOption()!;
    const desc = act.lastElementChild!.lastElementChild as HTMLElement;   // Ayu's description
    for (const th of THEMES) {
      document.documentElement.setAttribute('data-theme', th);
      expect(contrast(css(opt).color, css(pop).backgroundColor), th).toBeGreaterThanOrEqual(4.5);
      expect(contrast(css(desc).color, css(act).backgroundColor), th + ' description on active').toBeGreaterThanOrEqual(4.5);
    }
    document.documentElement.removeAttribute('data-theme');
  });
});
