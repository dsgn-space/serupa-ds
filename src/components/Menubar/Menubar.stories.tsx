import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MenuCheckboxItem, MenuGroup, MenuItem, MenuSeparator, MenuSub } from '../Menu/Menu';
import { Menubar, MenubarMenu } from './Menubar';

function Editor(props: { long?: boolean; open?: boolean }) {
  const [ruler, setRuler] = React.useState(true);
  return (
    <Menubar aria-label="Editor">
      <MenubarMenu label={props.long ? 'Berkas dan dokumen yang dibuka' : 'File'}>
        <MenuItem icon="add" shortcut="⌘N">New</MenuItem>
        <MenuItem icon="folder_open" shortcut="⌘O">Open…</MenuItem>
        <MenuSub icon="share" label="Share">
          <MenuItem icon="mail">Email</MenuItem>
          <MenuItem icon="link">Copy link</MenuItem>
        </MenuSub>
        <MenuSeparator />
        <MenuItem icon="print" shortcut="⌘P">{props.long ? 'Print with the page setup chosen for this document last time' : 'Print'}</MenuItem>
      </MenubarMenu>
      <MenubarMenu label="Edit" defaultOpen={props.open}>
        <MenuItem icon="undo" shortcut="⌘Z">Undo</MenuItem>
        <MenuItem icon="redo" shortcut="⇧⌘Z">Redo</MenuItem>
        <MenuSeparator />
        <MenuItem icon="content_cut" shortcut="⌘X">Cut</MenuItem>
        <MenuItem icon="content_copy" shortcut="⌘C">Copy</MenuItem>
        <MenuItem icon="content_paste" shortcut="⌘V">Paste</MenuItem>
      </MenubarMenu>
      <MenubarMenu label="View">
        <MenuGroup label="Show">
          <MenuCheckboxItem checked={ruler} onCheckedChange={setRuler}>Ruler</MenuCheckboxItem>
        </MenuGroup>
        <MenuItem icon="zoom_in" shortcut="⌘+">Zoom in</MenuItem>
        <MenuItem icon="zoom_out" shortcut="⌘-">Zoom out</MenuItem>
      </MenubarMenu>
      <MenubarMenu label="Help">
        <MenuItem icon="help">Help center</MenuItem>
        <MenuItem icon="keyboard">Keyboard shortcuts</MenuItem>
      </MenubarMenu>
    </Menubar>
  );
}

const meta = {
  title: 'Components/Overlays/Menubar',
  component: Menubar,
  args: { 'aria-label': 'Editor' },
  render: () => <Editor />,
} satisfies Meta<typeof Menubar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
/** A menu open: in the page, ↓ on the bar's focused name opens it on its first item, and ← → move to the next menu, open. */
export const Open: Story = { render: () => <div style={{ minHeight: 280 }}><Editor open /></div> };
/** A menu that can't open yet: still in the bar and reachable, but dimmed. */
export const Disabled: Story = {
  render: () => (
    <Menubar aria-label="Editor">
      <MenubarMenu label="File"><MenuItem>New</MenuItem></MenubarMenu>
      <MenubarMenu label="Edit" disabled><MenuItem>Undo</MenuItem></MenubarMenu>
      <MenubarMenu label="View"><MenuItem>Zoom in</MenuItem></MenubarMenu>
    </Menubar>
  ),
};
// The stress story (G14): long words, long labels, more items than fit; the visual baselines show how it copes.
export const LongText: Story = { render: () => <Editor long /> };
