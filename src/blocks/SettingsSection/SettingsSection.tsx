"use client";
import * as React from 'react';
import { Button } from '../../components/Button/Button';
import { ErrorSummary, type ErrorSummaryItem } from '../../components/ErrorSummary/ErrorSummary';
import { Heading } from '../../components/Heading/Heading';
import { SaveStatus, type SaveState } from '../../components/SaveStatus/SaveStatus';

/* Settings section (BL4): one group of settings with its own heading, its own Save and its own status, built from the
   components only, for an app to copy. A settings page stacks several. What it carries (WCAG 2.2):
   - 1.3.1: a section named by its heading, so a screen reader lists it and can jump to it; the description says what
     the group is for.
   - 3.3.1 / 3.3.3: a failed save shows an ErrorSummary at the top of this section's form, which takes focus, with a
     link to each field; each field also says its own error (the app passes it to the Field).
   - 4.1.3: SaveStatus says "Saved" politely once a save finishes, and "Couldn't save" with Try again if it fails, so
     the person doesn't have to look for a change.
   - 3.2.2: nothing saves on its own: changes wait for this section's Save, so other sections are left alone.
   - 1.4.10 reflow: the heading sits beside the fields on a wide screen and above them on a phone. */

export interface SettingsSectionProps {
  /** The section's heading: "Notifications". */
  title: string;
  /** What the settings are for, in a sentence, under the heading. */
  description?: React.ReactNode;
  /** The heading level, to fit the page's outline. Default: 2. The error summary's heading is one below it. */
  headingLevel?: 2 | 3 | 4 | undefined;
  /** Called by Save (the form's submit): check the fields, then save. */
  onSave: () => void;
  /** The problems from the last Save, in the order of the fields. With any, the summary shows and takes focus. */
  errors?: readonly ErrorSummaryItem[] | undefined;
  /** Where saving is: 'idle', 'saving', 'saved' or 'error'. Default: 'idle'. */
  status?: SaveState | undefined;
  /** When the last save finished, for "Saved 2 minutes ago". */
  savedAt?: Date | number | undefined;
  /** Shown with a failed save as Try again. */
  onRetry?: (() => void) | undefined;
  /** The save button's text, in the page's language. Default: "Save". */
  saveLabel?: string | undefined;
  /** The fields: Field with Input or Select, Switch, and so on. */
  children: React.ReactNode;
}

/** One group of settings with its own heading, its own Save, its own status and its own error summary. */
export function SettingsSection({ title, description, headingLevel = 2, onSave, errors = [], status = 'idle', savedAt, onRetry, saveLabel = 'Save', children }: SettingsSectionProps) {
  const id = React.useId();
  return (
    <section aria-labelledby={id} className="grid grid-cols-1 gap-4 border-b border-border py-6 md:grid-cols-3 md:gap-8">
      <div className="flex flex-col gap-1">
        <Heading level={headingLevel} size="lg" id={id}>{title}</Heading>
        {description ? <p className="m-0 text-sm text-text-muted">{description}</p> : null}
      </div>
      <form noValidate onSubmit={(e) => { e.preventDefault(); onSave(); }} className="flex min-w-0 flex-col gap-4 md:col-span-2">
        {errors.length ? <ErrorSummary errors={errors} headingLevel={(headingLevel + 1) as 3 | 4 | 5} /> : null}
        {children}
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" loading={status === 'saving'}>{saveLabel}</Button>
          <SaveStatus status={status} savedAt={savedAt} onRetry={onRetry} />
        </div>
      </form>
    </section>
  );
}
