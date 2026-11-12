import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tab, TabList, TabPanel, Tabs } from './Tabs';
import { SegmentedControl } from '../SegmentedControl/SegmentedControl';

const meta = {
  title: 'Components/Navigation/Tabs',
  component: Tabs,
  args: { variant: 'line', size: 'md', activation: 'auto' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['line', 'pill'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    activation: { control: 'inline-radio', options: ['auto', 'manual'] },
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
  },
  render: (args) => (
    <Tabs {...args} style={{ maxWidth: 520 }}>
      <TabList aria-label="Project">
        <Tab value="overview">Overview</Tab>
        <Tab value="activity" icon="history">Activity</Tab>
        <Tab value="members">Members</Tab>
        <Tab value="settings" disabled>Settings</Tab>
      </TabList>
      <TabPanel value="overview">Atlas is on track for the March release.</TabPanel>
      <TabPanel value="activity">Ada updated the roadmap 2 hours ago.</TabPanel>
      <TabPanel value="members">6 members, 2 pending invites.</TabPanel>
      <TabPanel value="settings">Settings are locked.</TabPanel>
    </Tabs>
  ),
} satisfies Meta<typeof Tabs>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const Pill: Story = { args: { variant: 'pill', size: 'sm' } };
/** 44px tabs with 16px text, beside large fields and buttons or on a touch screen. */
export const Large: Story = { args: { size: 'lg' } };
export const Controlled: Story = {
  render: function Render() {
    const [v, setV] = React.useState('week');
    return <div className="flex flex-col gap-2">
      <Tabs value={v} onValueChange={setV} variant="pill">
        <TabList aria-label="Range"><Tab value="day">Day</Tab><Tab value="week">Week</Tab><Tab value="month">Month</Tab></TabList>
      </Tabs>
      <p className="text-sm">Showing: {v}</p>
    </div>;
  },
};
/** More tabs than fit: the edge with more past it fades out, and the selected tab is scrolled into view. */
export const Overflow: Story = {
  render: (args) => (
    <Tabs {...args} defaultValue="m12" style={{ maxWidth: 400 }}>
      <TabList aria-label="Months">
        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => <Tab key={m} value={'m' + (i + 1)}>{m}</Tab>)}
      </TabList>
    </Tabs>
  ),
};
export const Vertical: Story = { args: { orientation: 'vertical' } };

// Do and don't, drawn on the guide's page beside each rule (the README's "### Do and don't").
/** Do: a word or two per tab, so every tab is in view. */
export const DoShortLabels: Story = {
  name: 'Do: short labels',
  render: () => <Tabs defaultValue="overview" style={{ maxWidth: 320 }}><TabList aria-label="Project"><Tab value="overview">Overview</Tab><Tab value="activity">Activity</Tab><Tab value="members">Members</Tab></TabList></Tabs>,
};
/** Don't: long labels, which push tabs out of view. */
export const DontLongLabels: Story = {
  name: "Don't: long labels",
  render: () => <Tabs defaultValue="overview" style={{ maxWidth: 320 }}><TabList aria-label="Project"><Tab value="overview">Project overview</Tab><Tab value="activity">Recent team activity</Tab><Tab value="members">Members and roles</Tab></TabList></Tabs>,
};
/** Do: a SegmentedControl to pick a value for the same content. */
export const DoSegmentedForValue: Story = {
  name: 'Do: a SegmentedControl for a value',
  render: () => <SegmentedControl aria-label="Period" defaultValue="week" options={[{ value: 'day', label: 'Day' }, { value: 'week', label: 'Week' }, { value: 'month', label: 'Month' }]} />,
};
/** Don't: tabs to pick a period: they promise separate panels. */
export const DontTabsForValue: Story = {
  name: "Don't: tabs for a value",
  render: () => <Tabs defaultValue="week" style={{ maxWidth: 320 }}><TabList aria-label="Period"><Tab value="day">Day</Tab><Tab value="week">Week</Tab><Tab value="month">Month</Tab></TabList></Tabs>,
};
