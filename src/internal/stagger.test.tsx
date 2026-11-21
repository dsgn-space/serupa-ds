import * as React from 'react';
import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { keepMotion } from '../../tools/test/vitest/helpers';

// The .stagger utility (utilities.template.css): each child waits its place times motion-stagger, and
// --srp-stagger-delay carries that wait for a transition of your own, also on an element inside the child.
describe('.stagger', () => {
  keepMotion();   // the test setup's stylesheet that stops motion would zero every delay
  test('an element inside the third child that reads --srp-stagger-delay gets the child\'s wait (100ms), not one worked out from its own place', async () => {
    await render(<div className="stagger">
      {[1, 2, 3].map((n) => <div key={n}><span id={'st-' + n} style={{ transitionDelay: 'var(--srp-stagger-delay)' }}>{n}</span></div>)}
    </div>);
    const delay = (n: number) => getComputedStyle(document.getElementById('st-' + n)!).transitionDelay;
    expect([delay(1), delay(2), delay(3)]).toEqual(['0s', '0.05s', '0.1s']);
  });
});
