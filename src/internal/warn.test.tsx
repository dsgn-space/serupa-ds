import { afterEach, expect, test, vi } from 'vitest';
import { resetWarnings, warnOnce } from './warn';

afterEach(() => { resetWarnings(); });

// A warning names its code and links its section of docs/warnings.md in the repository, on GitLab, once per key.
test('a warning links its section of docs/warnings.md on GitLab, once per key', () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  try {
    warnOnce('toaster-twice', 'Toaster: another Toaster is already mounted.');
    warnOnce('toaster-twice', 'Toaster: another Toaster is already mounted.');
    expect(warn.mock.calls.map((c) => c[0])).toEqual([
      'Toaster: another Toaster is already mounted. (Serupa warning toaster-twice: https://gitlab.com/diki-stwn/serupa-ds/-/blob/main/docs/warnings.md#toaster-twice)',
    ]);
  } finally { warn.mockRestore(); }
});
