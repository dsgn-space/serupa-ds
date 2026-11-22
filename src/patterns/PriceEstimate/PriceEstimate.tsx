'use client';
import * as React from 'react';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Button } from '../../components/Button/Button';
import { Card } from '../../components/Card/Card';
import { Checkbox, CheckboxGroup } from '../../components/Checkbox/Checkbox';
import { Field } from '../../components/Field/Field';
import { Link } from '../../components/Link/Link';
import { NumberInput } from '../../components/NumberInput/NumberInput';
import { RadioGroup, Radio } from '../../components/Radio/Radio';
import { Switch } from '../../components/Switch/Switch';
import { Table, TableBody, TableFoot, TableRow, TableHeaderCell, TableCell } from '../../components/Table/Table';
import { formatNumber } from '../../components/FormattedNumber/formatNumber';
import { useLocale } from '../../internal/provider';
import { PageHeader } from '../../blocks/PageHeader/PageHeader';
import { OfflineBanner } from '../../components/OfflineBanner/OfflineBanner';
import { Container } from '../../components/Container/Container';
import { Stack } from '../../components/Stack/Stack';

/* Price estimate: choose a plan, how many people and any extras, and see what it costs, line by line, as you go.
   For an app to copy. What it carries (WCAG 2.2):
   - 1.3.1: the plans and the extras are groups named by their question; each says its price as its description.
   - 3.3.2: the number of people says the plan's lowest and highest before you type.
   - 1.3.1: the estimate is a table, a line for each thing you pay for, with the total in its foot.
   - 4.1.3: the total is said when it changes, with how often it's billed.
   - 1.4.1: the yearly saving is said in words, not only by a struck-through price.
   Billing is the app's job: Start trial links on with the choices in the address. */

export interface Plan { id: string; name: string; perSeat: number; about: string; minSeats: number; maxSeats: number }
export interface Extra { id: string; name: string; price: number; perSeat: boolean; about: string }

export interface PriceEstimateProps {
  currency?: string | undefined;
  plans?: Plan[] | undefined;
  extras?: Extra[] | undefined;
  /** Off a yearly bill, as a share. Default: 0.2. */
  yearlyOff?: number | undefined;
  /** Where Start trial goes; the choices are added as a query. Default: "#trial". */
  trialHref?: string | undefined;
  /** Whether the app can reach its server. Left out, it follows the browser; false shows “You’re offline” at the top of
      the page, with what still works. */
  online?: boolean | undefined;
}

const demoPlans: Plan[] = [
  { id: 'starter', name: 'Starter', perSeat: 8, about: 'Boards, cards and comments', minSeats: 1, maxSeats: 10 },
  { id: 'team', name: 'Team', perSeat: 14, about: 'Starter, plus timelines, guests and automations', minSeats: 3, maxSeats: 250 },
  { id: 'business', name: 'Business', perSeat: 24, about: 'Team, plus single sign-on, audit log and admin roles', minSeats: 10, maxSeats: 5000 },
];
const demoExtras: Extra[] = [
  { id: 'storage', name: 'Extra storage', price: 20, perSeat: false, about: '1 TB more for the whole team' },
  { id: 'support', name: 'Priority support', price: 3, perSeat: true, about: 'Answers within 2 hours, any day' },
];

/** The lines of an estimate, a month at a time, and its total. Seats are kept within the plan's range. */
export function estimate(plan: Plan, seats: number, extras: Extra[], yearly: boolean, yearlyOff: number, locale = 'en-US') {
  const n = Math.min(plan.maxSeats, Math.max(plan.minSeats, Math.round(seats) || plan.minSeats));
  const lines = [{ id: plan.id, name: `${plan.name}, ${n === 1 ? '1 person' : `${formatNumber(n, locale)} people`}`, amount: plan.perSeat * n },
    ...extras.map((e) => ({ id: e.id, name: e.name, amount: e.perSeat ? e.price * n : e.price }))];
  const subtotal = lines.reduce((a, l) => a + l.amount, 0);
  const off = yearly ? Math.round(subtotal * yearlyOff * 100) / 100 : 0;
  return { seats: n, lines, subtotal, off, monthly: subtotal - off, yearlyTotal: yearly ? Math.round((subtotal - off) * 12 * 100) / 100 : 0 };
}

