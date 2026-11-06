import { useState } from 'react';
import { Divider, Icon, ToggleButton, ToggleGroup, Toolbar } from 'serupa-ds';

type Format = 'bold' | 'italic' | 'underline';
type Align = 'left' | 'center' | 'right';

export function FormattingBar() {
  const [formats, setFormats] = useState<Format[]>([]);
  const [align, setAlign] = useState<Align>('left');

  return (
    <Toolbar label="Text formatting" className="gap-2 p-1 bg-surface rounded-md">
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
        onValueChange={(next: Align) => {
          // Keep one alignment always selected.
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
    </Toolbar>
  );
}
