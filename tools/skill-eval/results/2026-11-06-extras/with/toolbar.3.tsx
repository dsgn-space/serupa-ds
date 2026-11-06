import { useState } from 'react';
import { Divider, Icon, ToggleButton, ToggleGroup, Toolbar } from 'serupa-ds';

type Align = 'left' | 'center' | 'right';

export function FormattingBar() {
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [underline, setUnderline] = useState(false);
  const [align, setAlign] = useState<Align>('left');

  return (
    <Toolbar aria-label="Text formatting" className="gap-2 p-1 bg-surface border rounded-md">
      <ToggleButton
        size="sm"
        pressed={bold}
        onPressedChange={setBold}
        aria-label="Bold"
      >
        <Icon name="format_bold" />
      </ToggleButton>
      <ToggleButton
        size="sm"
        pressed={italic}
        onPressedChange={setItalic}
        aria-label="Italic"
      >
        <Icon name="format_italic" />
      </ToggleButton>
      <ToggleButton
        size="sm"
        pressed={underline}
        onPressedChange={setUnderline}
        aria-label="Underline"
      >
        <Icon name="format_underlined" />
      </ToggleButton>

      <Divider orientation="vertical" />

      <ToggleGroup
        type="single"
        size="sm"
        aria-label="Text alignment"
        value={align}
        onValueChange={(next: Align | undefined) => {
          if (next) setAlign(next);
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
