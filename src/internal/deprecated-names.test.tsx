import * as React from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { Combobox } from '../components/Combobox/Combobox';
import { MaskedValue } from '../components/MaskedValue/MaskedValue';
import { PasswordInput } from '../components/PasswordInput/PasswordInput';
import { Timeline, TimelineItem } from '../components/Timeline/Timeline';

afterEach(() => { vi.restoreAllMocks(); });
const deprecations = (warn: { mock: { calls: unknown[][] } }) => warn.mock.calls.map((c) => String(c[0])).filter((m) => m.includes('deprecated-prop'));
const el = (id: string) => document.getElementById(id)!;

// One idea, one name (CONTRIBUTING.md, API naming table). The new names work; the old ones still work as before, and
// warn once in development with the name to use and the major that removes them.
describe('TimelineItem: tone, the name every component gives what a color means', () => {
  test('tone colors the marker, with no warning', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await render(<Timeline><TimelineItem id="t" title="Paid" tone="success" /></Timeline>);
    expect(el('t').classList.contains('dk-timeline__item--success')).toBe(true);
    expect(deprecations(warn)).toEqual([]);
  });
  test('status still colors it, warns once naming tone and 17.0.0, and tone wins when both are given', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await render(<Timeline><TimelineItem id="s" title="Late" status="warning" /><TimelineItem id="b" title="Both" status="warning" tone="danger" /></Timeline>);
    expect([el('s').classList.contains('dk-timeline__item--warning'), el('b').classList.contains('dk-timeline__item--danger')]).toEqual([true, true]);
    expect(deprecations(warn)).toHaveLength(1);
    expect(deprecations(warn)[0]).toMatch(/TimelineItem: `status` is deprecated and removed in 17\.0\.0\. Use `tone`/);
  });
});

describe('Combobox: onInputValueChange, named for inputValue', () => {
  test('onInputValueChange hears typing, with no warning', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const heard: string[] = [];
    await render(<Combobox id="c1" aria-label="Country" options={['Brazil', 'Canada']} onInputValueChange={(t) => heard.push(t)} />);
    await userEvent.type(el('c1'), 'Br');
    expect(heard).toEqual(['B', 'Br']);
    expect(deprecations(warn)).toEqual([]);
  });
  test('onInputChange still hears it and warns once naming onInputValueChange; given both, only onInputValueChange is called', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const old: string[] = [], both: string[] = [], ignored: string[] = [];
    await render(<>
      <Combobox id="c2" aria-label="Country" options={['Brazil']} onInputChange={(t) => old.push(t)} />
      <Combobox id="c3" aria-label="City" options={['Bogor']} onInputValueChange={(t) => both.push(t)} onInputChange={(t) => ignored.push(t)} />
    </>);
    await userEvent.type(el('c2'), 'B');
    await userEvent.type(el('c3'), 'B');
    // Leaving the first field for the second puts its (empty) label back, which it hears too.
    expect([old, both, ignored]).toEqual([['B', ''], ['B'], []]);
    expect(deprecations(warn)).toHaveLength(1);
    expect(deprecations(warn)[0]).toMatch(/Combobox: `onInputChange` is deprecated and removed in 17\.0\.0\. Use `onInputValueChange`/);
  });
});

describe('PasswordInput: revealed, as MaskedValue says showing a hidden value', () => {
  const field = (id: string) => el(id).querySelector('input')!;
  const toggle = (id: string) => el(id).querySelector('button')!;
  test('defaultRevealed shows it as text; revealed and onRevealedChange control it; no warning', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const calls: boolean[] = [];
    function Ctl() { const [r, setR] = React.useState(false); return <PasswordInput className="p2" aria-label="Ctl" revealed={r} onRevealedChange={(x) => { calls.push(x); setR(x); }} />; }
    await render(<><span id="p1"><PasswordInput aria-label="New" defaultRevealed /></span><span id="p2"><Ctl /></span></>);
    expect(field('p1').type).toBe('text');
    expect(field('p2').type).toBe('password');
    await userEvent.click(toggle('p2'));
    expect([field('p2').type, calls]).toEqual(['text', [true]]);
    expect(deprecations(warn)).toEqual([]);
  });
  test('visible, defaultVisible and onVisibleChange still work, each warning once naming its new name', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const calls: boolean[] = [];
    function Ctl() { const [v, setV] = React.useState(false); return <PasswordInput aria-label="Ctl" visible={v} onVisibleChange={(x) => { calls.push(x); setV(x); }} />; }
    await render(<><span id="p3"><PasswordInput aria-label="New" defaultVisible /></span><span id="p4"><Ctl /></span></>);
    expect(field('p3').type).toBe('text');
    await userEvent.click(toggle('p4'));
    expect([field('p4').type, calls]).toEqual(['text', [true]]);
    const said = deprecations(warn);
    expect(said).toHaveLength(3);
    for (const [was, now] of [['visible', 'revealed'], ['defaultVisible', 'defaultRevealed'], ['onVisibleChange', 'onRevealedChange']]) {
      expect(said.some((m) => m.includes(`PasswordInput: \`${was}\` is deprecated and removed in 17.0.0. Use \`${now}\``))).toBe(true);
    }
  });
});

describe('MaskedValue: defaultRevealed, as every controlled state has a default', () => {
  test('defaultRevealed shows the whole value at first, and Hide still hides it', async () => {
    await render(<MaskedValue id="m" value="4111111111111208" label="Card number" revealable defaultRevealed />);
    expect(el('m').classList.contains('dk-masked-value--revealed')).toBe(true);
    await userEvent.click(el('m').querySelector('button')!);
    expect(el('m').classList.contains('dk-masked-value--revealed')).toBe(false);
  });
});
