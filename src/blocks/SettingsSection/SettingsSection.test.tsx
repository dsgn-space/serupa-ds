import * as React from 'react';
import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { Field } from '../../components/Field/Field';
import { Input } from '../../components/Input/Input';
import { Switch } from '../../components/Switch/Switch';
import type { ErrorSummaryItem } from '../../components/ErrorSummary/ErrorSummary';
import type { SaveState } from '../../components/SaveStatus/SaveStatus';
import { SettingsSection } from './SettingsSection';

// Two sections as an app uses them: Profile checks its name before saving; Notifications always saves. Saves finish
// when the test says so, so the "Saving…" state can be seen.
let finish: () => void = () => {};
function Settings({ saveLabel }: { saveLabel?: string }) {
  const [name, setName] = React.useState('');
  const [profile, setProfile] = React.useState<{ status: SaveState; errors: ErrorSummaryItem[] }>({ status: 'idle', errors: [] });
  const [digest, setDigest] = React.useState(true);
  const [notify, setNotify] = React.useState<SaveState>('idle');
  return (
    <main>
      <h1>Settings</h1>
      <SettingsSection title="Profile" description="Your name, as your team sees it." status={profile.status} errors={profile.errors} saveLabel={saveLabel}
        onSave={() => {
          if (!name.trim()) { setProfile({ status: 'idle', errors: [{ field: 'name', message: 'Enter your name' }] }); return; }
          setProfile({ status: 'saving', errors: [] });
          finish = () => setProfile({ status: 'saved', errors: [] });
        }}>
        <Field label="Name" id="name" error={profile.errors.length ? 'Enter your name' : undefined}>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
      </SettingsSection>
      <SettingsSection title="Notifications" status={notify} onSave={() => setNotify('saved')}>
        <Switch checked={digest} onCheckedChange={setDigest}>Email digest</Switch>
      </SettingsSection>
    </main>
  );
}
const section = (name: string) => page.getByRole('region', { name });

// Settings section (BL4): each section is named by its heading and saves on its own, a failed save is summarized and
// focused, and the result is said.
describe('Blocks/Settings section', () => {
  test('each section is a region named by its heading, with the description under it', async () => {
    await render(<Settings />);
    await expect.element(section('Profile')).toBeVisible();
    await expect.element(section('Notifications')).toBeVisible();
    expect([...document.querySelectorAll('section > div > h2')].map((h) => h.textContent)).toEqual(['Profile', 'Notifications']);
    expect(section('Profile').element().textContent).toContain('Your name, as your team sees it.');
  });

  test('a failed save shows the summary, which takes focus and links to the field, and the field says its error', async () => {
    await render(<Settings />);
    await userEvent.click(section('Profile').getByRole('button', { name: 'Save' }));
    const summary = section('Profile').getByRole('heading', { level: 3 });
    await expect.element(summary).toBeVisible();
    await expect.poll(() => section('Profile').element().contains(document.activeElement) && document.activeElement !== document.body).toBe(true);
    await userEvent.click(section('Profile').getByRole('link', { name: 'Enter your name' }));
    expect(document.activeElement).toBe(page.getByRole('textbox', { name: 'Name' }).element());
    expect(document.activeElement!.getAttribute('aria-invalid')).toBe('true');
  });

  test('a good save shows Saving on its own button, then Saved, and leaves the other section alone', async () => {
    await render(<Settings />);
    await userEvent.type(page.getByRole('textbox', { name: 'Name' }), 'Dewi');
    await userEvent.click(section('Profile').getByRole('button', { name: 'Save' }));
    await expect.poll(() => section('Profile').getByRole('button', { name: 'Save' }).element().getAttribute('aria-busy')).toBe('true');
    expect(section('Notifications').getByRole('button', { name: 'Save' }).element().getAttribute('aria-busy')).toBeNull();
    finish();
    await expect.poll(() => section('Profile').element().textContent).toContain('Saved');
    expect(section('Notifications').element().textContent).not.toContain('Saved');
  });

  test('the save button takes its words in the page language', async () => {
    await render(<Settings saveLabel="Speichern" />);
    await expect.element(section('Profile').getByRole('button', { name: 'Speichern' })).toBeVisible();
  });

  test('on a phone the heading sits above the fields, and the page does not scroll sideways', async () => {
    await page.viewport(360, 720);
    await render(<Settings />);
    const heading = section('Profile').getByRole('heading', { name: 'Profile' }).element().getBoundingClientRect();
    const field = page.getByRole('textbox', { name: 'Name' }).element().getBoundingClientRect();
    expect(field.top).toBeGreaterThan(heading.bottom);
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(360);
  });

  test('on a wide screen the heading sits beside the fields', async () => {
    await page.viewport(1024, 768);
    await render(<Settings />);
    const heading = section('Profile').getByRole('heading', { name: 'Profile' }).element().getBoundingClientRect();
    const field = page.getByRole('textbox', { name: 'Name' }).element().getBoundingClientRect();
    expect(field.left).toBeGreaterThan(heading.right);
  });
});
