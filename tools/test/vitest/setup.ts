// Loaded before every component test: the tokens, page defaults and component styles, as a project loads them.
import '../../../tokens.css';
import '../../../src/styles/base.css';
import '../../../src/styles/index.css';
import { afterEach } from 'vitest';
import { userEvent } from 'vitest/browser';

afterEach(() => { document.documentElement.setAttribute('data-theme', 'blue-light'); });
document.documentElement.setAttribute('data-theme', 'blue-light');
// No transitions or animations: a test reads the end state, which Firefox and WebKit can otherwise still be
// easing towards. Motion itself is tested by the suites in tools/test/ (button-motion.mjs and others).
const still = document.createElement('style');
still.id = 'serupa-still';
still.textContent = '*, *::before, *::after { transition: none !important; animation: none !important; }';
document.head.appendChild(still);
// The pointer rests at the top-left corner between tests; padding keeps it off the component under test.
// Nothing moves it back on its own (the test files share one page too), and left where a test clicked, it
// hovers whatever the next test renders there, which then reads its hover look: so it goes back after each.
document.body.style.padding = '16px';
afterEach(() => userEvent.hover(document.documentElement, { position: { x: 0, y: 0 }, force: true }));
