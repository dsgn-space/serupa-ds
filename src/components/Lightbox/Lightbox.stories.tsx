import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Image } from '../Image/Image';
import { Lightbox, type LightboxItem } from './Lightbox';

// Local pictures, so stories load nothing from other servers.
const svg = (w: number, h: number, body: string) => 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`);
const DUSK = svg(800, 500, '<defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1e3a8a"/><stop offset="1" stop-color="#f59e0b"/></linearGradient></defs><rect width="800" height="500" fill="url(#s)"/><circle cx="560" cy="300" r="60" fill="#fde68a"/><path d="M0 380 Q200 300 400 370 T800 340 V500 H0Z" fill="#14532d"/>');
const SEA = svg(800, 500, '<rect width="800" height="500" fill="#bae6fd"/><rect y="280" width="800" height="220" fill="#0369a1"/><circle cx="200" cy="140" r="50" fill="#fef9c3"/>');
const TOWER = svg(400, 600, '<rect width="400" height="600" fill="#e0e7ff"/><rect x="150" y="120" width="100" height="480" fill="#4338ca"/><rect x="175" y="60" width="50" height="60" fill="#6366f1"/>');
const FIELD = svg(800, 800, '<rect width="800" height="800" fill="#fef3c7"/><rect y="500" width="800" height="300" fill="#65a30d"/>');

const photos: LightboxItem[] = [
  { src: DUSK, alt: 'A hillside at dusk', caption: 'Bromo, before sunrise', width: 800, height: 500 },
  { src: SEA, alt: 'The sea under a pale sky', caption: 'Lombok', width: 800, height: 500 },
  { src: TOWER, alt: 'A tall blue tower', width: 400, height: 600 },
  { src: FIELD, alt: 'A green field under a yellow sky', caption: 'Rice fields near Ubud', width: 800, height: 800 },
];

const meta = {
  title: 'Components/Content/Lightbox',
  component: Lightbox,
  args: { items: photos, defaultOpen: true },
  argTypes: { items: { control: false } },
} satisfies Meta<typeof Lightbox>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
/** Open on the second of four, with a caption; the arrows and "2 of 4" sit under it. */
export const Default: Story = { args: { defaultIndex: 1 } };

// A grid of thumbnails, each opening the Lightbox at its own picture.
function Gallery(args: React.ComponentProps<typeof Lightbox>) {
  const [open, setOpen] = React.useState(false);
  const [index, setIndex] = React.useState(0);
  return (
    <>
      <ul role="list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8, listStyle: 'none', margin: 0, padding: 0, maxWidth: 560 }}>
        {photos.map((p, i) => (
          <li key={p.src}>
            <button type="button" aria-haspopup="dialog" onClick={() => { setIndex(i); setOpen(true); }} style={{ all: 'unset', display: 'block', cursor: 'zoom-in', borderRadius: 8 }}>
              <Image src={p.src} alt={p.alt} ratio="square" />
            </button>
          </li>
        ))}
      </ul>
      <Lightbox {...args} defaultOpen={undefined} open={open} onOpenChange={setOpen} index={index} onIndexChange={setIndex} />
    </>
  );
}
/** A gallery: each thumbnail opens the Lightbox at its picture, and closing it puts focus back on that thumbnail. */
export const FromAGallery: Story = { name: 'From a gallery', args: { defaultOpen: false }, render: (args) => <Gallery {...args} /> };
/** loop: after the last picture comes the first, so neither arrow is ever off. */
export const Loop: Story = { args: { loop: true, defaultIndex: 3 } };
/** One picture: no arrows and no count, only the picture and its caption. */
export const Single: Story = { args: { items: [photos[0]] } };
/** A tall picture: the stage keeps its shape within the screen's height. */
export const Tall: Story = { args: { defaultIndex: 2 } };
/** A picture that fails to load: a broken-image icon on the stage, and the arrows still move on. */
export const Failed: Story = { args: { items: [{ src: 'data:image/png;base64,broken', alt: 'A receipt from March', caption: 'Couldn’t load this picture.' }, ...photos] } };
// The stress story (G14): long words, long labels, more items than fit; the visual baselines show how it copes.
export const LongText: Story = {
  args: { items: [{ ...photos[0], alt: 'Donaudampfschifffahrtsgesellschaftskapitänswitwenrentenversicherung and a title long enough to wrap twice', caption: 'A caption long enough to wrap onto a second and a third line in a narrow dialog, with Donaudampfschifffahrtsgesellschaftskapitän in it' }, ...photos] },
};
/** Do: open it from the picture people pressed, and name each picture in its alt text: it's the dialog's title. */
export const DoName: Story = { name: 'Do: name each picture', args: { defaultIndex: 0 } };
/** Don't: title pictures with their file names. The alt text is the dialog's title and what a screen reader says on each move. */
export const DontFileNames: Story = { name: "Don't: name pictures by file", args: { items: photos.map((p, i) => ({ ...p, alt: ['IMG_final.jpg', 'IMG_final_copy.jpg', 'IMG_edit.jpg', 'IMG_edit_copy.jpg'][i] ?? 'IMG.jpg' })) } };
