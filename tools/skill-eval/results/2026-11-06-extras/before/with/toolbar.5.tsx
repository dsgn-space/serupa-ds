import { useState } from 'react';
import { Divider, Icon, ToggleButton, ToggleGroup, Toolbar } from 'serupa-ds';

type Align = 'left' | 'center' | 'right';
type Mark = 'bold' | 'italic' | 'underline';

export function FormattingBar() {
  const [marks, setMarks] = useState<Mark[]>([]);
  const [align, setAlign] = useState<Align>('left');

  return (
    <Toolbar aria-label="Text formatting" className="p-1 gap-2">
      <ToggleGroup
        type="multiple"
        aria-label="Text style"
        value={marks}
        onValueChange={(next: Mark[]) => setMarks(next)}
      >
        <ToggleButton value="bold" aria-label="Bold">
          <Icon name="format_bold" />
        </ToggleButton>
        <ToggleButton value="italic" aria-label="Italic">
          <Icon name="format_italic" />
        </ToggleButton>
        <ToggleButton value="underline" aria-label="Underline">
          <Icon name="format_underlined" />
        </ToggleButton>
      </ToggleGroup>

      <Divider orientation="vertical" />

      <ToggleGroup
        type="single"
        aria-label="Text alignment"
        value={align}
        onValueChange={(next: Align | undefined) => {
          if (next) setAlign(next); // keep one alignment always selected
        }}
      >
        <ToggleButton value="left" aria-label="Align left">
          <Icon name="format_align_left" />
        </ToggleButton>
        <ToggleButton value="center" aria-label="Align center">
          <Icon name="format_align_center" />
        </ToggleButton>
        <ToggleButton value="right" aria-label="Align right">
          <Icon name="format_align_right" />
        </ToggleButton>
      </ToggleGroup>
    </Toolbar>
  );
}
