import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Attachment } from './Attachment';

const meta = {
  title: 'Components/Content/Attachment',
  component: Attachment,
  args: { name: 'Invoice March 2026.pdf', bytes: 1_482_000, type: 'application/pdf' },
  argTypes: {
    kind: { control: 'select', options: [undefined, 'pdf', 'image', 'sheet', 'doc', 'slides', 'archive', 'code', 'audio', 'video', 'other'] },
    progress: { control: { type: 'range', min: 0, max: 100 } },
  },
} satisfies Meta<typeof Attachment>;
export default meta;
type Story = StoryObj<typeof meta>;

const Col = ({ children, width }: { children: React.ReactNode; width?: number }) => <div className="flex flex-col items-start gap-2" style={width ? { width } : undefined}>{children}</div>;

export const Playground: Story = { args: { onRemove: () => {} } };

// Each kind's icon and word, picked from the type or the extension.
export const Kinds: Story = {
  render: () => <Col>
    <Attachment name="Contract signed.pdf" bytes={482_000} />
    <Attachment name="Site photo.jpg" bytes={3_400_000} />
    <Attachment name="Q3 budget.xlsx" bytes={88_000} />
    <Attachment name="Meeting notes.docx" bytes={24_000} />
    <Attachment name="Pitch.pptx" bytes={12_600_000} />
    <Attachment name="Assets.zip" bytes={48_000_000} />
    <Attachment name="checkout.tsx" bytes={6_200} />
    <Attachment name="Voice note.m4a" bytes={920_000} />
    <Attachment name="Demo.mp4" bytes={210_000_000} />
    <Attachment name="backup.bin" bytes={512} />
    <Attachment name="scan-0042" type="application/pdf" />
    <Attachment name="Floor plan" kind="image" />
  </Col>,
};

// A linked name opens or downloads the file.
export const Linked: Story = {
  render: () => <Col>
    <Attachment name="Invoice March 2026.pdf" bytes={1_482_000} href="#invoice" />
    <Attachment name="Q3 budget.xlsx" bytes={88_000} href="#budget" download onRemove={() => {}} />
  </Col>,
};

// While uploading, with a known and an unknown progress; then failed, with and without a retry.
export const Upload: Story = {
  render: () => <Col>
    <Attachment name="Site photo.jpg" bytes={3_400_000} progress={45} onRemove={() => {}} />
    <Attachment name="Assets.zip" bytes={48_000_000} progress={null} onRemove={() => {}} />
    <Attachment name="Demo.mp4" bytes={210_000_000} error="Larger than 100 MB" onRemove={() => {}} />
    <Attachment name="Pitch.pptx" bytes={12_600_000} error onRetry={() => {}} onRemove={() => {}} />
  </Col>,
};

export const Disabled: Story = {
  render: () => <Col>
    <Attachment name="Invoice March 2026.pdf" bytes={1_482_000} href="#invoice" disabled onRemove={() => {}} />
    <Attachment name="Pitch.pptx" bytes={12_600_000} error onRetry={() => {}} disabled onRemove={() => {}} />
  </Col>,
};

// Several in a row wrap onto the next line, as in a message or a form.
export const InARow: Story = {
  name: 'In a row',
  render: () => <ul role="list" className="flex flex-wrap gap-2" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
    {['Contract signed.pdf', 'Site photo.jpg', 'Q3 budget.xlsx', 'Notes.docx'].map((n) => <li key={n}><Attachment name={n} bytes={240_000} onRemove={() => {}} /></li>)}
  </ul>,
};

// The stress story (G14): long names keep their extension and last characters; the message wraps.
export const LongText: Story = {
  render: () => <Col width={260}>
    <Attachment name="Donaudampfschifffahrtsgesellschaftskapitänswitwenrentenversicherung-2026.pdf" bytes={1_482_000} onRemove={() => {}} />
    <Attachment name="Laporan keuangan triwulan ketiga PT Sumber Makmur Sejahtera 2026 final revisi.xlsx" bytes={88_000} href="#x" />
    <Attachment name="🎉 Ulang tahun.jpg" bytes={2_000_000} error="The server took too long to answer. Check your connection and try once more." onRetry={() => {}} onRemove={() => {}} />
    <Attachment name="تقرير.pdf" bytes={1_000} />
    <Attachment name="a" />
  </Col>,
};
