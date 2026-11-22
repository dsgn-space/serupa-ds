import type { Meta, StoryObj } from '@storybook/react-vite';
import { StatusPage, serviceDays } from './StatusPage';

/* Status page: the state now, each service's 90 days, incidents and their updates, and email updates.
   StatusPage.mdx says why each part is there and what stays the app's job. */
const meta = {
  title: 'Patterns/Status page',
  component: StatusPage,
  parameters: { layout: 'fullscreen' },
  args: { onSubscribe: () => new Promise((ok) => setTimeout(ok, 600)) },
} satisfies Meta<typeof StatusPage>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Webhooks are running late; one incident open. */
export const Default: Story = {};

/** Everything working, no incidents. */
export const AllWorking: Story = {
  args: {
    incidents: [],
    services: [
      { id: 'api', name: 'API', state: 'up', days: serviceDays('2026-03-12', 90) },
      { id: 'dashboard', name: 'Dashboard', state: 'up', days: serviceDays('2026-03-12', 90) },
    ],
  },
};

/** The API is down. */
export const Outage: Story = {
  args: {
    services: [
      { id: 'api', name: 'API', state: 'down', days: serviceDays('2026-03-12', 90, { 0: { state: 'down', note: 'Outage, ongoing' } }) },
      { id: 'dashboard', name: 'Dashboard', state: 'degraded', days: serviceDays('2026-03-12', 90, { 0: { state: 'degraded', note: 'Can’t load data' } }) },
    ],
    incidents: [{ id: 'x', title: 'API not responding', services: ['api', 'dashboard'], resolved: false, updates: [{ at: '2026-03-12T11:02', status: 'Investigating', text: 'The API returns errors for every request. We’re on it.' }] }],
  },
};

/** While the services load: one placeholder. */
export const Loading: Story = { args: { loading: true } };

/** Couldn't load: it says so, with Try again. */
export const LoadFailed: Story = { args: { loadFailed: true } };

/** Offline: the page as it was loaded, with “You’re offline” at the top and what still works. */
export const Offline: Story = { args: { online: false } };
