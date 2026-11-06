import { useState } from 'react';
import { Icon, Stack, ToggleButton, ToggleGroup, Toolbar, VisuallyHidden } from 'serupa-ds';

type Align = 'left' | 'center' | 'right';

export function FormattingBar() {
  const [styles, setStyles] = useState<string[]>([]);
  const [align, setAlign] = useState<Align>('left');

  return (
    <Toolbar label="Text formatting">
      <Stack direction="row" gap={4} align="center">
        <ToggleGroup
          type="multiple"
          label="Text style"
          value={styles}
          onValueChange={(next: string[]) => setStyles(next)}
        >
          <ToggleButton value="bold">
            <Icon name="format_bold" />
            <VisuallyHidden>Bold</VisuallyHidden>
          </ToggleButton>
          <ToggleButton value="italic">
            <Icon name="format_italic" />
            <VisuallyHidden>Italic</VisuallyHidden>
          </ToggleButton>
          <ToggleButton value="underline">
            <Icon name="format_underlined" />
            <VisuallyHidden>Underline</VisuallyHidden>
          </ToggleButton>
        </ToggleGroup>

        <ToggleGroup
          type="single"
          label="Text alignment"
          value={align}
          onValueChange={(next: Align) => next && setAlign(next)}
        >
          <ToggleButton value="left">
            <Icon name="format_align_left" />
            <VisuallyHidden>Align left</VisuallyHidden>
          </ToggleButton>
          <ToggleButton value="center">
            <Icon name="format_align_center" />
            <VisuallyHidden>Align center</VisuallyHidden>
          </ToggleButton>
          <ToggleButton value="right">
            <Icon name="format_align_right" />
            <VisuallyHidden>Align right</VisuallyHidden>
          </ToggleButton>
        </ToggleGroup>
      </Stack>
    </Toolbar>
  );
}
