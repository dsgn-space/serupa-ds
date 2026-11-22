import * as React from 'react';
import { describe, expect, test } from 'vitest';
import { render as draw } from 'vitest-browser-react';
import { DEFAULT_LABELS } from './labels';
import { SerupaProvider } from './provider';
import { Button } from '../components/Button/Button';
import { Field } from '../components/Field/Field';
import { Input } from '../components/Input/Input';
import { Tab, TabList, Tabs } from '../components/Tabs/Tabs';
import { TagGroup } from '../components/TagGroup/TagGroup';

// Runs 303 and 304: like parts keep like spaces from one component to the next. A label over what it names sits
// 6px above it (Field); a 16px icon 6px from its words
// in a control (Button, SegmentedControl, Breadcrumb). Small text keeps its own 20px line.
const render = (ui: React.ReactNode) => draw(<SerupaProvider locale="en-US" labels={DEFAULT_LABELS}><div style={{ lineHeight: '24px' }}>{ui}</div></SerupaProvider>);
const byText = (text: string) => [...document.body.querySelectorAll('*')].reverse().find((x) => x.textContent?.trim() === text)!;
const box = (x: Element) => x.getBoundingClientRect();
const pairSm = () => { const p = document.createElement('span'); p.style.lineHeight = 'var(--text-sm--line-height)'; document.body.append(p); const v = getComputedStyle(p).lineHeight; p.remove(); return v; };
// From the icon's slot to the first letter, in px.
const iconGap = (word: string) => { const t = byText(word); const host = t.closest('button, a, [role="tab"]')!; const icon = [...host.children].find((c) => c !== t && !c.contains(t) && c.getBoundingClientRect().right <= box(t).left + 1)!; return Math.round(box(t).left - box(icon).right); };

describe('spacing between like parts', () => {
  test("TagGroup's label sits as far over its tags as a Field's label over its control; +N more is 14/20", async () => {
    await render(<>
      <Field label="Name"><Input /></Field>
      <TagGroup label="Labels" max={1} items={[{ id: 'a', label: 'Design' }, { id: 'b', label: 'Bug' }]} />
    </>);
    const name = byText('Name'); const fieldGap = box(name.nextElementSibling!).top - box(name).bottom;
    const label = byText('Labels'), tags = label.nextElementSibling!;
    expect(box(tags).top - box(label).bottom).toBeCloseTo(fieldGap, 0);
    expect(fieldGap).toBeCloseTo(6, 0);
    const more = [...document.querySelectorAll('button')].find((b) => /more/.test(b.textContent ?? ''))!;
    expect(getComputedStyle(more).lineHeight).toBe(pairSm());
  });

  test("a tab's icon is as far from its label as a Button's", async () => {
    await render(<>
      <Button startIcon="save">Save</Button>
      <Tabs defaultValue="one"><TabList aria-label="Sections"><Tab value="one" icon="home">Home</Tab></TabList></Tabs>
    </>);
    expect(iconGap('Home')).toBe(iconGap('Save'));
  });
});