/** The price estimate page: a skip link, a header, then main with the h1, the choices and the estimate. */
export function PriceEstimate({ currency = 'USD', plans = demoPlans, extras = demoExtras, yearlyOff = 0.2, trialHref = '#trial', online }: PriceEstimateProps) {
  const locale = useLocale();
  const money = (n: number) => formatNumber(n, locale, { style: 'currency', currency, minimumFractionDigits: Number.isInteger(n) ? 0 : 2 });
  const [planId, setPlanId] = React.useState(plans[1]?.id ?? plans[0]!.id);
  // The radios' name is the estimate's own: two estimates on a page (a docs page shows several) don't share one group.
  const planName = React.useId();
  const [seats, setSeats] = React.useState<number | null>(12);
  const [chosen, setChosen] = React.useState<string[]>([]);
  const [yearly, setYearly] = React.useState(true);
  const plan = plans.find((p) => p.id === planId)!;
  const e = estimate(plan, seats ?? 0, extras.filter((x) => chosen.includes(x.id)), yearly, yearlyOff, locale);
  const pct = formatNumber(yearlyOff, locale, { style: 'percent' });
  const query = new URLSearchParams({ plan: planId, seats: String(e.seats), billing: yearly ? 'yearly' : 'monthly', ...(chosen.length ? { extras: extras.filter((x) => chosen.includes(x.id)).map((x) => x.id).join(',') } : {}) });

  return (
    <div className="min-h-screen bg-surface text-text">
      <SkipLink />
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <p className="m-0 text-base font-semibold">Acme Boards</p>
        <Link underline="hover" href="#pricing">Pricing</Link>
      </header>
      <Container as="main" size="lg" className="py-8 outline-none" id="main">
        <Stack gap={0}>
          <OfflineBanner online={online} placement="inline" className="mb-6">The estimate works offline. Starting a trial needs a connection.</OfflineBanner>
          <PageHeader breadcrumb={[{ label: 'Pricing', href: '#pricing' }, { label: 'Price estimate' }]} title="What would it cost?"
            description="Choose a plan, how many people and any extras. Prices are per month, before tax." />
          <div className="grid grid-cols-1 gap-6 pt-6 md:grid-cols-2">
            <div className="flex flex-col gap-4">
              <Field label="Plan" group>
                <RadioGroup name={planName} variant="card" value={planId} onValueChange={(v: string) => setPlanId(v)}>
                  {plans.map((p) => <Radio key={p.id} value={p.id} description={`${money(p.perSeat)} a person. ${p.about}.`}>{p.name}</Radio>)}
                </RadioGroup>
              </Field>
              <Field label="How many people?" id="estimate-seats" hint={`${plan.name} is for ${formatNumber(plan.minSeats, locale)} to ${formatNumber(plan.maxSeats, locale)} people.`}>
                <NumberInput min={plan.minSeats} max={plan.maxSeats} value={seats} onValueChange={setSeats} className="max-w-40" />
              </Field>
              <Field label="Extras" group optional>
                <CheckboxGroup value={chosen} onValueChange={(v: string[]) => setChosen(v)}>
                  {extras.map((x) => <Checkbox key={x.id} value={x.id} description={`${money(x.price)}${x.perSeat ? ' a person' : ''}. ${x.about}.`}>{x.name}</Checkbox>)}
                </CheckboxGroup>
              </Field>
              <Switch checked={yearly} onCheckedChange={setYearly} description={`${pct} off when you pay for a year at once.`}>Pay yearly</Switch>
            </div>
            <section aria-labelledby="estimate-title" className="flex flex-col gap-4 md:self-start">
              <Card className="flex flex-col gap-4">
                <h2 id="estimate-title" className="m-0 text-lg font-semibold">Your estimate</h2>
                <Table caption="Your estimate, a month at a time" hideCaption size="sm">
                  <TableBody>
                    {e.lines.map((l) => (
                      <TableRow key={l.id}>
                        <TableHeaderCell scope="row" className="font-normal">{l.name}</TableHeaderCell>
                        <TableCell align="end">{money(l.amount)}</TableCell>
                      </TableRow>
                    ))}
                    {e.off ? (
                      <TableRow>
                        <TableHeaderCell scope="row" className="font-normal">Paying yearly, {pct} off</TableHeaderCell>
                        <TableCell align="end">−{money(e.off)}</TableCell>
                      </TableRow>
                    ) : null}
                  </TableBody>
                  <TableFoot>
                    <TableRow>
                      <TableHeaderCell scope="row">A month</TableHeaderCell>
                      <TableCell align="end" className="font-semibold">{money(e.monthly)}</TableCell>
                    </TableRow>
                  </TableFoot>
                </Table>
                <p className="m-0" id="estimate-total" aria-live="polite">
                  {yearly ? `${money(e.monthly)} a month, billed as ${money(e.yearlyTotal)} once a year. You save ${money(e.off * 12)} a year.` : `${money(e.monthly)} a month, billed monthly.`}
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <Button href={`${trialHref}?${query.toString()}`}>Start a 14-day trial</Button>
                  <Link href="#sales">Talk to sales</Link>
                </div>
                <p className="m-0 text-sm text-text-muted">The trial is free and needs no card. You choose the plan when it ends.</p>
              </Card>
            </section>
          </div>
        </Stack>
      </Container>
    </div>
  );
}
