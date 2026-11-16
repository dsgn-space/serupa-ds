import * as React from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { HoverCard } from '../components/HoverCard/HoverCard';
import { Popover } from '../components/Popover/Popover';
import { ShowMore } from '../components/ShowMore/ShowMore';
import { ToggleButton } from '../components/ToggleButton/ToggleButton';
import { ToggleGroup } from '../components/ToggleGroup/ToggleGroup';
import { Tour } from '../components/Tour/Tour';

afterEach(() => { vi.restoreAllMocks(); });
const switches = (warn: { mock: { calls: unknown[][] } }) => warn.mock.calls.map((c) => String(c[0])).filter((m) => m.includes('controlled-switch'));

// Each prop an app can own, given a value and then undefined for one render (state loading or reset), as a user's app
// would by mistake: the component warns once in development and keeps following the prop.
const CASES: Array<[string, (v: unknown) => React.ReactElement]> = [
  ['HoverCard open', (v) => <HoverCard trigger={<a href="#d">@d</a>} open={v as boolean | undefined}>Card</HoverCard>],
  ['Popover open', (v) => <Popover title="Share" trigger={<button type="button">Share</button>} open={v as boolean | undefined}>Body</Popover>],
  ['ShowMore expanded', (v) => <ShowMore expanded={v as boolean | undefined}>Text</ShowMore>],
  ['ToggleGroup value', (v) => <ToggleGroup aria-label="Align" value={v as string[] | undefined}><ToggleButton value="l" aria-label="Left">L</ToggleButton></ToggleGroup>],
  ['Tour open', (v) => <Tour steps={[{ target: '#nowhere', title: 'One' }]} open={v as boolean | undefined} />],
  ['Tour step', (v) => <Tour steps={[{ target: '#nowhere', title: 'One' }]} step={v as number | undefined} />],
];
const VALUE: Record<string, unknown> = { 'ToggleGroup value': [], 'Tour step': 0 };

describe('a controlled prop that turns undefined', () => {
  for (const [name, ui] of CASES) {
    test(`${name}: controlled, then undefined, warns once naming the component and the prop; staying controlled warns nothing`, async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const v = name in VALUE ? VALUE[name] : false;
      const r = await render(ui(v));
      await r.rerender(ui(v));
      expect(switches(warn)).toEqual([]);
      await r.rerender(ui(undefined));
      await r.rerender(ui(v));
      const [component, prop] = name.split(' ');
      expect(switches(warn)).toHaveLength(1);
      expect(switches(warn)[0]).toContain(`${component}: \`${prop}\` changed from controlled to uncontrolled`);
      await r.unmount();
    });
  }
});
