import type { Meta, StoryObj } from '@storybook/react-vite';
import * as React from 'react';
import { Field } from '../Field/Field';
import { TimeZonePicker } from './TimeZonePicker';

// The offsets are for a fixed moment, so the pictures don't change with daylight saving time.
const AT = new Date('2025-03-12T10:00:00Z');

const meta = {
  title: 'Components/Forms/TimeZonePicker',
  component: TimeZonePicker,
  args: { 'aria-label': 'Time zone', at: AT },
  decorators: [(Story) => <div style={{ maxWidth: 'var(--container-sm)', minHeight: 360 }}><Story /></div>],
} satisfies Meta<typeof TimeZonePicker>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Default: Story = {
  render: (args) => (
    <Field label="Time zone" hint="Meetings and reminders use it.">
      <TimeZonePicker {...args} aria-label={undefined} defaultValue="Asia/Jakarta" />
    </Field>
  ),
};

// A few zones only, such as where a team works, in Indonesian.
export const SomeZones: Story = {
  args: { zones: ['Asia/Jakarta', 'Asia/Makassar', 'Asia/Jayapura', 'Asia/Singapore', 'Europe/Amsterdam'], locale: 'id-ID', defaultValue: 'Asia/Makassar' },
};

export const Controlled: Story = {
  render: function Render(args) {
    const [zone, setZone] = React.useState<string | null>('America/New_York');
    return (
      <div style={{ display: 'grid', gap: 8 }}>
        <TimeZonePicker {...args} value={zone} onValueChange={setZone} />
        <p style={{ margin: 0 }}>Saved: {zone ?? 'none'}</p>
      </div>
    );
  },
};

// The stress story (G14): a narrow field, a long city and a long zone name.
export const LongText: Story = {
  args: { zones: ['America/Argentina/ComodRivadavia', 'America/North_Dakota/New_Salem', 'Pacific/Port_Moresby'], defaultValue: 'America/North_Dakota/New_Salem' },
  decorators: [(Story) => <div style={{ width: 200 }}><Story /></div>],
};
