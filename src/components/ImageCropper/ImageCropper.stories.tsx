import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ImageCropper, cropImage, type CropArea } from './ImageCropper';
import { Field } from '../Field/Field';
import { Button } from '../Button/Button';

// Local pictures, so the stories load nothing from other servers. A person against a hillside, off centre, so the
// crop has something to find; a strip far wider than tall for the stress story.
const PHOTO = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600" viewBox="0 0 900 600"><defs><linearGradient id="s" x2="0" y2="1"><stop offset="0" stop-color="#bae6fd"/><stop offset="1" stop-color="#fde68a"/></linearGradient></defs><rect width="900" height="600" fill="url(#s)"/><path d="M0 420 Q220 320 450 400 T900 380 V600 H0z" fill="#65a30d"/><path d="M0 500 Q300 430 600 500 T900 480 V600 H0z" fill="#3f6212"/><circle cx="600" cy="230" r="80" fill="#f5d0a9"/><path d="M600 140 q-95 0-92 95 q30-50 92-50 t92 50 q3-95-92-95z" fill="#78350f"/><path d="M470 600 q0-190 130-190 t130 190z" fill="#be123c"/></svg>');
const STRIP = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="2400" height="300" viewBox="0 0 2400 300"><defs><linearGradient id="s" x2="1"><stop offset="0" stop-color="#1e3a8a"/><stop offset="1" stop-color="#f59e0b"/></linearGradient></defs><rect width="2400" height="300" fill="url(#s)"/><path d="M0 220 L300 120 L600 210 L900 90 L1200 200 L1500 110 L1800 220 L2100 100 L2400 200 V300 H0z" fill="#0f172a"/></svg>');

const meta = {
  title: 'Components/Forms/ImageCropper',
  component: ImageCropper,
  args: { src: PHOTO, shape: 'circle', 'aria-label': 'Profile photo' },
  // '' (the same as 'anonymous') would be a radio with no name in the controls.
  argTypes: { crossOrigin: { control: 'inline-radio', options: ['anonymous', 'use-credentials'] } },
} satisfies Meta<typeof ImageCropper>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
// A cover picture: wide, square-cornered, zoomed in a little to start.
export const Cover: Story = { args: { shape: 'rect', aspect: 16 / 9, defaultZoom: 1.25, 'aria-label': 'Cover picture' } };
// A portrait crop of a landscape picture: the frame is the full height, and the picture moves sideways.
export const Portrait: Story = { args: { shape: 'rect', aspect: 3 / 4, 'aria-label': 'Card picture' } };
export const Zoomed: Story = { args: { defaultZoom: 2.5 } };
export const Disabled: Story = { args: { disabled: true } };
export const Failed: Story = { args: { src: 'data:image/png;base64,broken' } };

// In a Field, with the cropped picture made on Save (cropImage) and shown beside it. Save is always on: the crop
// arrives as the picture loads, and a button turning on just after mount would flash.
function ProfilePhotoDemo(args: React.ComponentProps<typeof ImageCropper>) {
  const [area, setArea] = React.useState<CropArea | null>(null);
  const [out, setOut] = React.useState<string | null>(null);
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'flex-start' }}>
      <Field label="Profile photo" hint="Shown round, beside your name." style={{ inlineSize: 320 }}>
        <ImageCropper {...args} aria-label={undefined} onCropChange={setArea} />
      </Field>
      <div style={{ display: 'grid', gap: 8, justifyItems: 'start' }}>
        <Button size="sm" onClick={async () => { if (!area) return; const b = await cropImage(args.src, area, { width: 160 }); if (b) setOut(URL.createObjectURL(b)); }}>Save</Button>
        {out ? <img src={out} alt="Your new avatar, cropped" width={80} height={80} style={{ borderRadius: '50%' }} /> : null}
      </div>
    </div>
  );
}
export const ProfilePhoto: Story = { render: (args) => <ProfilePhotoDemo {...args} /> };

// The stress story (G14): a strip twelve times wider than tall, in a narrow column; the frame stays square and the
// picture still covers it, and the zoom row fits.
export const StressNarrowStrip: Story = { args: { src: STRIP, shape: 'rect', 'aria-label': 'Banner' }, render: (args) => <div style={{ inlineSize: 180 }}><ImageCropper {...args} /></div> };
