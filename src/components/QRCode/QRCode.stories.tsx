import type { Meta, StoryObj } from '@storybook/react-vite';
import * as React from 'react';
import { QRCode } from './QRCode';

const meta = {
  title: 'Components/Content/QRCode',
  component: QRCode,
  args: { value: 'https://example.com/pay/1042', label: 'QR code to pay order 1042' },
} satisfies Meta<typeof QRCode>;
export default meta;
type Story = StoryObj<typeof meta>;

// A plain square mark for the logo stories, so nothing depends on the network.
const MARK = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect width="10" height="10" rx="2" fill="#2f5bd3"/><path d="M3 5h4M5 3v4" stroke="#fff" stroke-width="1.4"/></svg>');

export const Playground: Story = {};
/** A payment link, at the default size. */
export const Default: Story = {};
/** The three sizes, quiet zone included. */
export const Sizes: Story = {
  render: (args) => <div style={{ display: 'flex', gap: 24, alignItems: 'end', flexWrap: 'wrap' }}>
    <QRCode {...args} size="sm" />
    <QRCode {...args} />
    <QRCode {...args} size="lg" />
  </div>,
};
/** A logo in the middle: the level goes up to H, so the covered modules are made up for. */
export const WithLogo: Story = { args: { logo: MARK, size: 'lg' } };
/** Each status over the code. */
export const Statuses: Story = {
  render: (args) => <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
    <QRCode {...args} label="Sign-in code, loading" status="loading" />
    <QRCode {...args} label="Sign-in code, expired" status="expired" onRefresh={() => {}} />
    <QRCode {...args} label="Sign-in code, scanned" status="scanned" />
  </div>,
};
// The stress story (G14): a long value makes a denser code at the smallest size, and the expired status at sm.
export const LongText: Story = {
  render: (args) => <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
    <QRCode {...args} size="sm" value={'otpauth://totp/Serupa:ada.lovelace@example.com?secret=JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP&issuer=Serupa&algorithm=SHA1&digits=6&period=30'} label="Authenticator setup code" />
    <QRCode {...args} size="sm" status="expired" onRefresh={() => {}} label="Expired code" />
  </div>,
};
/** Don't: a long text in the code, which packs it too dense to scan from a phone screen. */
export const DontLongValue: Story = { tags: ['!visual'],
  name: "Don't: a long text",
  args: { value: 'Order 1042. Pay 1,250,000 IDR to PT Contoh Jaya, account 123 456 7890 at Bank Contoh, by 30 November 2026. Write the order number in the transfer note so we can match it to your order, and keep the receipt until it shows as paid.' },
};
