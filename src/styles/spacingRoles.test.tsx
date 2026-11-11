import * as React from 'react';
import { expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { Card } from '../components/Card/Card';
import { Dialog } from '../components/Dialog/Dialog';
import { Drawer } from '../components/Drawer/Drawer';
import { Popover } from '../components/Popover/Popover';
import { Button } from '../components/Button/Button';

// The spacing roles the docs name for a component's padding are the ones it reads: space-surface pads a dialog, a
// drawer and a large card, and space-content a popover. Setting a role on part of the page (or :root) makes them
// denser or roomier with it; a component's own token still wins.
const pad = (el: Element | null | undefined) => getComputedStyle(el as Element).paddingTop;

test('Dialog, Drawer and a large Card take their padding from space-surface, Popover from space-content; their own tokens win', async () => {
  const roles = { '--space-surface': '40px', '--space-content': '12px' } as React.CSSProperties;
  await render(<div style={roles}>
    <Card id="card" padding="lg">Card</Card>
    <Card id="card-md">Card</Card>
    <Dialog id="dlg" defaultOpen title="Dialog">Body</Dialog>
    <Drawer id="drw" defaultOpen modal={false} title="Drawer">Body</Drawer>
    <Popover id="pop" defaultOpen trigger={<Button>Open</Button>}>Body</Popover>
  </div>);
  const panel = (id: string) => document.getElementById(id)?.firstElementChild;
  await expect.poll(() => [pad(document.getElementById('card')), pad(document.getElementById('card-md')), pad(panel('dlg')), pad(panel('drw')), pad(document.getElementById('pop'))])
    .toEqual(['40px', '20px', '40px', '40px', '12px']);
  // A component's own token still wins over the role.
  (document.getElementById('dlg') as HTMLElement).style.setProperty('--dialog-padding', '8px');
  expect(pad(panel('dlg'))).toBe('8px');
});
