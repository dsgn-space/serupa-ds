import * as React from 'react';
import { expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { Dialog } from '../components/Dialog/Dialog';
import { Drawer } from '../components/Drawer/Drawer';
import { Image } from '../components/Image/Image';
import { SegmentedControl } from '../components/SegmentedControl/SegmentedControl';

const PIXEL = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

// These forward their ref to an element they also keep a ref to: a function ref and an object ref both get it.
test.each([
  ['Dialog', 'DIALOG', (r: React.Ref<HTMLElement>) => <Dialog open={false} title="D" ref={r as React.Ref<HTMLDialogElement>} />],
  ['Drawer', 'DIALOG', (r: React.Ref<HTMLElement>) => <Drawer open={false} title="D" ref={r as React.Ref<HTMLDialogElement>} />],
  ['Image', 'IMG', (r: React.Ref<HTMLElement>) => <Image src={PIXEL} alt="Pixel" ref={r as React.Ref<HTMLImageElement>} />],
  ['SegmentedControl', 'DIV', (r: React.Ref<HTMLElement>) => <SegmentedControl aria-label="View" options={[{ value: 'a', label: 'A' }]} ref={r as React.Ref<HTMLDivElement>} />],
])('%s: a function ref and an object ref both receive the element', async (_name, tag, make) => {
  const obj = React.createRef<HTMLElement>();
  const got: (HTMLElement | null)[] = [];
  const screen = await render(<>{make(obj)}{make((n) => { got.push(n); })}</>);
  expect(obj.current?.tagName).toBe(tag);
  expect(got[0]?.tagName).toBe(tag);
  await screen.unmount();
  expect(got[got.length - 1]).toBeNull();
});
