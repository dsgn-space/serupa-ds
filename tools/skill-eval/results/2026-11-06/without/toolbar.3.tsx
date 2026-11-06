// NOTE: I couldn't inspect serupa-ds in this session (no file access), so the
// ToggleGroup / ToggleGroupItem names and props below are assumed. They follow
// the common Radix-style API. Check them against the installed version.
import { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "serupa-ds";

type Format = "bold" | "italic" | "underline";
type Align = "left" | "center" | "right";

const icon = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true, focusable: false } as const;

const BoldIcon = () => (
  <svg {...icon}><path d="M7 5h6a3.5 3.5 0 0 1 0 7H7zM7 12h7a3.5 3.5 0 0 1 0 7H7z" /></svg>
);
const ItalicIcon = () => (
  <svg {...icon}><path d="M19 4h-9M14 20H5M15 4 9 20" /></svg>
);
const UnderlineIcon = () => (
  <svg {...icon}><path d="M7 4v7a5 5 0 0 0 10 0V4M5 20h14" /></svg>
);
const AlignLeftIcon = () => (
  <svg {...icon}><path d="M4 6h16M4 10h10M4 14h16M4 18h10" /></svg>
);
const AlignCenterIcon = () => (
  <svg {...icon}><path d="M4 6h16M7 10h10M4 14h16M7 18h10" /></svg>
);
const AlignRightIcon = () => (
  <svg {...icon}><path d="M4 6h16M10 10h10M4 14h16M10 18h10" /></svg>
);

export function FormattingBar({
  onFormatChange,
  onAlignChange,
}: {
  onFormatChange?: (formats: Format[]) => void;
  onAlignChange?: (align: Align) => void;
}) {
  const [formats, setFormats] = useState<Format[]>([]);
  const [align, setAlign] = useState<Align>("left");

  return (
    <div role="toolbar" aria-label="Text formatting" style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <ToggleGroup
        type="multiple"
        aria-label="Text style"
        value={formats}
        onValueChange={(v: Format[]) => {
          setFormats(v);
          onFormatChange?.(v);
        }}
      >
        <ToggleGroupItem value="bold" aria-label="Bold"><BoldIcon /></ToggleGroupItem>
        <ToggleGroupItem value="italic" aria-label="Italic"><ItalicIcon /></ToggleGroupItem>
        <ToggleGroupItem value="underline" aria-label="Underline"><UnderlineIcon /></ToggleGroupItem>
      </ToggleGroup>

      <ToggleGroup
        type="single"
        aria-label="Text alignment"
        value={align}
        onValueChange={(v: Align) => {
          if (!v) return; // keep one alignment always selected
          setAlign(v);
          onAlignChange?.(v);
        }}
      >
        <ToggleGroupItem value="left" aria-label="Align left"><AlignLeftIcon /></ToggleGroupItem>
        <ToggleGroupItem value="center" aria-label="Align center"><AlignCenterIcon /></ToggleGroupItem>
        <ToggleGroupItem value="right" aria-label="Align right"><AlignRightIcon /></ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
