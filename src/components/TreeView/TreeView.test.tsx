import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { THEMES, color, contrast, css, press, withMotion, seen } from '../../../tools/test/vitest/helpers';
import { TreeView, type TreeViewItem } from './TreeView';

const el = (id: string) => document.getElementById(id) as HTMLElement;
const items = (): HTMLElement[] => [...document.querySelectorAll<HTMLElement>('[role=treeitem]')];
const shown = () => items().map((i) => i.dataset.id).join();
const focused = () => (document.activeElement as HTMLElement | null)?.dataset.id;
const item = (id: string) => items().find((i) => i.dataset.id === id)!;
const row = (id: string) => item(id).firstElementChild as HTMLElement;   // the row a person sees and clicks

const TREE: TreeViewItem[] = [
  { id: 'a', label: 'Apples', children: [
    { id: 'a1', label: 'Braeburn' },
    { id: 'a2', label: 'Cox', children: [{ id: 'a2x', label: 'Orange Pippin' }] },
  ] },
  { id: 'b', label: 'Bananas', disabled: true, children: [{ id: 'b1', label: 'Cavendish' }] },
  { id: 'c', label: 'Cherries' },
  { id: 'd', label: 'Dates', children: [{ id: 'd1', label: 'Medjool' }] },
];

function Tree(props: Partial<React.ComponentProps<typeof TreeView>>) {
  return (
    <>
      <button id="before">Before</button>
      <TreeView id="t" aria-label="Fruit" items={TREE} {...props} />
      <button id="after">After</button>
    </>
  );
}
const enter = async () => { el('before').focus(); await userEvent.keyboard('{Tab}'); };

