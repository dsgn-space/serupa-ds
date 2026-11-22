/// <reference types="vite/client" />
import * as React from 'react';
import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';

/* States everywhere: a pattern shows more than its happy path. A screen that loads data shows it loading, failing to
   load, empty and offline, and partly loaded where its parts load on their own; a screen that sends something shows
   the send failing and being offline. Each of those is a story, so it has its pictures in every theme and its axe
   pass, and an app that copies the pattern copies every state. A state that can't happen on a screen is in NOT_HERE
   with why; a story that shows a state under another name (NoOrders for Empty) is in SAME_AS. */

type Args = Record<string, unknown>;
type Story = { args?: Args; render?: unknown };
type Meta = { component?: React.ComponentType<Args>; args?: Args };
const files = import.meta.glob<Record<string, Meta | Story>>('../patterns/*/*.stories.tsx', { eager: true });
const patterns = Object.entries(files).map(([path, mod]) => ({ name: path.split('/')[2]!, mod }));

type State = 'Loading' | 'LoadFailed' | 'Empty' | 'Partial' | 'Offline' | 'SendFails';
// Screens that load what they show; every other pattern sends something, or is a page that only reads.
const LOADS = new Set(['AccountSecurity', 'ActivityLog', 'AddressBook', 'Agenda', 'ApiKeys', 'Appointment', 'Approvals',
  'Billing', 'Booking', 'CourseOverview', 'Dashboard', 'DataExport', 'DetailPage', 'ExpenseReport', 'FileBrowser',
  'HelpCenter', 'Integrations', 'Invoice', 'Leaderboard', 'LeaveRequest', 'ListDetail', 'ListSearch', 'Messages',
  'Notifications', 'Onboarding', 'OrderHistory', 'OrderStatus', 'ProductCompare', 'ProductPage', 'Profile', 'Quiz',
  'Reviews', 'RolePermissions', 'SavedItems', 'SettingsForm', 'StatusPage', 'StockCount', 'StoreLocator', 'TaskBoard', 'TeamCalendar',
  'TeamMembers', 'Timesheet', 'Transactions', 'WhatsNew']);
const required = (name: string): State[] => (LOADS.has(name) ? ['Loading', 'LoadFailed', 'Empty', 'Partial', 'Offline'] : ['SendFails', 'Offline']);

// A state shown by a story of another name.
const SAME_AS: Record<string, Partial<Record<State, string>>> = {
  AcceptInvite: { SendFails: 'JoinFails' },
  Approvals: { Empty: 'CaughtUp' },
  Checkout: { SendFails: 'OrderFails' },
  CourseOverview: { Empty: 'NotStarted' },
  Dashboard: { Empty: 'FirstRun' },
  DataExport: { Empty: 'FirstTime', },
  DataImport: { SendFails: 'ImportFails' },
  Donation: { SendFails: 'GiveFails' },
  EmailPreferences: { SendFails: 'SaveFails' },
  EventRegistration: { SendFails: 'RegisterFails' },
  GiftCard: { SendFails: 'AddFails' },
  LeaveRequest: { Empty: 'NoRequests' },
  ListSearch: { Empty: 'NoProjects' },
  OrderHistory: { Empty: 'NoOrders' },
  PasswordReset: { SendFails: 'RequestFails' },
  PermissionRequest: { SendFails: 'Denied' },
  Poll: { SendFails: 'VoteFails' },
  Reviews: { Empty: 'NoReviews' },
  SessionTimeout: { SendFails: 'ExtendFails' },
  ShareDialog: { SendFails: 'ShareFails' },
  SignAgreement: { SendFails: 'SignFails' },
  SignIn: { SendFails: 'WrongPassword' },
  SignUp: { SendFails: 'SubmitFails' },
  StoreLocator: { Empty: 'NoLocation' },
  SupportTicket: { SendFails: 'ReplyFails' },
  TeamMembers: { Empty: 'JustYou' },
  WhatsNew: { Empty: 'AllSeen' },
};

