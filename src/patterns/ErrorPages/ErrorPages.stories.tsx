import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ErrorBoundary } from '../../components/ErrorBoundary/ErrorBoundary';
import { ErrorPage } from './ErrorPages';

/* Error pages (PT7): not found, offline, server error and no access, as pages an app copies. ErrorPages.mdx says when
   each one shows, why each part is there and what stays the app's job. "Try again" does nothing here, so the story
   stays put. */
const stay = () => {};

// FromErrorBoundary crashes on purpose. React reports every caught error with console.error; keep that one quiet so
// the browser console only shows real problems (as ErrorBoundary's own stories do).
const ON_PURPOSE = 'The page failed to render';
if (typeof window !== 'undefined' && !(console.error as { serupaQuiet?: boolean }).serupaQuiet) {
  const error = console.error.bind(console);
  const quiet = (args: unknown[]) => args.some((a) => (a instanceof Error ? a.message : String(a)).includes(ON_PURPOSE));
  console.error = Object.assign((...args: unknown[]) => { if (!quiet(args)) error(...args); }, { serupaQuiet: true });
}
const meta = {
  title: 'Patterns/Error pages',
  component: ErrorPage,
  parameters: { layout: 'fullscreen' },
  args: { kind: 'not-found', onRetry: stay, home: '#home' },
} satisfies Meta<typeof ErrorPage>;
export default meta;
type Story = StoryObj<typeof meta>;

/** A 404: the address is wrong or the page moved. The way back is home, or back where they came from. */
export const NotFound: Story = {};

/** No connection. "Try again" reloads; when the connection returns, a status line says so without reloading by itself. */
export const Offline: Story = { args: { kind: 'offline' } };

/** A 500: the server failed. It says it isn't the person's fault, and gives a reference for support. */
export const ServerError: Story = { args: { kind: 'server', reference: 'ERR-7F3A-21' } };

/** A 403: signed in, but not allowed here. The way out is home, or signing in as someone else. */
export const NoAccess: Story = { args: { kind: 'no-access' } };

function Broken(): React.ReactElement { throw new Error(ON_PURPOSE); }
/** The server error page as an ErrorBoundary's fallback around the whole page: its reset is "Try again". */
export const FromErrorBoundary: Story = {
  render: (args) => (
    <ErrorBoundary fallback={({ reset }) => <ErrorPage kind="server" home={args.home} onRetry={reset} />} onError={stay}>
      <Broken />
    </ErrorBoundary>
  ),
};