describe('TreeView', () => {
  test('a role="tree" <ul> of treeitems with level, position and expanded state; ref, className and other props reach it', async () => {
    const ref = React.createRef<HTMLUListElement>();
    await render(<TreeView id="x" ref={ref} aria-label="Fruit" items={TREE} defaultExpanded={['a']} className="extra" data-x="y" />);
    const e = el('x');
    expect([e.tagName, e.getAttribute('role'), e.getAttribute('aria-label'), ref.current === e, e.className, e.dataset.x, e.dataset.component]).toEqual(['UL', 'tree', 'Fruit', true, 'srp-tree-view extra', 'y', 'tree-view']);
    expect(shown()).toBe('a,a1,a2,b,c,d');   // closed items' children aren't in the page
    const a2 = item('a2');
    expect([a2.getAttribute('aria-level'), a2.getAttribute('aria-posinset'), a2.getAttribute('aria-setsize'), a2.getAttribute('aria-expanded'), item('c').getAttribute('aria-expanded')])
      .toEqual(['2', '2', '2', 'false', null]);
    expect([item('a').getAttribute('aria-expanded'), a2.parentElement!.getAttribute('role'), item('b').getAttribute('aria-disabled')]).toEqual(['true', 'group', 'true']);
  });

  test('an item with children says data-state open or closed; a leaf says nothing (G11, ADR 0012)', async () => {
    await render(<Tree defaultExpanded={['a']} />);
    expect(['a', 'a1', 'a2', 'd'].map((i) => item(i).dataset.state ?? '-')).toEqual(['open', '-', 'closed', 'closed']);
    item('d').focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect.poll(() => item('d').dataset.state).toBe('open');
  });

  test('one Tab stop: the first item, or the first picked one; Tab leaves; coming back lands on the item used last', async () => {
    await render(<Tree defaultValue={['c']} />);
    expect(items().map((i) => i.tabIndex)).toEqual([-1, -1, 0, -1]);
    await enter();
    expect(focused()).toBe('c');
    await userEvent.keyboard('{ArrowDown}{Tab}');
    expect(document.activeElement!.id).toBe('after');
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
    expect(focused()).toBe('d');
  });

  test('Up and Down move through the items in view, stopping at the ends; Home and End go to the first and last', async () => {
    await render(<Tree defaultExpanded={['a']} />);
    await enter();
    await userEvent.keyboard('{ArrowUp}');
    expect(focused()).toBe('a');
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}');
    expect(focused()).toBe('b');   // a disabled item can still be focused and read
    await userEvent.keyboard('{End}');
    expect(focused()).toBe('d');
    await userEvent.keyboard('{ArrowDown}');
    expect(focused()).toBe('d');
    await userEvent.keyboard('{Home}');
    expect(focused()).toBe('a');
  });

  test('Right opens and then goes to the first child; Left closes and then goes to the parent; onExpandedChange hears each', async () => {
    const onExpandedChange = vi.fn();
    await render(<Tree onExpandedChange={onExpandedChange} />);
    await enter();
    await userEvent.keyboard('{ArrowRight}');
    expect([shown(), focused(), onExpandedChange.mock.calls.at(-1)![0]]).toEqual(['a,a1,a2,b,c,d', 'a', ['a']]);
    await userEvent.keyboard('{ArrowRight}');
    expect(focused()).toBe('a1');
    await userEvent.keyboard('{ArrowRight}');
    expect(focused()).toBe('a1');   // a leaf: nothing
    await userEvent.keyboard('{ArrowDown}{ArrowRight}{ArrowRight}');
    expect([shown(), focused()]).toEqual(['a,a1,a2,a2x,b,c,d', 'a2x']);
    await userEvent.keyboard('{ArrowLeft}');
    expect(focused()).toBe('a2');
    await userEvent.keyboard('{ArrowLeft}');
    expect([shown(), focused()]).toEqual(['a,a1,a2,b,c,d', 'a2']);
    await userEvent.keyboard('{ArrowLeft}');
    expect(focused()).toBe('a');
    await userEvent.keyboard('{ArrowLeft}');
    expect([shown(), onExpandedChange.mock.calls.at(-1)![0]]).toEqual(['a,b,c,d', []]);
  });

  test('right to left, the arrows swap: Left opens and Right closes', async () => {
    await render(<Tree dir="rtl" />);
    await enter();
    await userEvent.keyboard('{ArrowLeft}');
    expect(shown()).toBe('a,a1,a2,b,c,d');
    await userEvent.keyboard('{ArrowRight}');
    expect(shown()).toBe('a,b,c,d');
  });

  test('a disabled item doesn\'t open, close or get picked; * opens every sibling that can open', async () => {
    const onValueChange = vi.fn();
    await render(<Tree onValueChange={onValueChange} />);
    await enter();
    await userEvent.keyboard('{ArrowDown}{ArrowRight}{Enter}');
    expect([shown(), onValueChange.mock.calls.length]).toEqual(['a,b,c,d', 0]);
    await userEvent.keyboard('*');
    expect(shown()).toBe('a,a1,a2,b,c,d,d1');
  });

  test('single: Enter, Space or a click picks one item; aria-selected marks only it', async () => {
    const onValueChange = vi.fn();
    await render(<Tree onValueChange={onValueChange} />);
    await enter();
    await userEvent.keyboard('{Enter}');
    expect([onValueChange.mock.calls.at(-1)![0], item('a').getAttribute('aria-selected'), item('c').getAttribute('aria-selected')]).toEqual([['a'], 'true', null]);
    await userEvent.keyboard('{End} ');
    expect(onValueChange.mock.calls.at(-1)![0]).toEqual(['d']);
    await userEvent.click(row('c'));
    expect([onValueChange.mock.calls.at(-1)![0], focused(), item('c').classList.contains('srp-tree-view__item--selected')]).toEqual([['c'], 'c', true]);
    expect(el('t').hasAttribute('aria-multiselectable')).toBe(false);
  });

  test('a click on the chevron opens and closes without picking; closing an item that holds focus moves focus to it', async () => {
    const onValueChange = vi.fn();
    await render(<Tree onValueChange={onValueChange} />);
    const chevron = (id: string) => row(id).firstElementChild as HTMLElement;
    await userEvent.click(chevron('a'));
    expect([shown(), onValueChange.mock.calls.length]).toEqual(['a,a1,a2,b,c,d', 0]);
    await userEvent.click(row('a1'));
    expect(focused()).toBe('a1');
    await userEvent.click(chevron('a'));
    expect([shown(), focused()]).toEqual(['a,b,c,d', 'a']);
  });

  test('multiple: Space and clicks toggle, Shift+arrows pick as they move, Shift+Space and Shift+click pick a range, Ctrl+A picks all in view', async () => {
    const onValueChange = vi.fn();
    const last = () => [...(onValueChange.mock.calls.at(-1)![0] as string[])].sort().join();
    await render(<Tree selectionMode="multiple" defaultExpanded={['a']} onValueChange={onValueChange} />);
    expect([el('t').getAttribute('aria-multiselectable'), item('c').getAttribute('aria-selected')]).toEqual(['true', 'false']);
    await enter();
    await userEvent.keyboard(' ');
    expect(last()).toBe('a');
    await userEvent.keyboard(' ');
    expect(onValueChange.mock.calls.at(-1)![0]).toEqual([]);
    await userEvent.keyboard('{Shift>}{ArrowDown}{ArrowDown}{/Shift}');
    expect([last(), focused()]).toEqual(['a1,a2', 'a2']);
    await userEvent.keyboard('{End}{Shift>} {/Shift}');
    expect(last()).toBe('a1,a2,c,d');   // from a2, the last one picked, to d; b is disabled
    await userEvent.click(row('a1'));
    expect(last()).toBe('a2,c,d');
    await userEvent.keyboard('{Control>}a{/Control}');
    expect(last()).toBe('a,a1,a2,c,d');
  });

  test('L8E111: Ctrl+A or a Shift range over items all picked already calls no onValueChange', async () => {
    const onValueChange = vi.fn();
    await render(<Tree selectionMode="multiple" defaultExpanded={['a']} onValueChange={onValueChange} />);
    await enter();
    await userEvent.keyboard('{Control>}a{/Control}');
    expect(onValueChange).toHaveBeenCalledTimes(1);
    await userEvent.keyboard('{Control>}a{/Control}');   // everything is picked already
    expect(onValueChange).toHaveBeenCalledTimes(1);
    await userEvent.click(row('a1'));
    await userEvent.click(row('a1'));   // picked again, and now the anchor
    expect(onValueChange).toHaveBeenCalledTimes(3);
    await userEvent.keyboard('{End}{Shift>} {/Shift}');   // a1 to d, all picked already
    expect(onValueChange).toHaveBeenCalledTimes(3);
  });

  test('L8E4: Ctrl+A picks all on a layout whose A key types another script (Russian "ф"), by the key\'s position', async () => {
    const onValueChange = vi.fn();
    await render(<Tree selectionMode="multiple" defaultExpanded={['a']} onValueChange={onValueChange} />);
    await enter();
    const ctrl = (key: string, code: string) => document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key, code, ctrlKey: true, bubbles: true, cancelable: true }));
    ctrl('q', 'KeyA');   // AZERTY: the key in A's place types "q", which isn't Ctrl+A
    expect(onValueChange).not.toHaveBeenCalled();
    ctrl('ф', 'KeyA');
    expect([...(onValueChange.mock.calls.at(-1)![0] as string[])].sort().join()).toBe('a,a1,a2,c,d');
  });

  test('changing selectionMode after mounting redraws every row in view: aria-selected follows the new mode', async () => {
    const sel = () => items().map((i) => i.getAttribute('aria-selected')).join();
    const { rerender } = await render(<Tree selectionMode="single" defaultValue={['b']} />);
    expect(sel()).toBe(',true,,');   // single: only the picked item says so
    await rerender(<Tree selectionMode="multiple" defaultValue={['b']} />);
    expect(sel()).toBe('false,true,false,false');   // multiple: every item says picked or not
    await rerender(<Tree selectionMode="none" defaultValue={['b']} />);
    expect(sel()).toBe(',,,');
  });
  test('none: no aria-selected, and Enter, Space or a click opens and closes', async () => {
    await render(<Tree selectionMode="none" />);
    expect(item('a').hasAttribute('aria-selected')).toBe(false);
    await enter();
    await userEvent.keyboard('{Enter}');
    expect(shown()).toBe('a,a1,a2,b,c,d');
    await userEvent.keyboard(' ');
    expect(shown()).toBe('a,b,c,d');
    await userEvent.click(row('d'));
    expect(shown()).toBe('a,b,c,d,d1');
  });

  test('typing goes to the next item in view starting with what was typed, ignoring case and accents', async () => {
    await render(<Tree defaultExpanded={['a']} />);
    await enter();
    await userEvent.keyboard('c');
    expect(focused()).toBe('a2');
    await userEvent.keyboard('h');
    expect(focused()).toBe('c');
    await new Promise((r) => setTimeout(r, 600));
    await userEvent.keyboard('d');
    expect(focused()).toBe('d');
  });

  test('a Space typed within a word is part of it ("my files"), not a pick; after a pause Space picks (GQ4)', async () => {
    const files: TreeViewItem[] = [{ id: 'f1', label: 'my file' }, { id: 'f2', label: 'my files' }, { id: 's', label: 'src' }];
    await render(<><button id="before">Before</button><TreeView aria-label="Files" items={files} /></>);
    await enter();
    await userEvent.keyboard('my files');
    expect(focused()).toBe('f2');
    expect(items().filter((i) => i.getAttribute('aria-selected') === 'true')).toEqual([]);
    await new Promise((r) => setTimeout(r, 600));
    await userEvent.keyboard(' ');
    expect(item('f2').getAttribute('aria-selected')).toBe('true');
  });

  test('controlled: value and expanded come from props, and change only when the parent passes new ones', async () => {
    function Controlled() {
      const [value, setValue] = React.useState<string[]>(['c']);
      const [expanded, setExpanded] = React.useState<string[]>([]);
      return <><Tree value={value} onValueChange={setValue} expanded={expanded} onExpandedChange={setExpanded} /><output id="out">{value.join() + '|' + expanded.join()}</output></>;
    }
    await render(<Controlled />);
    await enter();
    await userEvent.keyboard('{Home}{ArrowRight}{Enter}');
    expect(el('out').textContent).toBe('a|a');
  });

  test('controlled without handlers: nothing opens or changes', async () => {
    await render(<Tree value={['c']} expanded={[]} />);
    await enter();
    await userEvent.keyboard('{Home}{ArrowRight}{Enter}');
    expect([shown(), item('c').getAttribute('aria-selected')]).toEqual(['a,b,c,d', 'true']);
  });

  test('rows are 32px, each level 16px further in; the picked row has a highlight and a bar', async () => {
    await render(<Tree defaultExpanded={['a', 'a2']} defaultValue={['a2x']} />);
    const pad = (id: string) => parseFloat(css(row(id)).paddingInlineStart);
    expect([row('a').offsetHeight, pad('a1') - pad('a'), pad('a2x') - pad('a1')]).toEqual([32, 16, 16]);
    expect(css(row('a2x')).boxShadow).not.toBe('none');
  });

  test('its labels read 4.5:1 on its background, and the picked row\'s on its highlight, in every theme', async () => {
    await render(<TreeView id="c" aria-label="Fruit" items={TREE} defaultValue={['c']} />);
    for (const th of THEMES) {
      document.documentElement.setAttribute('data-theme', th);
      expect(contrast(css(el('c')).color, css(el('c')).backgroundColor), th).toBeGreaterThanOrEqual(4.5);
      expect(contrast(css(row('c')).color, css(row('c')).backgroundColor), th + ' picked').toBeGreaterThanOrEqual(4.5);
    }
  });

  test('a focus move or a pick redraws only the rows it changes, not every row in view (DE1): 3,060 items, 60 folders open', async () => {
    // A row reads its item's label each time it draws: counting the reads counts the draws.
    const draws = new Map<string, number>();
    const counted = (id: string, text: string, children?: TreeViewItem[]): TreeViewItem => {
      const it = { id, textValue: text, children } as TreeViewItem;
      Object.defineProperty(it, 'label', { enumerable: true, get: () => { draws.set(id, (draws.get(id) || 0) + 1); return text; } });
      return it;
    };
    const big: TreeViewItem[] = [], openIds: string[] = [];
    for (let f = 0; f < 60; f++) {
      const kids: TreeViewItem[] = [];
      for (let i = 0; i < 50; i++) kids.push(counted(f + '-' + i, 'File ' + i));
      big.push(counted('f' + f, 'Folder ' + f, kids));
      openIds.push('f' + f);
    }
    await render(<TreeView id="big" aria-label="Files" items={big} defaultExpanded={openIds} selectionMode="multiple" />);
    expect(items().length).toBe(3060);
    item('f0').focus();
    draws.clear();
    await userEvent.keyboard('{ArrowDown}');
    expect(focused()).toBe('0-0');
    expect([...draws.keys()].sort()).toEqual(['0-0', 'f0']);
    draws.clear();
    await userEvent.keyboard(' ');
    expect(item('0-0').getAttribute('aria-selected')).toBe('true');
    expect([...draws.keys()]).toEqual(['0-0']);
    draws.clear();
    // Closing a folder redraws that folder (its children leave the page), not the other 59.
    item('f1').focus();
    draws.clear();
    await userEvent.keyboard('{ArrowLeft}');
    expect(item('f1').getAttribute('aria-expanded')).toBe('false');
    expect([...draws.keys()].sort()).toEqual(['0-0', 'f1']);
  });
  test('a big tree: Up and Down don\'t make the page work out its styles, and a row out of view isn\'t laid out until it scrolls near', async () => {
    const big: TreeViewItem[] = Array.from({ length: 2000 }, (_, i) => ({ id: 'n' + i, label: 'Node ' + i }));
    await render(<TreeView aria-label="Nodes" items={big} />);
    item('n0').focus();
    const styles = vi.spyOn(window, 'getComputedStyle');
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowUp}');
    const reads = styles.mock.calls.length;
    styles.mockRestore();
    expect([focused(), reads]).toEqual(['n1', 0]);
    const row = item('n1999').firstElementChild as HTMLElement;
    expect([css(row).contentVisibility, css(row).containIntrinsicBlockSize]).toEqual(['auto', 'auto 24px']);
    // Its text is still in the page, for find in page and screen readers.
    expect(row.textContent).toBe('Node 1999');
  });

  test('pressed: a row held down fills with pressed at once; a disabled row doesn\'t (ED1)', async () => {
    await render(<Tree />);
    await press(row('c'), () => expect.poll(() => css(row('c')).backgroundColor).toBe(color('var(--pressed)')));
    await press(row('b'), () => expect(css(row('b')).backgroundColor).not.toBe(color('var(--pressed)')));
  });
  // The README's recipe for a folder whose children load when it opens: a disabled "Loading…" item holds its place,
  // which people can reach and read; when the children come, focus on it goes to the first of them; a failure says so
  // in the same place, and closing and opening the folder tries again.
  test('a folder that loads on opening: a "Loading…" item, focus kept when the children come, and a retry on failure', async () => {
    const load = vi.fn<() => 'ok' | 'fail'>().mockReturnValueOnce('fail').mockReturnValue('ok');
    let finish = () => {};
    function Lazy() {
      const [kids, setKids] = React.useState<TreeViewItem[] | 'loading' | 'failed'>([]);
      const [open, setOpen] = React.useState<string[]>([]);
      const children: TreeViewItem[] = kids === 'loading' ? [{ id: 'docs-wait', label: 'Loading…', disabled: true }]
        : kids === 'failed' ? [{ id: 'docs-wait', label: 'Didn’t load. Close and open the folder to try again.', disabled: true }] : kids;
      return <TreeView aria-label="Files" items={[{ id: 'docs', label: 'docs', children }, { id: 'readme', label: 'README.md' }]} expanded={open}
        onExpandedChange={(next) => {
          setOpen(next);
          if (next.indexOf('docs') >= 0 && (kids === 'failed' || (Array.isArray(kids) && !kids.length))) {
            setKids('loading');
            finish = () => setKids(load() === 'ok' ? [{ id: 'intro', label: 'Introduction.mdx' }, { id: 'guide', label: 'Guide.mdx' }] : 'failed');
          }
        }} />;
    }
    await render(<Lazy />);
    await userEvent.click(row('docs').firstElementChild as HTMLElement);   // its toggle
    await expect.poll(() => shown()).toBe('docs,docs-wait,readme');
    await userEvent.keyboard('{ArrowDown}');
    expect([focused(), item('docs-wait').getAttribute('aria-disabled'), item('docs-wait').textContent]).toEqual(['docs-wait', 'true', 'Loading…']);
    React.act(() => finish());
    await expect.poll(() => item('docs-wait').textContent).toBe('Didn’t load. Close and open the folder to try again.');
    expect(focused()).toBe('docs-wait');
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');   // to the folder, then close it
    await expect.poll(() => shown()).toBe('docs,readme');
    await userEvent.keyboard('{ArrowRight}{ArrowDown}');   // open it again: it tries again
    await expect.poll(() => item('docs-wait').textContent).toBe('Loading…');
    expect(focused()).toBe('docs-wait');
    React.act(() => finish());
    await expect.poll(() => shown()).toBe('docs,intro,guide,readme');
    expect(focused()).toBe('intro');
  });
});

