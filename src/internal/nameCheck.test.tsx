import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { NAME_HOW, useNameCheck } from './nameCheck';

function Unnamed({ how }: { how: (typeof NAME_HOW)[keyof typeof NAME_HOW] }) {
  const ref = useNameCheck<HTMLDivElement>('Probe', how);
  return <div ref={ref} role="slider" aria-valuenow={1} />;
}

describe('useNameCheck', () => {
  test('NAME_HOW carries only the kind, so a production build, where the warning is gone, leaves the advice text out', () => {
    expect(NAME_HOW).toEqual({ field: 'field', group: 'group', label: 'label', title: 'title' });
  });

  test('in development, an element with no accessible name still warns once with the advice for its kind', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      await render(<><Unnamed how={NAME_HOW.label} /><Unnamed how={NAME_HOW.label} /></>);
      const said = warn.mock.calls.map((c) => String(c[0])).filter((m) => m.includes('Probe has no accessible name'));
      expect(said.length).toBe(1);
      expect(said[0]).toContain('so a screen reader announces only its role. Give it a label, or an aria-label.');
    } finally { warn.mockRestore(); }
  });
});
