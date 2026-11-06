import { useState } from "react";
// Assumed exports: adjust names/props to match your serupa-ds version.
import { Toolbar, ToggleGroup, ToggleGroupItem } from "serupa-ds";

type Format = "bold" | "italic" | "underline";
type Align = "left" | "center" | "right";

// Icon-only buttons need an accessible name, so each icon is decorative (aria-hidden)
// and the label lives on the button itself.
const icon = (path: React.ReactNode) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    aria-hidden="true"
    focusable="false"
  >
    {path}
  </svg>
);

const icons = {
  bold: icon(<path d="M4 2.5h4a2.5 2.5 0 0 1 0 5H4zm0 5h4.5a2.5 2.5 0 0 1 0 5H4z" />),
  italic: icon(<path d="M10 2.5H6.5M9.5 13.5H6M9 2.5l-2 11" />),
  underline: icon(<path d="M4.5 2.5v5a3.5 3.5 0 0 0 7 0v-5M3 14h10" />),
  left: icon(<path d="M2 3.5h12M2 7h7M2 10.5h12M2 14h7" />),
  center: icon(<path d="M2 3.5h12M4.5 7h7M2 10.5h12M4.5 14h7" />),
  right: icon(<path d="M2 3.5h12M7 7h7M2 10.5h12M7 14h7" />),
};

const FORMATS: { value: Format; label: string }[] = [
  { value: "bold", label: "Bold" },
  { value: "italic", label: "Italic" },
  { value: "underline", label: "Underline" },
];

const ALIGNMENTS: { value: Align; label: string }[] = [
  { value: "left", label: "Align left" },
  { value: "center", label: "Align center" },
  { value: "right", label: "Align right" },
];

export interface FormattingBarProps {
  onFormatChange?: (formats: Format[]) => void;
  onAlignChange?: (align: Align) => void;
}

export function FormattingBar({ onFormatChange, onAlignChange }: FormattingBarProps) {
  const [formats, setFormats] = useState<Format[]>([]);
  const [align, setAlign] = useState<Align>("left");

  return (
    <Toolbar aria-label="Text formatting">
      {/* Independent toggles: any combination can be on */}
      <ToggleGroup
        type="multiple"
        aria-label="Text style"
        value={formats}
        onValueChange={(next: Format[]) => {
          setFormats(next);
          onFormatChange?.(next);
        }}
      >
        {FORMATS.map(({ value, label }) => (
          <ToggleGroupItem key={value} value={value} aria-label={label} title={label}>
            {icons[value]}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      {/* Mutually exclusive: exactly one alignment, never deselected */}
      <ToggleGroup
        type="single"
        aria-label="Text alignment"
        value={align}
        onValueChange={(next: Align) => {
          if (!next) return; // ignore deselect; one alignment is always active
          setAlign(next);
          onAlignChange?.(next);
        }}
      >
        {ALIGNMENTS.map(({ value, label }) => (
          <ToggleGroupItem key={value} value={value} aria-label={label} title={label}>
            {icons[value]}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </Toolbar>
  );
}

export default FormattingBar;
