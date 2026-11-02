// React Router in framework mode (what Remix became): the stylesheets as route links so they load before the page
// paints, and theme.js inline first in <head>. theme.js sets data-theme on <html> before React hydrates, hence
// suppressHydrationWarning there.
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router';
import tokens from 'serupa-ds/tokens.css?url';
import base from 'serupa-ds/base.css?url';
import bundle from 'serupa-ds/bundle.css?url';
import theme from 'serupa-ds/theme.js?raw';

export const links = () => [tokens, base, bundle].map((href) => ({ rel: 'stylesheet', href }));

export function Layout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: theme }} />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
