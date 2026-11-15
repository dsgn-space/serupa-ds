import * as React from 'react';
import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { Pricing, type PricingPlan } from '../blocks/Pricing/Pricing';
import { Prose } from '../components/Prose/Prose';
import { Timeline, TimelineItem } from '../components/Timeline/Timeline';
import { toast, Toaster } from '../components/Toast/Toast';
import { TransferList } from '../components/TransferList/TransferList';

// GR424 (audit runs 298 and 299): numbers that change or sit in a column use tabular figures, so they keep their
// width as they change and line up down a column; small text keeps the small text's own line height.
const tabular = (el: Element | null) => getComputedStyle(el!).fontVariantNumeric;
const plans: PricingPlan[] = [{ id: 'pro', name: 'Pro', monthly: 10, yearly: 96, features: ['Unlimited projects'] }];

describe('tabular figures where numbers change or line up', () => {
  test("Timeline's times, a table cell in Prose, Pricing's price and TransferList's count", async () => {
    await render(
      <div>
        <Timeline><TimelineItem title="Order placed" time="09:14" /></Timeline>
        <Prose><table><tbody><tr><td>1,204</td></tr></tbody></table></Prose>
        <Pricing plans={plans} currency="USD" onChoose={() => {}} />
        <TransferList aria-label="Columns" options={[{ value: 'id', label: 'ID' }, { value: 'email', label: 'Email' }]} defaultValue={['id']} />
      </div>,
    );
    expect(tabular(document.querySelector('.dk-timeline__time'))).toBe('tabular-nums');
    expect(tabular(document.querySelector('.dk-prose td'))).toBe('tabular-nums');
    const price = [...document.querySelectorAll('.dk-card span')].find((s) => s.textContent === '$10')!;
    expect(tabular(price)).toBe('tabular-nums');
    expect(tabular(document.querySelector('.dk-transfer-list__count'))).toBe('tabular-nums');
  });

  test('TransferList: the side titles take the small text’s line height, not the 24px they would inherit', async () => {
    await render(<div style={{ lineHeight: '24px' }}><TransferList aria-label="Columns" options={[{ value: 'id', label: 'ID' }]} /></div>);
    const title = document.querySelector('.dk-transfer-list__title')!;
    const probe = document.createElement('span'); probe.style.lineHeight = 'var(--text-sm--line-height)'; document.body.append(probe);
    expect(getComputedStyle(title).lineHeight).toBe(getComputedStyle(probe).lineHeight);
    probe.remove();
  });

  test('Toast: the "+N more" pill under a stack', async () => {
    await render(<Toaster />);
    React.act(() => { for (let i = 1; i <= 5; i++) toast({ title: `Upload ${i} failed`, duration: 0 }); });
    await expect.poll(() => document.querySelector('.dk-toaster__more')).not.toBeNull();
    expect(tabular(document.querySelector('.dk-toaster__more'))).toBe('tabular-nums');
  });
});
