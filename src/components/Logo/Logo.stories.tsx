import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Logo } from './Logo';

// A made-up brand, "Acme", drawn for light and dark backgrounds.
const svg = (w: number, body: string) => 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="32" viewBox="0 0 ${w} 32">${body}</svg>`);
const mark = (bg: string, fg: string) => `<rect width="32" height="32" rx="8" fill="${bg}"/><path d="M9 23 16 8l7 15h-4l-3-7-3 7z" fill="${fg}"/>`;
const word = (fill: string) => `<text x="42" y="23" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="700" fill="${fill}">Acme</text>`;
const logo = svg(104, mark('#1d4ed8', '#fff') + word('#0f172a'));
const logoDark = svg(104, mark('#60a5fa', '#0f172a') + word('#f8fafc'));
const logoMark = svg(32, mark('#1d4ed8', '#fff'));
const logoMarkDark = svg(32, mark('#60a5fa', '#0f172a'));

const meta = {
  title: 'Components/Content/Logo',
  component: Logo,
  args: { src: logo, darkSrc: logoDark, markSrc: logoMark, markDarkSrc: logoMarkDark, alt: 'Acme' },
  argTypes: { src: { control: false }, darkSrc: { control: false }, markSrc: { control: false }, markDarkSrc: { control: false } },
} satisfies Meta<typeof Logo>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
// Dark themes show the dark version: switch the theme in the toolbar.
export const Default: Story = { name: 'Full logo' };
export const Mark: Story = { name: 'Small mark', args: { variant: 'mark' } };
// The mark below 768px, the full logo from there up: narrow the window to see it change.
export const Auto: Story = { name: 'Mark on a narrow screen (auto)', args: { variant: 'auto' } };
export const AutoSm: Story = { name: 'Auto, below 640px', args: { variant: 'auto', collapseBelow: 'sm' } };
export const AutoLg: Story = { name: 'Auto, below 1024px', args: { variant: 'auto', collapseBelow: 'lg' } };
export const Sizes: Story = {
  render: (args) => <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}><Logo {...args} size="sm" /><Logo {...args} size="md" /><Logo {...args} size="lg" /></div>,
};
// In a link home, the link takes the name and the picture is left out of the accessibility tree.
export const InALink: Story = { name: 'In a link home', render: (args) => <a href="#home" aria-label="Acme home"><Logo {...args} alt="" /></a> };
// The light version only: a dark theme shows it as is.
export const LightOnly: Story = { name: 'No dark version', args: { darkSrc: undefined, markDarkSrc: undefined } };
// The stress story (G14): a wide logo in a narrow box shrinks to fit, keeping its shape.
export const Overflow: Story = { name: 'Wider than its box', render: (args) => <div style={{ width: 80, border: '1px dashed currentColor' }}><Logo {...args} size="lg" /></div> };
