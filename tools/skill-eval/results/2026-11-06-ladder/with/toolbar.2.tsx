import { useState } from 'react';
import { Icon, Toolbar, ToggleGroup, Divider } from 'serupa-ds';

type Mark = 'bold' | 'italic' | 'underline';
type Align = 'left' | 'center' | 'right';

export function FormattingBar() {
  const [marks, setMarks] = useState<Mark[]>([]);
  const [align, setAlign] = useState<Align>('left');

  return (
    <Toolbar label="Text formatting" className="p-1 gap-2 bg-surface rounded-md">
      {/* Any number can be on at once */}
      <ToggleGroup
        type="multiple"
        label="Text style"
        value={marks}
        onValueChange={(value: Mark[]) => setMarks(value)}
      >
        <ToggleGroup.Item value="bold" label="Bold">
          <Icon name="format_bold" />
        </ToggleGroup.Item>
        <ToggleGroup.Item value="italic" label="Italic">
          <Icon name="format_italic" />
        </ToggleGroup.Item>
        <ToggleGroup.Item value="underline" label="Underline">
          <Icon name="format_underlined" />
        </ToggleGroup.Item>
      </ToggleGroup>

      <Divider orientation="vertical" />

      {/* One at a time; keep the current one if it is pressed again */}
      <ToggleGroup
        type="single"
        label="Text alignment"
        value={align}
        onValueChange={(value: Align) => value && setAlign(value)}
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
