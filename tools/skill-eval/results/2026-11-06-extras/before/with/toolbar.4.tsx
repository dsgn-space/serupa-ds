import { useState } from 'react';
import { Divider, Icon, ToggleButton, ToggleGroup, Toolbar, VisuallyHidden } from 'serupa-ds';

type Alignment = 'left' | 'center' | 'right';
type Format = 'bold' | 'italic' | 'underline';

export function FormattingBar() {
  const [formats, setFormats] = useState<Format[]>([]);
  const [align, setAlign] = useState<Alignment>('left');

  return (
    <Toolbar label="Text formatting" className="p-1 gap-2 bg-surface rounded-md">
      <ToggleGroup
        type="multiple"
        label="Text style"
        value={formats}
        onValueChange={(next: Format[]) => setFormats(next)}
      >
        <ToggleButton value="bold" label="Bold">
          <Icon name="format_bold" />
        </ToggleButton>
        <ToggleButton value="italic" label="Italic">
          <Icon name="format_italic" />
        </ToggleButton>
        <ToggleButton value="underline" label="Underline">
          <Icon name="format_underlined" />
        </ToggleButton>
      </ToggleGroup>

      <Divider orientation="vertical" />

      <ToggleGroup
        type="single"
        label="Text alignment"
        value={align}
        onValueChange={(next: Alignment | undefined) => {
          // Keep one alignment on at all times.
          if (next) setAlign(next);
        }}
      >
        <ToggleButton value="left" label="Align left">
          <Icon name="format_align_left" />
        </ToggleButton>
        <ToggleButton value="center" label="Align center">
          <Icon name="format_align_center" />
        </ToggleButton>
        <ToggleButton value="right" label="Align right">
          <Icon name="format_align_right" />
        </ToggleButton>
      </ToggleGroup>

      <VisuallyHidden role="status">
        {formats.length ? `Active styles: ${formats.join(', ')}.` : 'No text styles active.'} Alignment: {align}.
      </VisuallyHidden>
    </Toolbar>
  );
}
