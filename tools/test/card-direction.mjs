// The ESLint rule serupa/card-direction (tools/lint/card-direction.mjs): a Card laid out as a row says flex-row, since
// Card is a flex column and row classes alone stack and centre its children.
//   node tools/test/card-direction.mjs
import { Linter } from 'eslint';
import rule from '../lint/card-direction.mjs';
import { done, report } from './lib.mjs';

const linter = new Linter({ configType: 'flat' });
/** @type {import('eslint').Linter.Config[]} */
const config = [{
  files: ['**/*.jsx'],
  languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
  plugins: { serupa: { rules: { 'card-direction': /** @type {import('eslint').Rule.RuleModule} */ (rule) } } },
  rules: { 'serupa/card-direction': 'error' },
}];
/** @param {string} code */
const count = (code) => linter.verify(code, config, 'x.jsx').filter((m) => m.ruleId === 'serupa/card-direction').length;

const R = [];
/** @param {string} name @param {string} code @param {number} want */
const t = (name, code, want) => { const got = count(code); R.push({ name, ok: got === want, detail: `flagged ${got}, expected ${want}` }); };

t('row classes without a direction', '<Card className="flex flex-wrap items-center justify-between gap-3" />', 1);
t('in braces and in a template literal', '<><Card className={"flex justify-between"} /><Card className={`flex items-center ${x}`} /></>', 2);
t('flex-row, flex-col or a breakpoint direction says which', '<><Card className="flex flex-row flex-wrap items-center" /><Card className="flex flex-col items-center" /><Card className="flex justify-between md:flex-row" /></>', 0);
t('column classes, no className, or another element', '<><Card className="flex flex-col gap-5" /><Card /><div className="flex items-center justify-between" /></>', 0);

done(report('card-direction', R));
