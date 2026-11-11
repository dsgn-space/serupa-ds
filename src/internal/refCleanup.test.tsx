import * as React from 'react';
import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { Badge } from '../components/Badge/Badge';
import { Button } from '../components/Button/Button';
import { Chat } from '../components/Chat/Chat';
import { Checkbox, CheckboxGroup } from '../components/Checkbox/Checkbox';
import { Combobox } from '../components/Combobox/Combobox';
import { Image } from '../components/Image/Image';
import { Input } from '../components/Input/Input';
import { Menu, MenuItem } from '../components/Menu/Menu';
import { NumberInput } from '../components/NumberInput/NumberInput';
import { PasswordInput } from '../components/PasswordInput/PasswordInput';
import { Popover } from '../components/Popover/Popover';
import { Prose } from '../components/Prose/Prose';
import { Radio, RadioGroup } from '../components/Radio/Radio';
import { Rating } from '../components/Rating/Rating';
import { Sidebar, SidebarItem } from '../components/Sidebar/Sidebar';
import { Switch } from '../components/Switch/Switch';
import { Textarea } from '../components/Textarea/Textarea';
import { Tooltip } from '../components/Tooltip/Tooltip';


/** A callback ref that logs what React passes it and returns a cleanup that counts its runs. Stable for the test. */
function refLog() {
  const log = { calls: [] as Array<HTMLElement | null>, cleanups: 0, ref: (n: HTMLElement | null) => { log.calls.push(n); return () => { log.cleanups++; }; } };
  return log;
}

type Make = (ref: React.Ref<HTMLElement>, tick: number) => React.ReactElement;
const r = <T,>(ref: React.Ref<HTMLElement>) => ref as unknown as React.Ref<T>;

// GR237: a React 19 callback ref can return a cleanup, which React runs instead of calling it with null. Every
// component that holds the element as well as passing it on must keep that: set the caller's ref once for the node,
// not again on every render, and run its cleanup, not a call with null, when the node goes.
const CASES: Array<[string, Make]> = [
  ['Button', (ref, t) => <Button ref={r(ref)} className={'t' + t}>Save</Button>],
  ['Badge', (ref, t) => <Badge ref={r(ref)} className={'t' + t}>New</Badge>],
  ['Input', (ref, t) => <Input ref={r(ref)} aria-label="Name" className={'t' + t} />],
  ['Textarea', (ref, t) => <Textarea ref={r(ref)} aria-label="Note" className={'t' + t} />],
  ['PasswordInput', (ref, t) => <PasswordInput ref={r(ref)} aria-label="Password" className={'t' + t} />],
  ['NumberInput', (ref, t) => <NumberInput ref={r(ref)} aria-label="Count" className={'t' + t} />],
  ['Combobox', (ref, t) => <Combobox ref={r(ref)} aria-label="Fruit" options={['Apple', 'Pear']} className={'t' + t} />],
  ['Checkbox', (ref, t) => <Checkbox ref={r(ref)} className={'t' + t}>Agree</Checkbox>],
  ['CheckboxGroup', (ref, t) => <CheckboxGroup ref={r(ref)} aria-label="Days" className={'t' + t}><Checkbox value="m">Mon</Checkbox></CheckboxGroup>],
  ['RadioGroup', (ref, t) => <RadioGroup ref={r(ref)} aria-label="Size" className={'t' + t}><Radio value="s">Small</Radio></RadioGroup>],
  ['Switch', (ref, t) => <Switch ref={r(ref)} className={'t' + t}>Wi-Fi</Switch>],
  ['Rating', (ref, t) => <Rating ref={r(ref)} aria-label="Score" className={'t' + t} />],
  ['Image', (ref, t) => <Image ref={r(ref)} src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" alt="" className={'t' + t} />],
  ['Prose', (ref, t) => <Prose ref={r(ref)} className={'t' + t}><p>Text</p></Prose>],
  ['Chat', (ref, t) => <Chat ref={r(ref)} aria-label="Chat" className={'t' + t} />],
  ['Sidebar', (ref, t) => <Sidebar ref={r(ref)} aria-label="Main" className={'t' + t}><SidebarItem href="#a" label="A" /></Sidebar>],
  ['Tooltip trigger', (ref, t) => <Tooltip content={'Hint ' + t}><button ref={r(ref)}>T</button></Tooltip>],
  ['Popover trigger', (ref, t) => <Popover trigger={<button ref={r(ref)}>P</button>}>Body {t}</Popover>],
  ['Menu trigger', (ref, t) => <Menu trigger={<button ref={r(ref)}>M</button>}><MenuItem>One {t}</MenuItem></Menu>],
];

describe('forwarded refs keep React 19 ref cleanups (GR237)', () => {
  test.each(CASES)('%s: the caller\'s ref is set once, and its cleanup runs when the node goes', async (_name, make) => {
    const log = refLog();
    const screen = await render(make(log.ref, 0));
    await screen.rerender(make(log.ref, 1));
    await screen.rerender(make(log.ref, 2));
    const whileMounted = [...log.calls];
    await screen.unmount();
    expect([whileMounted.length, whileMounted[0] instanceof HTMLElement, log.calls.length, log.cleanups]).toEqual([1, true, 1, 1]);
  });

  test.each(CASES)('%s: an object ref is set, then back to null', async (_name, make) => {
    const obj = React.createRef<HTMLElement>();
    const screen = await render(make(obj, 0));
    const set = obj.current instanceof HTMLElement;
    await screen.unmount();
    expect([set, obj.current]).toEqual([true, null]);
  });
});
