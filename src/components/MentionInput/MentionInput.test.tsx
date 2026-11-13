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
const said = (text: RegExp) => expect.poll(() => document.querySelector('[data-dk-announcer]')?.textContent || '', { timeout: 3000 }).toMatch(text);

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
    expect([box().value, box().selectionStart, isOpen(), onMention.mock.calls[0]![0].id]).toEqual(['Ask @André Wijaya ', 18, false, 'andre']);
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
    // Escape, then the @ deleted and typed again in the same place: a new mention, so the list opens.
    await userEvent.keyboard('{Escape}{Backspace}@');
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
    await said(/[1١] result/);   // in the browser's digits
    await userEvent.keyboard('zz');
    await said(/No results/);
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

  test('mentionsIn finds a name after a longer word that starts with it, and a name that starts a longer one isn\'t mentioned by it', () => {
    const team: MentionOption[] = [{ id: 'ayu', label: 'Ayu' }, { id: 'ayul', label: 'Ayu Lestari' }, { id: 'budi', label: 'Budi' }];
    expect(mentionsIn('@Ayub asked @Budi and @Ayu', team).map((p) => p.id)).toEqual(['budi', 'ayu']);
    expect(mentionsIn('Thanks @Ayu Lestari', team).map((p) => p.id)).toEqual(['ayul']);
    expect(mentionsIn('@Ayu Lestari and @Ayu', team).map((p) => p.id)).toEqual(['ayul', 'ayu']);
  });

  test('options, their second line and the active option read 4.5:1 on the list in all six themes', async () => {
    await render(<Box />);
    await userEvent.click(box());
    await userEvent.keyboard('@');
    await expect.poll(isOpen).toBe(true);
    const pop = list().closest('[popover]') as HTMLElement;
    const opt = document.querySelectorAll<HTMLElement>('[role="option"]')[1]!, act = activeOption()!;
    const desc = act.lastElementChild!.lastElementChild as HTMLElement;   // Ayu's description
    for (const th of THEMES) {
      document.documentElement.setAttribute('data-theme', th);
      expect(contrast(css(opt).color, css(pop).backgroundColor), th).toBeGreaterThanOrEqual(4.5);
      expect(contrast(css(desc).color, css(act).backgroundColor), th + ' description on active').toBeGreaterThanOrEqual(4.5);
    }
    document.documentElement.removeAttribute('data-theme');
  });
});

