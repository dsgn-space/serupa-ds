import { useState } from 'react';
import { Divider, Icon, Toolbar, ToggleButton, ToggleGroup } from 'serupa-ds';

type Format = 'bold' | 'italic' | 'underline';
type Align = 'left' | 'center' | 'right';

export function FormattingBar() {
  const [formats, setFormats] = useState<Format[]>([]);
  const [align, setAlign] = useState<Align>('left');

  return (
    <Toolbar aria-label="Text formatting" className="gap-2 p-1 bg-surface border rounded-md">
      <ToggleGroup
        type="multiple"
        aria-label="Text style"
        value={formats}
        onValueChange={(value: string[]) => setFormats(value as Format[])}
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
        aria-label="Text alignment"
        value={align}
        onValueChange={(value: string) => {
          // Keep one alignment always selected.
          if (value) setAlign(value as Align);
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
    </Toolbar>
  );
}
