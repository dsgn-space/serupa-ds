import type { Meta, StoryObj } from '@storybook/react-vite';
import { DataImport } from './DataImport';

/* Data import: a CSV file of customers, its columns matched, every row checked before anything is saved, then what
   happened. DataImport.mdx says why each part is there and what stays the app's job. Importing succeeds here. */
const SAMPLE = {
  name: 'customers.csv',
  text: [
    'Full name,E-mail,Mobile,Town,Notes',
    'Ani Wijaya,ani@example.com,+62 812 3456 7890,Bandung,Prefers email',
    'Budi Santoso,budi@example.com,+62 813 2222 1111,Jakarta,',
    'Citra Lestari,citra@example,+62 811 0000 1234,Surabaya,"Moved, new address soon"',
    'Dewi Anggraini,dewi@example.com,,Yogyakarta,',
    ',eko@example.com,+62 815 9999 8888,Medan,No name given',
    'Fajar Nugroho,fajar@example.com,+62 817 1234 5678,Denpasar,',
  ].join('\n'),
};

const meta = {
  title: 'Patterns/Data import',
  component: DataImport,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof DataImport>;
export default meta;
type Story = StoryObj<typeof meta>;

/** The first step: choose a CSV file. */
export const Default: Story = {};

/** A file chosen: each detail matched to a column, the ones whose headings name it matched already. */
export const MatchColumns: Story = { args: { start: 'match', file: SAMPLE } };

/** Every row checked before anything is saved: the rows with problems first, each with its problem in words. */
export const CheckRows: Story = { args: { start: 'check', file: SAMPLE } };

/** An import that fails: "Couldn't import", nothing saved, and Try again. */
export const ImportFails: Story = { args: { start: 'check', file: SAMPLE, onImport: () => Promise.reject(new Error('offline')) } };
