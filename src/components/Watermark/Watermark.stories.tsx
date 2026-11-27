import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { usePeople } from '../../../.storybook/content';
import { Prose } from '../Prose/Prose';
import { Watermark } from './Watermark';

// A payslip preview: real text under the mark, so each story shows that it stays readable.
function Payslip() {
  return (
    <Prose>
      <h2>Payslip, November 2026</h2>
      <p>Your salary for November was paid into your account ending 4821 on 25 November. The breakdown below shows your base pay, allowances and deductions.</p>
      <table>
        <thead><tr><th>Item</th><th>Amount</th></tr></thead>
        <tbody>
          <tr><td>Base pay</td><td>Rp 18.500.000</td></tr>
          <tr><td>Transport allowance</td><td>Rp 1.200.000</td></tr>
          <tr><td>Income tax</td><td>−Rp 2.140.000</td></tr>
          <tr><td>Paid</td><td>Rp 17.560.000</td></tr>
        </tbody>
      </table>
      <p>Questions about this payslip go to the payroll team. Keep it private: the mark shows it was opened by you.</p>
    </Prose>
  );
}

const meta = {
  title: 'Components/Content/Watermark',
  component: Watermark,
  args: { text: ['Ada Lovelace', 'ada@example.com'], children: <Payslip /> },
} satisfies Meta<typeof Watermark>;
export default meta;
type Story = StoryObj<typeof meta>;

/** The viewer's name and email over a payslip preview. Select the text: the mark is never picked up. */
export const Playground: Story = {};

/** The Content menu's people: a long name, a single name, a missing email. */
export const Viewer: Story = {
  render: function Render(args) {
    const [person] = usePeople();
    return <Watermark {...args} text={person ? [person.name, person.email ?? ''] : []} />;
  },
};

/** One word on a contract draft, with more room between the marks. */
export const Draft: Story = { args: { text: 'Draft', gap: 'lg' } };

/** rotate: level text, and a steeper angle. */
export const Rotation: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 24 }}>
      <Watermark {...args} rotate={0} />
      <Watermark {...args} rotate={45} />
    </div>
  ),
};

/** fullPage: over the whole window, such as a support agent's shared screen. Scroll: it stays put. */
export const FullPage: Story = { args: { text: ['Support · Dana Putri', 'Shared screen'], fullPage: true } };

/** Arabic and Chinese marks read the right way round. */
export const OtherScripts: Story = { args: { text: ['سري للغاية', '机密文件'] } };

/** The stress story (G14): a long unbroken word and a long second line. The marks spread out to fit them. */
export const LongText: Story = { args: { text: ['Donaudampfschifffahrtsgesellschaftskapitänswitwenrentenversicherung', 'a second line long enough to make the mark wide'] } };
