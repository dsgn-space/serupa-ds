# ImageCropper

A picture in a frame of a fixed shape, which people move and zoom to choose the part to keep: a profile photo, a team logo, a cover. The app gets the crop in the picture's own pixels, and `cropImage` draws it.

**Also called:** image crop, avatar editor, photo cropper.

```tsx
import { Field, ImageCropper, cropImage, type CropArea } from "@diki-stwn/serupa-ds";

const [area, setArea] = React.useState<CropArea | null>(null);

<Field label="Profile photo" hint="Shown round, beside your name.">
  <ImageCropper src={URL.createObjectURL(file)} shape="round" onCropChange={setArea} />
</Field>

// on Save: a 256px square PNG of the crop
const photo = area && await cropImage(src, area, { width: 256 });
```

## When to use

- After someone picks a picture for a place with a fixed shape: an avatar, a logo, a cover or banner, a card's picture.
- When the server crops the original: send `onCropChange`'s area with it.

## When not to use

- Picking the file: use [FileUpload](../FileUpload/README.md), then show the picked file here.
- Showing a picture: use [Image](../Image/README.md) (its `fit` and `ratio` crop for display without changing the file).
- Editing a picture (rotating, filters, drawing): a full editor is outside a design system.

## Anatomy

Drawn from the `Playground` story.

1. **Frame**: the crop's shape (`aspect`), with the picture behind it filling it edge to edge. A round one dims the picture outside a circle and rings it.
2. **Thirds**: thin lines in thirds while the picture is dragged.
3. **Zoom row**: Zoom out, a small [Slider](../Slider/README.md) named "Zoom", Zoom in.

## Usage

- Name it: a [Field](../Field/README.md) label ("Profile photo") or `aria-label`.
- Match `aspect` and `shape` to where the picture goes: `shape="round"` for an avatar, `aspect={16 / 9}` for a cover. A round crop is still a square picture; the avatar draws the circle.
- `onCropChange(area)` fires once the picture loads (centred, as large as fits) and after every move or zoom, with `{ x, y, width, height }` in the picture's own whole pixels. Keep the last one for Save.
- `cropImage(src, area, { width, type, quality })` resolves to a Blob of the crop, `width` pixels wide (default: the crop's own width). A picture from another site needs CORS: give it `crossOrigin="anonymous"` here and in `cropImage`'s options, or crop on the server.
- The picture always covers the frame, so a crop never has an empty edge, and zoom 1 is as far out as it goes.
- A new `src` starts over: centred at `defaultZoom`.

### Do and don't

- **Do:** Show the shape it will have: round for an avatar, with the hint saying where it's shown. (`ProfilePhoto`)
- **Don't:** Crop a picture people didn't pick, or skip the step when the shape won't fit most pictures: a cover from a phone photo needs it. (`Cover`)

## Accessibility

- **Role and name:** a `group` named by its Field label or `aria-label`. In it, the frame is a focusable group named "Crop area" and described by how to use it ("Drag the picture or use the arrow keys to move it, and plus or minus to zoom."). The zoom is a slider named "Zoom", read as a percentage, between the "Zoom out" and "Zoom in" buttons.
- **Keyboard:** Tab reaches the frame, then the zoom row. On the frame, the arrow keys move the picture the way they point, a tenth of the frame at a time (with Shift, half); + and − zoom a tenth around the middle. The slider takes its usual keys.
- **Pointer and touch:** drag the picture, or tap a spot to bring it to the middle (2.5.7: moving needs no drag, and zooming has buttons). Two fingers pinch to zoom, around their middle; a trackpad pinch (Ctrl with the wheel) zooms too. The page doesn't scroll under a finger on the frame (`touch-action: none`); a plain mouse wheel scrolls the page.
- **Contrast:** the failure text reads 4.5:1 on the frame in every theme (`ImageCropper.test.tsx`). In forced colors, the frame's edge and the ring use the system text color.
- **What's still yours:** the label, where the picture will be shown, and a text alternative wherever the cropped picture appears.

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `src` | `string` | | The picture: a URL, or an object URL of a picked file. A new one starts over. |
| `aspect` | `number` | `1` | The crop's width over its height: `16 / 9`, `3 / 4`. |
| `shape` | `'rect' \| 'round'` | `'rect'` | `'round'` dims the picture outside a circle (an ellipse with another aspect). |
| `defaultZoom` | `number` | `1` | The zoom at first; 1 shows the whole width or height. |
| `maxZoom` | `number` | `4` | How far in it zooms. |
| `onCropChange` | `(area: CropArea) => void` | | The crop in the picture's pixels, on load and after each change. |
| `crossOrigin` | `'' \| 'anonymous' \| 'use-credentials'` | | For another site's picture, so `cropImage` can read it. |
| `disabled` | `boolean` | | Turns moving and zooming off. |

`className`, `ref` and other props go to the root `<div>`.

## Component tokens

Each is an optional override: set it on the page, a container or one ImageCropper. The list lives in `src/components/ImageCropper/image-cropper.tokens.json` (also in `design-tokens/components/`).

<!-- token-table:start (made from image-cropper.tokens.json by npm run tokens: edit the descriptions there) -->
| Token | Default | Use |
| --- | --- | --- |
| `--image-cropper-bg` | `surface-muted` | The frame behind the picture, seen while it loads or when it can't. |
| `--image-cropper-edge` | `picture-edge` | The hairline round the frame, so a pale picture keeps its edge. |
| `--image-cropper-scrim` | `overlay` | A round crop: what dims the picture outside the circle. |
| `--image-cropper-guide` | `white` | A round crop: the ring on the circle, over the picture. |
| `--image-cropper-grid` | `white` | The lines in thirds shown while the picture is dragged. |
| `--image-cropper-focus-ring` | `focus-ring` | The frame's focus ring. |
| `--image-cropper-fallback-color` | `text-muted` | The icon and words in the frame when the picture can't be loaded. |
| `--image-cropper-grid-opacity` | `opacity-60` | How strongly the thirds show while dragging. |
| `--image-cropper-radius` | `radius-control` | The frame's corners, as a field's. |
| `--image-cropper-max-width` | `container-xs` | The widest it grows (20rem); it fills a narrower column. |
| `--image-cropper-gap` | `spacing-2` | Between the frame and the zoom row (8px). |
| `--image-cropper-zoom-gap` | `spacing-1` | Between the zoom buttons and the slider (4px). |
<!-- token-table:end -->