// What a mutation run on MentionInput.tsx found no test for (88 of 127 mutants were caught, run 272): each test names
// the rule a changed operator would have broken without anything failing.
describe('MentionInput: rules no test covered', () => {
  test('mentionQuery: a trigger after the caret isn\'t the mention; the query may be 40 characters and no more, counted after the trigger', () => {
    const forty = 'a'.repeat(40);
    expect(mentionQuery('ab @c', 3)).toBeNull();
    expect([mentionQuery('xx @' + forty, 44), mentionQuery('xx @' + forty + 'a', 45)]).toEqual([{ start: 3, text: forty }, null]);
    expect([mentionQuery('xx ::' + forty, 45, '::'), mentionQuery('xx ::' + forty + 'a', 46, '::')]).toEqual([{ start: 3, text: forty }, null]);
  });

  test('mentionsIn: a name that ends the text counts, one followed by a digit doesn\'t', () => {
    expect(mentionsIn('Thanks @Ayu Lestari', PEOPLE).map((p) => p.id)).toEqual(['ayu']);
    expect(mentionsIn('Thanks @Ayu Lestari2', PEOPLE)).toEqual([]);
  });

  test('only the active option is selected, only the one that can\'t be picked is disabled, and only one with a description has a second line', async () => {
    await render(<Box />);
    await userEvent.click(box());
    await userEvent.keyboard('@');
    const options = () => [...document.querySelectorAll('[role="option"]')];
    expect(options().map((o) => [o.getAttribute('aria-selected'), o.getAttribute('aria-disabled'), o.lastElementChild!.childElementCount]))
      .toEqual([['true', null, 2], ['false', null, 1], ['false', null, 1], ['false', 'true', 1]]);
    expect(activeOption()).toBe(options()[0]);
    expect(list().parentElement!.textContent).not.toMatch(/No results/i);
    await userEvent.keyboard('zzz');
    expect([options().length, box().getAttribute('aria-activedescendant')]).toEqual([0, null]);
    expect(list().parentElement!.textContent).toMatch(/No results/i);
  });

  test('the pointer over an option makes it the active one; over one that can\'t be picked, or a click on it, does nothing', async () => {
    const onMention = vi.fn();
    await render(<Box onMention={onMention} />);
    await userEvent.click(box());
    await userEvent.keyboard('@');
    await userEvent.hover(page.getByRole('option', { name: 'Budi Santoso' }));
    expect(active()).toBe('Budi Santoso');
    await userEvent.hover(page.getByRole('option', { name: 'Eka Putri' }));
    expect(active()).toBe('Budi Santoso');
    await userEvent.click(page.getByRole('option', { name: 'Eka Putri' }), { force: true });
    expect([box().value, onMention.mock.calls.length, isOpen()]).toEqual(['@', 0, true]);
  });

  test('a mention put in before a space keeps that one space, and the caret goes after it', async () => {
    await render(<Box defaultValue="Hi  there" />);
    box().focus();
    box().setSelectionRange(3, 3);
    await userEvent.keyboard('@ay{Enter}');
    expect([box().value, box().selectionStart]).toEqual(['Hi @Ayu Lestari there', 16]);
  });

  test('in a scrolled field the list opens under the caret\'s line where it shows, not where it would be unscrolled', async () => {
    const lines = Array.from({ length: 20 }, (_, i) => 'line ' + i).join('\n');
    await render(<Box defaultValue={lines} rows={5} resize="none" />);
    const t = box(), line = parseFloat(getComputedStyle(t).lineHeight);
    const at = lines.split('\n').slice(0, 13).join('\n').length;   // the end of line 12
    t.focus();
    t.setSelectionRange(at, at);
    t.scrollTop = 10 * line;
    await userEvent.keyboard(' @');
    await expect.poll(isOpen).toBe(true);
    expect(t.scrollTop).toBeGreaterThan(8 * line);
    const field = t.getBoundingClientRect(), pop = list().getBoundingClientRect();
    const shownLine = (12 * line - t.scrollTop) / line;   // which visible line the caret is on, from 0
    const under = field.top + t.clientTop + parseFloat(getComputedStyle(t).paddingTop) + (shownLine + 1) * line;
    expect(Math.abs(pop.top - under)).toBeLessThan(line);
    expect(pop.left).toBeGreaterThan(field.left + t.clientLeft + 20);   // after "line 12 ", not at the field's edge
    expect(pop.left).toBeLessThan(field.left + 200);
  });

  test('a form reset puts the text back to defaultValue and closes the list', async () => {
    await render(<form><MentionInput aria-label="Comment" options={PEOPLE} defaultValue="Hello" /><button type="reset">Reset</button></form>);
    await userEvent.click(box());
    await userEvent.keyboard(' @');
    await expect.poll(isOpen).toBe(true);
    (document.querySelector('form') as HTMLFormElement).reset();
    await expect.poll(() => [box().value, isOpen()]).toEqual(['Hello', false]);
  });

  test('with the list closed Enter is a new line; a key the app already handled moves nothing in the list', async () => {
    let handle = false;
    await render(<Box onKeyDown={(e) => { if (handle && e.key === 'ArrowDown') e.preventDefault(); }} />);
    await userEvent.click(box());
    await userEvent.keyboard('a{Enter}b @');
    expect(box().value).toBe('a\nb @');
    handle = true;
    await userEvent.keyboard('{ArrowDown}');
    expect(active()).toBe('Ayu Lestari');
    handle = false;
    await userEvent.keyboard('{ArrowDown}');
    expect(active()).toBe('Budi Santoso');
  });
});
