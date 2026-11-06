import { useState } from "react";

type Align = "left" | "center" | "right";

const Icon = ({ d }: { d: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const ICONS = {
  bold: "M6 4h8a4 4 0 0 1 0 8H6zM6 12h9a4 4 0 0 1 0 8H6z",
  italic: "M19 4h-9M14 20H5M15 4 9 20",
  underline: "M6 4v6a6 6 0 0 0 12 0V4M4 20h16",
  left: "M3 6h18M3 12h12M3 18h16",
  center: "M3 6h18M6 12h12M4 18h16",
  right: "M3 6h18M9 12h12M5 18h16",
};

export function FormattingBar() {
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [underline, setUnderline] = useState(false);
  const [align, setAlign] = useState<Align>("left");

  const toggles = [
    { label: "Bold", icon: ICONS.bold, on: bold, set: setBold },
    { label: "Italic", icon: ICONS.italic, on: italic, set: setItalic },
    { label: "Underline", icon: ICONS.underline, on: underline, set: setUnderline },
  ];
  const aligns: { value: Align; label: string }[] = [
    { value: "left", label: "Align left" },
    { value: "center", label: "Align center" },
    { value: "right", label: "Align right" },
  ];

  const btn = (pressed: boolean): React.CSSProperties => ({
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    width: 32, height: 32, border: "1px solid currentColor", borderRadius: 6,
    background: pressed ? "rgba(128,128,128,.25)" : "transparent",
    color: "inherit", cursor: "pointer",
  });

  return (
    <div role="toolbar" aria-label="Text formatting"
         style={{ display: "inline-flex", gap: 12, alignItems: "center" }}>
      <div role="group" aria-label="Text style" style={{ display: "flex", gap: 4 }}>
        {toggles.map((t) => (
          <button key={t.label} type="button" aria-label={t.label} title={t.label}
                  aria-pressed={t.on} style={btn(t.on)} onClick={() => t.set(!t.on)}>
            <Icon d={t.icon} />
          </button>
        ))}
      </div>
      <div role="radiogroup" aria-label="Text alignment" style={{ display: "flex", gap: 4 }}>
        {aligns.map((a) => (
          <button key={a.value} type="button" role="radio" aria-label={a.label}
                  title={a.label} aria-checked={align === a.value}
                  tabIndex={align === a.value ? 0 : -1}
                  style={btn(align === a.value)} onClick={() => setAlign(a.value)}>
            <Icon d={ICONS[a.value]} />
          </button>
        ))}
      </div>
    </div>
  );
}
