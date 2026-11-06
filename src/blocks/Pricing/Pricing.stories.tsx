import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Heading } from '../../components/Heading/Heading';
import { SerupaProvider } from '../../internal/provider';
import { Pricing, type PricingPlan } from './Pricing';

/* Pricing (BL6): plans side by side, monthly or yearly, as a block an app copies. Pricing.mdx says what each part is
   for. The stories put it on a small page (a skip link, main, an h1 and the h2 the plans' h3s sit under). */
const wait = () => new Promise((resolve) => { window.setTimeout(resolve, 600); });

const plans: PricingPlan[] = [
  { id: 'free', name: 'Free', description: 'For trying it out on your own.', monthly: 0, yearly: 0, features: ['3 projects', '1 GB of files', 'Community help'], current: true },
  { id: 'pro', name: 'Pro', description: 'For small teams that ship every week.', monthly: 12, yearly: 120, features: ['Unlimited projects', '100 GB of files', 'Guest access', 'Email help'], recommended: true },
  { id: 'team', name: 'Team', description: 'For companies with many teams.', monthly: 24, yearly: 240, features: ['Everything in Pro', 'Single sign-on', 'Audit log', 'Help within a day'] },
];

function Page({ children, title = 'Billing', section = 'Plans' }: { children: React.ReactNode; title?: string; section?: string }) {
  return <div className="min-h-screen bg-surface-muted text-text"><SkipLink /><main id="main" className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6 outline-none">
    <Heading level={1}>{title}</Heading><Heading level={2}>{section}</Heading>{children}</main></div>;
}

const meta = {
  title: 'Blocks/Pricing',
  component: Pricing,
  parameters: { layout: 'fullscreen' },
  args: { plans, currency: 'USD', onChoose: wait },
  render: (args) => <Page><Pricing {...args} /></Page>,
} satisfies Meta<typeof Pricing>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Three plans billed monthly: the current one says so instead of offering a button, and the recommended one is marked in words. */
export const Monthly: Story = {};

/** Billed yearly: the price per month, what is paid once a year, and the saving in the yearly option's name. */
export const Yearly: Story = { args: { defaultPeriod: 'yearly' } };

/** In Indonesian rupiah, with the words in Indonesian: money is written the locale's way. */
export const Indonesian: Story = {
  args: {
    currency: 'IDR',
    plans: [
      { id: 'dasar', name: 'Dasar', monthly: 0, yearly: 0, features: ['3 proyek', 'File 1 GB'], current: true },
      { id: 'pro', name: 'Pro', monthly: 150000, yearly: 1500000, features: ['Proyek tanpa batas', 'File 100 GB', 'Akses tamu'], recommended: true },
      { id: 'tim', name: 'Tim', monthly: 300000, yearly: 3000000, features: ['Semua yang ada di Pro', 'Masuk sekali (SSO)', 'Log audit'] },
    ],
    labels: {
      period: 'Periode tagihan', monthly: 'Bulanan', yearly: (s) => (s > 0 ? `Tahunan, hemat ${s}%` : 'Tahunan'), perMonth: 'per bulan',
      billedYearly: (t) => `${t} ditagih per tahun`, current: 'Paket Anda saat ini', recommended: 'Disarankan',
      included: (p) => `Termasuk di ${p}`, choose: (p) => `Pilih ${p}`,
    },
  },
  render: (args) => <SerupaProvider locale="id-ID"><div lang="id"><Page title="Tagihan" section="Paket"><Pricing {...args} /></Page></div></SerupaProvider>,
};
