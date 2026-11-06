import { useState } from 'react';
import {
  Divider,
  Icon,
  ToggleButton,
  ToggleGroup,
  Toolbar,
  VisuallyHidden,
} from 'serupa-ds';

type Format = 'bold' | 'italic' | 'underline';
type Align = 'left' | 'center' | 'right';

export function FormattingBar() {
  const [formats, setFormats] = useState<Format[]>([]);
  const [align, setAlign] = useState<Align>('left');

  return (
    <Toolbar aria-label="Text formatting" className="p-1 gap-2 bg-surface border rounded-md">
      <ToggleGroup
        type="multiple"
        aria-label="Text style"
        value={formats}
        onValueChange={(next: Format[]) => setFormats(next)}
      >
        <ToggleButton value="bold" size="sm">
          <Icon name="format_bold" aria-hidden />
          <VisuallyHidden>Bold</VisuallyHidden>
        </ToggleButton>
        <ToggleButton value="italic" size="sm">
          <Icon name="format_italic" aria-hidden />
          <VisuallyHidden>Italic</VisuallyHidden>
        </ToggleButton>
        <ToggleButton value="underline" size="sm">
          <Icon name="format_underlined" aria-hidden />
          <VisuallyHidden>Underline</VisuallyHidden>
        </ToggleButton>
      </ToggleGroup>

      <Divider orientation="vertical" />

      <ToggleGroup
        type="single"
        aria-label="Text alignment"
        value={align}
        onValueChange={(next: Align) => next && setAlign(next)}
      >
        <ToggleButton value="left" size="sm">
          <Icon name="format_align_left" aria-hidden />
          <VisuallyHidden>Align left</VisuallyHidden>
        </ToggleButton>
        <ToggleButton value="center" size="sm">
          <Icon name="format_align_center" aria-hidden />
          <VisuallyHidden>Align center</VisuallyHidden>
        </ToggleButton>
        <ToggleButton value="right" size="sm">
          <Icon name="format_align_right" aria-hidden />
          <VisuallyHidden>Align right</VisuallyHidden>
        </ToggleButton>
      </ToggleGroup>
    </Toolbar>
  );
}
