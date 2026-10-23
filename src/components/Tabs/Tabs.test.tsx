import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { THEMES, color, contrast, css } from '../../../tools/test/vitest/helpers';
import { Tab, TabList, TabPanel, Tabs } from './Tabs';

const el = (id: string) => document.getElementById(id) as HTMLElement;
// "*" marks the selected tab, "0" the one in the Tab order; "+" a shown panel, "-" a hidden one, with its text.
const state = (id: string) => {
  const r = el(id);
  return [...r.querySelectorAll<HTMLElement>('[role="tab"]')].map((x) => (x.getAttribute('aria-selected') === 'true' ? '*' : '') + x.querySelector('.dk-tabs__label')!.textContent + (x.tabIndex === 0 ? '0' : '')).join(' ')
    + ' | ' + [...r.querySelectorAll<HTMLElement>('[role="tabpanel"]')].map((x) => (x.hidden ? '-' : '+') + (x.textContent || (x.querySelector('input') ? 'input' : ''))).join(' ');
};
const focused = () => { const a = document.activeElement!, l = a.querySelector('.dk-tabs__label'); return l ? l.textContent : a.textContent; };
const selected = (id: string) => el(id).querySelector<HTMLElement>('[role="tab"][aria-selected="true"]')!;

function Set3(p: { icon?: boolean; dis?: boolean }) {
  return <>
    <TabList aria-label="Sections">
      <Tab value="one" icon={p.icon ? 'home' : undefined}>One</Tab><Tab value="two" disabled={p.dis}>Two</Tab><Tab value="three x">Three</Tab>
    </TabList>
    <TabPanel value="one"><input aria-label="kept" /></TabPanel>
    <TabPanel value="two">Panel two</TabPanel>
    <TabPanel value="three x" keepMounted={false}>Panel three</TabPanel>
  </>;
}
let changes: string[] = [], setCtl: (v: string) => void = () => {};
function App(props: { tref?: React.Ref<HTMLDivElement> }) {
  const [c, set] = React.useState('two'); setCtl = set;
  return <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '560px' }}>
    <Tabs id="un" ref={props.tref} className="extra" onValueChange={(v) => { changes.push(v); }}><Set3 icon /></Tabs>
    <Tabs id="dv" defaultValue="three x" variant="pill" size="sm"><Set3 /></Tabs>
    <Tabs id="ctl" value={c} onValueChange={(v) => { changes.push('ctl:' + v); }}><Set3 /></Tabs>
    <Tabs id="dis" activation="manual"><Set3 dis /></Tabs>
    <div dir="rtl"><Tabs id="rtl"><Set3 /></Tabs></div>
    {/* @ts-expect-error: an unknown variant and size, as plain JavaScript could pass */}
    <Tabs id="bad" variant="boxed" size="xl" style={{ '--tabs-indicator': 'rgb(1, 2, 3)', '--tabs-height-md': '40px' } as React.CSSProperties}><Set3 /></Tabs>
  </div>;
}
const setup = async (tref?: React.Ref<HTMLDivElement>) => { changes = []; await render(<App tref={tref} />); await expect.poll(() => !!selected('un')).toBe(true); };