describe('TreeView target size (GQ6)', () => {
  test('a chevron is a 24px target (WCAG 2.5.8): a click 1.5px outside its 20px box still opens the item, and doesn\'t pick it', async () => {
    const onValueChange = vi.fn();
    await render(<Tree selectionMode="single" onValueChange={onValueChange} />);
    const toggle = row('a').firstElementChild as HTMLElement, r = toggle.getBoundingClientRect();
    expect([Math.round(r.width), Math.round(r.height)]).toEqual([20, 20]);
    await userEvent.click(toggle, { position: { x: -1.5, y: 10 } });
    expect([item('a').getAttribute('aria-expanded'), onValueChange.mock.calls.length]).toEqual(['true', 0]);
    await userEvent.click(toggle, { position: { x: 21.5, y: 21.5 } });
    expect(item('a').getAttribute('aria-expanded')).toBe('false');
  });
  test('the focused item leaving the page (deleted from items, or its parent closed by a controlled expanded) hands focus to the item in its place or to its parent, not to the page', async () => {
    let drop: (id: string) => void = () => {}, close: (id: string) => void = () => {};
    function Live() {
      const [list, setList] = React.useState(TREE);
      const [open, setOpen] = React.useState(['a', 'd']);
      drop = (id) => setList((l) => l.filter((x) => x.id !== id));
      close = (id) => setOpen((o) => o.filter((x) => x !== id));
      return <Tree items={list} expanded={open} onExpandedChange={setOpen} />;
    }
    await render(<Live />);
    item('c').focus();
    await expect.poll(() => item('c').tabIndex).toBe(0);   // the tree has seen it
    drop('c');   // an app's own Delete key, or a server update
    await expect.poll(() => [shown(), focused()]).toEqual(['a,a1,a2,b,d,d1', 'd']);
    item('d1').focus();
    await expect.poll(() => item('d1').tabIndex).toBe(0);
    close('d');   // an app's own "Collapse all"
    await expect.poll(() => [shown(), focused()]).toEqual(['a,a1,a2,b,d', 'd']);
    drop('d');   // the last one: the one before
    await expect.poll(() => focused()).toBe('b');
    el('after').focus();
    drop('b');   // focus is elsewhere: it stays there
    await expect.poll(() => shown()).toBe('a,a1,a2');
    expect(document.activeElement).toBe(el('after'));
  });

  test('picking an item keeps its label at the weight of the others, so a label that fits on one line never wraps when picked; the start bar marks it (GR269)', async () => {
    await render(<div style={{ width: '120px' }}><Tree /></div>);
    await userEvent.click(row('c'));
    expect(item('c').getAttribute('aria-selected')).toBe('true');
    expect(css(row('c')).fontWeight).toBe(css(row('a')).fontWeight);
    expect(css(row('c')).boxShadow).toMatch(/inset/);
  });
});

