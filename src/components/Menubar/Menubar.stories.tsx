import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MenuCheckboxItem, MenuGroup, MenuItem, MenuSeparator, MenuSub } from '../Menu/Menu';
import { Menubar, MenubarMenu } from './Menubar';

function Editor(props: { long?: boolean; open?: boolean }) {
  const [ruler, setRuler] = React.useState(true);
  return (
    <Menubar aria-label="Editor">
      <MenubarMenu label={props.long ? 'Berkas dan dokumen yang dibuka' : 'File'}>
        <MenuItem icon="add" shortcut={['alt', 'N']}>New</MenuItem>
        <MenuItem icon="folder_open" shortcut={['mod', 'shift', 'O']}>Open…</MenuItem>
        <MenuSub icon="share" label="Share">
          <MenuItem icon="mail">Email</MenuItem>
          <MenuItem icon="link">Copy link</MenuItem>
        </MenuSub>
        <MenuSeparator />
        <MenuItem icon="print" shortcut={['mod', 'P']}>{props.long ? 'Print with the page setup chosen for this document last time' : 'Print'}</MenuItem>
      </MenubarMenu>
      <MenubarMenu label="Edit" defaultOpen={props.open}>
        <MenuItem icon="undo" shortcut={['mod', 'Z']}>Undo</MenuItem>
        <MenuItem icon="redo" shortcut={['mod', 'shift', 'Z']}>Redo</MenuItem>
        <MenuSeparator />
        <MenuItem icon="content_cut" shortcut={['mod', 'X']}>Cut</MenuItem>
        <MenuItem icon="content_copy" shortcut={['mod', 'C']}>Copy</MenuItem>
        <MenuItem icon="content_paste" shortcut={['mod', 'V']}>Paste</MenuItem>
      </MenubarMenu>
      <MenubarMenu label="View">
        <MenuGroup label="Show">
          <MenuCheckboxItem checked={ruler} onCheckedChange={setRuler}>Ruler</MenuCheckboxItem>
        </MenuGroup>
        <MenuItem icon="zoom_in" shortcut={['alt', '+']}>Zoom in</MenuItem>
        <MenuItem icon="zoom_out" shortcut={['alt', '-']}>Zoom out</MenuItem>
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

// Do and don't, drawn on the guide's page beside each rule (the README's "### Do and don't").
/** Do: the names people know, in the usual order. */
export const DoFamiliarNames: Story = {
  name: 'Do: use the names people know',
  render: () => <Menubar aria-label="Editor">
    <MenubarMenu label="File"><MenuItem>New</MenuItem></MenubarMenu>
    <MenubarMenu label="Edit"><MenuItem>Undo</MenuItem></MenubarMenu>
    <MenubarMenu label="View"><MenuItem>Zoom in</MenuItem></MenubarMenu>
    <MenubarMenu label="Help"><MenuItem>Guides</MenuItem></MenubarMenu>
  </Menubar>,
};
/** Don't: new names in a new order, so people can't find what they know is there. */
export const DontNewNames: Story = {
  name: "Don't: rename the usual menus",
  render: () => <Menubar aria-label="Editor">
    <MenubarMenu label="Questions"><MenuItem>Guides</MenuItem></MenubarMenu>
    <MenubarMenu label="Stuff"><MenuItem>New</MenuItem></MenubarMenu>
    <MenubarMenu label="Display"><MenuItem>Zoom in</MenuItem></MenubarMenu>
    <MenubarMenu label="Changes"><MenuItem>Undo</MenuItem></MenubarMenu>
  </Menubar>,
};
