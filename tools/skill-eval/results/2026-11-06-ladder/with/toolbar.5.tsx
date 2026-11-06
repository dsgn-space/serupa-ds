import { useState } from 'react';
import { Icon, Toolbar, ToggleGroup, ToggleButton, Divider } from 'serupa-ds';

type Align = 'left' | 'center' | 'right';

export function FormattingBar() {
  // Bold, italic and underline can be on together.
  const [styles, setStyles] = useState<string[]>([]);
  // Alignment is one choice at a time.
  const [align, setAlign] = useState<Align>('left');

  return (
    <Toolbar label="Text formatting">
      <ToggleGroup
        type="multiple"
        label="Text style"
        value={styles}
        onValueChange={(value: string[]) => setStyles(value)}
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
        label="Text alignment"
        value={align}
        onValueChange={(value: string) => {
          // Keep one alignment always selected.
          if (value) setAlign(value as Align);
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
