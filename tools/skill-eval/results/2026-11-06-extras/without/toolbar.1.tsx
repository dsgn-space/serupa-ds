import { useState } from "react";
// NOTE: I couldn't inspect serupa-ds in this session, so these component and
// prop names (ToggleButton, ToggleGroup) are assumed. Check them against the
// installed package.
import { ToggleButton, ToggleGroup } from "serupa-ds";

type Align = "left" | "center" | "right";

const iconProps = {
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
  <svg {...iconProps}>
    <path d="M4 2.5h4a2.5 2.5 0 0 1 0 5H4zM4 7.5h4.5a2.5 2.5 0 0 1 0 5H4z" />
  </svg>
);
const ItalicIcon = () => (
  <svg {...iconProps}>
    <path d="M10 2.5H6.5M9.5 13.5H6M9.5 2.5l-3 11" />
  </svg>
);
const UnderlineIcon = () => (
  <svg {...iconProps}>
    <path d="M4.5 2.5v5a3.5 3.5 0 0 0 7 0v-5M3 14h10" />
  </svg>
);
const AlignLeftIcon = () => (
  <svg {...iconProps}>
    <path d="M2.5 3.5h11M2.5 6.5h7M2.5 9.5h11M2.5 12.5h7" />
  </svg>
);
const AlignCenterIcon = () => (
  <svg {...iconProps}>
    <path d="M2.5 3.5h11M4.5 6.5h7M2.5 9.5h11M4.5 12.5h7" />
  </svg>
);
const AlignRightIcon = () => (
  <svg {...iconProps}>
    <path d="M2.5 3.5h11M6.5 6.5h7M2.5 9.5h11M6.5 12.5h7" />
  </svg>
);

const alignments: { value: Align; label: string; icon: JSX.Element }[] = [
  { value: "left", label: "Align left", icon: <AlignLeftIcon /> },
  { value: "center", label: "Align center", icon: <AlignCenterIcon /> },
  { value: "right", label: "Align right", icon: <AlignRightIcon /> },
];

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
          aria-label="Bold"
          title="Bold"
          pressed={bold}
          onPressedChange={setBold}
        >
          <BoldIcon />
        </ToggleButton>
        <ToggleButton
          aria-label="Italic"
          title="Italic"
          pressed={italic}
          onPressedChange={setItalic}
        >
          <ItalicIcon />
        </ToggleButton>
        <ToggleButton
          aria-label="Underline"
          title="Underline"
          pressed={underline}
          onPressedChange={setUnderline}
        >
          <UnderlineIcon />
        </ToggleButton>
      </div>

      <ToggleGroup
        type="single"
        aria-label="Text alignment"
        value={align}
        onValueChange={(next: Align | "") => {
          // Keep one option always selected: ignore deselect clicks.
          if (next) setAlign(next);
        }}
      >
        {alignments.map(({ value, label, icon }) => (
          <ToggleGroup.Item key={value} value={value} aria-label={label} title={label}>
            {icon}
          </ToggleGroup.Item>
        ))}
      </ToggleGroup>
    </div>
  );
}

export default FormattingBar;
