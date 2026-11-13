import * as React from 'react';
import { afterEach, describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { THEMES, color, contrast, css, press } from '../../../tools/test/vitest/helpers';
import { Avatar } from '../Avatar/Avatar';
import { Badge } from '../Badge/Badge';
import { Card as SurfaceCard } from '../Card/Card';
import { IconButton } from '../IconButton/IconButton';
import { page } from 'vitest/browser';
import { List, ListItem, ListLoadingItems } from './List';

const el = (id: string) => document.getElementById(id) as HTMLElement;
const q = <T extends HTMLElement = HTMLElement>(sel: string) => document.querySelector(sel) as T;
// A row: the link, button or div first, then the trailing span. Inside it the leading span, then the text span
// holding the title and the description.
const main = <T extends HTMLElement = HTMLElement>(id: string) => q<T>(`#${id} > :first-child`);
const titleOf = (id: string) => q(`#${id} > :first-child > span:last-child > span:first-child`);
const bg = (v: string) => { const d = document.createElement('div'); d.style.background = v; document.body.appendChild(d); const c = getComputedStyle(d).backgroundColor; d.remove(); return c; };
const RouterLink = React.forwardRef<HTMLAnchorElement, { to: string } & React.AnchorHTMLAttributes<HTMLAnchorElement>>(function RouterLink({ to, ...p }, ref) {
  return <a {...p} ref={ref} href={'#router' + to} data-router="" />;
});
// Clicking the links changes the page's hash; put it back after each test.
afterEach(() => { history.replaceState(null, '', location.pathname + location.search); });

function People({ r, ir }: { r?: React.Ref<HTMLUListElement>; ir?: React.Ref<HTMLLIElement> }) {
  return <div style={{ width: '420px' }}>
    <List id="ldef" ref={r} className="extra" aria-label="People">
      <ListItem id="iada" ref={ir} title="Ada Lovelace" description="ada@example.com" leading={<Avatar name="Ada Lovelace" size="sm" />} trailing={<Badge>Admin</Badge>} />
      <ListItem id="iicon" title="Report.pdf" description="2 MB" leading="description" />
      <ListItem id="ionly" title="Just a title" />
    </List>
  </div>;
}

function Card({ clicks }: { clicks: string[] }) {
  return <div style={{ width: '420px' }}>
    <List id="lcard" variant="card" as="ol">
      <ListItem id="ilink" href="#files" title="Files" description="All your files" leading="folder" trailing={<IconButton icon="more_horiz" label="More" id="more" onClick={() => clicks.push('more')} />} />
      <ListItem id="ibtn" title="Open settings" onClick={() => clicks.push('btn')} selected={false} />
      <ListItem id="isel" href="#sel" title="Selected" selected />
      <ListItem id="irouter" as={RouterLink} linkProps={{ to: '/team' }} title="Team" />
      <ListItem id="idis" href="#dis" title="Disabled" disabled />
    </List>
  </div>;
}

describe('List', () => {
  test('a <ul> without bullets or padding; ref, className and props reach it; ListItem is an <li>', async () => {
    const r = React.createRef<HTMLUListElement>(), ir = React.createRef<HTMLLIElement>();
    await render(<People r={r} ir={ir} />);
    const l = el('ldef'), s = css(l);
    expect([l.tagName, l.className, l.dataset.component, r.current === l, ir.current?.tagName, l.getAttribute('aria-label'), s.listStyleType, s.paddingLeft])
      .toEqual(['UL', 'dk-list dk-list--divided extra', 'list', true, 'LI', 'People', 'none', '0px']);
  });

  test('an item: leading avatar, a text-sm font-medium title over a text-sm description, trailing meta at the end; 12px padding', async () => {
    await render(<People />);
    const li = el('iada'), m = main('iada'), t = titleOf('iada'), tr = li.querySelector(':scope > span')!;
    const left = [m.querySelector(':scope > span:first-child')!, t, tr].map((e) => Math.round(e.getBoundingClientRect().left));
    expect([m.tagName, `${css(m).paddingTop} ${css(m).paddingLeft}`, css(t).fontSize, css(t).fontWeight, css(t.nextElementSibling).fontSize, !!m.querySelector(':scope > span:first-child > [data-component="avatar"]')])
      .toEqual(['DIV', '12px 12px', '14px', '500', '14px', true]);
    expect(Math.round(li.getBoundingClientRect().right - tr.getBoundingClientRect().right)).toBe(12);
    expect(left[0] < left[1] && left[1] < left[2]).toBe(true);
  });

  test('divided: a 1px line between items, none above the first', async () => {
    await render(<People />);
    expect([...el('ldef').children].map((li) => css(li).borderTopWidth)).toEqual(['0px', '1px', '1px']);
  });

  test('an icon name as leading: a 20px muted icon', async () => {
    await render(<People />);
    const i = q('#iicon > :first-child > span:first-child > [data-icon]');
    expect([i.dataset.icon, css(i).fontSize]).toEqual(['description', '20px']);
  });

  test('variant card, as ol: a bordered frame with 8px corners and 16px side padding', async () => {
    await render(<Card clicks={[]} />);
    const l = el('lcard'), s = css(l);
    expect([l.tagName, s.borderTopWidth, s.borderTopLeftRadius, css(l.querySelector(':scope > li > :first-child')).paddingLeft]).toEqual(['OL', '1px', '8px', '16px']);
  });

  test('href: the main area is a link; trailing actions stay outside it (no nested controls)', async () => {
    await render(<Card clicks={[]} />);
    const m = main('ilink');
    expect([m.tagName, m.getAttribute('href'), m.contains(el('more')), m.textContent, m.querySelector<HTMLElement>('[data-icon]')?.dataset.icon]).toEqual(['A', '#files', false, 'FilesAll your files', 'folder']);
  });

  test('link and button items shade on hover; static items don\'t', async () => {
    await render(<><People /><Card clicks={[]} /></>);
    const shade = bg('var(--surface-muted)');
    expect(css(el('ilink')).backgroundColor).toBe('rgba(0, 0, 0, 0)');
    await userEvent.hover(titleOf('ilink'));
    await expect.poll(() => css(el('ilink')).backgroundColor).toBe(shade);
    await userEvent.hover(el('iada'));
    await expect.poll(() => css(el('ilink')).backgroundColor).toBe('rgba(0, 0, 0, 0)');
    expect(css(el('iada')).backgroundColor).toBe('rgba(0, 0, 0, 0)');
  });

  test('clicking the trailing action doesn\'t follow the link; clicking the row does', async () => {
    const clicks: string[] = [];
    await render(<Card clicks={clicks} />);
    await userEvent.click(el('more'));
    expect([clicks.join(), location.hash]).toEqual(['more', '']);
    await userEvent.click(titleOf('ilink'));
    expect([clicks.join(), location.hash]).toEqual(['more', '#files']);
  });

  test('the whole row works where it lights up: a press on trailing meta ("3 days ago") follows the link or presses the button; a trailing action stays its own (GF2)', async () => {
    const clicks: string[] = [];
    await render(<div style={{ width: '420px' }}><List>
      <ListItem id="mlink" href="#doc" title="Doc" trailing={<span id="mmeta">3 days ago</span>} />
      <ListItem id="mbtn" title="Settings" onClick={() => clicks.push('row')} trailing={<span id="bmeta">Edited</span>} />
      <ListItem id="mboth" href="#both" title="Both" trailing={<><span id="cmeta">Today</span><IconButton icon="more_horiz" label="More" id="more2" onClick={() => clicks.push('more')} /></>} />
    </List></div>);
    const at = (id: string) => { const r = el(id).getBoundingClientRect(); return document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)!; };
    expect([at('mmeta').closest('a')?.getAttribute('href'), at('bmeta').closest('button')?.textContent, at('cmeta').closest('a')?.getAttribute('href'), at('more2').closest('button')?.id])
      .toEqual(['#doc', 'Settings', '#both', 'more2']);
    await userEvent.click(el('bmeta'), { force: true });
    await userEvent.click(el('more2'));
    await userEvent.click(el('mmeta'), { force: true });
    expect([clicks.join(), location.hash]).toEqual(['row,more', '#doc']);
  });

  test('onClick: the main area is a button (aria-pressed with selected), and Enter presses it', async () => {
    const clicks: string[] = [];
    await render(<Card clicks={clicks} />);
    const b = main<HTMLButtonElement>('ibtn');
    expect([b.tagName, b.type, b.getAttribute('aria-pressed')]).toEqual(['BUTTON', 'button', 'false']);
    b.focus();
    await userEvent.keyboard('{Enter}');
    expect(clicks).toEqual(['btn']);
  });

  test('keyboard focus: a 2px ring inside the row', async () => {
    await render(<Card clicks={[]} />);
    const b = main('ibtn');
    // Arrive by keyboard (Tab away and back) so it matches :focus-visible.
    b.focus();
    await userEvent.keyboard('{Tab}');
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
    expect([document.activeElement === b, css(b).outlineStyle, css(b).outlineWidth, css(b).outlineOffset]).toEqual([true, 'solid', '2px', '-2px']);
  });

  test('selected: aria-current, shaded, a 2px primary bar at the start', async () => {
    await render(<Card clicks={[]} />);
    const li = el('isel'), s = css(li);
    expect([li.querySelector('a')!.getAttribute('aria-current'), s.backgroundColor]).toEqual(['true', bg('var(--surface-muted)')]);
    expect(s.boxShadow).toMatch(/2px 0px 0px 0px inset$/);
    expect(s.boxShadow).toContain(color('var(--primary)'));
  });

  test('linkProps\' aria-current wins over selected\'s "true", so a nav list can mark the current page (GF3)', async () => {
    await render(<List aria-label="Pages">
      <ListItem id="gp" href="#home" title="Home" selected linkProps={{ 'aria-current': 'page' }} />
      <ListItem id="gs" href="#docs" title="Docs" selected />
      <ListItem id="gn" href="#blog" title="Blog" linkProps={{ 'aria-current': 'page' }} />
      <ListItem id="go" href="#about" title="About" />
    </List>);
    expect(['gp', 'gs', 'gn', 'go'].map((id) => el(id).querySelector('a')!.getAttribute('aria-current'))).toEqual(['page', 'true', 'page', null]);
  });

  test('as with linkProps: a router link', async () => {
    await render(<Card clicks={[]} />);
    const a = main('irouter');
    expect([a.hasAttribute('data-router'), a.getAttribute('href'), a.className]).toEqual([true, '#router/team', 'dk-list__main']);
  });

  test('disabled: no href, aria-disabled, out of the tab order, dimmed, clicks do nothing', async () => {
    await render(<Card clicks={[]} />);
    const a = main('idis');
    expect([a.getAttribute('href'), a.getAttribute('aria-disabled'), a.tabIndex, css(a).opacity]).toEqual([null, 'true', -1, '0.5']);
    await userEvent.click(titleOf('idis'));
    expect(location.hash).toBe('');
  });

  test('disabled with a router link (as, linkProps.to): still no href, so a middle or Ctrl click can\'t open it either (L8E67)', async () => {
    await render(<List><ListItem id="irdis" as={RouterLink} linkProps={{ to: '/team', 'aria-label': 'Team page' }} title="Team" disabled /></List>);
    const a = main('irdis');
    expect([a.tagName, a.getAttribute('href'), a.getAttribute('aria-disabled'), a.getAttribute('aria-label'), a.tabIndex]).toEqual(['A', null, 'true', 'Team page', -1]);
  });

  test('linkProps is typed by as (GR276): a router link\'s props, an <a>\'s by default, and data-* on either', async () => {
    await render(<List>
      <ListItem id="ity-r" as={RouterLink} linkProps={{ to: '/team', 'data-row': 'team' }} title="Team" />
      <ListItem id="ity-a" href="#a" linkProps={{ target: '_self', 'aria-current': 'page' }} title="A" />
      {/* @ts-expect-error RouterLink has no tooo */}
      <ListItem id="ity-x" as={RouterLink} linkProps={{ tooo: '/x' }} title="X" />
      {/* @ts-expect-error an <a> has no to */}
      <ListItem id="ity-y" href="#y" linkProps={{ to: '/y' }} title="Y" />
    </List>);
    expect([main('ity-r').getAttribute('href'), main('ity-r').dataset.row, main('ity-a').getAttribute('target')]).toEqual(['#router/team', 'team', '_self']);
  });

  test('divided={false}: no lines; unknown variant and as fall back to plain and ul', async () => {
    await render(<List id="lnodiv" divided={false} variant={'boxed' as never} as={'table' as never}><ListItem title="A" /><ListItem title="B" /></List>);
    const l = el('lnodiv');
    expect([l.tagName, l.className, css(l.children[1]).borderTopWidth]).toEqual(['UL', 'dk-list', '0px']);
  });

  test('tokens (--list-padding-y, --list-title-color) override one list', async () => {
    await render(<List id="ltok" style={{ '--list-padding-y': '5px', '--list-title-color': 'rgb(1, 2, 3)' } as React.CSSProperties}><ListItem title="T" /></List>);
    expect([css(q('#ltok > li > :first-child')).paddingTop, css(q('#ltok > li > :first-child > span:last-child > span:first-child')).color]).toEqual(['5px', 'rgb(1, 2, 3)']);
  });

  test('a selected row shows on a filled, elevated or outline Card, on a muted panel and on a floating surface, as on the page, with its text at 4.5:1, in all six themes', async () => {
    await render(<div style={{ width: '420px' }}>
      <SurfaceCard id="filled" variant="filled"><List aria-label="On a filled card"><ListItem id="sfill" title="Ada Lovelace" description="ada@example.com" onClick={() => {}} selected /></List></SurfaceCard>
      <div id="muted" className="bg-surface-muted"><List aria-label="On a muted panel"><ListItem id="smuted" title="Ada Lovelace" description="ada@example.com" onClick={() => {}} selected /></List></div>
      <div id="raised" className="bg-surface-muted"><SurfaceCard id="inner"><List aria-label="On a card on a muted panel"><ListItem id="sinner" title="Ada Lovelace" description="ada@example.com" onClick={() => {}} selected /></List></SurfaceCard></div>
      <SurfaceCard id="elev" variant="elevated"><List aria-label="On an elevated card"><ListItem id="selev" title="Ada Lovelace" description="ada@example.com" onClick={() => {}} selected /></List></SurfaceCard>
      <div id="float" className="bg-surface-overlay"><List aria-label="On a floating surface"><ListItem id="sfloat" title="Ada Lovelace" description="ada@example.com" onClick={() => {}} selected /></List></div>
    </div>);
    const low: string[] = [];
    for (const th of THEMES) {
      document.documentElement.setAttribute('data-theme', th);
      for (const [row, under] of [['sfill', 'filled'], ['smuted', 'muted'], ['sinner', 'inner'], ['selev', 'elev'], ['sfloat', 'float']] as const) {
        const fill = css(el(row)).backgroundColor, back = css(el(under)).backgroundColor;
        if (contrast(fill, back) < 1.03) low.push(`${th} ${row}: fill ${fill} on ${back}`);
        const desc = css(titleOf(row).nextElementSibling).color;
        if (contrast(desc, fill) < 4.5) low.push(`${th} ${row}: description ${contrast(desc, fill).toFixed(2)}`);
      }
    }
    document.documentElement.removeAttribute('data-theme');
    expect(low).toEqual([]);
  });

  test('contrast: titles and descriptions keep 4.5:1 on plain and shaded rows, the selected bar 3:1, in all six themes', async () => {
    await render(<People />);
    const low: string[] = [];
    for (const th of THEMES) {
      document.documentElement.setAttribute('data-theme', th);
      const title = css(titleOf('iada')).color, desc = css(titleOf('iada').nextElementSibling).color;
      for (const [name, fg, back, need] of [
        ['title', title, 'var(--surface)', 4.5], ['description', desc, 'var(--surface)', 4.5],
        ['title on a shaded row', title, 'var(--surface-hover)', 4.5], ['description on a shaded row', desc, 'var(--surface-hover)', 4.5],
        ['selected bar', 'var(--primary)', 'var(--surface-hover)', 3],
      ] as const) {
        const r = contrast(fg, back);
        if (r < need) low.push(`${th} ${name} ${r.toFixed(2)}`);
      }
    }
    expect(low).toEqual([]);
  });

  test('pressed: a link row held down fills with pressed; holding its trailing action doesn\'t', async () => {
    await render(<><People /><Card clicks={[]} /></>);
    const row = el('ilink');
    await press(titleOf('ilink'), () => expect.poll(() => css(row).backgroundColor).toBe(color('var(--pressed)')));
    await press(el('more'), () => expect.poll(() => css(row).backgroundColor).not.toBe(color('var(--pressed)')));
  });

});

