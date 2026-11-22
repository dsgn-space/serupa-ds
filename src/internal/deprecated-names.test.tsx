import * as React from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { Button } from '../components/Button/Button';
import { Combobox } from '../components/Combobox/Combobox';
import { Divider } from '../components/Divider/Divider';
import { Link } from '../components/Link/Link';
import { NotificationCenter } from '../components/NotificationCenter/NotificationCenter';
import { TagGroup } from '../components/TagGroup/TagGroup';
import { Toaster } from '../components/Toast/Toast';
import { MaskedValue } from '../components/MaskedValue/MaskedValue';
import { PasswordInput } from '../components/PasswordInput/PasswordInput';
import { Timeline, TimelineItem } from '../components/Timeline/Timeline';

afterEach(() => { vi.restoreAllMocks(); });
const deprecations = (warn: { mock: { calls: unknown[][] } }) => warn.mock.calls.map((c) => String(c[0])).filter((m) => m.includes('deprecated-prop'));
const el = (id: string) => document.getElementById(id)!;

// One idea, one name (CONTRIBUTING.md, API naming table). The new names work with no warning; the old ones were
// removed in 17.0.0, or (below) still work, warn once naming the new one, and go in 18.0.0.
describe('TimelineItem: tone, the name every component gives what a color means', () => {
  test('tone colors the marker, with no warning', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await render(<Timeline><TimelineItem id="t" title="Paid" tone="success" /></Timeline>);
    expect(el('t').classList.contains('srp-timeline__item--success')).toBe(true);
    expect(deprecations(warn)).toEqual([]);
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
});

describe('MaskedValue: defaultRevealed, as every controlled state has a default', () => {
  test('defaultRevealed shows the whole value at first, and Hide still hides it', async () => {
    await render(<MaskedValue id="m" value="4111111111111208" label="Card number" revealable defaultRevealed />);
    expect(el('m').classList.contains('srp-masked-value--revealed')).toBe(true);
    await userEvent.click(el('m').querySelector('button')!);
    expect(el('m').classList.contains('srp-masked-value--revealed')).toBe(false);
  });
});

describe('surface, not onMedia: a prop named on… reads as an event handler (removed in 18.0.0)', () => {
  test('Button, Link and Divider draw for dark or light media from surface with no warning, and from onMedia the same, with one warning each', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await render(<>
      <Button id="b1" surface="dark">Book</Button><Link id="l1" href="#a" surface="light">Read</Link><Divider id="d1" surface="dark" />
    </>);
    expect(['b1', 'l1', 'd1'].map((id) => el(id).className.match(/srp-\w+--on-\w+/)?.[0])).toEqual(['srp-btn--on-dark', 'srp-link--on-light', 'srp-divider--on-dark']);
    expect(deprecations(warn)).toEqual([]);
    await render(<>
      <Button id="b2" onMedia="dark">Book</Button><Link id="l2" href="#b" onMedia="light">Read</Link><Divider id="d2" onMedia="dark" />
    </>);
    expect(['b2', 'l2', 'd2'].map((id) => el(id).className.match(/srp-\w+--on-\w+/)?.[0])).toEqual(['srp-btn--on-dark', 'srp-link--on-light', 'srp-divider--on-dark']);
    const said = deprecations(warn);
    expect(['Button', 'Link', 'Divider'].map((c) => said.filter((m) => m.includes(c + ': `onMedia` is deprecated') && m.includes('`surface`')).length)).toEqual([1, 1, 1]);
  });
});

describe('emptyText, not empty: the name Combobox and CommandPalette give it (removed in 18.0.0)', () => {
  test('TagGroup and NotificationCenter show emptyText with no warning, and empty the same, with one warning each', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await render(<TagGroup id="g1" label="Labels" items={[]} emptyText="No labels yet" />);
    expect(el('g1').textContent).toContain('No labels yet');
    expect(deprecations(warn)).toEqual([]);
    await render(<TagGroup id="g2" label="Labels" items={[]} empty="Nothing tagged" />);
    expect(el('g2').textContent).toContain('Nothing tagged');
    await render(<>
      <NotificationCenter open items={[]} emptyText="All caught up" />
      <NotificationCenter open items={[]} empty="Inbox zero" />
    </>);
    expect(['All caught up', 'Inbox zero'].map((t) => document.body.textContent.includes(t))).toEqual([true, true]);
    const said = deprecations(warn);
    expect(['TagGroup', 'NotificationCenter'].map((c) => said.filter((m) => m.includes(c + ': `empty` is deprecated') && m.includes('`emptyText`')).length)).toEqual([1, 1]);
  });
});

describe("Toaster: 'top' and 'bottom', as a Placement spells the middle (removed in 18.0.0: 'top-center', 'bottom-center')", () => {
  test("'bottom' centers the toasts with no warning; 'top-center' still centers them, with one warning naming 'top'", async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const screen = await render(<Toaster id="tz" placement="bottom" />);
    expect(el('tz').classList.contains('srp-toaster--bottom-center')).toBe(true);
    expect(deprecations(warn)).toEqual([]);
    await screen.rerender(<Toaster id="tz" placement="top-center" />);
    expect(el('tz').classList.contains('srp-toaster--top-center')).toBe(true);
    expect(deprecations(warn).filter((m) => m.includes('placement="top-center" is deprecated') && m.includes('placement="top"')).length).toBe(1);
  });
});
