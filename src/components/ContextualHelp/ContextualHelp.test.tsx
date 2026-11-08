import * as React from 'react';
import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { THEMES, contrast, css } from '../../../tools/test/vitest/helpers';
import { SerupaProvider } from '../../internal/provider';
import { ContextualHelp } from './ContextualHelp';

const btn = () => document.querySelector('.dk-contextual-help__button') as HTMLButtonElement;
const panel = () => document.querySelector('.dk-contextual-help') as HTMLElement;
const tick = () => new Promise((r) => setTimeout(r, 30));

describe('ContextualHelp', () => {
  test('a button named "Help" (or "Information" for variant info, or its label), 24px or larger, with aria-expanded (and aria-controls while open)', async () => {
    const { rerender } = await render(<ContextualHelp>Text</ContextualHelp>);
    const b = btn(), r = b.getBoundingClientRect();
    expect([b.tagName, b.getAttribute('aria-label'), b.getAttribute('aria-expanded')]).toEqual(['BUTTON', 'Help', 'false']);
    expect(r.width >= 24 && r.height >= 24).toBe(true);
    await rerender(<ContextualHelp variant="info">Text</ContextualHelp>);
    expect(btn().getAttribute('aria-label')).toBe('Information');
    await rerender(<ContextualHelp label="Help: tax ID">Text</ContextualHelp>);
    expect(btn().getAttribute('aria-label')).toBe('Help: tax ID');
  });

  test('pressing it opens a non-modal dialog named by its title; pressing again closes it', async () => {
    await render(<><ContextualHelp title="What is a workspace?">Holds your projects.</ContextualHelp><button id="after">after</button></>);
    await userEvent.click(btn());
    await tick();
    const p = panel();
    expect([p.hidden, p.getAttribute('role'), p.hasAttribute('aria-modal'), btn().getAttribute('aria-expanded'), btn().getAttribute('aria-controls')]).toEqual([false, 'dialog', false, 'true', p.id]);
    expect(document.getElementById(p.getAttribute('aria-labelledby')!)!.textContent).toBe('What is a workspace?');
    expect(p.querySelector('h3')).not.toBeNull();
    await userEvent.click(btn());
    await tick();
    expect([panel().hidden, btn().getAttribute('aria-expanded')]).toEqual([true, 'false']);
  });

  test('with no title the panel is named by the button\'s name; Escape closes it and focus goes back to the button', async () => {
    await render(<ContextualHelp label="About the rate">Hourly.</ContextualHelp>);
    btn().focus();
    await userEvent.keyboard('{Enter}');
    await tick();
    expect(panel().getAttribute('aria-label')).toBe('About the rate');
    await userEvent.keyboard('{Escape}');
    await tick();
    expect([panel().hidden, document.activeElement]).toEqual([true, btn()]);
  });

  test('a link inside takes focus when it opens', async () => {
    await render(<ContextualHelp>Read <a href="#x" id="more">more</a></ContextualHelp>);
    await userEvent.click(btn());
    await tick();
    expect(document.activeElement?.id).toBe('more');
  });

  test('its words follow SerupaProvider labels', async () => {
    await render(<SerupaProvider labels={{ contextualHelp: 'Bantuan' }}><ContextualHelp>Teks</ContextualHelp></SerupaProvider>);
    expect(btn().getAttribute('aria-label')).toBe('Bantuan');
  });

  test('the "?" and "i" read 3:1 on the page in all six themes', async () => {
    await render(<><ContextualHelp>a</ContextualHelp><ContextualHelp variant="info">b</ContextualHelp></>);
    const [h, i] = [...document.querySelectorAll('.dk-contextual-help__button')] as HTMLElement[];
    for (const th of THEMES) {
      document.documentElement.setAttribute('data-theme', th);
      const bg = css(document.body).backgroundColor;
      for (const e of [h, i]) expect(contrast(css(e).color, bg), th).toBeGreaterThanOrEqual(3);
    }
  });
});
