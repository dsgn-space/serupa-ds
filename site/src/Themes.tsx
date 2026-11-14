// The themes page: one piece of product under all six themes at once. Each panel is a section with that theme's
// attributes, which is all a theme is; the axes above (contrast, density, roundness) are attributes too, set on
// every panel. The fuller playground, with the attributes to copy, is Foundations' own page.
import * as React from 'react';
import tokens from '../../tokens.json';
import { AXES } from '../../docs/themePlayground';
import { Button } from '../../src/components/Button/Button';
import { Field } from '../../src/components/Field/Field';
import { Heading } from '../../src/components/Heading/Heading';
import { Link } from '../../src/components/Link/Link';
import { SegmentedControl } from '../../src/components/SegmentedControl/SegmentedControl';
import { Sample } from './Sample';
import { Shell } from './Shell';
import { useTheme } from './theme';

// The axes every theme shares: the brand and the mode are what the six panels already are.
const SHARED = AXES.filter((a) => ['contrast', 'density', 'radius'].includes(a.key));

export function Themes() {
  const { theme, set } = useTheme();
  const [values, setValues] = React.useState<Record<string, string>>(() => Object.fromEntries(SHARED.map((a) => [a.key, a.initial])));
  React.useEffect(() => { document.title = 'Themes · Serupa'; window.scrollTo(0, 0); }, []);
  const attrs = Object.fromEntries(SHARED.filter((a) => values[a.key]).map((a) => [a.attr, values[a.key]]));
  return <Shell>
    <div className="site-index">
      <header className="site-title">
        <p className="site-eyebrow">Theming</p>
        <Heading level={1} className="site-h1">Six themes, side by side</Heading>
        <p className="site-lead">The same components and the same markup in every panel. Only the tokens differ, and each theme meets WCAG 2.2 AA on its own.</p>
      </header>
      <div className="site-themes__axes">
        {SHARED.map((a) => <Field key={a.key} label={a.label}>
          <SegmentedControl size="sm" value={values[a.key] || 'default'} onValueChange={(v: string) => setValues((s) => ({ ...s, [a.key]: v === 'default' ? '' : v }))}
            options={a.options.map((o) => ({ value: o.value || 'default', label: o.label }))} />
        </Field>)}
      </div>
      <ul className="site-themes" role="list">
        {tokens.color.themes.map((t) => {
          const [brand = '', mode = ''] = t.id.split('-');
          const current = theme === t.id;
          return <li key={t.id}>
            <section aria-labelledby={`theme-${t.id}`} className="site-theme" data-brand={brand} data-mode={mode} {...attrs}>
              <div className="site-theme__head">
                <Heading level={2} id={`theme-${t.id}`} className="site-theme__name">{t.name}</Heading>
                <Button size="sm" variant={current ? 'secondary' : 'outline'} aria-pressed={current} leftIcon={current ? 'check' : undefined} onClick={() => set({ brand, mode: mode as 'light' | 'dark' })}>
                  {current ? 'This site’s theme' : 'Use on this site'}
                </Button>
              </div>
              <Sample headingLevel={3} />
            </section>
          </li>;
        })}
      </ul>
      <p className="site-p">A theme is a brand and a mode, set with <code className="site-code">data-brand</code> and <code className="site-code">data-mode</code> on the page or on any part of it. <Link href="/foundations/themes">Themes</Link> explains how they are made, and the <Link href="/foundations/theme-playground">theme playground</Link> gives the attributes to copy.</p>
    </div>
  </Shell>;
}
