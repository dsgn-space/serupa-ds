import { useState } from 'react';
import { Divider, Icon, ToggleButton, ToggleGroup, Toolbar } from 'serupa-ds';

type Mark = 'bold' | 'italic' | 'underline';
type Align = 'left' | 'center' | 'right';

export function FormattingBar() {
  const [marks, setMarks] = useState<Mark[]>([]);
  const [align, setAlign] = useState<Align>('left');

  return (
    <Toolbar aria-label="Text formatting" className="items-center gap-2 p-2 bg-surface rounded-md">
      <ToggleGroup
        type="multiple"
        aria-label="Text style"
        value={marks}
        onValueChange={(next: Mark[]) => setMarks(next)}
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
        onValueChange={(next: Align) => {
          // keep one alignment always selected
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
