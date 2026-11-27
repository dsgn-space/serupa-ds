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
