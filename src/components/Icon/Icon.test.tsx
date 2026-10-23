import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { settle } from '../../../tools/test/vitest/helpers';
import { BUILTIN_ICONS } from '../../material/builtin';
import { Icon } from './Icon';

const path = (id: string) => document.querySelector(`#${id} svg path`);

describe('Icon', () => {
  test('a built-in icon (one the components use) draws on the first render', async () => {
    expect(BUILTIN_ICONS.some((d) => d.name === 'close')).toBe(true);
    await render(<Icon id="close" name="close" />);
    expect(path('close')).not.toBeNull();
  });

  test('any other Material Symbol loads the full set once, then draws', async () => {
    expect(BUILTIN_ICONS.some((d) => d.name === 'sports_cricket')).toBe(false);
    await render(<Icon id="cricket" name="sports_cricket" />);
    await vi.waitFor(() => expect(path('cricket')).not.toBeNull());
  });

  test('an unknown name stays an empty box and warns once the full set has loaded', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await render(<Icon id="unknown" name="not_a_real_icon" />);
    await vi.waitFor(() => expect(warn.mock.calls.some((c) => String(c[0]).includes('"not_a_real_icon"'))).toBe(true));
    await settle(50);
    expect(document.querySelector('#unknown svg')).toBeNull();
    warn.mockRestore();
  });

  test('a decorative Icon is aria-hidden; with aria-label it is role="img"', async () => {
    await render(<><Icon id="deco" name="home" /><Icon id="meaning" name="error" aria-label="Error" /></>);
    expect(document.getElementById('deco')!.getAttribute('aria-hidden')).toBe('true');
    expect(document.getElementById('meaning')!.getAttribute('role')).toBe('img');
  });
});