describe('Tabs', () => {
  test('roles: a tablist of type="button" tabs, each controlling its tabpanel (labelled by the tab, focusable); unique ids; ref and className reach Tabs', async () => {
    const ref = React.createRef<HTMLDivElement>();
    await setup(ref);
    const r = el('un'), l = r.querySelector('[role="tablist"]')!, tab = r.querySelector<HTMLButtonElement>('[role="tab"]')!, pn = document.getElementById(tab.getAttribute('aria-controls')!)!;
    expect([l.getAttribute('aria-label'), tab.type, pn.getAttribute('role'), pn.getAttribute('aria-labelledby') === tab.id, pn.tabIndex]).toEqual(['Sections', 'button', 'tabpanel', true, 0]);
    expect([ref.current === r, r.dataset.component, tab.querySelector('.dk-tabs__icon')!.getAttribute('aria-hidden')]).toEqual([true, 'tabs', 'true']);
    expect(r.className).toMatch(/extra/);
    expect(new Set([...document.querySelectorAll('[role="tab"]')].map((x) => x.id)).size).toBe(18);
  });

  test('uncontrolled without defaultValue: the first tab is selected, the only one in the Tab order; other panels hidden', async () => {
    await setup();
    expect(state('un')).toBe('*One0 Two Three | +input -Panel two -');
  });

  test('defaultValue selects that tab; keepMounted={false} renders the panel only while selected', async () => {
    await setup();
    expect(state('dv')).toBe('One Two *Three0 | -input -Panel two +Panel three');
  });

  test('click selects and calls onValueChange', async () => {
    await setup();
    await userEvent.click(el('un').querySelector('[role="tab"]:nth-child(2)')!);
    expect([state('un'), changes.join()]).toEqual(['One *Two0 Three | -input +Panel two -', 'two']);
  });

  test('keys: arrows move and select (wrapping), Home and End jump to the ends; Tab goes on to the selected panel\'s content', async () => {
    await setup();
    await userEvent.click(el('un').querySelector('[role="tab"]:nth-child(2)')!);
    selected('un').focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(focused()).toBe('Three');
    expect(state('un')).toMatch(/^One Two \*Three0/);
    await userEvent.keyboard('{ArrowRight}'); expect(focused()).toBe('One');
    await userEvent.keyboard('{ArrowLeft}'); expect(focused()).toBe('Three');
    await userEvent.keyboard('{End}'); expect(focused()).toBe('Three');
    await userEvent.keyboard('{Home}');
    expect(focused()).toBe('One');
    expect(state('un')).toMatch(/^\*One0/);
    await userEvent.keyboard('{Tab}');
    const a = document.activeElement!;
    expect(a.getAttribute('aria-label') === 'kept' || a.getAttribute('role') === 'tabpanel').toBe(true);
  });

  test('controlled: a click only asks (onValueChange); value decides', async () => {
    await setup();
    await userEvent.click(el('ctl').querySelector('[role="tab"]:nth-child(1)')!);
    expect(state('ctl')).toMatch(/^One \*Two0/);
    expect(changes).toContain('ctl:one');
    React.act(() => setCtl('three x'));
    expect(state('ctl')).toMatch(/^One Two \*Three0/);
  });

  test('manual activation: arrows only move (skipping a disabled tab), Enter selects', async () => {
    await setup();
    selected('dis').focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(focused()).toBe('Three');
    expect(state('dis')).toMatch(/^\*One0/);
    await userEvent.keyboard('{Enter}');
    expect(state('dis')).toMatch(/^One Two \*Three0/);
    expect(el('dis').querySelector<HTMLButtonElement>('[role="tab"]:nth-child(2)')!.disabled).toBe(true);
  });

  test('right-to-left: ArrowLeft goes to the next tab', async () => {
    await setup();
    selected('rtl').focus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(focused()).toBe('Two');
  });

  test('line: a 1px border under the row, 36px tabs (text-sm, font-medium, 12px sides), a 2px primary line under the selected one, whose label is darker; 16px icons', async () => {
    await setup();
    const r = el('un'), sel = selected('un'), other = r.querySelector('[aria-selected="false"]')!, a = getComputedStyle(sel, '::after'), s = css(sel);
    expect([css(r.querySelector('[role="tablist"]')).borderBottomWidth, sel.getBoundingClientRect().height, a.height, a.backgroundColor]).toEqual(['1px', 36, '2px', color('var(--primary)')]);
    expect([s.fontSize, s.fontWeight, s.paddingLeft, css(sel.querySelector('.dk-icon')).fontSize]).toEqual(['14px', '500', '12px', '16px']);
    await expect.poll(() => css(sel).color).not.toBe(css(other).color);
  });

  test('pill, size sm: 32px tabs, the selected one filled in primary with 6px corners, no row border or line', async () => {
    await setup();
    const sel = selected('dv'), s = css(sel);
    await expect.poll(() => css(sel).backgroundColor).toBe(color('var(--primary)'));
    expect([sel.getBoundingClientRect().height, css(el('dv').querySelector('[role="tablist"]')).borderBottomStyle, s.borderTopLeftRadius, getComputedStyle(sel, '::after').content]).toEqual([32, 'none', '6px', 'none']);
  });

  test('unknown variant and size fall back to line and md; --tabs-indicator and --tabs-height-md override', async () => {
    await setup();
    const sel = selected('bad');
    expect([el('bad').dataset.variant, Math.round(sel.getBoundingClientRect().height), getComputedStyle(sel, '::after').backgroundColor]).toEqual(['line', 40, 'rgb(1, 2, 3)']);
  });

  test('focus from the keyboard: a 2px focus-ring inside the tab', async () => {
    await setup();
    // Arrive by Tab (to the panel and back) so focus counts as keyboard focus in every engine, then rove with the arrows.
    selected('un').focus();
    await userEvent.keyboard('{Tab}{Shift>}{Tab}{/Shift}{ArrowRight}{ArrowLeft}');
    const a = document.activeElement as HTMLElement;
    expect([a.getAttribute('role'), !!a.closest('#un')]).toEqual(['tab', true]);
    expect(css(a).boxShadow).toMatch(/0px 0px 0px 2px inset|inset 0px 0px 0px 2px/);
  });

  test('contrast: labels 4.5:1, the selected line and pill 3:1 against surface, in all six themes', async () => {
    await setup();
    const still = document.createElement('style'); still.textContent = '* { transition: none !important; }'; document.head.appendChild(still);
    const low: string[] = []; let n = 0;
    for (const th of THEMES) {
      document.documentElement.setAttribute('data-theme', th);
      const un = el('un').querySelector('[aria-selected="false"]')!, sel = selected('un'), pill = selected('dv');
      const checks: Array<[string, string, string, number]> = [['tab', css(un).color, 'var(--surface)', 4.5], ['selected', css(sel).color, 'var(--surface)', 4.5], ['line', getComputedStyle(sel, '::after').backgroundColor, 'var(--surface)', 3], ['pill', css(pill).color, css(pill).backgroundColor, 4.5], ['pill fill', css(pill).backgroundColor, 'var(--surface)', 3]];
      for (const [k, a, c, min] of checks) { const r = contrast(a, c); n++; if (r < min) low.push(`${th} ${k}: ${r.toFixed(2)}`); }
    }
    still.remove();
    expect([low, n]).toEqual([[], 30]);
  });
});

// Server rendering: without defaultValue the first enabled tab is picked while rendering, so the HTML already
// has a selected tab in the Tab order, its panel visible, and every tab pointing at its panel.
describe('Tabs on the server', () => {
  test('uncontrolled with no defaultValue: the first enabled tab is selected in the HTML', () => {
    const html = renderToString(
      <Tabs>
        <TabList aria-label="Sections">
          <Tab value="a" disabled>A</Tab>
          <Tab value="b">B</Tab>
          <Tab value="c">C</Tab>
        </TabList>
        <TabPanel value="b">Panel B</TabPanel>
        <TabPanel value="c">Panel C</TabPanel>
      </Tabs>,
    );
    const box = document.createElement('div');
    box.innerHTML = html;
    const tabs = [...box.querySelectorAll('[role="tab"]')].map((t) => [t.getAttribute('aria-selected'), t.getAttribute('tabindex'), !!t.getAttribute('aria-controls')]);
    expect(tabs).toEqual([['false', '-1', true], ['true', '0', true], ['false', '-1', true]]);
    expect([...box.querySelectorAll('[role="tabpanel"]')].map((p) => (p as HTMLElement).hidden)).toEqual([false, true]);
  });
});
