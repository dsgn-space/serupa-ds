// Loaded before every component test: the tokens, page defaults and component styles, as a project loads them.
import '../../../tokens.css';
import '../../../src/styles/base.css';
import '../../../src/styles/index.css';
import { afterEach } from 'vitest';

afterEach(() => { document.documentElement.setAttribute('data-theme', 'blue-light'); });
document.documentElement.setAttribute('data-theme', 'blue-light');
// No transitions or animations: a test reads the end state, which Firefox and WebKit can otherwise still be
// easing towards. Tests about motion turn it back on with keepMotion() or withMotion() (helpers.ts).
const still = document.createElement('style');
still.id = 'serupa-still';
still.textContent = '*, *::before, *::after { transition: none !important; animation: none !important; }';
document.head.appendChild(still);
// The pointer rests at the top-left corner between tests; padding keeps it off the component under test.
document.body.style.padding = '16px';
