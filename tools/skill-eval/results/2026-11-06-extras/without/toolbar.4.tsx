import { useState } from "react";

// NOTE: I couldn't inspect serupa-ds in this session, so I haven't used its
// component names or class names. This version uses native, accessible
// elements. To match the design system, swap the <button> elements for its
// toggle / segmented-control components.

type Align = "left" | "center" | "right";

const Icon = ({ children }: { children: React.ReactNode }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    {children}
  </svg>
);

const icons = {
  bold: (
    <Icon>
      <path d="M4 2.5h4a2.5 2.5 0 0 1 0 5H4zM4 7.5h4.5a2.5 2.5 0 0 1 0 5H4z" />
    </Icon>
  ),
  italic: (
    <Icon>
      <path d="M10 2.5H6.5M9.5 13.5H6M9.5 2.5l-3 11" />
    </Icon>
  ),
  underline: (
    <Icon>
      <path d="M4.5 2.5v5a3.5 3.5 0 0 0 7 0v-5M3 14h10" />
    </Icon>
  ),
  left: (
    <Icon>
      <path d="M2.5 3.5h11M2.5 6.5h7M2.5 9.5h11M2.5 12.5h7" />
    </Icon>
  ),
  center: (
    <Icon>
      <path d="M2.5 3.5h11M4.5 6.5h7M2.5 9.5h11M4.5 12.5h7" />
    </Icon>
  ),
  right: (
    <Icon>
      <path d="M2.5 3.5h11M6.5 6.5h7M2.5 9.5h11M6.5 12.5h7" />
    </Icon>
  ),
};

const buttonStyle = (active: boolean): React.CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 32,
  height: 32,
  border: "1px solid transparent",
  borderRadius: 6,
  background: active ? "rgba(0,0,0,0.12)" : "transparent",
  color: "inherit",
  cursor: "pointer",
});

const alignments: { value: Align; label: string }[] = [
  { value: "left", label: "Align left" },
  { value: "center", label: "Align center" },
  { value: "right", label: "Align right" },
];

export default function FormattingBar() {
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [underline, setUnderline] = useState(false);
  const [align, setAlign] = useState<Align>("left");

  const toggles = [
    { key: "bold", label: "Bold", on: bold, set: setBold, icon: icons.bold },
    { key: "italic", label: "Italic", on: italic, set: setItalic, icon: icons.italic },
    { key: "underline", label: "Underline", on: underline, set: setUnderline, icon: icons.underline },
  ];

  const onAlignKeyDown = (e: React.KeyboardEvent) => {
    const i = alignments.findIndex((a) => a.value === align);
    let next = i;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (i + 1) % alignments.length;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp")
      next = (i - 1 + alignments.length) % alignments.length;
    else return;
    e.preventDefault();
    setAlign(alignments[next].value);
    const buttons = e.currentTarget.querySelectorAll<HTMLButtonElement>("button");
    buttons[next]?.focus();
  };

  return (
    <div
      role="toolbar"
      aria-label="Text formatting"
      style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
    >
      <div role="group" aria-label="Text style" style={{ display: "inline-flex", gap: 2 }}>
        {toggles.map((t) => (
          <button
            key={t.key}
            type="button"
            aria-label={t.label}
            title={t.label}
            aria-pressed={t.on}
            onClick={() => t.set(!t.on)}
            style={buttonStyle(t.on)}
          >
            {t.icon}
          </button>
        ))}
      </div>

      <span
        aria-hidden="true"
        style={{ width: 1, height: 20, background: "currentColor", opacity: 0.2 }}
      />

      <div
        role="radiogroup"
        aria-label="Text alignment"
        onKeyDown={onAlignKeyDown}
        style={{ display: "inline-flex", gap: 2 }}
      >
        {alignments.map((a) => (
          <button
            key={a.value}
            type="button"
            role="radio"
            aria-checked={align === a.value}
            aria-label={a.label}
            title={a.label}
            tabIndex={align === a.value ? 0 : -1}
            onClick={() => setAlign(a.value)}
            style={buttonStyle(align === a.value)}
          >
            {icons[a.value]}
          </button>
        ))}
      </div>
    </div>
  );
}
