import * as React from 'react';
import { Button } from '../../components/Button/Button';
import { Field } from '../../components/Field/Field';
import { Heading } from '../../components/Heading/Heading';
import { Link } from '../../components/Link/Link';
import { Select } from '../../components/Select/Select';

/* Footer (BL10): the site's footer, for an app to copy. What it carries (WCAG 2.2):
   - 1.3.1 / 2.4.1: a <footer> (the page's contentinfo landmark) with each link group as a navigation landmark named
     by its visible heading, so "Product" and "Company" are told apart in a list of landmarks.
   - 3.1.2: each language is written in itself, marked with its lang, so a screen reader says "Bahasa Indonesia" the
     Indonesian way.
   - 3.2.2: picking a language changes nothing until the person presses Change (a new language is a new page);
     picking a theme only changes how the page looks, so it applies at once.
   - 1.3.1 / 3.3.2: both pickers have visible labels. Each word is a prop or a label, English by default. */

export interface FooterLinkGroup {
  /** The group's heading, which names its navigation landmark: "Product". */
  title: string;
  links: readonly { label: string; href: string }[];
}

export interface FooterLanguage {
  /** What onLanguageChange gets: "id". */
  value: string;
  /** The language's name in itself: "Bahasa Indonesia". */
  label: string;
  /** Its BCP 47 tag, so the name is said in its own language. Default: value. */
  lang?: string | undefined;
}

export interface FooterLabels {
  language: string;
  changeLanguage: string;
  theme: string;
  /** The theme picker's choices, in order, when `themes` isn't given. */
  system: string;
  light: string;
  dark: string;
}

const english: FooterLabels = { language: 'Language', changeLanguage: 'Change', theme: 'Theme', system: 'Match my device', light: 'Light', dark: 'Dark' };

export interface FooterProps {
  groups: readonly FooterLinkGroup[];
  /** The languages the site is in. With fewer than two, there's no language picker. */
  languages?: readonly FooterLanguage[] | undefined;
  /** The page's language now. */
  language?: string | undefined;
  /** Change was pressed with a different language picked. */
  onLanguageChange?: ((value: string) => void) | undefined;
  /** The theme now: 'system', 'light' or 'dark', or one of your `themes`. Without onThemeChange, there's no theme picker. */
  theme?: string | undefined;
  onThemeChange?: ((value: string) => void) | undefined;
  /** Your own themes, in place of Match my device, Light and Dark. */
  themes?: readonly { value: string; label: string }[] | undefined;
  /** The legal line: "© 2026 Acme, Inc.", and links to terms and privacy. */
  legal: React.ReactNode;
  /** The groups' headings. Default: 2. */
  headingLevel?: 2 | 3 | 4 | undefined;
  labels?: Partial<FooterLabels> | undefined;
}

/** The site's footer: link groups as named navigation, language and theme pickers, and the legal line. */
export function Footer({ groups, languages = [], language, onLanguageChange, theme = 'system', onThemeChange, themes, legal, headingLevel = 2, labels }: FooterProps) {
  const l = { ...english, ...labels };
  const id = React.useId();
  const [picked, setPicked] = React.useState(language ?? languages[0]?.value ?? '');
  // The page's language changed (Change was pressed, or the app moved on): the picker shows it. Set while rendering,
  // React's way to follow a prop, so there's no render with the old choice.
  const [was, setWas] = React.useState(language);
  if (language !== was) { setWas(language); if (language != null) setPicked(language); }
  const choices = themes ?? [{ value: 'system', label: l.system }, { value: 'light', label: l.light }, { value: 'dark', label: l.dark }];
  const changeLanguage = (e: React.FormEvent) => { e.preventDefault(); if (picked !== language) onLanguageChange?.(picked); };
  return (
    <footer className="border-t border-border bg-surface text-text">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
          {groups.map((g, i) => (
            <nav key={g.title} aria-labelledby={`${id}-${i}`} className="flex flex-col gap-3">
              <Heading level={headingLevel} id={`${id}-${i}`} className="text-sm font-semibold">{g.title}</Heading>
              <ul className="m-0 flex list-none flex-col gap-2 p-0 text-sm">
                {g.links.map((link) => <li key={link.href + link.label}><Link href={link.href}>{link.label}</Link></li>)}
              </ul>
            </nav>
          ))}
        </div>
        {(languages.length > 1 && onLanguageChange) || onThemeChange ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            {languages.length > 1 && onLanguageChange ? (
              <form onSubmit={changeLanguage} className="flex items-end gap-2">
                <Field label={l.language}>
                  <Select value={picked} onChange={(e) => setPicked(e.target.value)}>
                    {languages.map((x) => <option key={x.value} value={x.value} lang={x.lang ?? x.value}>{x.label}</option>)}
                  </Select>
                </Field>
                <Button type="submit" variant="outline">{l.changeLanguage}</Button>
              </form>
            ) : null}
            {onThemeChange ? (
              <Field label={l.theme}>
                <Select value={theme} options={choices.map((c) => ({ value: c.value, label: c.label }))} onChange={(e) => onThemeChange(e.target.value)} />
              </Field>
            ) : null}
          </div>
        ) : null}
        <div className="border-t border-border pt-6 text-sm text-text-muted">{legal}</div>
      </div>
    </footer>
  );
}
