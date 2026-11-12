# Lightbox

A set of pictures shown full size, one at a time, over the page. People move through them with the arrows, the arrow keys or a swipe, and see where they are ("2 of 5"), so a gallery, a product's photos or the screenshots in a report can be looked at closely without leaving the page.

**Also called:** image viewer, media viewer, photo gallery viewer, slideshow.

```tsx
import { Image, Lightbox } from "serupa-ds";

const photos = [
  { src: "/photos/bromo.jpg", alt: "A hillside at dusk", caption: "Bromo, before sunrise", width: 1600, height: 1000 },
  { src: "/photos/lombok.jpg", alt: "The sea under a pale sky", width: 1600, height: 1000 },
];
const [open, setOpen] = React.useState(false);
const [index, setIndex] = React.useState(0);

{photos.map((p, i) => (
  <button key={p.src} type="button" aria-haspopup="dialog" onClick={() => { setIndex(i); setOpen(true); }}>
    <Image src={p.src} alt={p.alt} ratio="square" />
  </button>
))}
<Lightbox items={photos} open={open} onOpenChange={setOpen} index={index} onIndexChange={setIndex} />
```

## When to use

- A gallery or a set of photos people open to see each one large and move on to the next.
- A product's pictures, or the screenshots attached to a report or a ticket.

## When not to use

- One picture on its own: give the [Image](../Image/README.md) `viewable`, which opens it full size by itself.
- Pictures people should see together on the page, side by side, with no need to enlarge them: a [Carousel](../Carousel/README.md) or a grid of Images.
- Files that aren't pictures, such as PDFs: list them as [Attachment](../Attachment/README.md)s, each opening in its own viewer.

## Anatomy

Drawn from the `Default` story.

1. **Stage** (`.dk-lightbox__stage`): the picture, as large as the screen lets it be, with its own shape.
2. **Caption** (`.dk-lightbox__caption`): the picture's `caption`, under it.
3. **Arrows** (`.dk-lightbox__nav`): the previous and next buttons, with "2 of 4" between them.

## Usage

- Open it from the thumbnail people pressed, at that picture's `index`. Closing it puts focus back on the thumbnail.
- Write each picture's `alt` as you would for an [Image](../Image/README.md): it's the dialog's title while that picture shows, and what a screen reader says on each move. A file name ("IMG_2041.jpg") tells nobody anything.
- Pass `width` and `height` when you know them: the stage takes the picture's shape before it arrives, so nothing jumps.
- Pass the large version as `src`, and a small one to the thumbnails. The pictures on either side load ahead, so moving on is quick.
- `loop` suits a slideshow people go round; without it, the arrows stop at the ends, which says when the set is done.

## Behavior

- It's a [Dialog](../Dialog/README.md) (size lg): Escape, the × or a click on the backdrop close it, and focus comes back to where it was.
- A picture that fails to load shows a broken-image icon on its stage; the arrows still move on.
- A sideways swipe with a finger or a pen moves to the next or previous picture. A mouse drag doesn't, so the page can still be selected as usual.
- With one picture there are no arrows and no count.

## Accessibility

- **Role and name:** a modal dialog titled with the shown picture's `alt`, and described by "2 of 5". The picture itself has empty alt text, so it isn't read twice.
- **Keyboard:** see below. Focus starts on the × and stays in the dialog.
- **Moves are said:** each move says the new picture's alt text and where it is ("The sea under a pale sky, 2 of 4").
- **Contrast:** the caption and the count read 4.5:1 on the dialog in all six themes (`Lightbox.test.tsx`).
- **What's still yours:** alt text that says what each picture shows, and the button that opens it.

### Keyboard

| Key | Does |
| --- | --- |
| Right arrow, Left arrow | The next or previous picture (the other way round in right-to-left text) |
| Home, End | The first or last picture |
| Escape | Closes it, and focus goes back to the button that opened it |

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `items` | `LightboxItem[]` | | `{ src, alt, caption?, width?, height? }`: the pictures, in order. |
| `open` | `boolean` | | Whether it's open (controlled). |
| `defaultOpen` | `boolean` | `false` | Whether it's open at first. |
| `onOpenChange` | `(open: boolean, details) => void` | | Asked to open or close: Escape, the × or the backdrop. |
| `index` | `number` | | The picture shown, from 0 (controlled). |
| `defaultIndex` | `number` | `0` | The picture shown at first. |
| `onIndexChange` | `(index: number) => void` | | Another picture was asked for: the arrows, the keys or a swipe. |
| `loop` | `boolean` | `false` | After the last picture comes the first again. |
| `id` | string | none | Goes to the `<dialog>`. |

`className`, `ref` and other props go to the `<dialog>`.

## Component tokens

Each is an optional override: set it on the page, a container or one Lightbox. The list lives in `src/components/Lightbox/lightbox.tokens.json` (also in `design-tokens/components/`).

<!-- token-table:start (made from lightbox.tokens.json by npm run tokens: edit the descriptions there) -->
| Token | Default | Use |
| --- | --- | --- |
| `--lightbox-stage-bg` | `surface-muted` | The stage behind a picture while it loads, or if it fails. |
| `--lightbox-caption-color` | `text-muted` | The caption and the count (4.5:1 on the dialog). |
| `--lightbox-fallback-color` | `text-muted` | The broken-image icon when a picture fails. |
| `--lightbox-edge` | `picture-edge` | A faint line around the picture, so a white one stays apart from a white dialog. |
| `--lightbox-stage-radius` | `radius-surface` | The stage's corners (8px). |
| `--lightbox-fallback-icon` | `spacing-6` | The broken-image icon's size (24px). |
| `--lightbox-stage-max-height` | `spacing-40` | Space kept free above and below the stage: the title, the arrows and the screen's edges (160px). |
| `--lightbox-gap` | `spacing-3` | Space between the picture, its caption and the arrows (12px). |
<!-- token-table:end -->
