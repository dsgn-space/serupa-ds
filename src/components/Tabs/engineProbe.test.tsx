// TEMPORARY probe for MWG-SPIKE and MWG-VT, removed before this pull request merges: what each engine does.
import { test } from 'vitest';

const frame = () => new Promise((r) => requestAnimationFrame(() => r(null)));

// eslint-disable-next-line vitest/expect-expect -- reports by throwing, on purpose (temporary)
test('engine probe: anchor() insets and Element.startViewTransition', async () => {
  const out: Record<string, unknown> = { ua: navigator.userAgent };
  out.anchorSupported = CSS.supports('anchor-name: --a') && CSS.supports('left: anchor(left)');
  out.elementViewTransition = typeof (Element.prototype as unknown as { startViewTransition?: unknown }).startViewTransition === 'function';
  out.documentViewTransition = typeof (document as unknown as { startViewTransition?: unknown }).startViewTransition === 'function';
  if (out.anchorSupported) {
    const host = document.createElement('div');
    host.innerHTML = `<style>
      .p-a { anchor-name: --probe; position: relative; display: inline-block; width: 40px; height: 10px; margin-left: 0; }
      .p-i { position: absolute; position-anchor: --probe; left: anchor(left); width: anchor-size(width); height: 2px; top: 50px;
             transition: left 400ms linear, width 400ms linear; background: red; }
    </style><div style="position:relative;width:400px"><span class="p-a"></span><span class="p-i"></span></div>`;
    document.body.append(host);
    const a = host.querySelector<HTMLElement>('.p-a')!, ind = host.querySelector<HTMLElement>('.p-i')!;
    await frame(); await frame();
    const start = ind.getBoundingClientRect().left;
    a.style.marginLeft = '200px'; a.style.width = '80px';
    const lefts: number[] = [], widths: number[] = [];
    for (let i = 0; i < 40; i++) { await frame(); const r = ind.getBoundingClientRect(); lefts.push(Math.round(r.left - start)); widths.push(Math.round(r.width)); }
    out.anchorLefts = [...new Set(lefts)].slice(0, 12);
    out.anchorWidths = [...new Set(widths)].slice(0, 12);
    out.anchorAnimates = new Set(lefts).size > 2;
    out.anchorArrives = lefts[lefts.length - 1] === 200;
    host.remove();
  }
  // Fails on purpose, so the run's failure list carries what was seen.
  throw new Error('ENGINE-PROBE ' + JSON.stringify(out));
});

// TEMPORARY: where Tab goes in a Lightbox in each engine, and what Escape does there.
// eslint-disable-next-line vitest/expect-expect -- reports by throwing, on purpose (temporary)
test('engine probe: Tab and Escape in Lightbox Default', async () => {
  const { createRoot } = await import('react-dom/client');
  const { flushSync } = await import('react-dom');
  const { userEvent } = await import('vitest/browser');
  const { storyElement } = await import('../../../tools/test/vitest/stories');
  const mod = await import('../Lightbox/Lightbox.stories');
  const before = document.body.appendChild(document.createElement('button')); before.textContent = 'before';
  const host = document.body.appendChild(document.createElement('div'));
  const after = document.body.appendChild(document.createElement('button')); after.textContent = 'after';
  const root = createRoot(host);
  flushSync(() => root.render(storyElement(mod.default as never, mod.Default as never)));
  await frame(); await new Promise((r) => setTimeout(r, 50));
  const d = (el: Element | null) => !el ? 'null' : el === document.body ? 'body' : `${el.tagName.toLowerCase()}:${el.getAttribute('aria-label') || (el.textContent || '').trim().slice(0, 12)}`;
  const open = () => !!document.querySelector('dialog[open]');
  const trail: string[] = [`start ${d(document.activeElement)} open=${open()}`];
  before.focus();
  trail.push(`focus(before) -> ${d(document.activeElement)} hasFocus=${document.hasFocus()}`);
  for (let i = 0; i < 9; i++) { trail.push('…'); await userEvent.tab(); trail.pop(); trail.push(`tab -> ${d(document.activeElement)} hasFocus=${document.hasFocus()} open=${open()}`); }
  const seenKeys: string[] = [];
  const onKey = (e: KeyboardEvent) => seenKeys.push(`${e.key}@${d(e.target as Element)}${e.defaultPrevented ? ' prevented' : ''}`);
  window.addEventListener('keydown', onKey, true);
  const dlg = document.querySelector('dialog');
  dlg?.addEventListener('cancel', () => seenKeys.push('cancel'));
  dlg?.addEventListener('close', () => seenKeys.push('close'));
  for (let k = 0; k < 4 && open(); k++) {
    await userEvent.keyboard('{Escape}'); await frame(); await frame();
    trail.push(`escape -> ${d(document.activeElement)} hasFocus=${document.hasFocus()} open=${open()} events=${seenKeys.splice(0).join(',')}`);
    await userEvent.tab();
    trail.push(`tab -> ${d(document.activeElement)} hasFocus=${document.hasFocus()} open=${open()}`);
  }
  window.removeEventListener('keydown', onKey, true);
  root.unmount(); for (const el of [before, host, after]) el.remove();
  throw new Error('ENGINE-PROBE-LIGHTBOX ' + JSON.stringify(trail));
}, 60000);

// TEMPORARY: whether a held press on a checked Switch matches :active in each engine.
// eslint-disable-next-line vitest/expect-expect -- reports by throwing, on purpose (temporary)
test('engine probe: a held press on a checked Switch', async () => {
  const React = await import('react');
  const { render } = await import('vitest-browser-react');
  const { press, css } = await import('../../../tools/test/vitest/helpers');
  const { Switch } = await import('../Switch/Switch');
  await render(React.createElement(React.Fragment, null, React.createElement(Switch, { id: 'ps' }, 'Press me'), React.createElement(Switch, { id: 'pk', defaultChecked: true }, 'On')));
  const look = (id: string) => { const i = document.getElementById(id)!, l = i.closest('label')!, r = l.getBoundingClientRect(); const at = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return { active: l.matches(':active'), inputActive: i.matches(':active'), checked: (i as HTMLInputElement).checked, bg: css(i).backgroundColor, at: at ? at.className || at.tagName : null, rect: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)] }; };
  const out: Record<string, unknown> = {};
  out.pkFirst = await press(document.getElementById('pk')!.closest('label')!, () => look('pk'));
  out.pkAfterFirst = look('pk');
  out.ps = await press(document.getElementById('ps')!.closest('label')!, () => look('ps'));
  out.pkSecond = await press(document.getElementById('pk')!.closest('label')!, () => look('pk'));
  out.pkSecondLater = await press(document.getElementById('pk')!.closest('label')!, async () => { await frame(); await frame(); return look('pk'); });
  throw new Error('ENGINE-PROBE-SWITCH ' + JSON.stringify(out));
});
