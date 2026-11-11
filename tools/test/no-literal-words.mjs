// The ESLint rule serupa/no-literal-words (tools/lint/no-literal-words.mjs): a word written into a component's JSX
// is flagged wherever it can reach people, and the words that come from labels pass (GR276).
//   node tools/test/no-literal-words.mjs
import { Linter } from 'eslint';
import rule from '../lint/no-literal-words.mjs';
import { done, report } from './lib.mjs';

const linter = new Linter({ configType: 'flat' });
const config = (allow) => [{
  files: ['**/*.jsx'],
  languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
  plugins: { serupa: { rules: { 'no-literal-words': rule } } },
  rules: { 'serupa/no-literal-words': ['error', ...(allow ? [{ allow }] : [])] },
}];
const flagged = (code, allow) => linter.verify(code, config(allow), 'x.jsx').map((m) => m.ruleId === 'serupa/no-literal-words' ? m.message.match(/"(.*)"$/)?.[1] : `${m.ruleId}: ${m.message}`);

const R = [];
const t = (name, code, want, allow) => {
  const got = flagged(code, allow);
  R.push({ name, ok: JSON.stringify(got) === JSON.stringify(want), detail: `flagged ${JSON.stringify(got)}, expected ${JSON.stringify(want)}` });
};

t('words from labels, symbols and non-spoken attributes pass', `const a = <div className="dk-x" aria-label={l.close} title={open ? l.hide : l.show} data-x="Words here">{l.more} × {count} {\`\${n}\`}</div>;`, []);
t('JSX text and a literal in a spoken attribute', '<b title="Close">Open now</b>', ['Close', 'Open now']);
t('a string child in braces', `<b>{'Close'}</b>`, ['Close']);
t('the fixed text of a template literal, in a child and an attribute', '<b aria-label={`${n} more`}>{`Page ${n}`}</b>', ['more', 'Page']);
t('either side of a condition, and a logical fallback', `<b alt={open ? 'Hide' : l.show}>{name || 'Nobody'}{busy && 'Saving'}</b>`, ['Hide', 'Nobody', 'Saving']);
t('aria-placeholder is spoken', '<div role="textbox" aria-placeholder="Search" />', ['Search']);
t('the allow option passes a word', `<b title="OK">{'OK'}</b>`, [], ['OK']);

done(report('no-literal-words', R));
