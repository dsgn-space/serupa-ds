// NOTE: I couldn't inspect the installed serupa-ds package in this session
// (no file or shell access), so the component names and props imported below
// are assumed, not checked. Check them against the package's exports first.
import { useState } from "react";
import { ToggleButton, ToggleGroup, ToggleGroupItem } from "serupa-ds";
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight } from "lucide-react";

type Align = "left" | "center" | "right";
type Mark = "bold" | "italic" | "underline";

export function FormattingBar() {
  const [marks, setMarks] = useState<Record<Mark, boolean>>({
    bold: false,
    italic: false,
    underline: false,
  });
  const [align, setAlign] = useState<Align>("left");

  const toggle = (mark: Mark) => (pressed: boolean) =>
    setMarks((m) => ({ ...m, [mark]: pressed }));

  return (
    <div role="toolbar" aria-label="Text formatting" style={{ display: "flex", gap: 12 }}>
      <div role="group" aria-label="Text style" style={{ display: "flex", gap: 4 }}>
        {/* Icon-only toggles: each needs an accessible name via aria-label */}
        <ToggleButton
          aria-label="Bold"
          pressed={marks.bold}
          onPressedChange={toggle("bold")}
        >
          <Bold aria-hidden="true" size={16} />
        </ToggleButton>
        <ToggleButton
          aria-label="Italic"
          pressed={marks.italic}
          onPressedChange={toggle("italic")}
        >
          <Italic aria-hidden="true" size={16} />
        </ToggleButton>
        <ToggleButton
          aria-label="Underline"
          pressed={marks.underline}
          onPressedChange={toggle("underline")}
        >
          <Underline aria-hidden="true" size={16} />
        </ToggleButton>
      </div>

      {/* Alignment is a single choice: exactly one of left/center/right */}
      <ToggleGroup
        type="single"
        aria-label="Text alignment"
        value={align}
        onValueChange={(v: string) => {
          if (v) setAlign(v as Align); // ignore deselect so one option stays active
        }}
      >
        <ToggleGroupItem value="left" aria-label="Align left">
          <AlignLeft aria-hidden="true" size={16} />
        </ToggleGroupItem>
        <ToggleGroupItem value="center" aria-label="Align center">
          <AlignCenter aria-hidden="true" size={16} />
        </ToggleGroupItem>
        <ToggleGroupItem value="right" aria-label="Align right">
          <AlignRight aria-hidden="true" size={16} />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
