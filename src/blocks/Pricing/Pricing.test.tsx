import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { SerupaProvider } from '../../internal/provider';
import { Pricing, type PricingPlan } from './Pricing';

const plans: PricingPlan[] = [
  { id: 'free', name: 'Free', monthly: 0, yearly: 0, features: ['3 projects', '1 GB of files'], current: true },
  { id: 'pro', name: 'Pro', description: 'For small teams.', monthly: 10, yearly: 96, features: ['Unlimited projects', '100 GB of files'], recommended: true },
  { id: 'team', name: 'Team', monthly: 20, yearly: 216, features: ['Everything in Pro', 'Single sign-on'] },
];
const text = (id: string) => document.querySelector(`[aria-labelledby="${id}-name"]`)?.textContent || '';

// Pricing (BL6): plans as a list, monthly or yearly as one choice with the saving in words, the current and the
// recommended plan in words, and one action per plan named after it.
describe('Blocks/Pricing', () => {
  test('plans are a list of named items, each with a heading and a named list of what it includes', async () => {
    await render(<SerupaProvider locale="en-US"><Pricing plans={plans} currency="USD" onChoose={() => {}} /></SerupaProvider>);
    await expect.element(page.getByRole('heading', { level: 3, name: 'Pro' })).toBeVisible();
    expect(page.getByRole('listitem', { name: 'Team' }).elements()).toHaveLength(1);
    const included = page.getByRole('list', { name: 'Included in Pro' });
    await expect.element(included).toBeVisible();
    expect(included.getByRole('listitem').elements()).toHaveLength(2);
    expect(text('pro')).toContain('$10per month');
  });

  test('the current plan and the recommended one say so in words; the current plan has no button', async () => {
    await render(<SerupaProvider locale="en-US"><Pricing plans={plans} currency="USD" onChoose={() => {}} /></SerupaProvider>);
    expect(text('free')).toContain('Your current plan');
    expect(text('pro')).toContain('Recommended');
    expect(page.getByRole('button', { name: 'Choose Free' }).elements()).toHaveLength(0);
    expect(page.getByRole('button', { name: /^Choose / }).elements()).toHaveLength(2);
  });

  test('yearly is one choice of two, says the saving, and shows the yearly prices per month and per year', async () => {
    const onPeriodChange = vi.fn();
    await render(<SerupaProvider locale="en-US"><Pricing plans={plans} currency="USD" onChoose={() => {}} onPeriodChange={onPeriodChange} /></SerupaProvider>);
    await expect.element(page.getByRole('radiogroup', { name: 'Billing period' })).toBeVisible();
    await expect.element(page.getByRole('radio', { name: 'Monthly' })).toBeChecked();
    await userEvent.click(page.getByRole('radio', { name: 'Yearly, save 20%' }));
    expect(onPeriodChange).toHaveBeenCalledWith('yearly');
    await expect.poll(() => text('pro')).toContain('$8per month');
    expect(text('pro')).toContain('$96 billed yearly');
    expect(text('team')).toContain('$18per month');
    expect(text('free')).not.toContain('billed yearly');
  });

  test('a plan’s button chooses that plan for the period shown', async () => {
    const onChoose = vi.fn();
    await render(<SerupaProvider locale="en-US"><Pricing plans={plans} currency="USD" defaultPeriod="yearly" onChoose={onChoose} /></SerupaProvider>);
    await userEvent.click(page.getByRole('button', { name: 'Choose Team' }));
    expect(onChoose).toHaveBeenCalledWith('team', 'yearly');
  });

  test('every word can be given in the page language, and money is written the locale’s way', async () => {
    const rupiah: PricingPlan[] = [{ id: 'pro', name: 'Pro', monthly: 150000, yearly: 1500000, features: ['Proyek tanpa batas'] }];
    await render(<SerupaProvider locale="id-ID"><Pricing plans={rupiah} currency="IDR" defaultPeriod="yearly" onChoose={() => {}} labels={{
      period: 'Periode tagihan', monthly: 'Bulanan', yearly: (s) => `Tahunan, hemat ${s}%`, perMonth: 'per bulan',
      billedYearly: (t) => `${t} ditagih per tahun`, included: (p) => `Termasuk di ${p}`, choose: (p) => `Pilih ${p}`,
    }} /></SerupaProvider>);
    await expect.element(page.getByRole('radio', { name: 'Tahunan, hemat 16%' })).toBeChecked();
    await expect.element(page.getByRole('list', { name: 'Termasuk di Pro' })).toBeVisible();
    await expect.element(page.getByRole('button', { name: 'Pilih Pro' })).toBeVisible();
    expect(text('pro').replace(/\s/g, ' ')).toContain('Rp 125.000per bulan');
    expect(text('pro').replace(/\s/g, ' ')).toContain('Rp 1.500.000 ditagih per tahun');
  });
});
