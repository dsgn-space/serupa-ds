import { useState } from "react";
// NOTE: I couldn't inspect the installed package in this session (no file access),
// so these component names and props are assumed. Adjust the imports and props to
// match serupa-ds's actual exports.
import { ToggleGroup, ToggleGroupItem } from "serupa-ds";

type Format = "bold" | "italic" | "underline";
type Align = "left" | "center" | "right";

// Decorative inline icons. The accessible name comes from aria-label on each item.
const Svg = ({ children }: { children: React.ReactNode }) => (
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
  <Svg>
    <path d="M4 2.5h4a2.5 2.5 0 0 1 0 5H4zM4 7.5h4.5a2.5 2.5 0 0 1 0 5H4z" />
  </Svg>
);
const ItalicIcon = () => (
  <Svg>
    <path d="M6.5 2.5h5M4.5 13.5h5M9.5 2.5l-3 11" />
  </Svg>
);
const UnderlineIcon = () => (
  <Svg>
    <path d="M4.5 2.5v4.5a3.5 3.5 0 0 0 7 0V2.5M3 14h10" />
  </Svg>
);
const AlignLeftIcon = () => (
  <Svg>
    <path d="M2.5 3.5h11M2.5 6.5h7M2.5 9.5h11M2.5 12.5h7" />
  </Svg>
);
const AlignCenterIcon = () => (
  <Svg>
    <path d="M2.5 3.5h11M4.5 6.5h7M2.5 9.5h11M4.5 12.5h7" />
  </Svg>
);
const AlignRightIcon = () => (
  <Svg>
    <path d="M2.5 3.5h11M6.5 6.5h7M2.5 9.5h11M6.5 12.5h7" />
  </Svg>
);

export function FormattingBar() {
  const [formats, setFormats] = useState<Format[]>([]);
  const [align, setAlign] = useState<Align>("left");

  return (
    <div
      role="toolbar"
      aria-label="Text formatting"
      style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
    >
      {/* Independent on/off toggles: any combination can be active */}
      <ToggleGroup
        type="multiple"
        aria-label="Text style"
        value={formats}
        onValueChange={(v: string[]) => setFormats(v as Format[])}
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

      {/* Mutually exclusive choice: exactly one alignment is always selected */}
      <ToggleGroup
        type="single"
        aria-label="Text alignment"
        value={align}
        onValueChange={(v: string) => {
          if (v) setAlign(v as Align); // ignore deselect so one stays selected
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
    </div>
  );
}

export default FormattingBar;
