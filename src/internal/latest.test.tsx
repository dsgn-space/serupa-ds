import * as React from 'react';
import { expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { useLatest } from './cn';

// useLatest (ADR-0017): one ref for the component's life, holding the value of the newest committed render, so a
// handler made once (a native listener, a memoised row's callback) reads the current props without being made again.
test('useLatest keeps one ref and hands a handler made on mount the newest value', async () => {
  const refs: React.RefObject<string>[] = [];
  const read: string[] = [];
  function Probe({ word }: { word: string }) {
    const latest = useLatest(word);
    refs.push(latest);
    const [onClick] = React.useState(() => () => { read.push(latest.current); });
    return <button type="button" onClick={onClick}>Read</button>;
  }
  const screen = await render(<Probe word="first" />);
  await screen.getByRole('button').click();
  await screen.rerender(<Probe word="second" />);
  await screen.getByRole('button').click();
  expect(read).toEqual(['first', 'second']);
  expect(new Set(refs).size).toBe(1);
});
