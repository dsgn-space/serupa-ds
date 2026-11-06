import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Heading } from '../../components/Heading/Heading';
import { Link } from '../../components/Link/Link';
import { Footer, type FooterLinkGroup } from './Footer';

/* Footer (BL10): the site's footer, as a block an app copies. Footer.mdx says what each part is for. The stories put
   it under a small page (a skip link, main and an h1). The pickers keep their choice in the story; an app changes
   the page's language and theme from them. */
const groups: FooterLinkGroup[] = [
  { title: 'Product', links: [{ label: 'Features', href: '#features' }, { label: 'Pricing', href: '#pricing' }, { label: 'Changelog', href: '#changelog' }] },
  { title: 'Resources', links: [{ label: 'Guides', href: '#guides' }, { label: 'Help center', href: '#help' }, { label: 'Status', href: '#status' }] },
  { title: 'Company', links: [{ label: 'About', href: '#about' }, { label: 'Careers', href: '#careers' }, { label: 'Contact', href: '#contact' }] },
  { title: 'Legal', links: [{ label: 'Terms', href: '#terms' }, { label: 'Privacy', href: '#privacy' }, { label: 'Accessibility', href: '#accessibility' }] },
];
const languages = [{ value: 'en', label: 'English' }, { value: 'id', label: 'Bahasa Indonesia' }, { value: 'ar', label: 'العربية' }, { value: 'ja', label: '日本語' }];

function Page({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-screen flex-col bg-surface-muted text-text"><SkipLink />
    <main id="main" className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 px-4 py-10 outline-none"><Heading level={1}>Acme</Heading><p className="text-text-muted">The page’s own content goes here.</p></main>
    {children}</div>;
}

/** Keeps the picked language and theme, as an app would before applying them. */
function Live() {
  const [language, setLanguage] = React.useState('en');
  const [theme, setTheme] = React.useState('system');
  return <Footer groups={groups} languages={languages} language={language} onLanguageChange={setLanguage} theme={theme} onThemeChange={setTheme}
    legal={<p className="m-0">© 2026 Acme, Inc. <Link href="#terms">Terms</Link> · <Link href="#privacy">Privacy</Link></p>} />;
}

const meta = {
  title: 'Blocks/Footer',
  component: Footer,
  parameters: { layout: 'fullscreen' },
  args: { groups, legal: '© 2026 Acme, Inc.' },
} satisfies Meta<typeof Footer>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Four link groups, the language and theme pickers, and the legal line. */
export const Default: Story = { render: () => <Page><Live /></Page> };

/** Only links and the legal line: with no handlers, there are no pickers. */
export const LinksOnly: Story = { render: (args) => <Page><Footer {...args} groups={groups.slice(0, 2)} /></Page> };
