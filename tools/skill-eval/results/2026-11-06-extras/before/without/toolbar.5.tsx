// NOTE: I couldn't inspect the installed serupa-ds package in this session (no file access).
// The component names and props below (Toolbar, ToggleGroup, ToggleGroupItem) are assumed.
// Check them against the package's exports and adjust if they differ.
import { useState } from "react";
import { Toolbar, ToggleGroup, ToggleGroupItem } from "serupa-ds";

type TextStyle = "bold" | "italic" | "underline";
type Alignment = "left" | "center" | "right";

// Inline SVG icons, decorative only. The accessible name comes from aria-label on each item.
const Icon = ({ children }: { children: React.ReactNode }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    {children}
  </svg>
);

const BoldIcon = () => (
  <Icon>
    <path d="M4 2.5h4a2.5 2.5 0 0 1 0 5H4zM4 7.5h4.5a2.5 2.5 0 0 1 0 5H4z" />
  </Icon>
);
const ItalicIcon = () => (
  <Icon>
    <path d="M10 2.5H6.5M9.5 13.5H6M9.5 2.5l-3 11" />
  </Icon>
);
const UnderlineIcon = () => (
  <Icon>
    <path d="M4 2.5v4.5a4 4 0 0 0 8 0V2.5M3 14h10" />
  </Icon>
);
const AlignLeftIcon = () => (
  <Icon>
    <path d="M2.5 3.5h11M2.5 6.5h7M2.5 9.5h11M2.5 12.5h7" />
  </Icon>
);
const AlignCenterIcon = () => (
  <Icon>
    <path d="M2.5 3.5h11M4.5 6.5h7M2.5 9.5h11M4.5 12.5h7" />
  </Icon>
);
const AlignRightIcon = () => (
  <Icon>
    <path d="M2.5 3.5h11M6.5 6.5h7M2.5 9.5h11M6.5 12.5h7" />
  </Icon>
);

export interface FormattingBarProps {
  onStyleChange?: (styles: TextStyle[]) => void;
  onAlignChange?: (alignment: Alignment) => void;
}

export function FormattingBar({ onStyleChange, onAlignChange }: FormattingBarProps) {
  const [styles, setStyles] = useState<TextStyle[]>([]);
  const [alignment, setAlignment] = useState<Alignment>("left");

  return (
    <Toolbar aria-label="Text formatting">
      {/* Bold, italic and underline can be combined, so this is a multi-select group. */}
      <ToggleGroup
        type="multiple"
        aria-label="Text style"
        value={styles}
        onValueChange={(next: TextStyle[]) => {
          setStyles(next);
          onStyleChange?.(next);
        }}
      >
        <ToggleGroupItem value="bold" aria-label="Bold">
          <BoldIcon />
        </ToggleGroupItem>
        <ToggleGroupItem value="italic" aria-label="Italic">
          <ItalicIcon />
        </ToggleGroupItem>
        <ToggleGroupItem value="underline" aria-label="Underline">
          <UnderlineIcon />
        </ToggleGroupItem>
      </ToggleGroup>

      {/* Alignment is exactly one of three, so this is a single-select group.
          Ignore the empty value that fires when the active item is clicked again,
          so one option always stays selected. */}
      <ToggleGroup
        type="single"
        aria-label="Text alignment"
        value={alignment}
        onValueChange={(next: Alignment | "") => {
          if (!next) return;
          setAlignment(next);
          onAlignChange?.(next);
        }}
      >
        <ToggleGroupItem value="left" aria-label="Align left">
          <AlignLeftIcon />
        </ToggleGroupItem>
        <ToggleGroupItem value="center" aria-label="Align center">
          <AlignCenterIcon />
        </ToggleGroupItem>
        <ToggleGroupItem value="right" aria-label="Align right">
          <AlignRightIcon />
        </ToggleGroupItem>
      </ToggleGroup>
    </Toolbar>
  );
}

export default FormattingBar;
