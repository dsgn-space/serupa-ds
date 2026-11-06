import { useState } from 'react';
import { Divider, Toolbar, ToggleButton, ToggleGroup, VisuallyHidden } from 'serupa-ds';

type Align = 'left' | 'center' | 'right';

export function FormattingBar() {
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [underline, setUnderline] = useState(false);
  const [align, setAlign] = useState<Align>('left');

  return (
    <Toolbar aria-label="Text formatting" className="gap-2 p-1 bg-surface border rounded-md">
      <ToggleButton
        icon="format_bold"
        label="Bold"
        size="sm"
        pressed={bold}
        onPressedChange={setBold}
      />
      <ToggleButton
        icon="format_italic"
        label="Italic"
        size="sm"
        pressed={italic}
        onPressedChange={setItalic}
      />
      <ToggleButton
        icon="format_underlined"
        label="Underline"
        size="sm"
        pressed={underline}
        onPressedChange={setUnderline}
      />

      <Divider orientation="vertical" />

      <ToggleGroup
        type="single"
        aria-label="Text alignment"
        size="sm"
        value={align}
        onValueChange={(next) => {
          // A single group can report an empty value when the active item is pressed again; keep one selected.
          if (next) setAlign(next as Align);
        }}
      >
        <ToggleGroup.Item value="left" icon="format_align_left" label="Align left" />
        <ToggleGroup.Item value="center" icon="format_align_center" label="Align center" />
        <ToggleGroup.Item value="right" icon="format_align_right" label="Align right" />
      </ToggleGroup>

      <VisuallyHidden role="status" aria-live="polite">
        {`${bold ? 'Bold on. ' : ''}${italic ? 'Italic on. ' : ''}${underline ? 'Underline on. ' : ''}Aligned ${align}.`}
      </VisuallyHidden>
    </Toolbar>
  );
}
