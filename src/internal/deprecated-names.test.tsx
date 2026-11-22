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
// removed in 17.0.0 or 18.0.0.
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

describe('surface, not onMedia: a prop named on… reads as an event handler (onMedia removed in 18.0.0)', () => {
  test('Button, Link and Divider draw for dark or light media from surface, and the old onMedia does nothing', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const old = { onMedia: 'dark' } as object;
    await render(<>
      <Button id="b1" surface="dark">Book</Button><Link id="l1" href="#a" surface="light">Read</Link><Divider id="d1" surface="dark" />
      <Button id="b2" {...old}>Book</Button><Link id="l2" href="#b" {...old}>Read</Link><Divider id="d2" {...old} />
    </>);
    expect(['b1', 'l1', 'd1', 'b2', 'l2', 'd2'].map((id) => el(id).className.match(/srp-\w+--on-\w+/)?.[0])).toEqual(['srp-btn--on-dark', 'srp-link--on-light', 'srp-divider--on-dark', undefined, undefined, undefined]);
    expect(deprecations(warn)).toEqual([]);
  });
});

describe('emptyText, not empty: the name Combobox and CommandPalette give it (empty removed in 18.0.0)', () => {
  test('TagGroup and NotificationCenter show emptyText, and the old empty shows nothing', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const old = { empty: 'Nothing tagged' } as object;
    await render(<TagGroup id="g1" label="Labels" items={[]} emptyText="No labels yet" />);
    await render(<TagGroup id="g2" label="Labels" items={[]} {...old} />);
    expect([el('g1').textContent.includes('No labels yet'), el('g2').textContent.includes('Nothing tagged')]).toEqual([true, false]);
    await render(<NotificationCenter open items={[]} emptyText="All caught up" />);
    expect(document.body.textContent.includes('All caught up')).toBe(true);
    expect(deprecations(warn)).toEqual([]);
  });
});

describe("Toaster: 'top' and 'bottom', as a Placement spells the middle ('top-center' and 'bottom-center' removed in 18.0.0)", () => {
  test("'bottom' centers the toasts; the old 'top-center' is an unknown value, so the toasts take the default corner", async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const screen = await render(<Toaster id="tz" placement="bottom" />);
    expect(el('tz').classList.contains('srp-toaster--bottom-center')).toBe(true);
    await screen.rerender(<Toaster id="tz" {...({ placement: 'top-center' } as object)} />);
    expect(el('tz').classList.contains('srp-toaster--bottom-end')).toBe(true);
    expect(deprecations(warn)).toEqual([]);
  });
});
