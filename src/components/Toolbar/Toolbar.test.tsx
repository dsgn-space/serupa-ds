import * as React from 'react';
import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { THEMES, contrast, css } from '../../../tools/test/vitest/helpers';
import { Button } from '../Button/Button';
import { ButtonGroup } from '../ButtonGroup/ButtonGroup';
import { Divider } from '../Divider/Divider';
import { IconButton } from '../IconButton/IconButton';
import { Input } from '../Input/Input';
import { Menu, MenuItem } from '../Menu/Menu';
import { SerupaProvider } from '../../internal/provider';
import { idLabels } from '../../internal/labels';
import { ToggleButton } from '../ToggleButton/ToggleButton';
import { Toolbar } from './Toolbar';

const el = (id: string) => document.getElementById(id) as HTMLElement;
const focused = () => document.activeElement && document.activeElement.id;
const stops = (id: string) => [...el(id).querySelectorAll<HTMLElement>('button, input')].map((b) => b.id + ':' + b.tabIndex).join();

function Format({ id = 'tb', ...props }: Partial<React.ComponentProps<typeof Toolbar>>) {
  return (
    <>
      <button id="before">Before</button>
      <Toolbar id={id} aria-label="Text formatting" {...props}>
        <ButtonGroup aria-label="Style">
          <ToggleButton id="b" icon="format_bold" aria-label="Bold" />
          <ToggleButton id="i" icon="format_italic" aria-label="Italic" />
        </ButtonGroup>
        <Divider orientation="vertical" />
        <Button id="off" variant="ghost" disabled>Off</Button>
        <Button id="link" variant="ghost">Link</Button>
      </Toolbar>
      <button id="after">After</button>
    </>
  );
}

