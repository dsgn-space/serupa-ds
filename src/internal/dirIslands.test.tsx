import * as React from 'react';
import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { Button } from '../components/Button/Button';
import { Breadcrumb, BreadcrumbItem } from '../components/Breadcrumb/Breadcrumb';
import { Calendar } from '../components/Calendar/Calendar';
import { List, ListItem } from '../components/List/List';
import { Pagination } from '../components/Pagination/Pagination';
import { Popover } from '../components/Popover/Popover';
import { Progress } from '../components/Progress/Progress';
import { Table, TableBody, TableCell, TableRow } from '../components/Table/Table';
import { iconPoints } from '../../tools/test/vitest/helpers';

// Six components that turn with the text direction, in one block.
function Six() {
  return <>
    <Breadcrumb><BreadcrumbItem href="#a">A</BreadcrumbItem><BreadcrumbItem>B</BreadcrumbItem></Breadcrumb>
    <Pagination count={3} />
    <Calendar />
    <Progress label="Loading" />
    <List><ListItem title="Picked" selected /></List>
    <Table><TableBody><TableRow selected><TableCell>Picked</TableCell></TableRow></TableBody></Table>
  </>;
}

const picked = (root: HTMLElement, tag: string) => [...root.querySelectorAll(tag)].find((e) => e.textContent === 'Picked')!;
// Which way each part of a block points: its chevrons (the ones that show), the indeterminate bar's start, and the
// selected List item's and Table row's bar (a positive inset shadow is on the left).
function sides(root: HTMLElement) {
  // Breadcrumb's separator, Pagination's previous and next, Calendar's previous and next month: as drawn left to right,
  // they point right, left, right, left, right.
  const ways = [...root.querySelectorAll('[data-icon^="chevron_"]')].map(iconPoints).join();
  const fill = [...root.querySelector('[role="progressbar"]')!.querySelectorAll('*')].find((e) => getComputedStyle(e).getPropertyValue('--dk-progress-from'))!;
  const bar = (e: Element) => { const s = getComputedStyle(e).boxShadow; return s === 'none' ? 'none' : /\) -\d/.test(s) ? 'right' : 'left'; };
  return {
    chevrons: [ways === 'right,left,right,left,right' ? 'ltr' : ways === 'left,right,left,right,left' ? 'rtl' : 'mixed ' + ways],
    progressFrom: getComputedStyle(fill).getPropertyValue('--dk-progress-from').trim(),
    listBar: bar(picked(root, 'li')),
    tableBar: bar(picked(root, 'td')),
  };
}
const LTR = { chevrons: ['ltr'], progressFrom: '-100%', listBar: 'left', tableBar: 'left' };
const RTL = { chevrons: ['rtl'], progressFrom: '100%', listBar: 'right', tableBar: 'right' };

describe('direction islands (EX1)', () => {
  test('a dir="ltr" block on a right-to-left page (an English widget, a code sample) points left to right, and a dir="rtl" block on a left-to-right page right to left', async () => {
    const html = document.documentElement;
    try {
      html.dir = 'rtl';
      const { unmount } = await render(<><div id="page"><Six /></div><div id="island" dir="ltr"><Six /></div></>);
      expect(sides(document.getElementById('page')!)).toEqual(RTL);
      expect(sides(document.getElementById('island')!)).toEqual(LTR);
      await unmount();
      html.dir = 'ltr';
      await render(<><div id="page2"><Six /></div><div id="island2" dir="rtl"><Six /></div></>);
      expect(sides(document.getElementById('page2')!)).toEqual(LTR);
      expect(sides(document.getElementById('island2')!)).toEqual(RTL);
    } finally {
      html.removeAttribute('dir');
    }
  });

  test('an overlay opened in a dir="rtl" block on a left-to-right page lines its start up with the trigger\'s right edge, and one in a dir="ltr" block on a right-to-left page with its left edge', async () => {
    const html = document.documentElement;
    const edges = async (id: string) => {
      const trigger = document.querySelector<HTMLElement>(`#${id} button`)!;
      trigger.click();
      await expect.poll(() => document.querySelector(`#${id} [role="dialog"]`)?.getBoundingClientRect().width || 0).toBeGreaterThan(0);
      const t = trigger.getBoundingClientRect(), p = document.querySelector(`#${id} [role="dialog"]`)!.getBoundingClientRect();
      return { left: Math.round(p.left - t.left), right: Math.round(t.right - p.right) };
    };
    const Block = ({ id, dir }: { id: string; dir?: 'rtl' | 'ltr' }) => (
      <div id={id} dir={dir} style={{ padding: '0 300px' }}><Popover placement="bottom-start" title="Filters" trigger={<Button>Open</Button>}>Text</Popover></div>
    );
    try {
      await render(<Block id="rtl-island" dir="rtl" />);
      expect((await edges('rtl-island')).right).toBe(0);
      html.dir = 'rtl';
      await render(<Block id="ltr-island" dir="ltr" />);
      expect((await edges('ltr-island')).left).toBe(0);
    } finally {
      html.removeAttribute('dir');
    }
  });
});
