import { useState } from 'react';
import { Divider, Icon, Toolbar, ToggleButton, ToggleGroup } from 'serupa-ds';

type Align = 'left' | 'center' | 'right';
type Mark = 'bold' | 'italic' | 'underline';

export function FormattingBar() {
  const [marks, setMarks] = useState<Mark[]>([]);
  const [align, setAlign] = useState<Align>('left');

  return (
    <Toolbar label="Text formatting" className="gap-2 p-1 bg-surface border rounded-md">
      <ToggleGroup
        type="multiple"
        label="Text style"
        value={marks}
        onValueChange={(next: string[]) => setMarks(next as Mark[])}
      >
        <ToggleButton value="bold" label="Bold" size="sm">
          <Icon name="format_bold" />
        </ToggleButton>
        <ToggleButton value="italic" label="Italic" size="sm">
          <Icon name="format_italic" />
        </ToggleButton>
        <ToggleButton value="underline" label="Underline" size="sm">
          <Icon name="format_underlined" />
        </ToggleButton>
      </ToggleGroup>

      <Divider orientation="vertical" />

      <ToggleGroup
        type="single"
        label="Text alignment"
        value={align}
        onValueChange={(next: string) => next && setAlign(next as Align)}
      >
        <ToggleButton value="left" label="Align left" size="sm">
          <Icon name="format_align_left" />
        </ToggleButton>
        <ToggleButton value="center" label="Align center" size="sm">
          <Icon name="format_align_center" />
        </ToggleButton>
        <ToggleButton value="right" label="Align right" size="sm">
          <Icon name="format_align_right" />
        </ToggleButton>
      </ToggleGroup>
    </Toolbar>
  );
}
