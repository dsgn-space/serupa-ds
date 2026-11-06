import * as React from 'react';
import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { THEMES, contrast, css } from '../../../tools/test/vitest/helpers';
import { EventCalendar } from './EventCalendar';

const el = (id: string) => document.getElementById(id) as HTMLElement;

describe('EventCalendar', () => {
  test('renders a <div>; ref, className and other props reach it', async () => {
    const ref = React.createRef<HTMLDivElement>();
    await render(<EventCalendar id="x" ref={ref} className="extra" data-x="y">Hello</EventCalendar>);
    const e = el('x');
    expect([e.tagName, e.textContent, ref.current === e, e.className, e.dataset.x, e.dataset.component]).toEqual(['DIV', 'Hello', true, 'dk-event-calendar extra', 'y', 'event-calendar']);
  });

  test('its text reads 4.5:1 on its background in all six themes', async () => {
    await render(<EventCalendar id="c">Text</EventCalendar>);
    for (const th of THEMES) {
      document.documentElement.setAttribute('data-theme', th);
      expect(contrast(css(el('c')).color, css(el('c')).backgroundColor), th).toBeGreaterThanOrEqual(4.5);
    }
  });

  // TODO(new-component): a test for every behaviour: keyboard, focus, ARIA states, each variant.
});
