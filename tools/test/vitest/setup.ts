// Loaded before every component test: the tokens, page defaults and component styles, as a project loads them.
import '../../../tokens.css';
import '../../../src/styles/base.css';
import '../../../src/styles/index.css';
import { afterEach } from 'vitest';

afterEach(() => { document.documentElement.setAttribute('data-theme', 'blue-light'); });
document.documentElement.setAttribute('data-theme', 'blue-light');
// The pointer rests at the top-left corner between tests; padding keeps it off the component under test.
document.body.style.padding = '16px';