describe('Toolbar', () => {
  test('a role="toolbar" named by aria-label, horizontal by default; ref, className and other props reach it', async () => {
    const ref = React.createRef<HTMLDivElement>();
    await render(<Toolbar id="x" ref={ref} aria-label="Tools" className="extra" data-x="y"><Button>One</Button></Toolbar>);
    const e = el('x');
    expect([e.tagName, page.getByRole('toolbar', { name: 'Tools' }).element() === e, e.getAttribute('aria-orientation'), ref.current === e, e.className, e.dataset.x, e.dataset.component, e.dataset.orientation])
      .toEqual(['DIV', true, 'horizontal', true, 'srp-toolbar extra', 'y', 'toolbar', 'horizontal']);
  });

  test('size: every button in it without its own, in a ButtonGroup too, takes the toolbar\'s (sm 24, md 32, lg 44px); a group\'s or a button\'s own size wins', async () => {
    const Bar = (p: { id: string; size?: 'sm' | 'md' | 'lg' }) => (
      <Toolbar id={p.id} size={p.size} aria-label="Edit">
        <Button variant="secondary">Cut</Button>
        <ButtonGroup aria-label="Style"><ToggleButton>Bold</ToggleButton><IconButton icon="format_italic" label="Italic" /></ButtonGroup>
        <ButtonGroup size="sm" aria-label="Own"><Button variant="secondary">Group</Button></ButtonGroup>
        <Button variant="secondary" size="md">Own</Button>
      </Toolbar>
    );
    await render(<><Bar id="tsm" size="sm" /><Bar id="tmd" size="md" /><Bar id="tlg" size="lg" /><Bar id="tnone" /></>);
    const heights = (id: string) => [...document.getElementById(id)!.querySelectorAll('button')].map((b) => b.getBoundingClientRect().height);
    expect(['tsm', 'tmd', 'tlg', 'tnone'].map(heights)).toEqual([[24, 24, 24, 24, 32], [32, 32, 32, 24, 32], [44, 44, 44, 24, 32], [32, 32, 32, 24, 32]]);
  });

  test('its corners are concentric with the buttons inside: their radius plus the padding and the 1px edge (6 + 4 + 1 = 11px; 12 + 4 + 1 with round corners); --toolbar-radius still sets them', async () => {
    await render(<><Toolbar id="tb1" aria-label="A"><Button id="b1">One</Button></Toolbar>
      <div data-radius="round"><Toolbar id="tb2" aria-label="B"><Button id="b2">Two</Button></Toolbar></div>
      <Toolbar id="tb3" aria-label="C" style={{ '--toolbar-radius': '3px' } as React.CSSProperties}><Button>Three</Button></Toolbar></>);
    const r = (id: string) => parseFloat(css(el(id)).borderTopLeftRadius);
    const pad = (id: string) => parseFloat(css(el(id)).paddingTop) + parseFloat(css(el(id)).borderTopWidth);
    expect([r('tb1') - pad('tb1') === r('b1'), r('tb2') - pad('tb2') === r('b2'), r('tb1'), r('tb3')]).toEqual([true, true, 11, 3]);
  });

  test('one Tab stop: the first control; Tab goes in and straight out again', async () => {
    await render(<Format />);
    expect(stops('tb')).toBe('b:0,i:-1,off:-1,link:-1');
    el('before').focus();
    await userEvent.tab();
    expect(focused()).toBe('b');
    await userEvent.tab();
    expect(focused()).toBe('after');
  });

  test('Right and Left move focus, skipping a disabled control, and wrap at the ends; Home and End go to the first and last', async () => {
    await render(<Format />);
    el('b').focus();
    const seen: (string | null)[] = [];
    for (const k of ['{ArrowRight}', '{ArrowRight}', '{ArrowRight}', '{ArrowLeft}', '{End}', '{Home}', '{ArrowLeft}']) { await userEvent.keyboard(k); seen.push(focused()); }
    expect(seen).toEqual(['i', 'link', 'b', 'link', 'link', 'b', 'link']);
    expect(stops('tb')).toBe('b:-1,i:-1,off:-1,link:0');
  });

  test('coming back with Shift+Tab or Tab lands on the control used last', async () => {
    await render(<Format />);
    el('b').focus();
    await userEvent.keyboard('{ArrowRight}');
    await userEvent.tab();
    expect(focused()).toBe('after');
    await userEvent.tab({ shift: true });
    expect(focused()).toBe('i');
    await userEvent.click(el('link'));
    expect(stops('tb')).toBe('b:-1,i:-1,off:-1,link:0');
  });

  test('vertical: aria-orientation, a column; Down and Up move focus and Right and Left don\'t', async () => {
    await render(<Format orientation="vertical" />);
    expect([el('tb').getAttribute('aria-orientation'), css(el('tb')).flexDirection]).toEqual(['vertical', 'column']);
    el('b').focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(focused()).toBe('b');
    await userEvent.keyboard('{ArrowDown}');
    expect(focused()).toBe('i');
    await userEvent.keyboard('{ArrowUp}{ArrowUp}');
    expect(focused()).toBe('link');
  });

  test('right to left: ArrowLeft goes to the next control', async () => {
    await render(<div dir="rtl"><Format /></div>);
    el('b').focus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(focused()).toBe('i');
    await userEvent.keyboard('{ArrowRight}');
    expect(focused()).toBe('b');
  });

  test('in a text field the arrows, Home and End stay the field\'s; a control added later joins the order out of the Tab order', async () => {
    function Grow() {
      const [more, setMore] = React.useState(false);
      return <Toolbar id="tf" aria-label="Find"><Input id="q" aria-label="Find" defaultValue="abc" /><Button id="go" onClick={() => setMore(true)}>Go</Button>{more && <Button id="next">Next</Button>}</Toolbar>;
    }
    await render(<Grow />);
    const q = el('q') as HTMLInputElement;
    q.focus();
    q.setSelectionRange(3, 3);
    await userEvent.keyboard('{ArrowLeft}{Home}');
    expect([focused(), q.selectionStart]).toEqual(['q', 0]);
    await userEvent.click(el('go'));
    await expect.poll(() => el('next') && el('next').tabIndex).toBe(-1);
    el('go').focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(focused()).toBe('next');
  });

  test('a Menu inside: its items aren\'t toolbar controls, and the Menu keeps its own arrow keys', async () => {
    await render(<Toolbar id="tm" aria-label="Edit"><Button id="cut">Cut</Button>
      <Menu trigger={<Button id="more">More</Button>}><MenuItem id="m1">One</MenuItem><MenuItem id="m2">Two</MenuItem></Menu></Toolbar>);
    expect(stops('tm')).toBe('cut:0,more:-1');
    el('more').focus();
    await userEvent.keyboard('{Enter}');
    await expect.poll(() => focused()).toBe('m1');
    await userEvent.keyboard('{ArrowDown}');
    expect(focused()).toBe('m2');
    await userEvent.keyboard('{Escape}');
    await expect.poll(() => focused()).toBe('more');
    await userEvent.keyboard('{ArrowLeft}');
    expect(focused()).toBe('cut');
  });

  test('your onKeyDown runs first: preventDefault() keeps the toolbar from moving focus', async () => {
    await render(<Format onKeyDown={(e) => { if (e.key === 'ArrowRight') e.preventDefault(); }} />);
    el('b').focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(focused()).toBe('b');
    await userEvent.keyboard('{End}');
    expect(focused()).toBe('link');
  });

  test('layout: controls 4px apart inside 4px of padding, centered in a wrapping row', async () => {
    await render(<Format />);
    const s = css(el('tb'));
    expect([s.display, s.flexWrap, s.alignItems, s.columnGap, s.paddingTop, s.borderTopLeftRadius]).toEqual(['flex', 'wrap', 'center', '4px', '4px', '11px']);
  });

  test('its text reads 4.5:1 on its background in every theme', async () => {
    await render(<Toolbar id="c" aria-label="Status">Text</Toolbar>);
    for (const th of THEMES) {
      document.documentElement.setAttribute('data-theme', th);
      expect(contrast(css(el('c')).color, css(el('c')).backgroundColor), th).toBeGreaterThanOrEqual(4.5);
    }
  });

  test('L8E77: a control hidden by CSS (display: none) is skipped by the arrows and never holds the Tab stop', async () => {
    await render(
      <>
        <button id="before">Before</button>
        <Toolbar id="tb" aria-label="Tools">
          <Button id="h0" style={{ display: 'none' }}>Hidden first</Button>
          <Button id="a">A</Button>
          <Button id="h1" style={{ display: 'none' }}>Hidden</Button>
          <Button id="c">C</Button>
        </Toolbar>
      </>,
    );
    el('before').focus();
    await userEvent.tab();
    expect(focused()).toBe('a');
    const seen: (string | null)[] = [];
    for (const k of ['{ArrowRight}', '{ArrowRight}', '{End}', '{Home}', '{ArrowLeft}']) { await userEvent.keyboard(k); seen.push(focused()); }
    expect(seen).toEqual(['c', 'a', 'c', 'a', 'c']);
    expect(el('c').tabIndex).toBe(0);
  });

  test('GR66: when the window narrows and a breakpoint hides the control holding the Tab stop, the stop moves to one still shown, and back', async () => {
    await page.viewport(800, 640);
    await render(
      <>
        <style>{'@media (max-width: 500px) { #gr66u { display: none; } }'}</style>
        <button id="before">Before</button>
        <Toolbar id="tb66" aria-label="Edit">
          <Button id="gr66u">Undo</Button>
          <Button id="gr66b">Bold</Button>
        </Toolbar>
        <button id="after">After</button>
      </>,
    );
    try {
      expect(el('gr66u').tabIndex).toBe(0);
      await page.viewport(400, 640);
      await expect.poll(() => el('gr66b').tabIndex).toBe(0);
      el('before').focus();
      await userEvent.tab();
      expect(focused()).toBe('gr66b');
      await page.viewport(800, 640);
      el('before').focus();
      await userEvent.tab();
      expect(focused()).toBe('gr66b');   // the stop stays where it went; Undo is reachable with the arrows again
      await userEvent.keyboard('{ArrowLeft}');
      expect(focused()).toBe('gr66u');
    } finally { await page.viewport(900, 700); }
  });
});

