import type { Meta, StoryObj } from '@storybook/react-vite';
import { SettingsForm } from './SettingsForm';

/* Settings form: sections with their own Save, errors and status, and a question before unsaved changes are
   lost. SettingsForm.mdx says why each part is there and what stays the app's job. Saving succeeds here. */
const meta = {
  title: 'Patterns/Settings form',
  component: SettingsForm,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof SettingsForm>;
export default meta;
type Story = StoryObj<typeof meta>;

/** The settings as saved. Change a field and Save that section; or follow "Back to the dashboard" first. */
export const Default: Story = {};

/** A save that fails: "Couldn't save" with Try again, and the changes kept. */
export const SaveFails: Story = { args: { onSave: () => Promise.reject(new Error('offline')) } };

/** While the saved settings load: the page and its sections, with placeholder fields, named once for screen readers. */
export const Loading: Story = { args: { loading: true } };
