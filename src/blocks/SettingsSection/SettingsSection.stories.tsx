import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SkipLink } from '../../components/SkipLink/SkipLink';
import { Heading } from '../../components/Heading/Heading';
import { Field } from '../../components/Field/Field';
import { Input } from '../../components/Input/Input';
import { Select } from '../../components/Select/Select';
import { Switch } from '../../components/Switch/Switch';
import type { ErrorSummaryItem } from '../../components/ErrorSummary/ErrorSummary';
import type { SaveState } from '../../components/SaveStatus/SaveStatus';
import { SettingsSection } from './SettingsSection';

/* Settings section (BL4): one group of settings with its own Save, status and error summary, as a block an app copies.
   SettingsSection.mdx says what each part is for. The stories put two sections on a small settings page (a skip link,
   main and an h1), each saving on its own. */
function profileErrors(name: string, email: string): ErrorSummaryItem[] {
  const out: ErrorSummaryItem[] = [];
  if (!name.trim()) out.push({ field: 'settings-name', message: 'Enter your name' });
  if (!/^\S+@\S+\.\S+$/.test(email.trim())) out.push({ field: 'settings-email', message: 'Enter an email address like name@example.com' });
  return out;
}
const fieldError = (errors: readonly ErrorSummaryItem[], id: string) => errors.find((e) => e.field === id)?.message;

function Settings({ name: name0 = 'Dewi Lestari', email: email0 = 'dewi@example.com', profileStatus = 'idle' as SaveState, failed = false }) {
  const [name, setName] = React.useState(name0);
  const [email, setEmail] = React.useState(email0);
  const [profile, setProfile] = React.useState<{ status: SaveState; errors: ErrorSummaryItem[] }>({ status: profileStatus, errors: failed ? profileErrors(name0, email0) : [] });
  const [digest, setDigest] = React.useState(true);
  const [often, setOften] = React.useState('weekly');
  const [notify, setNotify] = React.useState<SaveState>('idle');
  const later = (done: () => void) => { window.setTimeout(done, 600); };
  return (
    <>
      <SettingsSection
        title="Profile" description="Your name and email, as your team sees them."
        status={profile.status} errors={profile.errors}
        onSave={() => {
          const errors = profileErrors(name, email);
          if (errors.length) { setProfile({ status: 'idle', errors }); return; }
          setProfile({ status: 'saving', errors: [] });
          later(() => setProfile({ status: 'saved', errors: [] }));
        }}
      >
        <Field label="Name" id="settings-name" error={fieldError(profile.errors, 'settings-name')}>
          <Input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
        </Field>
        <Field label="Email" id="settings-email" error={fieldError(profile.errors, 'settings-email')}>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </Field>
      </SettingsSection>
      <SettingsSection
        title="Notifications" description="What we email you about, and how often."
        status={notify}
        onSave={() => { setNotify('saving'); later(() => setNotify('saved')); }}
      >
        <Switch checked={digest} onCheckedChange={setDigest} description="A summary of what changed in your projects.">Email digest</Switch>
        <Field label="How often">
          <Select value={often} onChange={(e) => setOften(e.target.value)} disabled={!digest} options={[{ value: 'daily', label: 'Every day' }, { value: 'weekly', label: 'Every week' }]} />
        </Field>
      </SettingsSection>
    </>
  );
}

const meta = {
  title: 'Blocks/Settings section',
  component: Settings,
  parameters: { layout: 'fullscreen' },
  decorators: [(Story) => <div className="min-h-screen bg-surface text-text"><SkipLink /><main id="main" className="mx-auto flex max-w-5xl flex-col px-4 py-6 outline-none"><Heading level={1}>Settings</Heading><Story /></main></div>],
} satisfies Meta<typeof Settings>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Two sections, each with its own Save. Saving one shows "Saving…", then "Saved", and leaves the other alone. */
export const Default: Story = {};

/** A save that failed: the summary at the top of the section lists both problems, and each field says its own. */
export const WithErrors: Story = { args: { name: '', email: 'dewi@', failed: true } };

/** Just saved: "Saved" beside the button, said once to screen readers. */
export const Saved: Story = { args: { profileStatus: 'saved' } };
