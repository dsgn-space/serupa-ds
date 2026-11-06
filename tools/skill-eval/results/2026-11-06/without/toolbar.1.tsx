// NOTE: I couldn't inspect serupa-ds in this session (no file access), so the
// component and prop names below (ToggleButton, SegmentedControl) are assumed.
// Check them against the installed package's exports before using this.
import { useState } from "react";
import { ToggleButton, SegmentedControl } from "serupa-ds";

type Align = "left" | "center" | "right";

type Format = {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  align: Align;
};

const icon = (d: string) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path d={d} />
  </svg>
);

const icons = {
  bold: icon("M6 4h8a4 4 0 0 1 0 8H6zM6 12h9a4 4 0 0 1 0 8H6z"),
  italic: icon("M19 4h-9M14 20H5M15 4 9 20"),
  underline: icon("M6 4v6a6 6 0 0 0 12 0V4M4 20h16"),
  left: icon("M3 6h18M3 12h12M3 18h16"),
  center: icon("M3 6h18M6 12h12M4 18h16"),
  right: icon("M3 6h18M9 12h12M5 18h16"),
};

export function FormattingBar({
  value,
  onChange,
}: {
  value?: Format;
  onChange?: (next: Format) => void;
}) {
  const [internal, setInternal] = useState<Format>({
    bold: false,
    italic: false,
    underline: false,
    align: "left",
  });
  const format = value ?? internal;

  const update = (patch: Partial<Format>) => {
    const next = { ...format, ...patch };
    if (!value) setInternal(next);
    onChange?.(next);
  };

  return (
    <div role="toolbar" aria-label="Text formatting" style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <ToggleButton
        aria-label="Bold"
        title="Bold"
        pressed={format.bold}
        onPressedChange={(bold: boolean) => update({ bold })}
      >
        {icons.bold}
      </ToggleButton>
      <ToggleButton
        aria-label="Italic"
        title="Italic"
        pressed={format.italic}
        onPressedChange={(italic: boolean) => update({ italic })}
      >
        {icons.italic}
      </ToggleButton>
      <ToggleButton
        aria-label="Underline"
        title="Underline"
        pressed={format.underline}
        onPressedChange={(underline: boolean) => update({ underline })}
      >
        {icons.underline}
      </ToggleButton>

      <SegmentedControl
        aria-label="Text alignment"
        value={format.align}
        onValueChange={(align: Align) => update({ align })}
        options={[
          { value: "left", label: icons.left, "aria-label": "Align left" },
          { value: "center", label: icons.center, "aria-label": "Align center" },
          { value: "right", label: icons.right, "aria-label": "Align right" },
        ]}
      />
    </div>
  );
}

export default FormattingBar;
