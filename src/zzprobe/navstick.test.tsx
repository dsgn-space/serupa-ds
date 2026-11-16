/* eslint-disable */
// @ts-nocheck
import * as React from 'react';
import { render } from 'vitest-browser-react';
import { expect, test } from 'vitest';
import { withMotion } from '../../tools/test/vitest/helpers';
import { Navbar, NavbarLink } from '../components/Navbar/Navbar';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
for (let k = 0; k < 6; k++) test('stick ' + k, async () => withMotion(async () => {
  await render(<div><Navbar id={'n' + k} sticky condense brand="Docs"><NavbarLink href="#a">A</NavbarLink></Navbar><div style={{ height: 2000 }} /></div>);
  const n = document.getElementById('n' + k)!;
  const shown = () => { const r = n.getBoundingClientRect(); return Math.round(r.top) + ',' + Math.round(r.bottom); };
  window.scrollTo(0, 0); await wait(100);
  window.scrollTo(0, 8); await wait(300);
  const at8 = shown();
  window.scrollTo(0, 600);
  const seq = [];
  for (let i = 0; i < 10; i++) { await new Promise(requestAnimationFrame); seq.push(shown()); }
  await wait(1500); const later = shown();
  window.scrollBy(0, 1); await wait(200); const nudged = shown();
  const anim = n.getAnimations().map((a) => a.animationName + ':' + (a.currentTime?.value ?? a.currentTime) + ':' + a.playState).join(' ');
  console.log('STICK', k, at8, '| frames', seq.join(' '), '| 1.5s', later, '| +1px', nudged, '|', anim);
}));
