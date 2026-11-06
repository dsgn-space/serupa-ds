import { useState } from "react";
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { ToggleButton, ToggleButtonGroup } from "serupa-ds";

type Align = "left" | "center" | "right";

export function FormattingBar() {
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [underline, setUnderline] = useState(false);
  const [align, setAlign] = useState<Align>("left");

  return (
    <div role="toolbar" aria-label="Text formatting" style={{ display: "flex", gap: 12 }}>
      <ToggleButtonGroup aria-label="Text style">
        <ToggleButton selected={bold} onChange={setBold} aria-label="Bold">
          <Bold aria-hidden size={16} />
        </ToggleButton>
        <ToggleButton selected={italic} onChange={setItalic} aria-label="Italic">
          <Italic aria-hidden size={16} />
        </ToggleButton>
        <ToggleButton selected={underline} onChange={setUnderline} aria-label="Underline">
          <Underline aria-hidden size={16} />
        </ToggleButton>
      </ToggleButtonGroup>

      <ToggleButtonGroup
        aria-label="Alignment"
        selectionMode="single"
        value={align}
        onChange={(v: Align) => setAlign(v)}
      >
        <ToggleButton value="left" aria-label="Align left">
          <AlignLeft aria-hidden size={16} />
        </ToggleButton>
        <ToggleButton value="center" aria-label="Align center">
          <AlignCenter aria-hidden size={16} />
        </ToggleButton>
        <ToggleButton value="right" aria-label="Align right">
          <AlignRight aria-hidden size={16} />
        </ToggleButton>
      </ToggleButtonGroup>
    </div>
  );
}
