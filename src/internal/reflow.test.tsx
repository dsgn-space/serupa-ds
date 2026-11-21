import { expect, test } from 'vitest';
import { reflow } from './reflow';
import { keepMotion } from '../../tools/test/vitest/helpers';

keepMotion();

// reflow (ADR-0017): a transition starts from the styles set before it, so a slide runs from where the element was,
// even when the component around it is compiled by the React Compiler.
test('reflow lays the element out, so a transition runs from the style set before it', () => {
  const el = document.createElement('div');
  el.style.cssText = 'width: 10px; height: 10px; translate: 0 0; transition: translate 200ms linear';
  document.body.append(el);
  el.style.transition = 'none';
  el.style.translate = '100px 0';
  expect(reflow(el)).toBe(10);
  el.style.transition = 'translate 200ms linear';
  el.style.translate = '0px 0px';
  const moving = el.getAnimations().filter((a) => a instanceof CSSTransition && a.transitionProperty === 'translate');
  expect(moving.length).toBe(1);
  el.remove();
});
