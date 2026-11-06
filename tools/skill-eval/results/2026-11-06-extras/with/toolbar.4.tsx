import { useState } from 'react';
import { Divider, Icon, ToggleButton, ToggleGroup, Toolbar } from 'serupa-ds';

type Align = 'left' | 'center' | 'right';

export function FormattingBar() {
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [underline, setUnderline] = useState(false);
  const [align, setAlign] = useState<Align>('left');

  return (
    <Toolbar label="Text formatting" className="p-1 bg-surface border rounded-md">
      <ToggleButton
        label="Bold"
        pressed={bold}
        onPressedChange={setBold}
        size="sm"
      >
        <Icon name="format_bold" />
      </ToggleButton>
      <ToggleButton
        label="Italic"
        pressed={italic}
        onPressedChange={setItalic}
        size="sm"
      >
        <Icon name="format_italic" />
      </ToggleButton>
      <ToggleButton
        label="Underline"
        pressed={underline}
        onPressedChange={setUnderline}
        size="sm"
      >
        <Icon name="format_underlined" />
      </ToggleButton>

      <Divider orientation="vertical" />

      <ToggleGroup
        label="Text alignment"
        type="single"
        value={align}
        onValueChange={(next: Align | undefined) => next && setAlign(next)}
        size="sm"
      >
        <ToggleGroup.Item value="left" label="Align left">
          <Icon name="format_align_left" />
        </ToggleGroup.Item>
        <ToggleGroup.Item value="center" label="Align center">
          <Icon name="format_align_center" />
        </ToggleGroup.Item>
        <ToggleGroup.Item value="right" label="Align right">
          <Icon name="format_align_right" />
        </ToggleGroup.Item>
      </ToggleGroup>
    </Toolbar>
  );
}