// A state the screen can't be in, with why.
const NOT_HERE: Record<string, Partial<Record<State, string>>> = {
  Article: { SendFails: 'it only reads', Offline: 'a page that only reads works the same once loaded' },
  ConsentBanner: { SendFails: 'the answer is kept on the device', Offline: 'the answer is kept on the device' },
  ErrorPages: { SendFails: 'it only reads' },
  Landing: { SendFails: 'it only links', Offline: 'a page that only links works the same once loaded' },
  PageShell: { SendFails: 'a layout, with no data of its own', Offline: 'a layout: the page in it says it' },
  PriceEstimate: { SendFails: 'it works out the price on the device' },
  Recipe: { SendFails: 'it only reads', Offline: 'a page that only reads works the same once loaded' },
  AccountSecurity: { Empty: 'an account always has a password and this device', Partial: 'one request' },
  ActivityLog: { Partial: 'one request, then pages of it' },
  AddressBook: { Partial: 'one request' },
  Agenda: { Partial: 'one request' },
  ApiKeys: { Partial: 'one request' },
  Appointment: { Partial: 'one request' },
  Approvals: { Partial: 'one request' },
  Billing: { Empty: 'a workspace always has a plan; no card and no invoices are NoPaymentMethod and the first month' },
  Booking: { Empty: 'a place with no free nights isn’t listed for booking', Partial: 'one request' },
  CourseOverview: { Partial: 'one request' },
  DataExport: { Partial: 'one request' },
  DetailPage: { Empty: 'a project always has its overview; no tasks is its Tasks tab' },
  ExpenseReport: { Partial: 'one request' },
  FileBrowser: { Partial: 'one request per folder' },
  HelpCenter: { Empty: 'the topics come with the app', Partial: 'one request' },
  Integrations: { Empty: 'the list of apps comes with the app', Partial: 'one request' },
  Invoice: { Empty: 'an invoice always has its lines', Partial: 'one request' },
  Leaderboard: { Partial: 'one request' },
  LeaveRequest: { Partial: 'one request' },
  ListDetail: { Partial: 'one request' },
  ListSearch: { Partial: 'one request' },
  Messages: { Partial: 'one request' },
  Notifications: { Partial: 'one request' },
  Onboarding: { Empty: 'the steps come with the app', Partial: 'one request' },
  OrderHistory: { Partial: 'one request' },
  OrderStatus: { Empty: 'an order always has its items', Partial: 'one request' },
  ProductCompare: { Partial: 'one request' },
  ProductPage: { Empty: 'a product always has its details; sold out is SoldOut', Partial: 'one request' },
  Profile: { Partial: 'one request' },
  Quiz: { Empty: 'a quiz always has its questions', Partial: 'one request' },
  Reviews: { Partial: 'one request' },
  RolePermissions: { Empty: 'there are always the built-in roles', Partial: 'one request' },
  SavedItems: { Partial: 'one request' },
  SettingsForm: { Empty: 'an account always has its settings', Partial: 'one request' },
  StatusPage: { Empty: 'every service always has a status', Partial: 'one request' },
  StoreLocator: { Partial: 'one request' },
  TaskBoard: { Partial: 'one request' },
  TeamCalendar: { Partial: 'one request' },
  Timesheet: { Partial: 'one request' },
  Transactions: { Partial: 'one request' },
  WhatsNew: { Partial: 'one request' },
};

describe('Patterns: states everywhere', () => {
  test.each(patterns)('$name has a story for each state it can be in', ({ name, mod }) => {
    const missing = required(name).filter((s) => !NOT_HERE[name]?.[s] && !((SAME_AS[name]?.[s] ?? s) in mod));
    expect(missing, `${name}: add a story for each, or say in NOT_HERE why the screen can't be in it`).toEqual([]);
  });

  test('every exception is still needed', () => {
    const names = new Set(patterns.map((p) => p.name));
    for (const name of Object.keys({ ...SAME_AS, ...NOT_HERE })) expect(names.has(name), name).toBe(true);
    for (const [name, states] of Object.entries(SAME_AS)) {
      const mod = patterns.find((p) => p.name === name)!.mod;
      for (const [state, story] of Object.entries(states)) {
        expect(story in mod, `${name}/${story} is gone: show ${state} again, or drop it from SAME_AS`).toBe(true);
        expect(state in mod, `${name} has ${state} now: drop it from SAME_AS`).toBe(false);
      }
    }
    for (const [name, states] of Object.entries(NOT_HERE)) {
      const mod = patterns.find((p) => p.name === name)!.mod;
      for (const state of Object.keys(states)) expect(state in mod, `${name} has ${state} now: drop it from NOT_HERE`).toBe(false);
    }
  });

  // Offline, the page keeps what it loaded and says so once, first in main, with what still works after it; online
  // it says nothing.
  const offline = patterns.filter((p) => 'Offline' in p.mod && p.name !== 'ErrorPages');
  test.each(offline)('$name says it is offline, first in main', async ({ mod }) => {
    const meta = mod.default as Meta, story = mod.Offline as Story;
    const Component = meta.component!;
    const screen = await render(<Component {...meta.args} {...story.args} />);
    const main = screen.container.querySelector('main')!;
    const bar = main.querySelector('[data-component="offline-banner"]');
    expect(bar?.textContent).toMatch(/^You’re offline .+\.$/);
    // First in main: main's first child, or the first child of the layout wrapper (Center, Stack) main holds.
    let first = main.firstElementChild;
    while (first && first !== bar && first.matches('[data-component="center"], [data-component="stack"], [data-component="container"]')) first = first.firstElementChild;
    expect(first).toBe(bar);
  });
  test.each(offline)('$name says nothing about the connection online', async ({ mod }) => {
    const meta = mod.default as Meta;
    const Component = meta.component!;
    const screen = await render(<Component {...meta.args} />);
    expect(screen.container.querySelector('main')).not.toBeNull();
    expect(screen.container.querySelector('[data-component="offline-banner"]')).toBeNull();
  });
});
