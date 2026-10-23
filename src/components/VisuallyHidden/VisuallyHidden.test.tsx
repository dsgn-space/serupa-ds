import * as React from 'react';
import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { css } from '../../../tools/test/vitest/helpers';
import { VisuallyHidden } from './VisuallyHidden';

const el = (id: string) => document.getElementById(id) as HTMLElement;

describe('VisuallyHidden', () => {
  test('a 1px clipped <span>, out of the layout, its text still there; ref and className reach it', async () => {
    const r = React.createRef<HTMLElement>();
    await render(<p>Unread <VisuallyHidden id="vh" ref={r} className="extra">messages: </VisuallyHidden>3</p>);
    const e = el('vh'), b = e.getBoundingClientRect(), s = css(e);
    expect([e.tagName, e.className, r.current === e, s.position, s.overflow, e.textContent, s.visibility]).toEqual(['SPAN', 'dk-visually-hidden extra', true, 'absolute', 'hidden', 'messages: ', 'visible']);
    expect(b.width).toBeLessThanOrEqual(1);
    expect(b.height).toBeLessThanOrEqual(1);
    expect(s.display).not.toBe('none');
  });

  test('it stays in the page text that assistive tech reads', async () => {
    await render(<p>Unread <VisuallyHidden id="vh">messages: </VisuallyHidden>3</p>);
    expect(el('vh').parentElement!.textContent).toMatch(/messages/);
  });

  test('focusable: a skip link shows while focused, and hides again after', async () => {
    await render(<>
      <button id="before">before</button>
      <VisuallyHidden id="vskip" as="div" focusable><a id="skip" href="#main">Skip to content</a></VisuallyHidden>
      <button id="after">after</button>
    </>);
    const w0 = el('vskip').getBoundingClientRect().width;
    el('before').focus();
    await userEvent.keyboard('{Tab}');
    const r = el('vskip').getBoundingClientRect(), focused = document.activeElement?.id, pos = css(el('vskip')).position;
    await userEvent.keyboard('{Tab}');
    const w2 = el('vskip').getBoundingClientRect().width;
    expect(w0).toBeLessThanOrEqual(1);
    expect([focused, r.width > 50, r.height > 10, pos]).toEqual(['skip', true, true, 'static']);
    expect(w2).toBeLessThanOrEqual(1);
  });

  test('an unknown as falls back to span', async () => {
    await render(<VisuallyHidden id="vbad" as={'table' as never}>x</VisuallyHidden>);
    expect(el('vbad').tagName).toBe('SPAN');
  });
});