describe('Toolbar overflow', () => {
  const hidden = (id: string) => [...el(id).children].filter((k) => getComputedStyle(k).display === 'none' && !k.querySelector('[aria-label="More"]') && k.getAttribute('role') !== 'tooltip').map((k) => k.id || k.getAttribute('role'));
  const more = () => document.querySelector<HTMLElement>('#of button[aria-label="More"]');
  const moreShown = () => getComputedStyle(more()!.parentElement!).display !== 'none';
  function Wide({ width, onCopy = () => {} }: { width: number; onCopy?: () => void }) {
    const [bold, setBold] = React.useState(false);
    return (
      <div style={{ width }}>
        <Toolbar id="of" aria-label="Editing" overflow>
          <ToggleButton id="bold" icon="format_bold" aria-label="Bold" data-priority={2} pressed={bold} onPressedChange={setBold} />
          <IconButton id="undo" icon="undo" label="Undo" data-priority={3} />
          <Divider orientation="vertical" />
          <Button id="copy" variant="ghost" onClick={onCopy}>Copy</Button>
          <Button id="paste" variant="ghost" disabled>Paste</Button>
          <Divider orientation="vertical" />
          <Input id="find" aria-label="Find" style={{ width: 80 }} />
        </Toolbar>
      </div>
    );
  }

  test('with room for everything: one row, nothing hidden and no More button', async () => {
    await render(<Wide width={800} />);
    expect(hidden('of')).toEqual([]);
    expect(moreShown()).toBe(false);
    expect(getComputedStyle(el('of')).flexWrap).toBe('nowrap');
  });

  test('narrower: the lowest priority goes first, the last among equals first, a field stays, and a separator left alone goes too', async () => {
    await render(<Wide width={220} />);
    await expect.poll(() => hidden('of')).toContain('paste');
    expect(hidden('of')).not.toContain('find');
    expect(hidden('of')).not.toContain('undo');
    expect(moreShown()).toBe(true);
    expect(more()!.getAttribute('aria-label')).toBe('More');
    expect(el('of').scrollWidth).toBeLessThanOrEqual(el('of').clientWidth + 1);
    const shown = [...el('of').children].filter((k) => getComputedStyle(k).display !== 'none');
    expect(shown.filter((k, i) => k.getAttribute('role') === 'separator' && (i === 0 || shown[i - 1]!.getAttribute('role') === 'separator')).length).toBe(0);
  });

  test('More lists the hidden controls as they are; choosing one presses it, a toggle as a checked item, and focus comes back to More', async () => {
    let copied = 0;
    await render(<Wide width={120} onCopy={() => { copied++; }} />);
    await expect.poll(() => hidden('of')).toContain('bold');
    more()!.focus();
    await userEvent.keyboard('{Enter}');
    const items = () => [...document.querySelectorAll('[role=menu] [role^=menuitem]')];
    await expect.poll(() => items().map((i) => i.textContent)).toEqual(expect.arrayContaining(['Bold', 'Copy', 'Paste']));
    const paste = items().find((i) => i.textContent === 'Paste')!;
    expect(paste.getAttribute('aria-disabled')).toBe('true');
    const bold = items().find((i) => i.textContent === 'Bold')!;
    expect([bold.getAttribute('role'), bold.getAttribute('aria-checked')]).toEqual(['menuitemcheckbox', 'false']);
    (bold as HTMLElement).click();
    await expect.poll(() => el('bold').getAttribute('aria-pressed')).toBe('true');
    await expect.poll(() => document.activeElement).toBe(more());
    await userEvent.keyboard('{Enter}');
    await expect.poll(() => items().find((i) => i.textContent === 'Bold')?.getAttribute('aria-checked')).toBe('true');
    (items().find((i) => i.textContent === 'Copy') as HTMLElement).click();
    expect(copied).toBe(1);
  });

  test('the arrows skip hidden controls and reach More; growing the toolbar brings them back and More goes', async () => {
    const screen = await render(<Wide width={200} />);
    await expect.poll(() => hidden('of').length).toBeGreaterThan(0);
    el('undo').focus();
    await userEvent.keyboard('{End}');
    expect(document.activeElement).toBe(more());
    await screen.rerender(<Wide width={900} />);
    await expect.poll(() => hidden('of')).toEqual([]);
    await expect.poll(moreShown).toBe(false);
  });

  test('vertical ignores overflow, and moreLabel and the labels name the More button', async () => {
    await render(<div style={{ height: 40 }}><Toolbar id="v" aria-label="Tools" orientation="vertical" overflow><IconButton icon="undo" label="Undo" /><IconButton icon="redo" label="Redo" /></Toolbar></div>);
    expect(el('v').querySelector('button[aria-label="More"]')).toBeNull();
    await render(<SerupaProvider labels={idLabels}><div style={{ width: 60 }}><Toolbar id="id1" aria-label="A" overflow><Button>One long label</Button><Button>Two long label</Button></Toolbar></div></SerupaProvider>);
    await expect.poll(() => el('id1').lastElementChild?.querySelector('button')?.getAttribute('aria-label')).toBe('Lainnya');
    await render(<div style={{ width: 60 }}><Toolbar id="ml" aria-label="B" overflow moreLabel="More actions"><Button>One long label</Button><Button>Two long label</Button></Toolbar></div>);
    await expect.poll(() => el('ml').lastElementChild?.querySelector('button')?.getAttribute('aria-label')).toBe('More actions');
  });
});