describe('TreeView: motion', () => {
  const turn = () => getComputedStyle(row('a').querySelector('svg')!.parentElement!).transitionDuration;
  test('a key opens and closes an item with the chevron turned at once; a click keeps the turn', () => withMotion(async () => {
    await render(<Tree />);
    expect(turn()).not.toBe('0s');
    await userEvent.tab();
    await userEvent.tab();
    expect(focused()).toBe('a');
    await userEvent.keyboard('{ArrowRight}');
    expect(item('a').getAttribute('aria-expanded')).toBe('true');
    expect(turn()).toBe('0s');
    await userEvent.keyboard('{ArrowLeft}');
    expect(turn()).toBe('0s');
    await userEvent.click(row('a').querySelector('svg')!.parentElement!.parentElement!);
    expect(item('a').getAttribute('aria-expanded')).toBe('true');
    expect(turn()).not.toBe('0s');
  }));
});

describe('TreeView: cascade, a checkbox tree', () => {
  const FILES: TreeViewItem[] = [
    { id: 'src', label: 'src', children: [
      { id: 'a', label: 'a.ts' },
      { id: 'b', label: 'b.ts' },
      { id: 'lib', label: 'lib', children: [{ id: 'c', label: 'c.ts' }, { id: 'd', label: 'd.ts', disabled: true }] },
    ] },
    { id: 'readme', label: 'README.md' },
  ];
  const OPEN = ['src', 'lib'];
  const checked = (): Record<string, string | null> => Object.fromEntries(items().map((i) => [i.dataset.id ?? '', i.getAttribute('aria-checked')]));
  function Tree(props: { cascadeValue?: 'all' | 'leaves'; value?: string[]; defaultValue?: string[] }) {
    const [got, setGot] = React.useState<string[] | null>(null);
    return <><TreeView aria-label="Files" items={FILES} selectionMode="multiple" cascade defaultExpanded={OPEN} onValueChange={setGot} {...props} /><output id="got">{got ? got.join() : ''}</output></>;
  }

  test('each item is checked, unchecked or mixed, not selected: a checkbox tree', async () => {
    await render(<Tree defaultValue={['a']} />);
    expect(checked()).toEqual({ src: 'mixed', a: 'true', b: 'false', lib: 'false', c: 'false', d: 'false', readme: 'false' });
    expect([items().some((i) => i.hasAttribute('aria-selected')), document.querySelector('[role=tree]')!.hasAttribute('aria-multiselectable')]).toEqual([false, false]);
    // The box is drawn for the eye only: the item's aria-checked says it.
    expect(row('a').querySelector('[data-state]')!.getAttribute('aria-hidden')).toBe('true');
  });

  test('checking a folder checks everything in it that can change; a disabled item keeps its state, so the folder stays mixed', async () => {
    await render(<Tree />);
    await userEvent.click(row('src'));
    expect(checked()).toEqual({ src: 'mixed', a: 'true', b: 'true', lib: 'mixed', c: 'true', d: 'false', readme: 'false' });
    expect(el('got').textContent).toBe('a,b,c');
  });

  test('Space on a mixed folder checks the rest, and again clears the branch; value lists every fully checked item', async () => {
    await render(<Tree defaultValue={['a']} />);
    item('src').focus();
    await userEvent.keyboard(' ');
    expect(el('got').textContent).toBe('a,b,c');
    await userEvent.keyboard(' ');
    expect([el('got').textContent, checked().src]).toEqual(['', 'false']);
    item('lib').focus();
    await userEvent.keyboard(' ');
    // lib's only usable file is c; lib isn't fully checked (d can't be), so it isn't in value.
    expect([el('got').textContent, checked().lib]).toEqual(['c', 'mixed']);
  });

  test('a folder whose items are all checked is checked, and is in value unless cascadeValue="leaves"', async () => {
    await render(<><Tree defaultValue={['a', 'b']} /></>);
    await userEvent.click(row('readme'));
    expect(el('got').textContent).toBe('a,b,readme');
  });

  test('Shift+click checks every item from the one picked last, folders and all, as a range does', async () => {
    await render(<Tree cascadeValue="leaves" />);
    await userEvent.click(row('a'));
    await userEvent.click(row('c'), { modifiers: ['Shift'] });
    expect([el('got').textContent, checked().lib, checked().src]).toEqual(['a,b,c', 'mixed', 'mixed']);
  });

  test('cascadeValue="leaves" reports only items with no children; a folder id in value checks the folder\'s items', async () => {
    await render(<Tree cascadeValue="leaves" defaultValue={['lib']} />);
    expect([checked().c, checked().d, checked().lib]).toEqual(['true', 'true', 'true']);
    await userEvent.click(row('a'));
    expect(el('got').textContent).toBe('a,c,d');
  });

  test('Ctrl+A checks everything that can change; Shift with an arrow checks as it moves', async () => {
    await render(<Tree />);
    item('src').focus();
    await userEvent.keyboard('{Control>}a{/Control}');
    expect(el('got').textContent).toBe('a,b,c,readme');
    await userEvent.keyboard('{Control>}a{/Control}');
    expect(el('got').textContent).toBe('a,b,c,readme');
  });

  test('Shift+Down checks the item it moves to', async () => {
    await render(<Tree />);
    item('src').focus();
    await userEvent.keyboard('{ArrowDown}{Shift>}{ArrowDown}{/Shift}');
    expect(el('got').textContent).toBe('b');
  });

  test('as Checkbox\'s, in every theme: a checked box 3:1 on the row and its mark 4.5:1 on it; an unchecked box\'s soft border 1.3:1', async () => {
    await render(<Tree defaultValue={['a']} />);
    const on = row('a').querySelector<HTMLElement>('[data-state]')!, off = row('b').querySelector<HTMLElement>('[data-state]')!;
    const bg = (e: HTMLElement) => css(e.closest<HTMLElement>('[role=tree]')).backgroundColor;
    for (const th of THEMES) {
      document.documentElement.setAttribute('data-theme', th);
      expect(contrast(seen(on), bg(on)), th + ' checked').toBeGreaterThanOrEqual(3);
      expect(contrast(css(off).borderTopColor, bg(off)), th + ' unchecked').toBeGreaterThanOrEqual(1.3);
      expect(contrast(css(on).color, css(on).backgroundColor), th + ' mark').toBeGreaterThanOrEqual(4.5);
    }
  });
});