describe('List loading (GR316)', () => {
  test('busy sets aria-busy; ListLoadingItems rows are as tall as the rows that replace them, with or without a description, icon or Avatar, and the wait is said once', async () => {
    type Lead = 'icon' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | undefined;
    const CASES: Array<{ id: string; description: boolean; leading: Lead }> = [
      { id: 'plain', description: false, leading: undefined },
      { id: 'desc-md', description: true, leading: 'md' },
      { id: 'desc-icon', description: true, leading: 'icon' },
      { id: 'sm', description: false, leading: 'sm' },
      { id: 'xs', description: false, leading: 'xs' },
      { id: 'lg', description: true, leading: 'lg' },
      { id: 'xl', description: true, leading: 'xl' },
    ];
    function Lists(props: { busy: boolean }) {
      return <div style={{ width: '400px' }}>{CASES.map((c) => (
        <List key={c.id} id={c.id} busy={props.busy} aria-label={c.id}>
          {props.busy ? <ListLoadingItems rows={2} description={c.description} leading={c.leading} label={'Loading ' + c.id} />
            : <ListItem title="Ada Lovelace" description={c.description ? 'Admin' : undefined}
              leading={c.leading === 'icon' ? 'person' : c.leading ? <Avatar name="Ada Lovelace" size={c.leading} /> : undefined} />}
        </List>
      ))}</div>;
    }
    const { rerender } = await render(<Lists busy />);
    expect(CASES.map((c) => [el(c.id).getAttribute('aria-busy'), el(c.id).children.length])).toEqual(CASES.map(() => ['true', 2]));
    // The placeholders are hidden from screen readers; each list's label is said once, after the loader's delay.
    expect(page.getByRole('progressbar').all().length).toBe(0);
    expect(CASES.every((c) => [...el(c.id).querySelectorAll('li > div > *')].every((x) => x.querySelector('[aria-hidden="true"]') || x.getAttribute('aria-hidden') === 'true'))).toBe(true);
    await expect.poll(() => document.querySelector('[data-dk-announcer]')?.textContent || '', { timeout: 3000 }).toContain('Loading desc-md');
    const loading = CASES.map((c) => el(c.id).firstElementChild!.getBoundingClientRect().height);
    await rerender(<Lists busy={false} />);
    expect(CASES.map((c) => el(c.id).firstElementChild!.getBoundingClientRect().height)).toEqual(loading);
    expect(el('plain').hasAttribute('aria-busy')).toBe(false);
  });
});
