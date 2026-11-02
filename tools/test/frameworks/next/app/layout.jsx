// The Next.js App Router, as the README sets it up: the stylesheets imported once in the root layout, and theme.js
// pasted inline in <head> so the page has its light or dark theme before it paints. theme.js sets data-theme on
// <html> before React hydrates, hence suppressHydrationWarning there.
import fs from 'node:fs';
import path from 'node:path';
import 'serupa-ds/tokens.css';
import 'serupa-ds/base.css';
import 'serupa-ds/bundle.css';

const theme = fs.readFileSync(path.join(process.cwd(), 'node_modules', 'serupa-ds', 'dist', 'theme.js'), 'utf8');

export const metadata = { title: 'Serupa in Next.js' };

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: theme }} /></head>
      <body>{children}</body>
    </html>
  );
}
