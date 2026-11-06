// NOTE: I couldn't inspect node_modules in this session, so the serupa-ds
// names below (ToggleButton, ToggleGroup, ToggleGroupItem) and their props
// are assumed. Check them against the installed package before using this.
import { useState } from "react";
import { ToggleButton, ToggleGroup, ToggleGroupItem } from "serupa-ds";

type Align = "left" | "center" | "right";

const svgProps = {
  width: 16,
  height: 16,
  viewBox: "0 0 16 16",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: false,
};

const BoldIcon = () => (
  <svg {...svgProps}>
    <path d="M4 2.5h4a2.5 2.5 0 0 1 0 5H4zM4 7.5h4.5a2.5 2.5 0 0 1 0 5H4z" />
  </svg>
);
const ItalicIcon = () => (
  <svg {...svgProps}>
    <path d="M6.5 2.5h5M4.5 13.5h5M9.5 2.5l-3 11" />
  </svg>
);
const UnderlineIcon = () => (
  <svg {...svgProps}>
    <path d="M4 2.5v5a4 4 0 0 0 8 0v-5M3 14h10" />
  </svg>
);
const AlignLeftIcon = () => (
  <svg {...svgProps}>
    <path d="M2 3.5h12M2 6.5h7M2 9.5h12M2 12.5h7" />
  </svg>
);
const AlignCenterIcon = () => (
  <svg {...svgProps}>
    <path d="M2 3.5h12M4.5 6.5h7M2 9.5h12M4.5 12.5h7" />
  </svg>
);
const AlignRightIcon = () => (
  <svg {...svgProps}>
    <path d="M2 3.5h12M7 6.5h7M2 9.5h12M7 12.5h7" />
  </svg>
);

export function FormattingBar() {
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [underline, setUnderline] = useState(false);
  const [align, setAlign] = useState<Align>("left");

  return (
    <div
      role="toolbar"
      aria-label="Text formatting"
      style={{ display: "flex", alignItems: "center", gap: 12 }}
    >
      <div role="group" aria-label="Text style" style={{ display: "flex", gap: 4 }}>
        <ToggleButton
          pressed={bold}
          onPressedChange={setBold}
          aria-label="Bold"
          title="Bold"
        >
          <BoldIcon />
        </ToggleButton>
        <ToggleButton
          pressed={italic}
          onPressedChange={setItalic}
          aria-label="Italic"
          title="Italic"
        >
          <ItalicIcon />
        </ToggleButton>
        <ToggleButton
          pressed={underline}
          onPressedChange={setUnderline}
          aria-label="Underline"
          title="Underline"
        >
          <UnderlineIcon />
        </ToggleButton>
      </div>

      <ToggleGroup
        type="single"
        value={align}
        // Single-select: ignore the empty value emitted when the active item is clicked again.
        onValueChange={(v: string) => v && setAlign(v as Align)}
        aria-label="Text alignment"
      >
        <ToggleGroupItem value="left" aria-label="Align left" title="Align left">
          <AlignLeftIcon />
        </ToggleGroupItem>
        <ToggleGroupItem value="center" aria-label="Align center" title="Align center">
          <AlignCenterIcon />
        </ToggleGroupItem>
        <ToggleGroupItem value="right" aria-label="Align right" title="Align right">
          <AlignRightIcon />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
