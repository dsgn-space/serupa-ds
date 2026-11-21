import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SerupaProvider } from './provider';
import { DEFAULT_LABELS, idLabels } from './labels';
import { localeDir } from './locale';
import * as ar from '../labels/ar';
import * as pseudoPack from '../labels/pseudo';
import { Button } from '../components/Button/Button';
import { Field } from '../components/Field/Field';
import { FileUpload } from '../components/FileUpload/FileUpload';
import { SegmentedControl } from '../components/SegmentedControl/SegmentedControl';
import { Alert } from '../components/Alert/Alert';
import { DatePicker } from '../components/DatePicker/DatePicker';
import { Pagination } from '../components/Pagination/Pagination';
import { SearchInput } from '../components/SearchInput/SearchInput';
import { TimePicker } from '../components/TimePicker/TimePicker';

const meta = {
  title: 'Guides/SerupaProvider',
  component: SerupaProvider,
} satisfies Meta<typeof SerupaProvider>;
export default meta;
type Story = StoryObj<typeof meta>;

const Sample = ({ say = (t: string) => t }: { say?: (text: string) => string }) => (
  <div className="flex flex-col gap-4 max-w-md">
    <Alert title={say('Saved')} onDismiss={() => {}} />
    <div className="flex flex-wrap gap-2">
      <DatePicker aria-label={say('Date')} defaultValue={new Date(2026, 2, 5)} />
      <TimePicker aria-label={say('Time')} defaultValue="14:30" />
    </div>
    <SearchInput aria-label={say('Search')} defaultValue="report" />
    <Pagination count={5} defaultPage={2} />
  </div>
);

/** Without a provider: the browser's locale and the English words. */
export const Default: Story = { render: () => <Sample /> };

/** Indonesian: dates, times and every built-in word. */
export const Indonesian: Story = { render: () => <SerupaProvider locale="id-ID" labels={idLabels}><Sample /></SerupaProvider> };

/** A nested provider changes only what it sets: here German dates inside the Indonesian words. */
export const Nested: Story = {
  render: () => (
    <SerupaProvider locale="id-ID" labels={idLabels}>
      <SerupaProvider locale="de-DE"><Sample /></SerupaProvider>
    </SerupaProvider>
  ),
};

const en = { locale: 'en-US', labels: DEFAULT_LABELS }, id = { locale: 'id-ID', labels: idLabels };
/** One locale switches the words, the dates and numbers, and the direction: the provider picks the words from
 *  `languages` by `locale`, and `localeDir(locale)` gives the `dir` to set beside `lang`. */
export const OneLocale: Story = {
  render: function Render() {
    const [locale, setLocale] = React.useState('id-ID');
    return (
      <div className="flex flex-col gap-4">
        <SegmentedControl aria-label="Locale" value={locale} onValueChange={setLocale}
          options={[{ value: 'en-US', label: 'English' }, { value: 'id-ID', label: 'Bahasa Indonesia' }, { value: 'ar-EG', label: 'العربية' }]} />
        <div lang={locale} dir={localeDir(locale)}>
          <SerupaProvider locale={locale} languages={[en, id, ar]}><Sample /></SerupaProvider>
        </div>
      </div>
    );
  },
};

/** The pseudo-locale (serupa-ds/labels/pseudo): every built-in word accented, about 40% longer and between ⟦ ⟧, with
 *  the story's own words through pseudo() too. Text that overflows, clips or loses its ⟧ shows a layout that won't
 *  hold a longer language; a word still plain English was written into the code. */
export const PseudoLocale: Story = {
  render: () => (
    <SerupaProvider locale={pseudoPack.locale} labels={pseudoPack.labels}>
      <div className="flex flex-col gap-4 max-w-md">
        <Sample say={pseudoPack.pseudo} />
        <Field label={pseudoPack.pseudo('Attachments')}><FileUpload multiple /></Field>
        <div className="flex flex-wrap gap-2">
          <Button>{pseudoPack.pseudo('Save changes')}</Button>
          <Button variant="outline" loading>{pseudoPack.pseudo('Send invite')}</Button>
        </div>
      </div>
    </SerupaProvider>
  ),
};
