import { describe, expect, test } from 'vitest';
import * as builtin from './builtin';
import * as filled from './icons';
import * as outlined from './outlined';
import type { IconData } from './types';

// Every path is relative (m, l, h, v, q, t, z) on the 960 grid, as tools/icons/material.py writes it. A quadratic
// whose control point is the previous quadratic's mirrored through the current point is the same curve as a smooth
// quadratic (t) with only its end point: writing the control point again only makes the icon set bigger.
const ARGS: Record<string, number> = { m: 2, l: 2, h: 1, v: 1, q: 4, t: 2, z: 0 };
function repeatedControls(d: string): number {
  const tokens = d.match(/[a-z]|-?(?:\d+\.?\d*|\.\d+)/gi) || [];
  let i = 0, cmd = '', x = 0, y = 0, sx = 0, sy = 0, qc: [number, number] | null = null, count = 0;
  while (i < tokens.length) {
    if (/[a-z]/i.test(tokens[i])) cmd = tokens[i++];
    if (cmd !== cmd.toLowerCase()) throw new Error(`absolute command ${cmd} in ${d.slice(0, 40)}`);
    const a = tokens.slice(i, i + ARGS[cmd]).map(Number);
    i += ARGS[cmd];
    if (cmd === 'q') {
      const cx = x + a[0], cy = y + a[1];
      if (qc && cx === 2 * x - qc[0] && cy === 2 * y - qc[1]) count++;
      qc = [cx, cy]; x += a[2]; y += a[3];
    } else if (cmd === 't') {
      qc = qc ? [2 * x - qc[0], 2 * y - qc[1]] : [x, y]; x += a[0]; y += a[1];
    } else {
      qc = null;
      if (cmd === 'm') { x += a[0]; y += a[1]; sx = x; sy = y; cmd = 'l'; }
      else if (cmd === 'l') { x += a[0]; y += a[1]; }
      else if (cmd === 'h') x += a[0];
      else if (cmd === 'v') y += a[0];
      else if (cmd === 'z') { x = sx; y = sy; }
    }
  }
  return count;
}
const icons = (set: object) => Object.values(set).filter((v): v is IconData => !!v && typeof v === 'object' && typeof (v as IconData).d === 'string');

describe('Material Symbol paths', () => {
  test('a quadratic that continues the curve before it smoothly is written as t, not with its control point again', () => {
    const repeated = (set: object) => icons(set).filter((i) => repeatedControls(i.d) > 0).map((i) => i.name);
    expect(icons(builtin).length).toBeGreaterThan(40);
    expect(icons(filled).length).toBeGreaterThan(3000);
    expect([repeated(builtin), repeated(filled).slice(0, 5), repeated(outlined).slice(0, 5)]).toEqual([[], [], []]);
  });

  test('a smooth quadratic draws the curve the full form does (the browser reads t as its mirrored control point)', () => {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    document.body.append(svg);
    try {
      const path = (d: string) => { const p = document.createElementNS(ns, 'path'); p.setAttribute('d', d); svg.append(p); return p; };
      const smooth = path('m440-440q-17 0-28.5-11.5t-11.5-28.5 11.5-28.5'), full = path('m440-440q-17 0-28.5-11.5q-11.5-11.5-11.5-28.5q0-17 11.5-28.5');
      const at = (p: SVGPathElement) => [0, 0.25, 0.5, 0.75, 1].map((f) => { const q = p.getPointAtLength(p.getTotalLength() * f); return [Math.round(q.x * 100), Math.round(q.y * 100)]; });
      expect(at(smooth)).toEqual(at(full));
    } finally { svg.remove(); }
  });
});
