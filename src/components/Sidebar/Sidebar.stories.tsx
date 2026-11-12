import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Sidebar, SidebarItem, SidebarSection } from './Sidebar';
import { Badge } from '../Badge/Badge';
import { Avatar } from '../Avatar/Avatar';
import { IconButton } from '../IconButton/IconButton';
import { useName } from '../../../.storybook/content';

const items = [
  <SidebarSection key="a">
    <SidebarItem href="#" icon="home" label="Home" active />
    <SidebarItem href="#" icon="inbox" label="Inbox" badge={<Badge count={4} />} />
  </SidebarSection>,
  <SidebarSection key="b" title="Workspace">
    <SidebarItem icon="folder" label="Projects" defaultOpen>
      <SidebarItem href="#" label="Website" />
      <SidebarItem href="#" label="Mobile app" />
    </SidebarItem>
    <SidebarItem href="#" icon="group" label="Team" />
    <SidebarItem href="#" icon="bar_chart" label="Reports" />
  </SidebarSection>,
];

// The signed-in person follows Storybook's Content menu (.storybook/content.ts): a long name in the worst case.
const Me = ({ nameShown = true }: { nameShown?: boolean }) => { const name = useName('Ada Lovelace'); return nameShown ? <div className="flex items-center gap-2 text-sm text-text"><Avatar name={name} size="sm" /><span>{name}</span></div> : <div className="flex justify-center"><Avatar name={name} size="sm" /></div>; };
const meta = {
  title: 'Components/Navigation/Sidebar',
  component: Sidebar,
  subcomponents: { SidebarSection, SidebarItem },
  parameters: { layout: 'fullscreen' },
  args: {
    header: <strong className="block px-3 py-1 text-base text-text">Acme</strong>,
    footer: <Me />,
    children: items,
  },
  argTypes: { header: { control: false }, footer: { control: false }, children: { control: false } },
  render: (args) => <div style={{ display: 'flex', height: 520 }}><Sidebar {...args} /></div>,
} satisfies Meta<typeof Sidebar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Collapsed: Story = {
  args: { collapsed: true, header: <strong className="block text-center text-base text-text">A</strong>, footer: <Me nameShown={false} /> },
};

export const Toggle: Story = {
  render: function Render(args) {
    const [collapsed, setCollapsed] = React.useState(false);
    return (
      <div style={{ display: 'flex', height: 520 }}>
        <Sidebar {...args} collapsed={collapsed} footer={<IconButton icon={collapsed ? 'left_panel_open' : 'left_panel_close'} label={collapsed ? 'Expand the sidebar' : 'Collapse the sidebar'} onClick={() => setCollapsed(!collapsed)} />} />
      </div>
    );
  },
};

export const LongLabels: Story = {
  args: {
    children: [
      <SidebarSection key="a" title="Workspace settings for every team">
        <SidebarItem href="#" icon="home" label="Home and recent activity across projects" active />
        <SidebarItem href="#" icon="inbox" label="Donaudampfschifffahrtsgesellschaftskapitänskajüte" badge={<Badge count={1234} />} />
      </SidebarSection>,
    ],
  },
  render: (args) => <div style={{ display: 'flex', height: 320, width: 200 }}><Sidebar {...args} /></div>,
};
