// The Playground guide (playground.stories.tsx): code with hooks keeps working after the preview draws again.
import * as React from 'react';
import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import meta, { Element, WithState } from './playground.stories';

const Playground = meta.component;

describe('Playground', () => {
  test('the WithState example counts when its button is pressed, and it doesn\'t crash', async () => {
    const screen = await render(<Playground {...WithState.args} />);
    await userEvent.click(screen.getByRole('button', { name: 'Add one' }));
    await userEvent.click(screen.getByRole('button', { name: 'Add one' }));
    await expect.element(screen.getByRole('region', { name: 'Preview' })).toHaveTextContent('Add one2');
  });

  test('code with hooks survives the page drawing it again (a theme switch)', async () => {
    const screen = await render(<Playground {...WithState.args} />);
    await screen.rerender(<Playground {...WithState.args} />);
    await expect.element(screen.getByRole('button', { name: 'Add one' })).toBeVisible();
  });

  test('editing the code shows the new preview, and an error in it shows as an alert', async () => {
    const screen = await render(<Playground {...Element.args} />);
    const code = screen.getByRole('textbox', { name: 'Code' });
    await userEvent.fill(code, '<Button>Saved</Button>');
    await expect.element(screen.getByRole('button', { name: 'Saved' })).toBeVisible();
    await userEvent.fill(code, 'return <Button>{missing}</Button>;');
    await expect.element(screen.getByText('It threw while rendering')).toBeVisible();
    await userEvent.fill(code, '<Button>');
    await expect.element(screen.getByText('The code doesn\'t run')).toBeVisible();
  });
});
