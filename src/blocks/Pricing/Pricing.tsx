"use client";
import * as React from 'react';
import { Badge } from '../../components/Badge/Badge';
import { Button } from '../../components/Button/Button';
import { Card } from '../../components/Card/Card';
import { Heading } from '../../components/Heading/Heading';
import { Icon } from '../../components/Icon/Icon';
import { SegmentedControl } from '../../components/SegmentedControl/SegmentedControl';
import { formatNumber } from '../../components/FormattedNumber/formatNumber';
import { useLocale } from '../../internal/provider';

/* Pricing (BL6): plans side by side, for an app to copy. What it carries (WCAG 2.2):
   - 1.3.1 in Safari: role="list" on the lists without bullets, since WebKit stops calling them lists (FU1, GR151).
   - 1.3.1: the plans are a list, each plan's name is a heading, and what a plan includes is a real list named after it.
   - 1.4.1 / 1.3.3: the current plan and the recommended one say so in words, not only with a color or a border.
   - 2.4.6 / 2.5.3: each plan has one action, named after the plan ("Choose Pro"), so a list of buttons still makes
     sense out of context.
   - Monthly or yearly is a radio group (SegmentedControl, one choice); the yearly option says the saving in words.
   - 1.4.10: a long word, such as a German compound, wraps inside its card rather than running out of it (GR137).
   - Prices are written the way the reader's locale writes money. Each word is a label, English by default. */

export type PricingPeriod = 'monthly' | 'yearly';

export interface PricingPlan {
  id: string;
  /** "Pro". */
  name: string;
  /** Who it's for, in a sentence. */
  description?: string | undefined;
  /** The price of one month, billed monthly. */
  monthly: number;
  /** The price of one year, billed yearly. */
  yearly: number;
  /** What it includes, one line each. */
  features: readonly string[];
  /** The person is on this plan now: it says so instead of offering a button. */
  current?: boolean | undefined;
  /** The plan most people should pick: marked in words. */
  recommended?: boolean | undefined;
}

export interface PricingLabels {
  /** The radio group's name. */
  period: string;
  monthly: string;
  /** The yearly option. savingPercent is the biggest saving yearly billing gives across the plans, rounded down (0
      for none); upTo is true when the plans save different amounts, so the words must say "up to" (GR138). */
  yearly: (savingPercent: number, upTo: boolean) => string;
  perMonth: string;
  /** Under a yearly price per month: what is paid once a year. */
  billedYearly: (total: string) => string;
  current: string;
  recommended: string;
  /** The name of a plan's list of what it includes. */
  included: (plan: string) => string;
  /** A plan's button. */
  choose: (plan: string) => string;
}

const english: PricingLabels = {
  period: 'Billing period',
  monthly: 'Monthly',
  yearly: (saving, upTo) => (saving > 0 ? `Yearly, save ${upTo ? 'up to ' : ''}${saving}%` : 'Yearly'),
  perMonth: 'per month',
  billedYearly: (total) => `${total} billed yearly`,
  current: 'Your current plan',
  recommended: 'Recommended',
  included: (plan) => `Included in ${plan}`,
  choose: (plan) => `Choose ${plan}`,
};

export interface PricingProps {
  plans: readonly PricingPlan[];
  /** An ISO 4217 code: "USD", "IDR", "EUR". */
  currency: string;
  /** The period shown, when the page holds it. */
  period?: PricingPeriod | undefined;
  /** The period shown first, when Pricing holds it. Default: monthly. */
  defaultPeriod?: PricingPeriod | undefined;
  onPeriodChange?: ((period: PricingPeriod) => void) | undefined;
  /** A plan's button was pressed. */
  onChoose: (planId: string, period: PricingPeriod) => void | Promise<unknown>;
  /** Each plan's name. Default: 3, under the page's h2. */
  headingLevel?: 2 | 3 | 4 | undefined;
  labels?: Partial<PricingLabels> | undefined;
}

/** What yearly billing saves over twelve monthly payments, per paid plan, as whole percentages rounded down. */
function savings(plans: readonly PricingPlan[]) {
  // toFixed: 96 of 120 is 20%, not 19.99…%
  return plans.filter((p) => p.monthly > 0).map((p) => Math.max(0, Math.floor(Number(((1 - p.yearly / (p.monthly * 12)) * 100).toFixed(6)))));
}

/** Plans side by side, monthly or yearly, each with what it includes and one clear action. */
export function Pricing({ plans, currency, period, defaultPeriod = 'monthly', onPeriodChange, onChoose, headingLevel = 3, labels }: PricingProps) {
  const l = { ...english, ...labels };
  const locale = useLocale();
  const [own, setOwn] = React.useState<PricingPeriod>(defaultPeriod);
  const shown = period ?? own;
  // A whole amount without its cents ("$12", not "$12.00"); anything else as the currency writes it.
  const money = (value: number) => formatNumber(value, locale, { format: 'currency', currency, ...(Number.isInteger(value) && { minimumFractionDigits: 0, maximumFractionDigits: 0 }) });
  const saved = savings(plans), best = Math.max(0, ...saved);
  const change = (next: PricingPeriod) => { setOwn(next); onPeriodChange?.(next); };
  return (
    <div className="flex flex-col gap-6">
      <SegmentedControl<PricingPeriod> aria-label={l.period} value={shown} onValueChange={change} className="self-center"
        options={[{ value: 'monthly', label: l.monthly }, { value: 'yearly', label: l.yearly(best, saved.some((x) => x !== best)) }]} />
      <ul role="list" className="m-0 grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-3">
        {plans.map((plan) => {
          const perMonth = shown === 'yearly' ? plan.yearly / 12 : plan.monthly;
          return (
            <Card as="li" key={plan.id} padding="lg" variant={plan.recommended ? 'elevated' : 'outline'} aria-labelledby={`${plan.id}-name`}
              className={plan.recommended ? 'flex h-full min-w-0 flex-col gap-4 wrap-anywhere border-primary' : 'flex h-full min-w-0 flex-col gap-4 wrap-anywhere'}>
              <div className="flex flex-wrap items-center gap-2">
                <Heading level={headingLevel} id={`${plan.id}-name`}>{plan.name}</Heading>
                {plan.recommended && <Badge tone="primary">{l.recommended}</Badge>}
              </div>
              {plan.description && <p className="text-sm text-text-muted">{plan.description}</p>}
              <p className="flex flex-wrap items-baseline gap-x-2">
                <span className="text-3xl font-semibold">{money(perMonth)}</span>
                <span className="text-sm text-text-muted">{l.perMonth}</span>
                {shown === 'yearly' && plan.yearly > 0 && <span className="w-full text-sm text-text-muted">{l.billedYearly(money(plan.yearly))}</span>}
              </p>
              <ul role="list" aria-label={l.included(plan.name)} className="m-0 flex list-none flex-col gap-2 p-0 text-sm">
                {plan.features.map((f) => <li key={f} className="flex items-center gap-2"><Icon name="check" className="shrink-0 text-success" />{f}</li>)}
              </ul>
              <div className="mt-auto">
                {plan.current
                  ? <p className="text-sm font-semibold">{l.current}</p>
                  : <Button className="w-full" variant={plan.recommended ? 'primary' : 'secondary'} onClick={() => onChoose(plan.id, shown)}>{l.choose(plan.name)}</Button>}
              </div>
            </Card>
          );
        })}
      </ul>
    </div>
  );
}
