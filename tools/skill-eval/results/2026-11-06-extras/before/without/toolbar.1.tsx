import { useState } from "react";
// NOTE: I couldn't inspect the installed serupa-ds package in this session, so the
// component names and props below (ToggleButton, ToggleGroup, ToggleGroupItem)
// are assumed. Check them against the package's exports before using this.
import { ToggleButton, ToggleGroup, ToggleGroupItem } from "serupa-ds";

type Align = "left" | "center" | "right";
type Mark = "bold" | "italic" | "underline";

const iconProps = {
  width: 16,
  height: 16,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: false,
};

const BoldIcon = () => (
  <svg {...iconProps}>
    <path d="M7 5h6a3.5 3.5 0 0 1 0 7H7zM7 12h7a3.5 3.5 0 0 1 0 7H7z" />
  </svg>
);
const ItalicIcon = () => (
  <svg {...iconProps}>
    <path d="M19 4h-9M14 20H5M15 4 9 20" />
  </svg>
);
const UnderlineIcon = () => (
  <svg {...iconProps}>
    <path d="M6 4v7a6 6 0 0 0 12 0V4M4 20h16" />
  </svg>
);
const AlignLeftIcon = () => (
  <svg {...iconProps}>
    <path d="M4 6h16M4 10h10M4 14h16M4 18h10" />
  </svg>
);
const AlignCenterIcon = () => (
  <svg {...iconProps}>
    <path d="M4 6h16M7 10h10M4 14h16M7 18h10" />
  </svg>
);
const AlignRightIcon = () => (
  <svg {...iconProps}>
    <path d="M4 6h16M10 10h10M4 14h16M10 18h10" />
  </svg>
);

const MARKS: { value: Mark; label: string; icon: JSX.Element }[] = [
  { value: "bold", label: "Bold", icon: <BoldIcon /> },
  { value: "italic", label: "Italic", icon: <ItalicIcon /> },
  { value: "underline", label: "Underline", icon: <UnderlineIcon /> },
];

const ALIGNMENTS: { value: Align; label: string; icon: JSX.Element }[] = [
  { value: "left", label: "Align left", icon: <AlignLeftIcon /> },
  { value: "center", label: "Align center", icon: <AlignCenterIcon /> },
  { value: "right", label: "Align right", icon: <AlignRightIcon /> },
];

export interface FormattingBarProps {
  onChange?: (state: { marks: Mark[]; align: Align }) => void;
}

export function FormattingBar({ onChange }: FormattingBarProps) {
  const [marks, setMarks] = useState<Record<Mark, boolean>>({
    bold: false,
    italic: false,
    underline: false,
  });
  const [align, setAlign] = useState<Align>("left");

  const emit = (m: Record<Mark, boolean>, a: Align) =>
    onChange?.({
      marks: (Object.keys(m) as Mark[]).filter((k) => m[k]),
      align: a,
    });

  const toggleMark = (mark: Mark, pressed: boolean) => {
    const next = { ...marks, [mark]: pressed };
    setMarks(next);
    emit(next, align);
  };

  const changeAlign = (value: string) => {
    // Single-select: ignore the empty value emitted when the active item is clicked again.
    if (!value) return;
    setAlign(value as Align);
    emit(marks, value as Align);
  };

  return (
    <div
      role="toolbar"
      aria-label="Text formatting"
      style={{ display: "inline-flex", alignItems: "center", gap: 12 }}
    >
      <div role="group" aria-label="Text style" style={{ display: "inline-flex", gap: 4 }}>
        {MARKS.map(({ value, label, icon }) => (
          <ToggleButton
            key={value}
            aria-label={label}
            title={label}
            pressed={marks[value]}
            onPressedChange={(pressed: boolean) => toggleMark(value, pressed)}
          >
            {icon}
          </ToggleButton>
        ))}
      </div>

      <ToggleGroup
        type="single"
        aria-label="Text alignment"
        value={align}
        onValueChange={changeAlign}
      >
        {ALIGNMENTS.map(({ value, label, icon }) => (
          <ToggleGroupItem key={value} value={value} aria-label={label} title={label}>
            {icon}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}

export default FormattingBar;
