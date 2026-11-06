import { useState } from 'react';
import { Divider, Icon, Toolbar, ToggleButton, ToggleGroup, Tooltip } from 'serupa-ds';

type Format = 'bold' | 'italic' | 'underline';
type Align = 'left' | 'center' | 'right';

export function FormattingBar() {
  const [formats, setFormats] = useState<Format[]>([]);
  const [align, setAlign] = useState<Align>('left');

  return (
    <Toolbar label="Text formatting" className="gap-2 p-1 bg-surface border rounded-md">
      <ToggleGroup
        type="multiple"
        label="Text style"
        value={formats}
        onValueChange={(next: Format[]) => setFormats(next)}
      >
        <Tooltip content="Bold">
          <ToggleButton value="bold" aria-label="Bold">
            <Icon name="format_bold" />
          </ToggleButton>
        </Tooltip>
        <Tooltip content="Italic">
          <ToggleButton value="italic" aria-label="Italic">
            <Icon name="format_italic" />
          </ToggleButton>
        </Tooltip>
        <Tooltip content="Underline">
          <ToggleButton value="underline" aria-label="Underline">
            <Icon name="format_underlined" />
          </ToggleButton>
        </Tooltip>
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
        <Tooltip content="Align left">
          <ToggleButton value="left" aria-label="Align left">
            <Icon name="format_align_left" />
          </ToggleButton>
        </Tooltip>
        <Tooltip content="Align center">
          <ToggleButton value="center" aria-label="Align center">
            <Icon name="format_align_center" />
          </ToggleButton>
        </Tooltip>
        <Tooltip content="Align right">
          <ToggleButton value="right" aria-label="Align right">
            <Icon name="format_align_right" />
          </ToggleButton>
        </Tooltip>
      </ToggleGroup>
    </Toolbar>
  );
}
